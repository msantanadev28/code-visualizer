import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphStateService, LayoutType } from '../../core/services/graph-state.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm z-10 w-full relative">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>
        </div>
        <h1 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 tracking-tight">Code Flow Vis</h1>
      </div>

      <div class="flex items-center space-x-4">
        <div class="relative">
          <select 
            [ngModel]="state.layout()" 
            (ngModelChange)="onLayoutChange($event)"
            class="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-1.5 pl-3 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none transition-all cursor-pointer">
            <option value="dagre">DAG (Hierarchical)</option>
            <option value="breadthfirst">Tree (Breadth First)</option>
            <option value="cose">Force-Directed</option>
            <option value="grid">Grid</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        <button 
          (click)="loadDemo()"
          class="px-4 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-sm font-semibold transition-colors border border-indigo-200 dark:border-indigo-500/20 shadow-sm">
          Try Demo
        </button>
      </div>
    </header>
  `
})
export class ToolbarComponent {
  state = inject(GraphStateService);

  onLayoutChange(layout: string) {
    this.state.setLayout(layout as LayoutType);
  }
  
  loadDemo() {
    this.state.loadSampleData();
  }
}
