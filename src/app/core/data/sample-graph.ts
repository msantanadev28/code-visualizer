import { GraphSchema } from '../models/graph.models';

export const SAMPLE_GRAPH_INPUT: GraphSchema = {
  methods: [
    {
      id: 'bootstrapApp',
      name: 'bootstrapApp',
      file: 'src/main.ts',
      code:
        'export async function bootstrapApp() {\n  const workspace = await loadWorkspace();\n  const model = parseExecutionModel(workspace);\n  mountVisualizer(model);\n}',
      calls: ['loadWorkspace', 'parseExecutionModel', 'mountVisualizer'],
      references: ['src/main.ts:1'],
      examples: ['bootstrapApplication(App, appConfig);'],
      metrics: {
        executionTimeMs: 4.8,
        frequency: 1
      }
    },
    {
      id: 'loadWorkspace',
      name: 'loadWorkspace',
      file: 'src/core/workspace.ts',
      code:
        'export async function loadWorkspace() {\n  const raw = await fetchWorkspaceJson();\n  return JSON.parse(raw);\n}',
      calls: ['fetchWorkspaceJson'],
      references: ['src/core/workspace.ts:3'],
      metrics: {
        executionTimeMs: 12.6,
        frequency: 1
      }
    },
    {
      id: 'fetchWorkspaceJson',
      name: 'fetchWorkspaceJson',
      file: 'src/data/source.ts',
      code:
        'export function fetchWorkspaceJson() {\n  return Promise.resolve(sampleWorkspace);\n}',
      calls: [],
      references: ['src/data/source.ts:1'],
      metrics: {
        executionTimeMs: 2.1,
        frequency: 1
      }
    },
    {
      id: 'parseExecutionModel',
      name: 'parseExecutionModel',
      file: 'src/core/parser.ts',
      code:
        'export function parseExecutionModel(workspace: unknown) {\n  const methods = normalizeMethods(workspace);\n  detectCycles(methods);\n  return buildExecutionGraph(methods);\n}',
      calls: ['normalizeMethods', 'detectCycles', 'buildExecutionGraph'],
      references: ['src/core/parser.ts:8'],
      metrics: {
        executionTimeMs: 18.7,
        frequency: 1
      }
    },
    {
      id: 'normalizeMethods',
      name: 'normalizeMethods',
      file: 'src/core/parser.ts',
      code:
        'function normalizeMethods(workspace: unknown) {\n  return Array.isArray(workspace) ? workspace : [];\n}',
      calls: [],
      metrics: {
        executionTimeMs: 3.3,
        frequency: 1
      }
    },
    {
      id: 'detectCycles',
      name: 'detectCycles',
      file: 'src/core/cycles.ts',
      code:
        'export function detectCycles(methods: MethodNode[]) {\n  return traceRecursiveBranch(methods[0]);\n}',
      calls: ['traceRecursiveBranch'],
      references: ['src/core/cycles.ts:2'],
      metrics: {
        executionTimeMs: 7.9,
        frequency: 2
      }
    },
    {
      id: 'traceRecursiveBranch',
      name: 'traceRecursiveBranch',
      file: 'src/core/cycles.ts',
      code:
        'function traceRecursiveBranch(node: MethodNode) {\n  if (!node.calls.length) return [];\n  return traceRecursiveBranch(node);\n}',
      calls: ['traceRecursiveBranch'],
      references: ['src/core/cycles.ts:7'],
      metrics: {
        executionTimeMs: 1.4,
        frequency: 6
      }
    },
    {
      id: 'buildExecutionGraph',
      name: 'buildExecutionGraph',
      file: 'src/core/graph.ts',
      code:
        'export function buildExecutionGraph(methods: MethodNode[]) {\n  decorateMetrics(methods);\n  return buildExecutionTree(methods);\n}',
      calls: ['decorateMetrics', 'buildExecutionTree'],
      references: ['src/core/graph.ts:4'],
      metrics: {
        executionTimeMs: 15.2,
        frequency: 1
      }
    },
    {
      id: 'decorateMetrics',
      name: 'decorateMetrics',
      file: 'src/core/metrics.ts',
      code:
        'export function decorateMetrics(methods: MethodNode[]) {\n  return methods.map((method) => ({ ...method, executionTime: 0 }));\n}',
      calls: [],
      metrics: {
        executionTimeMs: 6.4,
        frequency: 1
      }
    },
    {
      id: 'buildExecutionTree',
      name: 'buildExecutionTree',
      file: 'src/core/tree.ts',
      code:
        'export function buildExecutionTree(methods: MethodNode[]) {\n  return methods.reduce((tree, method) => tree.concat(method), [] as MethodNode[]);\n}',
      calls: [],
      metrics: {
        executionTimeMs: 5.8,
        frequency: 1
      }
    },
    {
      id: 'mountVisualizer',
      name: 'mountVisualizer',
      file: 'src/ui/visualizer.ts',
      code:
        'export function mountVisualizer(model: GraphModel) {\n  renderGraphCanvas(model);\n  syncNodeInspector(model);\n}',
      calls: ['renderGraphCanvas', 'syncNodeInspector'],
      references: ['src/ui/visualizer.ts:3'],
      metrics: {
        executionTimeMs: 11.1,
        frequency: 1
      }
    },
    {
      id: 'renderGraphCanvas',
      name: 'renderGraphCanvas',
      file: 'src/ui/canvas.ts',
      code:
        'export function renderGraphCanvas(model: GraphModel) {\n  layoutGraph(model);\n  bindGraphInteractions(model);\n}',
      calls: ['layoutGraph', 'bindGraphInteractions'],
      references: ['src/ui/canvas.ts:1'],
      metrics: {
        executionTimeMs: 28.5,
        frequency: 60
      }
    },
    {
      id: 'layoutGraph',
      name: 'layoutGraph',
      file: 'src/ui/layout.ts',
      code:
        'export function layoutGraph(model: GraphModel) {\n  return model.nodes.length;\n}',
      calls: [],
      metrics: {
        executionTimeMs: 9.6,
        frequency: 60
      }
    },
    {
      id: 'bindGraphInteractions',
      name: 'bindGraphInteractions',
      file: 'src/ui/interactions.ts',
      code:
        'export function bindGraphInteractions(model: GraphModel) {\n  return model.nodes.map((node) => node.id);\n}',
      calls: [],
      metrics: {
        executionTimeMs: 14.3,
        frequency: 60
      }
    },
    {
      id: 'syncNodeInspector',
      name: 'syncNodeInspector',
      file: 'src/ui/inspector.ts',
      code:
        'export function syncNodeInspector(model: GraphModel) {\n  highlightExecutionPath(model);\n  loadCodePreview(model);\n}',
      calls: ['highlightExecutionPath', 'loadCodePreview'],
      references: ['src/ui/inspector.ts:1'],
      metrics: {
        executionTimeMs: 8.5,
        frequency: 12
      }
    },
    {
      id: 'highlightExecutionPath',
      name: 'highlightExecutionPath',
      file: 'src/ui/highlight.ts',
      code:
        'export function highlightExecutionPath(model: GraphModel) {\n  findUpstreamChain(model);\n  findDownstreamChain(model);\n}',
      calls: ['findUpstreamChain', 'findDownstreamChain'],
      references: ['src/ui/highlight.ts:4'],
      metrics: {
        executionTimeMs: 6.2,
        frequency: 12
      }
    },
    {
      id: 'findUpstreamChain',
      name: 'findUpstreamChain',
      file: 'src/ui/highlight.ts',
      code:
        'function findUpstreamChain(model: GraphModel) {\n  return model.edges.filter((edge) => edge.target);\n}',
      calls: [],
      metrics: {
        executionTimeMs: 4.4,
        frequency: 12
      }
    },
    {
      id: 'findDownstreamChain',
      name: 'findDownstreamChain',
      file: 'src/ui/highlight.ts',
      code:
        'function findDownstreamChain(model: GraphModel) {\n  return model.edges.filter((edge) => edge.source);\n}',
      calls: [],
      metrics: {
        executionTimeMs: 4.2,
        frequency: 12
      }
    },
    {
      id: 'loadCodePreview',
      name: 'loadCodePreview',
      file: 'src/ui/preview.ts',
      code:
        'export function loadCodePreview(model: GraphModel) {\n  return model.focusedNode?.code ?? "";\n}',
      calls: [],
      metrics: {
        executionTimeMs: 2.7,
        frequency: 12
      }
    }
  ]
};

export const SAMPLE_GRAPH_JSON = JSON.stringify(SAMPLE_GRAPH_INPUT, null, 2);
