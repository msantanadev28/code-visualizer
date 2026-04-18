import { Component, inject, signal } from '@angular/core';
import { JsonEditorComponent } from './components/json-editor/json-editor.component';
import { GraphCanvasComponent } from './components/graph-canvas/graph-canvas.component';
import { NodeDetailsComponent } from './components/node-details/node-details.component';
import { GraphStateService } from './services/graph-state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, JsonEditorComponent, GraphCanvasComponent, NodeDetailsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private state = inject(GraphStateService);
  
  public getLayoutClass(mode: string): string {
    const base = 'px-3 py-1.5 rounded-md transition-colors';
    return this.state.layoutMode() === mode 
      ? `${base} bg-neutral-800 text-emerald-400 shadow-sm` 
      : `${base} text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50`;
  }
  
  public setLayout(mode: 'dagre' | 'breadthfirst' | 'circle'): void {
    this.state.setLayoutMode(mode);
  }
}

