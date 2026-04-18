import { Injectable } from '@angular/core';

import {
  GraphEdge,
  GraphNode,
  GraphSchema,
  InputMethod,
  ParsedGraph
} from '../models/graph.models';

interface NodeBuilder {
  id: string;
  name: string;
  file: string;
  code: string;
  calls: Set<string>;
  calledBy: Set<string>;
  references: string[];
  examples: string[];
  metrics: GraphNode['metrics'];
  metadata: GraphNode['metadata'];
}

@Injectable({
  providedIn: 'root'
})
export class GraphParserService {
  parse(input: string | GraphSchema): ParsedGraph {
    const schema = this.parseSchema(input);
    const warnings: string[] = [];
    const builders = new Map<string, NodeBuilder>();

    for (const method of schema.methods) {
      this.collectMethod(method, builders, warnings);
    }

    const edges = this.buildEdges(builders, warnings);
    const cycles = this.detectCycles(builders);
    const recursiveIds = new Set(cycles.flat());
    const roots = this.findRoots(builders);
    const depthMap = this.computeDepths(builders, roots);

    const nodes: GraphNode[] = Array.from(builders.values()).map((builder) => ({
      id: builder.id,
      name: builder.name,
      file: builder.file,
      code: builder.code,
      calls: Array.from(builder.calls),
      calledBy: Array.from(builder.calledBy),
      references: builder.references,
      examples: builder.examples,
      metrics: builder.metrics,
      metadata: builder.metadata,
      depth: depthMap.get(builder.id) ?? 0,
      isRecursive: recursiveIds.has(builder.id) || builder.calls.has(builder.id)
    }));

    return {
      nodes: nodes.sort((left, right) => left.depth - right.depth || left.name.localeCompare(right.name)),
      edges,
      roots,
      cycles,
      warnings
    };
  }

  private parseSchema(input: string | GraphSchema): GraphSchema {
    if (typeof input !== 'string') {
      this.assertSchema(input);
      return input;
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(input);
    } catch {
      throw new Error('Input is not valid JSON.');
    }

    this.assertSchema(parsed);
    return parsed;
  }

  private assertSchema(value: unknown): asserts value is GraphSchema {
    if (!value || typeof value !== 'object' || !Array.isArray((value as GraphSchema).methods)) {
      throw new Error('Input must contain a top-level "methods" array.');
    }
  }

  private collectMethod(
    method: InputMethod,
    builders: Map<string, NodeBuilder>,
    warnings: string[],
    parentId?: string
  ): void {
    if (!method.id?.trim()) {
      throw new Error('Each method must have a non-empty "id".');
    }

    if (!method.name?.trim()) {
      throw new Error(`Method "${method.id}" must have a non-empty "name".`);
    }

    if (!method.file?.trim()) {
      throw new Error(`Method "${method.id}" must have a non-empty "file".`);
    }

    const existing = builders.get(method.id);
    const calls = new Set(method.calls ?? []);

    for (const child of method.children ?? []) {
      calls.add(child.id);
    }

    if (existing) {
      warnings.push(`Duplicate method id "${method.id}" encountered. The first definition was kept.`);
    } else {
      builders.set(method.id, {
        id: method.id,
        name: method.name,
        file: method.file,
        code: method.code ?? '// Code preview was not provided for this method.',
        calls,
        calledBy: new Set(parentId ? [parentId] : []),
        references: [...(method.references ?? [])],
        examples: [...(method.examples ?? [])],
        metrics: {
          executionTimeMs: method.metrics?.executionTimeMs,
          frequency: method.metrics?.frequency
        },
        metadata: { ...(method.metadata ?? {}) }
      });
    }

    for (const child of method.children ?? []) {
      this.collectMethod(child, builders, warnings, method.id);
    }
  }

  private buildEdges(builders: Map<string, NodeBuilder>, warnings: string[]): GraphEdge[] {
    const edges = new Map<string, GraphEdge>();

    for (const builder of builders.values()) {
      for (const target of builder.calls) {
        const targetBuilder = builders.get(target);

        if (!targetBuilder) {
          warnings.push(`Method "${builder.id}" references unknown call target "${target}".`);
          continue;
        }

        targetBuilder.calledBy.add(builder.id);
        const edgeId = `${builder.id}->${target}`;
        edges.set(edgeId, {
          id: edgeId,
          source: builder.id,
          target
        });
      }
    }

    return Array.from(edges.values());
  }

  private findRoots(builders: Map<string, NodeBuilder>): string[] {
    const roots = Array.from(builders.values())
      .filter((builder) => builder.calledBy.size === 0)
      .map((builder) => builder.id);

    if (roots.length > 0) {
      return roots;
    }

    const firstNode = builders.values().next().value as NodeBuilder | undefined;
    return firstNode ? [firstNode.id] : [];
  }

  private computeDepths(builders: Map<string, NodeBuilder>, roots: string[]): Map<string, number> {
    const depthMap = new Map<string, number>();
    const queue = roots.map((rootId) => ({ id: rootId, depth: 0 }));

    while (queue.length > 0) {
      const current = queue.shift();

      if (!current) {
        continue;
      }

      const previousDepth = depthMap.get(current.id);

      if (previousDepth !== undefined && previousDepth <= current.depth) {
        continue;
      }

      depthMap.set(current.id, current.depth);
      const node = builders.get(current.id);

      for (const target of node?.calls ?? []) {
        queue.push({
          id: target,
          depth: current.depth + 1
        });
      }
    }

    return depthMap;
  }

  private detectCycles(builders: Map<string, NodeBuilder>): string[][] {
    const visited = new Set<string>();
    const path: string[] = [];
    const cycles = new Map<string, string[]>();

    const visit = (nodeId: string): void => {
      if (visited.has(nodeId)) {
        return;
      }

      visited.add(nodeId);
      path.push(nodeId);

      for (const target of builders.get(nodeId)?.calls ?? []) {
        if (!builders.has(target)) {
          continue;
        }

        const cycleStart = path.indexOf(target);

        if (cycleStart >= 0) {
          const cycle = path.slice(cycleStart);
          const normalized = this.normalizeCycle(cycle);
          cycles.set(normalized.join('>'), normalized);
          continue;
        }

        visit(target);
      }

      path.pop();
    };

    for (const nodeId of builders.keys()) {
      visit(nodeId);
    }

    return Array.from(cycles.values());
  }

  private normalizeCycle(cycle: string[]): string[] {
    if (cycle.length <= 1) {
      return cycle;
    }

    const rotations = cycle.map((_, index) => [...cycle.slice(index), ...cycle.slice(0, index)]);
    return rotations.reduce((best, current) =>
      current.join('>').localeCompare(best.join('>')) < 0 ? current : best
    );
  }
}
