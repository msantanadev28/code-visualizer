# Code Visualizer

Code Visualizer is a developer-focused Angular application for exploring execution flow as an interactive graph. It combines a Monaco JSON editor, a Cytoscape-powered graph canvas, and a detail inspector to make method relationships, call paths, cycles, and performance metadata easier to reason about.

## Stack

- Angular 21 with standalone components and lazy-loaded feature entry
- TypeScript with strict typing and signals-based state management
- Tailwind CSS for the dark visual system and responsive layout
- Cytoscape.js with `cytoscape-dagre` for DAG, tree, and force-style graph layouts
- Monaco Editor for JSON authoring

## Development

Install dependencies and start the app:

```bash
npm install
npm start
```

Build for production:

```bash
npm run build
```

Run unit tests:

```bash
npm test
```

## What The UI Supports

- Left panel Monaco editor with live JSON parsing
- Center graph canvas with zoom, pan, drag, layout switching, and path highlighting
- Right panel inspector with call relationships, cycle information, metrics, and code preview
- Search and contextual filtering
- Expand and collapse of nested branches
- Step-by-step execution simulation
- Cycle and recursion detection
- Import and export of JSON files
- Sample dataset for immediate exploration

## Input Schema

The application expects a JSON document with a top-level `methods` array.

```json
{
	"methods": [
		{
			"id": "bootstrapApp",
			"name": "bootstrapApp",
			"file": "src/main.ts",
			"code": "export function bootstrapApp() {}",
			"calls": ["parseExecutionModel", "mountVisualizer"],
			"references": ["src/main.ts:1"],
			"examples": ["bootstrapApplication(App, appConfig)"],
			"metrics": {
				"executionTimeMs": 4.8,
				"frequency": 1
			}
		}
	]
}
```

### Schema Notes

- `id`, `name`, and `file` are required.
- `calls` should contain method ids that exist elsewhere in the document.
- `code`, `references`, `examples`, `metrics`, and `metadata` are optional.
- Nested `children` are also supported and are linked automatically as calls from the parent.

## Architecture

The codebase follows a feature-oriented standalone Angular structure rather than NgModules, which is the recommended Angular 21 pattern.

- `src/app/core`: models, sample data, parser logic, state management
- `src/app/features/visualizer`: page shell and visualization components
- `src/types`: small ambient module declarations for Monaco workers and Cytoscape plugin typing

## Interaction Notes

- Click a node to focus its upstream and downstream execution path.
- Right-click a node in the graph to collapse or expand that subtree.
- Use the toolbar to switch between DAG, tree, and force layouts.
- Start simulation from the toolbar to walk the selected branch in traversal order.
