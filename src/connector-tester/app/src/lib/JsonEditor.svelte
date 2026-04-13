<script lang="ts">
  import { onMount } from 'svelte';
  import { EditorState, RangeSetBuilder } from '@codemirror/state';
  import { EditorView, lineNumbers, highlightActiveLine, keymap, ViewPlugin, Decoration, type DecorationSet } from '@codemirror/view';
  import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
  import { json } from '@codemirror/lang-json';
  import { foldGutter, codeFolding, foldKeymap, syntaxTree } from '@codemirror/language';

  let {
    value = $bindable('{}'),
    valid = $bindable(true),
    label = 'Input',
  }: {
    value: string;
    valid: boolean;
    label?: string;
  } = $props();

  let parseError = $state<string | null>(null);
  let container: HTMLDivElement;
  let view: EditorView | undefined;
  let internalValue = value;

  const vscodeTheme = EditorView.theme({
    '.cm-scroller': {
      fontFamily: 'var(--vscode-editor-font-family, "Courier New", monospace)',
      fontSize: 'var(--vscode-editor-font-size, 12px)',
      lineHeight: '1.5',
      overflow: 'auto',
    },
    '.cm-content': {
      padding: '4px 0',
      caretColor: 'var(--vscode-editorCursor-foreground, #aeafad)',
    },
    '&.cm-focused': { outline: 'none' },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: 'var(--vscode-editorCursor-foreground, #aeafad)',
    },
    '.cm-gutters': {
      background: 'var(--vscode-input-background)',
      color: 'var(--vscode-editorLineNumber-foreground, #858585)',
      borderRight: '1px solid var(--vscode-panel-border, rgba(128,128,128,0.2))',
    },
    '.cm-activeLineGutter': {
      background: 'transparent',
      color: 'var(--vscode-editorLineNumber-activeForeground, #c6c6c6)',
    },
    '.cm-activeLine': { background: 'transparent' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
      background: 'var(--vscode-editor-selectionBackground, #264f78)',
    },
    '::selection': {
      background: 'var(--vscode-editor-selectionBackground, #264f78)',
    },
    '.cm-foldPlaceholder': {
      background: 'transparent',
      border: '1px solid var(--vscode-panel-border, #555)',
      color: 'var(--vscode-descriptionForeground)',
      borderRadius: '2px',
      padding: '0 4px',
    },
  });

  const BRACKET_COLORS = [
    'var(--vscode-editorBracketHighlight-foreground1, #ffd700)',
    'var(--vscode-editorBracketHighlight-foreground2, #da70d6)',
    'var(--vscode-editorBracketHighlight-foreground3, #179fff)',
  ];

  const TOKEN_COLORS: Record<string, string> = {
    PropertyName: 'var(--vscode-symbolIcon-propertyForeground, #9cdcfe)',
    String: '#ce9178',
    Number: '#b5cea8',
    True: '#569cd6',
    False: '#569cd6',
    Null: '#569cd6',
  };

  function buildDecorations(view: EditorView): DecorationSet {
    const marks: Array<{ from: number; to: number; color: string }> = [];

    syntaxTree(view.state).iterate({
      enter(node) {
        // Syntax token coloring
        const tokenColor = TOKEN_COLORS[node.name];
        if (tokenColor) {
          marks.push({ from: node.from, to: node.to, color: tokenColor });
          return false; // don't descend into token nodes
        }

        // Bracket coloring for Object/Array
        if (node.name === 'Object' || node.name === 'Array') {
          if (node.to - node.from < 2) return;
          let depth = 0;
          let parent = node.node.parent;
          while (parent) {
            if (parent.name === 'Object' || parent.name === 'Array') depth++;
            parent = parent.parent;
          }
          const color = BRACKET_COLORS[depth % 3];
          marks.push({ from: node.from, to: node.from + 1, color });
          marks.push({ from: node.to - 1, to: node.to, color });
        }
      },
    });

    marks.sort((a, b) => a.from - b.from);

    const builder = new RangeSetBuilder<Decoration>();
    for (const { from, to, color } of marks) {
      builder.add(from, to, Decoration.mark({ attributes: { style: `color: ${color}` } }));
    }
    return builder.finish();
  }

  const bracketColorPlugin = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      constructor(view: EditorView) {
        this.decorations = buildDecorations(view);
      }
      update(update: { docChanged: boolean; view: EditorView }) {
        if (update.docChanged) {
          this.decorations = buildDecorations(update.view);
        }
      }
    },
    { decorations: (v) => v.decorations },
  );

  function validate(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed || trimmed === '{}') {
      valid = true;
      parseError = null;
      return;
    }
    try {
      JSON.parse(raw);
      valid = true;
      parseError = null;
    } catch (err: any) {
      valid = false;
      parseError = err.message;
    }
  }

  function format() {
    if (!view) return;
    try {
      const raw = view.state.doc.toString();
      const formatted = JSON.stringify(JSON.parse(raw || '{}'), null, 2);
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: formatted } });
      value = formatted;
      validate(formatted);
    } catch {
      // invalid JSON, can't format
    }
  }

  onMount(() => {
    validate(value);

    view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          history(),
          foldGutter(),
          codeFolding(),
          json(),
          vscodeTheme,
          bracketColorPlugin,
          keymap.of([...defaultKeymap, ...historyKeymap, ...foldKeymap]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const raw = update.state.doc.toString();
              internalValue = raw;
              value = raw;
              validate(raw);
            }
          }),
        ],
      }),
      parent: container,
    });

    return () => view?.destroy();
  });

  $effect(() => {
    if (!view || value === internalValue) return;
    internalValue = value;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value ?? '' } });
  });
</script>

<div class="field json-editor-field">
  <div class="row" style="margin-bottom: 4px;">
    <span class="body-label">{label}</span>
    <button class="secondary" style="padding: 1px 6px; font-size: 11px;" onclick={format} title="Format JSON">
      &#123;&nbsp;&#125;
    </button>
  </div>
  <div bind:this={container} class="cm-wrap" class:invalid={!valid}></div>
  {#if parseError}
    <span class="field-error">{parseError}</span>
  {/if}
</div>

<style>
  .json-editor-field {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .cm-wrap {
    flex: 1;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    background: var(--vscode-input-background);
    border: 1px solid var(--vscode-input-border, var(--vscode-editorWidget-border, transparent));
    border-radius: 2px;
    overflow: hidden;
  }

  .cm-wrap:focus-within {
    border-color: var(--vscode-focusBorder);
  }

  .cm-wrap.invalid {
    border-color: var(--vscode-inputValidation-errorBorder, #f44336) !important;
  }

  .cm-wrap :global(.cm-editor) {
    flex: 1;
    min-height: 0;
  }

  .body-label {
    flex: 1;
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
  }
</style>
