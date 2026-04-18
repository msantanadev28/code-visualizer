import { Injectable, signal, computed, effect } from '@angular/core';

export interface MethodNode {
  id: string;
  name: string;
  file: string;
  code?: string;
  calls: string[];
  type?: 'function' | 'class' | 'module';
}

export interface GraphData {
  methods: MethodNode[];
}

export const INITIAL_DATA: GraphData = {
  methods: [
    {
      id: 'main',
      name: 'main()',
      file: 'src/main.ts',
      calls: ['initApp', 'loadConfig'],
      code: `function main() {
  const config = loadConfig();
  initApp(config);
}`
    },
    {
      id: 'initApp',
      name: 'initApp()',
      file: 'src/app.ts',
      calls: ['renderDashboard', 'connectDb'],
      code: `function initApp(config) {\n  connectDb(config.dbUrl);\n  renderDashboard();\n}`
    },
    {
      id: 'loadConfig',
      name: 'loadConfig()',
      file: 'src/config.ts',
      calls: [],
      code: `function loadConfig() {\n  return { dbUrl: 'postgres://localhost/db' };\n}`
    },
    {
      id: 'renderDashboard',
      name: 'renderDashboard()',
      file: 'src/dashboard.ts',
      calls: [],
      code: `function renderDashboard() {\n  console.log('Rendering dashboard');\n}`
    },
    {
      id: 'connectDb',
      name: 'connectDb()',
      file: 'src/db.ts',
      calls: [],
      code: `function connectDb(url) {\n  console.log('Connected to', url);\n}`
    }
  ]
};

@Injectable({ providedIn: 'root' })
export class GraphStateService {
  readonly jsonContent = signal<string>(JSON.stringify(INITIAL_DATA, null, 2));
  readonly selectedNodeId = signal<string | null>(null);
  readonly layoutMode = signal<'dagre' | 'breadthfirst' | 'circle'>('dagre');

  readonly parsedData = computed<GraphData | null>(() => {
    try {
      return JSON.parse(this.jsonContent());
    } catch {
      return null;
    }
  });

  readonly selectedNode = computed(() => {
    const data = this.parsedData();
    const id = this.selectedNodeId();
    if (!data || !id) return null;
    return data.methods.find(m => m.id === id) || null;
  });

  updateJson(json: string) {
    this.jsonContent.set(json);
  }

  selectNode(id: string | null) {
    this.selectedNodeId.set(id);
  }

  setLayoutMode(mode: 'dagre' | 'breadthfirst' | 'circle') {
    this.layoutMode.set(mode);
  }
}
