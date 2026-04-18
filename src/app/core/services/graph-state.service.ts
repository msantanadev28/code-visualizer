import { Injectable, signal, computed, inject } from '@angular/core';
import { GraphData, MethodNode } from '../models/graph.model';
import { GraphParserService } from './graph-parser.service';

export type LayoutType = 'dagre' | 'cose' | 'breadthfirst' | 'grid';

@Injectable({
  providedIn: 'root'
})
export class GraphStateService {
  private parser = inject(GraphParserService);

  // State
  rawData = signal<string>('{\n  "methods": []\n}');
  graphData = signal<GraphData | null>(null);
  selectedNodeId = signal<string | null>(null);
  searchQuery = signal<string>('');
  layout = signal<LayoutType>('dagre');

  // Computed state
  selectedNode = computed(() => {
    const data = this.graphData();
    const id = this.selectedNodeId();
    if (!data || !id) return null;
    return data.methods.find(m => m.id === id) || null;
  });

  isValidJson = computed(() => {
    return this.graphData() !== null;
  });

  cyElements = computed(() => {
    const data = this.graphData();
    if (!data) return { nodes: [], edges: [] };
    return this.parser.getNodesAndEdges(data);
  });

  // Actions
  updateRawData(jsonString: string) {
    this.rawData.set(jsonString);
    const parsed = this.parser.parseJson(jsonString);
    this.graphData.set(parsed);
    
    // Clear selection if node no longer exists
    if (parsed && this.selectedNodeId()) {
      const exists = parsed.methods.some(m => m.id === this.selectedNodeId());
      if (!exists) this.selectedNodeId.set(null);
    }
  }

  selectNode(id: string | null) {
    this.selectedNodeId.set(id);
  }

  setSearchQuery(query: string) {
    this.searchQuery.set(query);
  }

  setLayout(layout: LayoutType) {
    this.layout.set(layout);
  }

  loadSampleData() {
    const sample = {
      methods: [
        {
          id: "main",
          name: "main()",
          file: "index.ts",
          code: "function main() {\n  init();\n  loadData();\n  render();\n}",
          calls: ["init", "loadData", "render"]
        },
        {
          id: "init",
          name: "init()",
          file: "core.ts",
          code: "function init() {\n  setupConfig();\n}",
          calls: ["setupConfig"]
        },
        {
          id: "setupConfig",
          name: "setupConfig()",
          file: "config.ts",
          code: "function setupConfig() {\n  // load env vars\n}",
          calls: []
        },
        {
          id: "loadData",
          name: "loadData()",
          file: "api.ts",
          code: "async function loadData() {\n  return fetch('/api/data');\n}",
          calls: []
        },
        {
          id: "render",
          name: "render()",
          file: "ui.ts",
          code: "function render() {\n  // paint UI\n}",
          calls: []
        }
      ]
    };
    this.updateRawData(JSON.stringify(sample, null, 2));
  }
}
