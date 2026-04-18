declare module 'cytoscape-dagre';
declare module 'monaco-editor/esm/vs/editor/editor.worker.js?worker' {
  const workerFactory: {
    new (): Worker;
  };

  export default workerFactory;
}

declare module 'monaco-editor/esm/vs/language/json/json.worker.js?worker' {
  const workerFactory: {
    new (): Worker;
  };

  export default workerFactory;
}