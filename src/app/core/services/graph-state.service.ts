import { computed, inject, Injectable, signal } from '@angular/core';

import {
  GraphLayout,
  GraphNode,
  GraphStats,
  ParsedGraph,
  ProjectedGraph
} from '../models/graph.models';
import { SAMPLE_GRAPH_JSON } from '../data/sample-graph';
import { GraphParserService } from './graph-parser.service';

@Injectable({
  providedIn: 'root'
})
export class GraphStateService {
  private readonly parser = inject(GraphParserService);

  readonly rawJson = signal(SAMPLE_GRAPH_JSON);
  readonly parseError = signal<string | null>(null);
  readonly graph = signal<ParsedGraph>(this.parser.parse(SAMPLE_GRAPH_JSON));
  readonly layout = signal<GraphLayout>('dag');
  readonly searchQuery = signal('');
  readonly leftPanelCollapsed = signal(false);
  readonly rightPanelCollapsed = signal(false);
  readonly collapsedNodeIds = signal<Set<string>>(new Set());
  readonly selectedNodeId = signal<string | null>(this.graph().roots[0] ?? this.graph().nodes[0]?.id ?? null);
  readonly simulationPath = signal<string[]>([]);
  readonly simulationIndex = signal(-1);

  readonly nodeMap = computed(() => new Map(this.graph().nodes.map((node) => [node.id, node])));

  readonly cycleMap = computed(() => {
    const map = new Map<string, string[][]>();

    for (const cycle of this.graph().cycles) {
      for (const nodeId of cycle) {
        const existing = map.get(nodeId) ?? [];
        existing.push(cycle);
        map.set(nodeId, existing);
      }
    }

    return map;
  });

  readonly selectedNode = computed(() => {
    const selectedNodeId = this.selectedNodeId();
    return selectedNodeId ? this.nodeMap().get(selectedNodeId) ?? null : null;
  });

  readonly visibleGraph = computed<ProjectedGraph>(() => {
    const graph = this.graph();
    const visibleIds = this.createVisibleNodeSet(graph);
    const nodes = graph.nodes.filter((node) => visibleIds.has(node.id));
    const edges = graph.edges.filter(
      (edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target)
    );

    return {
      nodes,
      edges,
      hiddenNodeCount: graph.nodes.length - nodes.length
    };
  });

  readonly highlightedNodeIds = computed(() => {
    const selectedNode = this.selectedNode();
    if (!selectedNode) {
      return new Set<string>();
    }

    return new Set([
      selectedNode.id,
      ...this.collectAncestors(selectedNode.id),
      ...this.collectDescendants(selectedNode.id)
    ]);
  });

  readonly simulationNodeId = computed(() => {
    const simulationIndex = this.simulationIndex();
    return simulationIndex >= 0 ? this.simulationPath()[simulationIndex] ?? null : null;
  });

  readonly selectedIncoming = computed(() => {
    const selectedNode = this.selectedNode();
    if (!selectedNode) {
      return [];
    }

    return selectedNode.calledBy
      .map((nodeId) => this.nodeMap().get(nodeId))
      .filter((node): node is GraphNode => Boolean(node));
  });

  readonly selectedOutgoing = computed(() => {
    const selectedNode = this.selectedNode();
    if (!selectedNode) {
      return [];
    }

    return selectedNode.calls
      .map((nodeId) => this.nodeMap().get(nodeId))
      .filter((node): node is GraphNode => Boolean(node));
  });

  readonly graphStats = computed<GraphStats>(() => ({
    nodes: this.visibleGraph().nodes.length,
    edges: this.visibleGraph().edges.length,
    cycles: this.graph().cycles.length,
    highlighted: this.highlightedNodeIds().size,
    simulatedSteps: this.simulationPath().length
  }));

  applyJson(json: string): void {
    this.rawJson.set(json);

    try {
      const parsed = this.parser.parse(json);
      this.graph.set(parsed);
      this.parseError.set(null);
      this.collapsedNodeIds.set(new Set());
      this.simulationPath.set([]);
      this.simulationIndex.set(-1);

      const selectedId = this.selectedNodeId();
      const fallbackId = parsed.roots[0] ?? parsed.nodes[0]?.id ?? null;
      this.selectedNodeId.set(selectedId && parsed.nodes.some((node) => node.id === selectedId) ? selectedId : fallbackId);
    } catch (error) {
      this.parseError.set(error instanceof Error ? error.message : 'Unable to parse the provided graph JSON.');
    }
  }

  loadSample(): void {
    this.applyJson(SAMPLE_GRAPH_JSON);
  }

  formatJson(): void {
    try {
      const formatted = JSON.stringify(JSON.parse(this.rawJson()), null, 2);
      this.applyJson(formatted);
    } catch {
      this.parseError.set('JSON must be valid before it can be formatted.');
    }
  }

  importJson(json: string): void {
    this.applyJson(json);
  }

  exportJson(): void {
    const blob = new Blob([this.rawJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'execution-graph.json';
    anchor.click();

    URL.revokeObjectURL(url);
  }

  selectNode(nodeId: string): void {
    this.selectedNodeId.set(nodeId);
  }

  setLayout(layout: GraphLayout): void {
    this.layout.set(layout);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  togglePanel(panel: 'left' | 'right'): void {
    if (panel === 'left') {
      this.leftPanelCollapsed.update((collapsed) => !collapsed);
      return;
    }

    this.rightPanelCollapsed.update((collapsed) => !collapsed);
  }

  toggleNodeCollapsed(nodeId: string): void {
    this.collapsedNodeIds.update((collapsedNodeIds) => {
      const next = new Set(collapsedNodeIds);

      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }

      return next;
    });
  }

  expandAll(): void {
    this.collapsedNodeIds.set(new Set());
  }

  collapseSelectedBranch(): void {
    const selectedNode = this.selectedNode();

    if (selectedNode?.calls.length) {
      this.toggleNodeCollapsed(selectedNode.id);
    }
  }

  startSimulation(): void {
    const startNodeId = this.selectedNodeId() ?? this.graph().roots[0] ?? null;

    if (!startNodeId) {
      this.simulationPath.set([]);
      this.simulationIndex.set(-1);
      return;
    }

    const path = this.buildTraversalSequence(startNodeId);
    this.simulationPath.set(path);
    this.simulationIndex.set(path.length ? 0 : -1);

    if (path.length > 0) {
      this.selectedNodeId.set(path[0]);
    }
  }

  stepSimulation(direction: 1 | -1): void {
    const simulationPath = this.simulationPath();
    if (!simulationPath.length) {
      return;
    }

    const nextIndex = Math.min(
      simulationPath.length - 1,
      Math.max(0, this.simulationIndex() + direction)
    );

    this.simulationIndex.set(nextIndex);
    this.selectedNodeId.set(simulationPath[nextIndex] ?? null);
  }

  resetSimulation(): void {
    this.simulationPath.set([]);
    this.simulationIndex.set(-1);
  }

  isNodeCollapsed(nodeId: string): boolean {
    return this.collapsedNodeIds().has(nodeId);
  }

  private createVisibleNodeSet(graph: ParsedGraph): Set<string> {
    const visibleIds = new Set(graph.nodes.map((node) => node.id));
    const query = this.searchQuery().trim().toLowerCase();

    if (query) {
      visibleIds.clear();

      for (const node of graph.nodes) {
        const searchable = [node.id, node.name, node.file, ...node.references, ...node.examples]
          .join(' ')
          .toLowerCase();

        if (!searchable.includes(query)) {
          continue;
        }

        visibleIds.add(node.id);
        for (const ancestorId of this.collectAncestors(node.id)) {
          visibleIds.add(ancestorId);
        }
        for (const descendantId of this.collectDescendants(node.id)) {
          visibleIds.add(descendantId);
        }
      }
    }

    for (const collapsedNodeId of this.collapsedNodeIds()) {
      if (!visibleIds.has(collapsedNodeId)) {
        continue;
      }

      for (const descendantId of this.collectDescendants(collapsedNodeId)) {
        visibleIds.delete(descendantId);
      }
      visibleIds.add(collapsedNodeId);
    }

    return visibleIds;
  }

  private collectAncestors(nodeId: string, visited = new Set<string>()): string[] {
    const node = this.nodeMap().get(nodeId);
    if (!node) {
      return [];
    }

    const ancestors: string[] = [];

    for (const parentId of node.calledBy) {
      if (visited.has(parentId)) {
        continue;
      }

      visited.add(parentId);
      ancestors.push(parentId, ...this.collectAncestors(parentId, visited));
    }

    return ancestors;
  }

  private collectDescendants(nodeId: string, visited = new Set<string>()): string[] {
    const node = this.nodeMap().get(nodeId);
    if (!node) {
      return [];
    }

    const descendants: string[] = [];

    for (const childId of node.calls) {
      if (visited.has(childId)) {
        continue;
      }

      visited.add(childId);
      descendants.push(childId, ...this.collectDescendants(childId, visited));
    }

    return descendants;
  }

  private buildTraversalSequence(startNodeId: string): string[] {
    const sequence: string[] = [];
    const visited = new Set<string>();

    const traverse = (nodeId: string): void => {
      if (visited.has(nodeId)) {
        return;
      }

      visited.add(nodeId);
      sequence.push(nodeId);

      for (const childId of this.nodeMap().get(nodeId)?.calls ?? []) {
        traverse(childId);
      }
    };

    traverse(startNodeId);

    for (const rootId of this.graph().roots) {
      traverse(rootId);
    }

    return sequence;
  }
}
