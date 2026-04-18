import { Component, effect, ElementRef, inject, viewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import cytoscape from 'cytoscape';
// Using standard layouts (circle, grid, breadthfirst) to avoid extra deps, typical DAG is available via plugins but breadthfirst works nicely for trees
import { GraphStateService } from '../../services/graph-state.service';

@Component({
  selector: 'app-graph-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `<div #cyContainer class="w-full h-full bg-neutral-900 rounded-2xl shadow-inner border border-neutral-800"></div>`,
  styles: [`:host { display: block; height: 100%; width: 100%; }`],
  encapsulation: ViewEncapsulation.None
})
export class GraphCanvasComponent {
  private state = inject(GraphStateService);
  private container = viewChild.required<ElementRef<HTMLDivElement>>('cyContainer');
  private cy: cytoscape.Core | null = null;

  constructor() {
    effect(() => {
      const el = this.container().nativeElement;
      const data = this.state.parsedData();
      const layoutType = this.state.layoutMode() === 'dagre' ? 'breadthfirst' : this.state.layoutMode(); // Fallback for dagre as breadthfirst if not installed

      if (!this.cy && data) {
        this.cy = cytoscape({
          container: el,
          elements: this.buildElements(data),
          style: [
            {
              selector: 'node',
              style: {
                'label': 'data(name)',
                'background-color': '#10b981',
                'color': '#fff',
                'text-valign': 'center',
                'text-halign': 'center',
                'font-size': '12px',
                'width': 'label',
                'padding': '16px',
                'shape': 'round-rectangle'
              }
            },
            {
              selector: 'edge',
              style: {
                'width': 2,
                'target-arrow-shape': 'triangle',
                'line-color': '#4b5563',
                'target-arrow-color': '#4b5563',
                'curve-style': 'bezier',
                'arrow-scale': 1.5
              }
            },
            {
              selector: '.highlighted',
              style: {
                'background-color': '#3b82f6',
                'line-color': '#3b82f6',
                'target-arrow-color': '#3b82f6',
                'transition-property': 'background-color, line-color, target-arrow-color',
                'transition-duration': 300
              }
            }
          ],
          layout: { name: layoutType, directed: true, spacingFactor: 1.5 }
        });

        this.cy.on('tap', 'node', (evt) => {
          const node = evt.target;
          this.state.selectNode(node.id());
          
          // Basic highlight effect
          this.cy?.elements().removeClass('highlighted');
          node.addClass('highlighted');
          node.outgoers().addClass('highlighted');
          node.incomers().addClass('highlighted');
        });

        this.cy.on('tap', (evt) => {
          if (evt.target === this.cy) {
            this.state.selectNode(null);
            this.cy?.elements().removeClass('highlighted');
          }
        });
      } else if (this.cy && data) {
        this.cy.elements().remove();
        this.cy.add(this.buildElements(data));
        this.cy.layout({ name: layoutType, directed: true, spacingFactor: 1.5 }).run();
      }
    });

    effect(() => {
      const id = this.state.selectedNodeId();
      if (!this.cy) return;
      if (id) {
        const node = this.cy.getElementById(id);
        if (node) {
          this.cy.elements().removeClass('highlighted');
          node.addClass('highlighted');
          node.outgoers().addClass('highlighted');
          node.incomers().addClass('highlighted');
        }
      } else {
        this.cy.elements().removeClass('highlighted');
      }
    });
  }

  private buildElements(data: any): cytoscape.ElementDefinition[] {
    const elements: cytoscape.ElementDefinition[] = [];
    if (!data.methods) return elements;

    // Add nodes
    data.methods.forEach((m: any) => {
      elements.push({ data: { id: m.id, name: m.name || m.id } });
    });

    // Add edges
    data.methods.forEach((m: any) => {
      if (m.calls) {
        m.calls.forEach((target: string) => {
          elements.push({
            data: { id: `${m.id}->${target}`, source: m.id, target }
          });
        });
      }
    });

    return elements;
  }
}

