export type GraphLayout = 'tree' | 'dag' | 'force';

export interface GraphMetrics {
  executionTimeMs?: number;
  frequency?: number;
}

export interface InputMethod {
  id: string;
  name: string;
  file: string;
  code?: string;
  calls?: string[];
  children?: InputMethod[];
  references?: string[];
  examples?: string[];
  metrics?: GraphMetrics;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface GraphSchema {
  methods: InputMethod[];
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

export interface GraphNode {
  id: string;
  name: string;
  file: string;
  code: string;
  calls: string[];
  calledBy: string[];
  references: string[];
  examples: string[];
  metrics: GraphMetrics;
  metadata: Record<string, string | number | boolean | null>;
  depth: number;
  isRecursive: boolean;
}

export interface ParsedGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  roots: string[];
  cycles: string[][];
  warnings: string[];
}

export interface ProjectedGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  hiddenNodeCount: number;
}

export interface GraphStats {
  nodes: number;
  edges: number;
  cycles: number;
  highlighted: number;
  simulatedSteps: number;
}