import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { GraphStateService } from '../../core/services/graph-state.service';

@Component({
  selector: 'app-json-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, MonacoEditorModule],
  template: `
    <div class="flex flex-col h-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div class="px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">Data Input (JSON)</h3>
        <button 
          (click)="loadSample()"
          class="text-xs px-2 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded transition-colors shadow-sm">
          Load Sample
        </button>
      </div>
      <div class="flex-1 relative">
        <ngx-monaco-editor 
          class="absolute inset-0 h-full w-full"
          [options]="editorOptions" 
          [ngModel]="code" 
          (ngModelChange)="onCodeChange($event)">
        </ngx-monaco-editor>
      </div>
      
      @if (!state.isValidJson()) {
        <div class="p-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs text-center font-medium">
          Invalid JSON Schema
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
  `]
})
export class JsonEditorComponent {
  state = inject(GraphStateService);
  
  editorOptions = {
    theme: 'vs-dark',
    language: 'json',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 13,
    wordWrap: 'on',
    formatOnType: true,
    automaticLayout: true
  };

  get code() {
    return this.state.rawData();
  }

  onCodeChange(val: string) {
    this.state.updateRawData(val);
  }

  loadSample() {
    this.state.loadSampleData();
  }
}
