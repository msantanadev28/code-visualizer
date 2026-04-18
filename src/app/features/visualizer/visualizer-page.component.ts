import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { GraphStateService } from '../../core/services/graph-state.service';
import { GraphCanvasComponent } from './components/graph-canvas.component';
import { JsonEditorComponent } from './components/json-editor.component';
import { NodeDetailsComponent } from './components/node-details.component';
import { ToolbarComponent } from './components/toolbar.component';

@Component({
  selector: 'app-visualizer-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToolbarComponent, JsonEditorComponent, GraphCanvasComponent, NodeDetailsComponent],
  templateUrl: './visualizer-page.component.html',
  styleUrl: './visualizer-page.component.css'
})
export class VisualizerPageComponent {
  protected readonly state = inject(GraphStateService);
  protected readonly cycleNodeIds = computed(() => new Set(this.state.graph().cycles.flat()));
  protected readonly selectedNodeCycles = computed(() => {
    const selectedNode = this.state.selectedNode();
    return selectedNode ? this.state.cycleMap().get(selectedNode.id) ?? [] : [];
  });
}