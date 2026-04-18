import { Component, OnInit, inject } from '@angular/core';
import { ToolbarComponent } from './shared/toolbar/toolbar.component';
import { JsonEditorComponent } from './features/editor/json-editor.component';
import { GraphCanvasComponent } from './features/graph/graph-canvas.component';
import { NodeDetailsComponent } from './features/inspector/node-details.component';
import { GraphStateService } from './core/services/graph-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ToolbarComponent,
    JsonEditorComponent,
    GraphCanvasComponent,
    NodeDetailsComponent
  ],
  template: `
    <div class="flex flex-col h-screen w-full bg-slate-100 dark:bg-slate-950 font-sans overflow-hidden">
      <app-toolbar></app-toolbar>
      
      <main class="flex-1 flex gap-4 p-4 min-h-0">
        <!-- Left Panel: JSON Editor -->
        <aside class="w-80 lg:w-96 flex-shrink-0 flex flex-col min-h-0">
          <app-json-editor></app-json-editor>
        </aside>

        <!-- Center Panel: Graph Visualization -->
        <section class="flex-1 min-w-0 min-h-0 relative">
          <app-graph-canvas></app-graph-canvas>
        </section>

        <!-- Right Panel: Node Inspector -->
        <aside class="w-80 lg:w-96 flex-shrink-0 flex flex-col min-h-0">
          <app-node-details></app-node-details>
        </aside>
      </main>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  state = inject(GraphStateService);

  ngOnInit() {
    // Optionally load sample data on startup
    // this.state.loadSampleData();
  }
}
