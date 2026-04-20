import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Method {
  id: string;
  name: string;
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
  template: `
    <div class="flex h-screen w-full bg-[#08090a] text-slate-300 font-sans overflow-hidden">

      <!-- --- Main Execution Workspace --- -->
      <main class="flex-1 flex flex-col relative">

        <!-- Simplified Header -->
        <header class="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#08090a] z-20">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
            </div>
            <h1 class="text-sm font-bold text-white tracking-wide uppercase">Execution Flow</h1>
          </div>

          <div class="flex items-center gap-3">
            <button
              (click)="toggleCode()"
              [class]="showCode() ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-white/10 text-slate-500 hover:text-slate-300'"
              class="flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              {{ showCode() ? 'Hide Logic' : 'Show Logic' }}
            </button>

            <button
              (click)="toggleEditor()"
              [class]="showEditor() ? 'bg-white text-black border-white' : 'border-white/10 text-slate-300 hover:bg-white/5'"
              class="flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              {{ showEditor() ? 'Close Config' : 'Edit Config' }}
            </button>
          </div>
        </header>

        <!-- Collapsible Config Editor Overlay -->
        <div
          [class.max-h-0]="!showEditor()"
          [class.opacity-0]="!showEditor()"
          [class.max-h-[500px]]="showEditor()"
          [class.opacity-100]="showEditor()"
          class="absolute top-16 left-0 right-0 bg-[#0d0e10] border-b border-white/10 transition-all duration-500 ease-in-out z-10 overflow-hidden"
        >
          <div class="p-6 max-w-5xl mx-auto flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black uppercase tracking-widest text-indigo-500">JSON Schema Editor</span>
              <button
                (click)="handleSave(editorArea.value)"
                class="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-[11px] font-bold hover:bg-indigo-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Update Flow
              </button>
            </div>
            <textarea
              #editorArea
              class="w-full h-64 bg-black/50 border border-white/5 rounded-xl p-4 font-mono text-xs text-indigo-300 outline-none focus:border-indigo-500/50 resize-none"
              [value]="jsonInput()"
              spellcheck="false"
            ></textarea>
          </div>
        </div>

        <!-- Visual Flow Path -->
        <div class="flex-1 flex flex-col items-center justify-center p-10 space-y-12">

          <div class="flex items-center gap-4 overflow-x-auto py-8 max-w-full no-scrollbar">
            @for (method of data().methods; track method.id; let idx = $index) {
              <div class="flex items-center">
                <button
                  (click)="setActiveStep(idx)"
                  [class.bg-indigo-600]="activeStep() === idx"
                  class="relative group flex flex-col items-start min-w-[200px] w-52 p-5 rounded-2xl border transition-all duration-500"
                  [class.bg-indigo-600]="activeStep() === idx"
                  [class.bg-white]="activeStep() !== idx"
                  [ngClass]="activeStep() === idx
                      ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_40px_-10px_rgba(79,70,229,0.4)] scale-105'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/20'"
                >
                  <div class="flex items-center justify-between w-full mb-3">
                    <div [class]="activeStep() === idx ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500'" class="p-1.5 rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
                    </div>
                    <span class="text-[10px] font-mono text-slate-500">0{{idx + 1}}</span>
                  </div>

                  <h3 [class]="activeStep() === idx ? 'text-white' : 'text-slate-400'" class="text-sm font-bold mb-1 truncate w-full">
                    {{method.name}}
                  </h3>
                  <p class="text-[10px] text-slate-500 line-clamp-1">{{method.description}}</p>

                  @if (activeStep() === idx) {
                    <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-500 rounded-full"></div>
                  }
                </button>

                @if (idx < data().methods.length - 1) {
                  <div class="flex items-center px-1">
                    <div [class]="activeStep() > idx ? 'bg-indigo-500' : 'bg-white/10'" class="h-px w-6"></div>
                    <svg [class]="activeStep() > idx ? 'text-indigo-500' : 'text-white/10'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    <div [class]="activeStep() > idx ? 'bg-indigo-500' : 'bg-white/10'" class="h-px w-6"></div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Context Details Card -->
          <div class="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            <!-- Info Section -->
            <div class="md:col-span-1 space-y-4">
              <div class="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                <div class="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-4">Step Details</div>
                <h2 class="text-xl font-bold text-white mb-2">{{currentMethod()?.name}}</h2>
                <p class="text-xs leading-relaxed text-slate-400 mb-6">{{currentMethod()?.description}}</p>

                <div class="flex items-center gap-4 py-4 border-t border-white/5">
                  <div class="flex flex-col">
                    <span class="text-[9px] uppercase text-slate-500 font-bold">Latency</span>
                    <span class="text-sm font-mono text-white flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {{currentMethod()?.metrics?.time}}
                    </span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[9px] uppercase text-slate-500 font-bold">Status</span>
                    <span class="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Live
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Code Section -->
            @if (showCode()) {
              <div class="md:col-span-2 rounded-3xl bg-black border border-white/5 p-8 relative group overflow-hidden transition-all duration-500">
                <div class="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2 text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15a2 2 0 0 1 0 3.48l-9 5.15A2 2 0 0 1 4.5 16.33V7.67a2 2 0 0 1 3-1.73Z"/><path d="M12 12V4"/></svg>
                    <span class="text-[10px] font-bold uppercase tracking-tighter">Implementation Snippet</span>
                  </div>
                </div>
                <pre class="text-sm font-mono leading-relaxed text-indigo-200/90 whitespace-pre overflow-x-auto">{{currentMethod()?.code}}</pre>
              </div>
            }
          </div>
        </div>

        <!-- Footer Navigation -->
        <footer class="h-12 border-t border-white/5 flex items-center justify-center bg-[#08090a]">
          <div class="flex gap-2">
            @for (m of data().methods; track $index; let i = $index) {
              <button
                (click)="setActiveStep(i)"
                [class]="activeStep() === i ? 'w-10 bg-indigo-500' : 'w-2 bg-white/10 hover:bg-white/20'"
                class="h-1.5 rounded-full transition-all duration-300"
              ></button>
            }
          </div>
        </footer>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slide-in-from-bottom { from { transform: translateY(1rem); } to { transform: translateY(0); } }
    .animate-in { animation: fade-in 0.7s ease-out, slide-in-from-bottom 0.7s ease-out; }
  `]
})
export class App {
  // Initial Data
  private readonly initialData: ExecutionData = {
    methods: [
      {
        id: 'bootstrap',
        name: 'bootstrapApp',
        description: 'Initializes the application workspace and visualizer.',
        code: 'const workspace = await loadWorkspace();\nconst model = parseModel(workspace);\nmountVisualizer(model);',
        metrics: { time: '4.8ms' }
      },
      {
        id: 'load',
        name: 'loadWorkspace',
        description: 'Fetches raw configuration from the data source.',
        code: 'const raw = await fetchJson();\nreturn JSON.parse(raw);',
        metrics: { time: '12.6ms' }
      },
      {
        id: 'fetch',
        name: 'fetchJson',
        description: 'API call to retrieve workspace definition.',
        code: 'return Promise.resolve(sampleData);',
        metrics: { time: '2.1ms' }
      },
      {
        id: 'parse',
        name: 'parseModel',
        description: 'Normalizes raw data into a graph structure.',
        code: 'const methods = normalize(data);\ndetectCycles(methods);\nreturn buildGraph(methods);',
        metrics: { time: '18.7ms' }
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
