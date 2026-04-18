import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  output,
  viewChild
} from '@angular/core';
import cytoscape, { Core, ElementDefinition, LayoutOptions } from 'cytoscape';
import dagre from 'cytoscape-dagre';

import { GraphLayout, ProjectedGraph } from '../../../core/models/graph.models';

cytoscape.use(dagre);

const GRAPH_STYLES = [
  {
    selector: 'node',
    style: {
      width: 180,
      height: 72,
      shape: 'round-rectangle',
      label: 'data(label)',
      'text-wrap': 'wrap',
      'text-max-width': '152px',
      'font-size': 12,
      'font-family': 'IBM Plex Mono, monospace',
      'font-weight': 500,
      color: '#e2e8f0',
      'text-valign': 'center',
      'text-halign': 'center',
      'background-color': '#0f172a',
      'background-gradient-stop-colors': ['#164e63', '#0f172a'],
      'background-gradient-direction': 'to-bottom',
      'border-width': 1,
      'border-color': '#334155',
      'overlay-opacity': 0,
      'text-margin-y': 0,
      'shadow-blur': 20,
      'shadow-color': '#020617',
      'shadow-opacity': 0.32,
      'shadow-offset-y': 8
    }
  },
  {
    selector: 'edge',
    style: {
      width: 2,
      'curve-style': 'bezier',
      'target-arrow-shape': 'triangle',
      'target-arrow-color': '#38bdf8',
      'line-color': '#334155',
      opacity: 0.85
    }
  },
  {
    selector: '.selected',
    style: {
      'border-color': '#67e8f9',
      'border-width': 2,
      'background-gradient-stop-colors': ['#155e75', '#082f49']
    }
  },
  {
    selector: '.highlighted',
    style: {
      'line-color': '#22d3ee',
      'target-arrow-color': '#22d3ee',
      'border-color': '#22d3ee'
    }
  },
  {
    selector: '.active-step',
    style: {
      'background-gradient-stop-colors': ['#14532d', '#022c22'],
      'border-color': '#4ade80'
    }
  },
  {
    selector: '.cycle',
    style: {
      'border-color': '#f59e0b',
      'border-style': 'dashed'
    }
  },
  {
    selector: '.collapsed',
    style: {
      'background-gradient-stop-colors': ['#4c1d95', '#1e1b4b']
    }
  }
];

@Component({
  selector: 'app-graph-canvas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex h-full min-h-[28rem] flex-col'
  },
  templateUrl: './graph-canvas.component.html',
  styleUrl: './graph-canvas.component.css'
})
export class GraphCanvasComponent implements AfterViewInit, OnDestroy {
  readonly graph = input.required<ProjectedGraph>();
  readonly layout = input.required<GraphLayout>();
  readonly selectedNodeId = input<string | null>(null);
  readonly highlightedNodeIds = input<Set<string>>(new Set());
  readonly simulationNodeId = input<string | null>(null);
  readonly cycleNodeIds = input<Set<string>>(new Set());
  readonly collapsedNodeIds = input<Set<string>>(new Set());

  readonly nodeSelected = output<string>();
  readonly nodeCollapseToggled = output<string>();

  protected readonly canvasHost = viewChild.required<ElementRef<HTMLDivElement>>('canvasHost');

  private cy?: Core;
  private readonly graphSyncEffect = effect(() => {
    if (!this.cy) {
      return;
    }

    this.renderGraph();
  });

  ngAfterViewInit(): void {
    this.cy = cytoscape({
      container: this.canvasHost().nativeElement,
      wheelSensitivity: 0.18,
      boxSelectionEnabled: false,
      style: GRAPH_STYLES as never
    });

    this.cy.on('tap', 'node', (event) => {
      this.nodeSelected.emit(event.target.id());
    });

    this.cy.on('cxttap', 'node', (event) => {
      this.nodeCollapseToggled.emit(event.target.id());
    });

    this.renderGraph();
  }

  ngOnDestroy(): void {
    this.graphSyncEffect.destroy();
    this.cy?.destroy();
  }

  private renderGraph(): void {
    if (!this.cy) {
      return;
    }

    this.cy.elements().remove();
    this.cy.add(this.toElements());
    this.applyClasses();
    this.cy.layout(this.createLayoutOptions()).run();
  }

  private toElements(): ElementDefinition[] {
    const collapsedNodeIds = this.collapsedNodeIds();

    return [
      ...this.graph().nodes.map((node) => ({
        data: {
          id: node.id,
          label: `${node.name}\n${node.metrics.executionTimeMs ?? 0} ms | ${node.metrics.frequency ?? 0}x`,
          collapsed: collapsedNodeIds.has(node.id)
        }
      })),
      ...this.graph().edges.map((edge) => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target
        }
      }))
    ];
  }

  private applyClasses(): void {
    if (!this.cy) {
      return;
    }

    const highlightedNodeIds = this.highlightedNodeIds();
    const cycleNodeIds = this.cycleNodeIds();
    const selectedNodeId = this.selectedNodeId();
    const simulationNodeId = this.simulationNodeId();

    this.cy.elements().removeClass('selected highlighted active-step cycle collapsed');

    this.cy.nodes().forEach((node) => {
      const nodeId = node.id();

      if (highlightedNodeIds.has(nodeId)) {
        node.addClass('highlighted');
      }

      if (this.collapsedNodeIds().has(nodeId)) {
        node.addClass('collapsed');
      }

      if (cycleNodeIds.has(nodeId)) {
        node.addClass('cycle');
      }

      if (selectedNodeId === nodeId) {
        node.addClass('selected');
      }

      if (simulationNodeId === nodeId) {
        node.addClass('active-step');
      }
    });

    this.cy.edges().forEach((edge) => {
      if (highlightedNodeIds.has(edge.source().id()) && highlightedNodeIds.has(edge.target().id())) {
        edge.addClass('highlighted');
      }
    });

    const selectedElement = selectedNodeId ? this.cy.getElementById(selectedNodeId) : undefined;
    if (selectedElement && selectedElement.nonempty()) {
      this.cy.animate({
        center: { eles: selectedElement },
        duration: 240
      });
    } else {
      this.cy.fit(undefined, 40);
    }
  }

  private createLayoutOptions(): LayoutOptions {
    switch (this.layout()) {
      case 'tree':
        return {
          name: 'dagre',
          rankDir: 'TB',
          rankSep: 88,
          nodeSep: 30,
          edgeSep: 18,
          padding: 36,
          animate: true,
          fit: true
        } as LayoutOptions;
      case 'force':
        return {
          name: 'cose',
          padding: 36,
          animate: true,
          fit: true,
          idealEdgeLength: 180,
          nodeOverlap: 18,
          gravity: 0.65
        } as LayoutOptions;
      default:
        return {
          name: 'dagre',
          rankDir: 'LR',
          rankSep: 104,
          nodeSep: 24,
          edgeSep: 16,
          padding: 36,
          animate: true,
          fit: true
        } as LayoutOptions;
    }
  }
}