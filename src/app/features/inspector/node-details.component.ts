import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { GraphStateService } from '../../core/services/graph-state.service';

@Component({
  selector: 'app-node-details',
  standalone: true,
  imports: [CommonModule, FormsModule, MonacoEditorModule],
  template: `
    <div class="h-full bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
        <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          Node Inspector
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Select a node to view its details</p>
      </div>

      <div class="flex-1 overflow-y-auto p-5">
        @if (node()) {
          <div class="space-y-6 animate-fade-in">
            
            <!-- Basic Info -->
            <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
              <div class="mb-2">
                <span class="text-[10px] uppercase font-bold text-indigo-500 dark:text-indigo-400 tracking-wider">Method Name</span>
                <div class="text-base font-mono font-semibold text-slate-800 dark:text-slate-200">{{ node()?.name }}</div>
              </div>
              <div class="mb-2">
                <span class="text-[10px] uppercase font-bold text-indigo-500 dark:text-indigo-400 tracking-wider">File Origin</span>
                <div class="text-sm font-medium text-slate-600 dark:text-slate-400">{{ node()?.file }}</div>
              </div>
              <div>
                <span class="text-[10px] uppercase font-bold text-indigo-500 dark:text-indigo-400 tracking-wider">Node ID</span>
                <div class="text-xs text-slate-500 dark:text-slate-500 font-mono">{{ node()?.id }}</div>
              </div>
            </div>

            <!-- Relationships -->
            <div>
              <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 ml-1">Outgoing Calls</h3>
              @if (node()?.calls?.length) {
                <div class="flex flex-wrap gap-2">
                  @for (call of node()?.calls; track call) {
                    <span 
                      (click)="goToNode(call)"
                      class="cursor-pointer inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800/60 transition-colors border border-emerald-200 dark:border-emerald-800">
                      {{ call }}
                    </span>
                  }
                </div>
              } @else {
                <p class="text-xs text-slate-400 italic">No outgoing calls.</p>
              }
            </div>

            <!-- Code Preview -->
            @if (node()?.code) {
              <div class="mt-4 flex flex-col h-[300px]">
                <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 ml-1">Implementation</h3>
                <div class="flex-1 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                  <ngx-monaco-editor 
                    class="absolute inset-0 h-full w-full"
                    [options]="editorOptions" 
                    [ngModel]="node()?.code">
                  </ngx-monaco-editor>
                </div>
              </div>
            }

          </div>
        } @else {
          <div class="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-4">
            <svg class="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-sm font-medium">No node selected</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class NodeDetailsComponent {
  state = inject(GraphStateService);
  node = this.state.selectedNode;
  
  editorOptions = {
    theme: 'vs-dark',
    language: 'typescript',
    readOnly: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 12,
    lineNumbers: 'off',
    renderLineHighlight: 'none',
    automaticLayout: true
  };

  goToNode(id: string) {
    this.state.selectNode(id);
  }
}
