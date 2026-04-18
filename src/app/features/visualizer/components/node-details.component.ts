import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { GraphNode } from '../../../core/models/graph.models';

@Component({
  selector: 'app-node-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex h-full min-h-[22rem] flex-col'
  },
  templateUrl: './node-details.component.html',
  styleUrl: './node-details.component.css'
})
export class NodeDetailsComponent {
  readonly node = input<GraphNode | null>(null);
  readonly incoming = input<GraphNode[]>([]);
  readonly outgoing = input<GraphNode[]>([]);
  readonly cyclePaths = input<string[][]>([]);
  readonly simulationIndex = input<number>(-1);
  readonly simulationLength = input<number>(0);
  readonly collapsed = input<boolean>(false);

  readonly toggleCollapsed = output<string>();

  protected formatMetric(value: number | undefined, suffix: string): string {
    return value === undefined ? 'n/a' : `${value}${suffix}`;
  }

  protected onToggle(): void {
    const node = this.node();
    if (node?.calls.length) {
      this.toggleCollapsed.emit(node.id);
    }
  }
}