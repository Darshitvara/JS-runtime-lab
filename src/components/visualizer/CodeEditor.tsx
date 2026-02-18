/* ──────────────────────────────────────────────
 *  CodeEditor — Monaco Editor wrapper with line highlighting
 * ────────────────────────────────────────────── */

import { useRef, useCallback, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type * as monacoType from 'monaco-editor';
import { useVisualizerStore } from '../../store/visualizerStore';

export default function CodeEditor() {
  const code = useVisualizerStore((s) => s.code);
  const currentLine = useVisualizerStore((s) => s.currentLine);
  const setCode = useVisualizerStore((s) => s.setCode);
  const editorRef = useRef<monacoType.editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<monacoType.editor.IEditorDecorationsCollection | null>(null);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    // Define custom theme
    monaco.editor.defineTheme('midnight-ember', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '4a4e69', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'b48eff' },
        { token: 'string', foreground: '00e5a0' },
        { token: 'number', foreground: 'ffaa00' },
        { token: 'type', foreground: '00f0ff' },
        { token: 'identifier', foreground: 'c9d1d9' },
        { token: 'delimiter', foreground: '6e7681' },
        { token: 'function', foreground: '00f0ff' },
      ],
      colors: {
        'editor.background': '#0a0b10',
        'editor.foreground': '#c9d1d9',
        'editor.lineHighlightBackground': '#13151e',
        'editor.selectionBackground': '#00f0ff20',
        'editorCursor.foreground': '#00f0ff',
        'editorLineNumber.foreground': '#2a2d3a',
        'editorLineNumber.activeForeground': '#00f0ff60',
        'editor.selectionHighlightBackground': '#00f0ff10',
        'editorIndentGuide.background': '#1a1c2810',
        'editorIndentGuide.activeBackground': '#1a1c2830',
        'editorBracketMatch.background': '#00f0ff15',
        'editorBracketMatch.border': '#00f0ff30',
      },
    });

    monaco.editor.setTheme('midnight-ember');

    // Configure editor settings
    editor.updateOptions({
      fontSize: 13,
      lineHeight: 22,
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontLigatures: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderLineHighlight: 'line',
      padding: { top: 12, bottom: 12 },
      lineNumbers: 'on',
      glyphMargin: false,
      folding: false,
      suggest: { showStatusBar: false },
      overviewRulerLanes: 0,
      overviewRulerBorder: false,
      hideCursorInOverviewRuler: true,
      scrollbar: {
        verticalScrollbarSize: 4,
        horizontalScrollbarSize: 4,
      },
    });

    // Create decorations collection
    decorationsRef.current = editor.createDecorationsCollection([]);
  }, []);

  // Update line highlighting
  useEffect(() => {
    const editor = editorRef.current;
    const decorations = decorationsRef.current;
    if (!editor || !decorations) return;

    if (currentLine && currentLine > 0) {
      decorations.set([
        {
          range: {
            startLineNumber: currentLine,
            startColumn: 1,
            endLineNumber: currentLine,
            endColumn: 1,
          },
          options: {
            isWholeLine: true,
            className: 'highlighted-line',
            glyphMarginClassName: 'highlighted-glyph',
          },
        },
      ]);

      // Scroll to the executing line
      editor.revealLineInCenterIfOutsideViewport(currentLine);
    } else {
      decorations.set([]);
    }
  }, [currentLine]);

  return (
    <div className="h-full rounded-lg overflow-hidden border border-white/[0.06]">
      <Editor
        defaultLanguage="javascript"
        value={code}
        onChange={(v) => setCode(v ?? '')}
        onMount={handleMount}
        loading={
          <div className="flex items-center justify-center h-full bg-abyss text-white/20 text-xs font-mono">
            Loading editor...
          </div>
        }
        options={{
          tabSize: 2,
          wordWrap: 'on',
        }}
      />

      {/* Inline styles for line highlighting (Monaco's CSS scope) */}
      <style>{`
        .highlighted-line {
          background: rgba(0, 240, 255, 0.06) !important;
          border-left: 2px solid rgba(0, 240, 255, 0.6) !important;
        }
        .highlighted-glyph {
          background: rgba(0, 240, 255, 0.4);
          border-radius: 50%;
          width: 6px !important;
          margin-left: 4px;
        }
      `}</style>
    </div>
  );
}
