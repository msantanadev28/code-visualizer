import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphStateService } from '../../services/graph-state.service';

@Component({
  selector: 'app-node-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col bg-neutral-800 rounded-2xl shadow-lg border border-neutral-700 overflow-hidden">
      <div class="px-4 py-3 bg-neutral-900 border-b border-neutral-700 font-semibold text-neutral-300">
        Inspector
      </div>
      <div class="p-6 flex-grow overflow-y-auto w-full">
        @if (node()) {
          <h2 class="text-2xl font-bold text-emerald-400 mb-2">{{ node()?.name }}</h2>
          <div class="text-sm text-neutral-400 mb-6 font-mono bg-neutral-900 px-3 py-1 rounded inline-block">
            {{ node()?.file }}
          </div>

          <div class="mb-6">
            <h3 class="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-3">Outgoing Calls ({{ node()?.calls?.length || 0 }})</h3>
            @if (node()?.calls?.length) {
              <div class="flex flex-wrap gap-2">
                @for (call of node()?.calls; track call) {
                  <span class="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded-full text-sm cursor-pointer transition-colors" (click)="state.selectNode(call)">
                    {{ call }}
                  </span>
                }
              </div>
            } @else {
              <p class="text-neutral-500 text-sm">No outgoing calls</p>
            }
          </div>

          @if (node()?.code) {
            <div>
              <h3 class="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-3">Code Reference</h3>
              <pre class="bg-neutral-900 border border-neutral-700 rounded-xl p-4 text-sm font-mono text-neutral-300 overflow-x-auto whitespace-pre-wrap selection:bg-emerald-900"><code>{{ node()?.code }}</code></pre>
            </div>
          }
        } @else {
          <div class="h-full flex items-center justify-center text-neutral-500 text-sm italic">
            Select a node in the graph to inspect details
          </div>
        }
      </div>
    </div>
  `
})
export class NodeDetailsComponent {
  state = inject(GraphStateService);
  node = this.state.selectedNode;
}
