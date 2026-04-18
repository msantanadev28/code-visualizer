import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import type * as Monaco from 'monaco-editor';

type MonacoModule = typeof Monaco;
type MonacoEditor = Monaco.editor.IStandaloneCodeEditor;

declare global {
  interface Window {
    monaco?: MonacoModule;
    require?: {
      config: (config: { paths: Record<string, string> }) => void;
      (modules: string[], callback: () => void): void;
    };
  }
}

const MONACO_BASE_URL = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs';

@Component({
  selector: 'app-json-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex h-full min-h-[22rem] flex-col'
  },
  templateUrl: './json-editor.component.html',
  styleUrl: './json-editor.component.css'
})
export class JsonEditorComponent implements AfterViewInit, OnDestroy {
  readonly json = input.required<string>();
  readonly parseError = input<string | null>(null);
  readonly jsonChanged = output<string>();

  protected readonly editorHost = viewChild.required<ElementRef<HTMLDivElement>>('editorHost');
  protected readonly usingFallback = signal(false);
  protected readonly editorReady = signal(false);

  private editor?: MonacoEditor;
  private readonly syncEffect = effect(() => {
    const value = this.json();

    if (this.editor && value !== this.editor.getValue()) {
      this.editor.setValue(value);
    }
  });

  async ngAfterViewInit(): Promise<void> {
    try {
      const monaco = await this.loadMonaco();

      monaco.editor.defineTheme('visualizer-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'string.key.json', foreground: '67e8f9' },
          { token: 'number', foreground: 'fbbf24' }
        ],
        colors: {
          'editor.background': '#07111f',
          'editor.lineHighlightBackground': '#0f1f36',
          'editor.selectionBackground': '#134e4a88',
          'editorCursor.foreground': '#67e8f9',
          'editor.inactiveSelectionBackground': '#0f766e55'
        }
      });

      this.createEditor(monaco);
      this.editorReady.set(true);
    } catch {
      this.usingFallback.set(true);
      this.editorReady.set(true);
    }
  }

  ngOnDestroy(): void {
    this.syncEffect.destroy();
    this.editor?.dispose();
  }

  protected onFallbackInput(value: string): void {
    this.jsonChanged.emit(value);
  }

  private createEditor(monaco: MonacoModule): void {
    this.editor = monaco.editor.create(this.editorHost().nativeElement, {
      value: this.json(),
      language: 'json',
      theme: 'visualizer-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 13,
      fontFamily: 'IBM Plex Mono, monospace',
      smoothScrolling: true,
      scrollBeyondLastLine: false,
      renderLineHighlight: 'all',
      padding: { top: 16, bottom: 16 },
      bracketPairColorization: { enabled: true },
      roundedSelection: true,
      tabSize: 2,
      wordWrap: 'on'
    });

    this.editor.onDidChangeModelContent(() => {
      this.jsonChanged.emit(this.editor?.getValue() ?? '');
    });
  }

  private async loadMonaco(): Promise<MonacoModule> {
    if (window.monaco) {
      return window.monaco;
    }

    await this.loadScript(`${MONACO_BASE_URL}/loader.js`);

    if (!window.require) {
      throw new Error('Monaco loader did not initialize.');
    }

    window.require.config({
      paths: {
        vs: MONACO_BASE_URL
      }
    });

    await new Promise<void>((resolve) => {
      window.require?.(['vs/editor/editor.main'], () => resolve());
    });

    if (!window.monaco) {
      throw new Error('Monaco editor failed to load.');
    }

    return window.monaco;
  }

  private loadScript(source: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[data-monaco-loader="${source}"]`);

      if (existing) {
        if (existing.dataset['loaded'] === 'true') {
          resolve();
          return;
        }

        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Unable to load Monaco loader script.')), {
          once: true
        });
        return;
      }

      const script = document.createElement('script');
      script.src = source;
      script.async = true;
      script.dataset['monacoLoader'] = source;
      script.addEventListener('load', () => {
        script.dataset['loaded'] = 'true';
        resolve();
      }, { once: true });
      script.addEventListener('error', () => reject(new Error('Unable to load Monaco loader script.')), {
        once: true
      });
      document.body.append(script);
    });
  }
}
