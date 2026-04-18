import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { GraphStateService } from '../../services/graph-state.service';

@Component({
  selector: 'app-json-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorComponent],
  template: `
    <div class="h-full flex flex-col bg-neutral-800 rounded-2xl shadow-lg border border-neutral-700 overflow-hidden">
      <div class="px-4 py-3 bg-neutral-900 border-b border-neutral-700 font-semibold text-neutral-300 flex justify-between items-center">
        Input JSON
        <span class="text-xs text-neutral-500 font-mono">{{ isValid() ? 'Valid JSON' : 'Invalid JSON' }}</span>
      </div>
      <div class="flex-grow p-2" class="monaco-editor-container">
        <ngx-monaco-editor
          class="h-full"
          [options]="editorOptions"
          [ngModel]="state.jsonContent()"
          (ngModelChange)="onCodeChanged($event)">
        </ngx-monaco-editor>
      </div>
    </div>
  `
})
export class JsonEditorComponent {
  state = inject(GraphStateService);

  editorOptions = {
    theme: 'vs-dark',
    language: 'json',
    minimap: { enabled: false },
    fontSize: 13,
    scrollBeyondLastLine: false,
    roundedSelection: true,
    padding: { top: 16 }
  };

  isValid() {
    return this.state.parsedData() !== null;
  }

  onCodeChanged(newCode: string) {
    this.state.updateJson(newCode);
  }
}
