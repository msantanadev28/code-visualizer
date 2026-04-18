import { Component, ElementRef, ViewChild, inject, effect, OnDestroy, signal } from '@angular/core';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { GraphStateService, LayoutType } from '../../core/services/graph-state.service';

// Register dagre layout
cytoscape.use(dagre);

@Component({
  selector: 'app-graph-canvas',
  standalone: true,
  template: `<div #cyContainer class="w-full h-full bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden shadow-inner"></div>`,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
  `]
})
export class GraphCanvasComponent implements OnDestroy {
  @ViewChild('cyContainer') cyContainer!: ElementRef;
  
  private state = inject(GraphStateService);
  private cy: cytoscape.Core | null = null;
  
  constructor() {
    effect(() => {
      const elements = this.state.cyElements();
      const layoutType = this.state.layout();
      
      if (!this.cy && this.cyContainer) {
        this.initCytoscape(elements, layoutType);
      } else if (this.cy) {
        this.cy.elements().remove();
        this.cy.add(elements);
        this.runLayout(layoutType);
      }
    });

    effect(() => {
      const selection = this.state.selectedNodeId();
      if (!this.cy) return;
      
      this.cy.elements().removeClass('selected highlighted dimmed');
      
      if (selection) {
        const node = this.cy.getElementById(selection);
        if (node.length > 0) {
          node.addClass('selected');
          node.outgoers().addClass('highlighted');
          // Dim everything else
          this.cy.elements().difference(node).difference(node.outgoers()).addClass('dimmed');
        }
      }
    });
  }

  private initCytoscape(elements: any, layoutType: LayoutType) {
    if (!this.cyContainer) return;
    
    this.cy = cytoscape({
      container: this.cyContainer.nativeElement,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#3b82f6',
            'label': 'data(name)',
            'color': '#f8fafc',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-family': 'ui-sans-serif, system-ui, sans-serif',
            'font-size': '12px',
            'width': 'label',
            'height': 'label',
            'padding': '12px',
            'shape': 'round-rectangle',
            'text-outline-width': '0px',
            'text-outline-color': '#1e293b'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#94a3b8',
            'target-arrow-color': '#94a3b8',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 1.2
          }
        },
        {
          selector: 'node.selected',
          style: {
            'background-color': '#10b981',
            'border-width': 4,
            'border-color': '#059669',
            'shadow-blur': 12,
            'shadow-color': '#10b981',
            'shadow-opacity': 0.8
          } as any
        },
        {
          selector: 'node.highlighted',
          style: {
            'background-color': '#f59e0b',
            'border-width': 2,
            'border-color': '#d97706'
          }
        },
        {
          selector: 'edge.highlighted',
          style: {
            'line-color': '#f59e0b',
            'target-arrow-color': '#f59e0b',
            'width': 3
          }
        },
        {
          selector: '.dimmed',
          style: {
            'opacity': 0.2
          }
        }
      ]
    });
    
    this.cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      this.state.selectNode(node.id());
    });

    this.cy.on('tap', (evt) => {
      if (evt.target === this.cy) {
        this.state.selectNode(null);
      }
    });

    this.runLayout(layoutType);
  }

  private runLayout(name: string) {
    if (!this.cy) return;
    this.cy.layout({
      name: name,
      fit: true,
      padding: 30,
      animate: true,
      animationDuration: 500,
      nodeDimensionsIncludeLabels: true
    } as any).run();
  }

  ngOnDestroy() {
    if (this.cy) {
      this.cy.destroy();
    }
  }
}
