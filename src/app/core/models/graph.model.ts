export interface MethodNode {
  id: string;
  name: string;
  file: string;
  code?: string;
  calls: string[];
  references?: Record<string, any>;
  examples?: Record<string, any>;
}

export interface GraphData {
  methods: MethodNode[];
}

export interface NodeMetrics {
  executionTime?: number;
  frequency?: number;
}
