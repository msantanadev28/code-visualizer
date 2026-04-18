import { TestBed } from '@angular/core/testing';

import { SAMPLE_GRAPH_JSON } from '../data/sample-graph';
import { GraphParserService } from './graph-parser.service';

describe('GraphParserService', () => {
  let service: GraphParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraphParserService);
  });

  it('parses nodes and edges from schema JSON', () => {
    const graph = service.parse(SAMPLE_GRAPH_JSON);

    expect(graph.nodes.length).toBeGreaterThan(5);
    expect(graph.edges.length).toBeGreaterThan(5);
    expect(graph.roots).toContain('bootstrapApp');
  });

  it('detects recursive cycles', () => {
    const graph = service.parse(SAMPLE_GRAPH_JSON);

    expect(graph.cycles.some((cycle) => cycle.includes('traceRecursiveBranch'))).toBe(true);
  });
});
