import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';

import { GraphLayout, GraphStats } from '../../../core/models/graph.models';

@Component({
  selector: 'app-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-black/20 backdrop-blur xl:p-5'
  },
  template: `
    <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div class="space-y-2">
        <p class="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-cyan-300/75">
          Code Visualizer
        </p>
        <div>
          <h1 class="font-display text-3xl font-semibold tracking-tight text-white">
            Execution Flow Atlas
          </h1>
          <p class="mt-1 max-w-3xl text-sm text-slate-300/80">
            Inspect call graphs, follow execution paths, and step through structured code relationships from JSON.
          </p>
        </div>
      </div>

      <div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <article class="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
          <div class="text-[0.65rem] uppercase tracking-[0.24em] text-slate-400">Visible nodes</div>
          <div class="mt-2 text-2xl font-semibold text-white">{{ stats().nodes }}</div>
        </article>
        <article class="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
          <div class="text-[0.65rem] uppercase tracking-[0.24em] text-slate-400">Edges</div>
          <div class="mt-2 text-2xl font-semibold text-white">{{ stats().edges }}</div>
        </article>
        <article class="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
          <div class="text-[0.65rem] uppercase tracking-[0.24em] text-slate-400">Cycles</div>
          <div class="mt-2 text-2xl font-semibold text-amber-300">{{ stats().cycles }}</div>
        </article>
        <article class="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
          <div class="text-[0.65rem] uppercase tracking-[0.24em] text-slate-400">Simulation steps</div>
          <div class="mt-2 text-2xl font-semibold text-emerald-300">{{ stats().simulatedSteps }}</div>
        </article>
      </div>
    </div>

    <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div class="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
        <label class="relative block min-w-0 flex-1">
          <span class="sr-only">Search methods</span>
          <input
            type="search"
            class="h-11 w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 pr-11 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
            [value]="query()"
            (input)="searchChanged.emit(searchInput.value)"
            #searchInput
            placeholder="Search method, file, reference or example"
          />
          <span class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-500">
            /
          </span>
        </label>

        <div class="flex flex-wrap gap-2">
          @for (option of layouts; track option.value) {
            <button
              type="button"
              class="rounded-2xl border px-4 py-2 text-sm font-medium transition"
              [class.border-cyan-300/60]="layout() === option.value"
              [class.bg-cyan-300/15]="layout() === option.value"
              [class.text-cyan-100]="layout() === option.value"
              [class.border-white/10]="layout() !== option.value"
              [class.bg-white/5]="layout() !== option.value"
              [class.text-slate-300]="layout() !== option.value"
              (click)="layoutChanged.emit(option.value)"
            >
              {{ option.label }}
            </button>
          }
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <button type="button" class="toolbar-button" (click)="togglePanel.emit('left')">
          {{ leftPanelCollapsed() ? 'Show editor' : 'Hide editor' }}
        </button>
        <button type="button" class="toolbar-button" (click)="togglePanel.emit('right')">
          {{ rightPanelCollapsed() ? 'Show inspector' : 'Hide inspector' }}
        </button>
        <button type="button" class="toolbar-button" (click)="expandAll.emit()">Expand all</button>
        <button
          type="button"
          class="toolbar-button"
          [disabled]="!hasSelectedNode()"
          (click)="collapseSelected.emit()"
        >
          Toggle branch
        </button>
        <button type="button" class="toolbar-button" (click)="formatJson.emit()">Format JSON</button>
        <button type="button" class="toolbar-button" (click)="loadSample.emit()">Load sample</button>
        <button type="button" class="toolbar-button" (click)="openFilePicker()">Import</button>
        <button type="button" class="toolbar-button toolbar-button--primary" (click)="exportJson.emit()">
          Export
        </button>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2 border-t border-white/8 pt-3">
      <button type="button" class="toolbar-button" (click)="startSimulation.emit()">Start simulation</button>
      <button type="button" class="toolbar-button" [disabled]="!canStepBackward()" (click)="stepBackward.emit()">
        Previous
      </button>
      <button type="button" class="toolbar-button" [disabled]="!canStepForward()" (click)="stepForward.emit()">
        Next
      </button>
      <button type="button" class="toolbar-button" [disabled]="!simulationLength()" (click)="resetSimulation.emit()">
        Reset
      </button>
      <p class="ml-auto text-sm text-slate-400">
        @if (simulationLength()) {
          Step {{ simulationIndex() + 1 }} of {{ simulationLength() }}
        } @else {
          Choose a node to simulate from its execution branch.
        }
      </p>
    </div>

    <input
      #fileInput
      hidden
      type="file"
      accept="application/json,.json"
      (change)="onFileSelected()"
    />
  `,
  styles: `
    .toolbar-button {
      border: 1px solid rgb(255 255 255 / 0.1);
      background: rgb(255 255 255 / 0.05);
      color: rgb(226 232 240);
      border-radius: 1rem;
      padding: 0.65rem 0.95rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition: background 180ms ease, border-color 180ms ease, transform 180ms ease;
    }

    .toolbar-button:hover:not(:disabled) {
      background: rgb(34 211 238 / 0.12);
      border-color: rgb(103 232 249 / 0.4);
      transform: translateY(-1px);
    }

    .toolbar-button:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    .toolbar-button--primary {
      border-color: rgb(34 211 238 / 0.5);
      background: linear-gradient(135deg, rgb(8 145 178 / 0.9), rgb(14 116 144 / 0.9));
      color: white;
    }
  `
})
export class ToolbarComponent {
  readonly stats = input.required<GraphStats>();
  readonly layout = input.required<GraphLayout>();
  readonly query = input.required<string>();
  readonly leftPanelCollapsed = input.required<boolean>();
  readonly rightPanelCollapsed = input.required<boolean>();
  readonly hasSelectedNode = input.required<boolean>();
  readonly simulationIndex = input.required<number>();
  readonly simulationLength = input.required<number>();

  readonly searchChanged = output<string>();
  readonly layoutChanged = output<GraphLayout>();
  readonly togglePanel = output<'left' | 'right'>();
  readonly loadSample = output<void>();
  readonly formatJson = output<void>();
  readonly fileImported = output<string>();
  readonly exportJson = output<void>();
  readonly startSimulation = output<void>();
  readonly stepBackward = output<void>();
  readonly stepForward = output<void>();
  readonly resetSimulation = output<void>();
  readonly expandAll = output<void>();
  readonly collapseSelected = output<void>();

  protected readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  protected readonly layouts: Array<{ label: string; value: GraphLayout }> = [
    { label: 'DAG', value: 'dag' },
    { label: 'Tree', value: 'tree' },
    { label: 'Force', value: 'force' }
  ];

  protected canStepBackward(): boolean {
    return this.simulationLength() > 0 && this.simulationIndex() > 0;
  }

  protected canStepForward(): boolean {
    return this.simulationLength() > 0 && this.simulationIndex() < this.simulationLength() - 1;
  }

  protected openFilePicker(): void {
    this.fileInput().nativeElement.click();
  }

  protected async onFileSelected(): Promise<void> {
    const element = this.fileInput().nativeElement;
    const file = element.files?.[0];

    if (!file) {
      return;
    }

    this.fileImported.emit(await file.text());
    element.value = '';
  }
}
