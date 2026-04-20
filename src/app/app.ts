import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Parameter {
  name: string;
  type: string;
  description?: string;
}

interface Method {
  id: string;
  name: string;
  className?: string; // Classes support added here
  parameters?: Parameter[]; // Parameters support added here
  description: string;
  code: string;
  metrics: {
    time: string;
  };
  file?: string;
}

interface ExecutionData {
  methods: Method[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  // Initial Data
  private readonly initialData: ExecutionData = {
    methods: [
      {
        id: 'bootstrap',
        name: 'bootstrapApp',
        className: 'CoreVisualizer',
        parameters: [
          { name: 'options', type: 'BootstrapOptions', description: 'Application start configuration' }
        ],
        description: 'Initializes the application workspace and visualizer.',
        code: 'const workspace = await loadWorkspace();\nconst model = parseModel(workspace);\nmountVisualizer(model);',
        metrics: { time: '4.8ms' },
        file: 'core/visualizer.ts'
      },
      {
        id: 'load',
        name: 'loadWorkspace',
        className: 'WorkspaceLoader',
        parameters: [],
        description: 'Fetches raw configuration from the data source.',
        code: 'const raw = await fetchJson();\nreturn JSON.parse(raw);',
        metrics: { time: '12.6ms' },
        file: 'services/loader.ts'
      },
      {
        id: 'fetch',
        name: 'fetchJson',
        className: 'ApiGateway',
        parameters: [
          { name: 'endpoint', type: 'string', description: 'The API endpoint to query' },
          { name: 'headers', type: 'Record<string, string>', description: 'Optional request headers' }
        ],
        description: 'API call to retrieve workspace definition.',
        code: 'return Promise.resolve(sampleData);',
        metrics: { time: '2.1ms' },
        file: 'api/gateway.ts'
      },
      {
        id: 'parse',
        name: 'parseModel',
        className: 'ModelParser',
        parameters: [
          { name: 'data', type: 'RawWorkspaceData', description: 'The raw JSON to parse' }
        ],
        description: 'Normalizes raw data into a graph structure.',
        code: 'const methods = normalize(data);\ndetectCycles(methods);\nreturn buildGraph(methods);',
        metrics: { time: '18.7ms' },
        file: 'utils/parser.ts'
      }
    ]
  };

  // State Management using Signals
  data = signal<ExecutionData>(this.initialData);
  jsonInput = signal<string>(JSON.stringify(this.initialData, null, 2));
  activeStep = signal<number>(0);
  showCode = signal<boolean>(true);
  showEditor = signal<boolean>(false);

  // Derived state
  currentMethod = computed(() => this.data().methods[this.activeStep()] || this.data().methods[0]);

  constructor() {
    // Effect can be used for logging or local storage if needed
    effect(() => {
      console.log('Active step changed to:', this.activeStep());
    });
  }

  // Actions
  setActiveStep(index: number) {
    this.activeStep.set(index);
  }

  toggleCode() {
    this.showCode.update(v => !v);
  }

  toggleEditor() {
    this.showEditor.update(v => !v);
  }

  handleSave(newValue: string) {
    try {
      const parsed = JSON.parse(newValue);
      this.data.set(parsed);
      this.jsonInput.set(newValue);
      this.activeStep.set(0);
      this.showEditor.set(false);
    } catch (e) {
      // In a real app, we'd use a custom toast here
      console.error('Invalid JSON format');
    }
  }
}
