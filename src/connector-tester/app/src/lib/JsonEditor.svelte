<script lang="ts">
  import { onMount } from 'svelte';
  import { EditorState, Prec } from '@codemirror/state';
  import { EditorView } from '@codemirror/view';
  import { basicSetup } from '@codemirror/basic-setup';
  import { json } from '@codemirror/lang-json';
  import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
  import { tags } from '@lezer/highlight';

  let {
    value = $bindable('{}'),
    valid = $bindable(true),
    placeholder = '{}',
  }: {
    value: string;
    valid: boolean;
    placeholder?: string;
  } = $props();

  let parseError = $state<string | null>(null);
  let container: HTMLDivElement;
  let view: EditorView | undefined;

  const vscodeTheme = EditorView.theme({
    '&': { height: '100%' },
    '.cm-scroller': {
      fontFamily: 'var(--vscode-editor-font-family, "Courier New", monospace)',
      fontSize: 'var(--vscode-editor-font-size, 12px)',
      lineHeight: '1.5',
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
    '.cm-matchingBracket': {
      background: 'var(--vscode-editorBracketMatch-background, rgba(0,100,0,0.3))',
      outline: '1px solid var(--vscode-editorBracketMatch-border, #6f6f6f)',
    },
    '.cm-foldPlaceholder': {
      background: 'transparent',
      border: '1px solid var(--vscode-panel-border, #555)',
      color: 'var(--vscode-descriptionForeground)',
      borderRadius: '2px',
      padding: '0 4px',
    },
  });

  const jsonHighlight = HighlightStyle.define([
    { tag: tags.propertyName, color: 'var(--vscode-symbolIcon-propertyForeground, #9cdcfe)' },
    { tag: [tags.string, tags.special(tags.string)], color: '#ce9178' },
    { tag: tags.number, color: '#b5cea8' },
    { tag: [tags.bool, tags.atom], color: '#569cd6' },
    { tag: tags.null, color: '#569cd6' },
    { tag: tags.bracket, color: 'var(--vscode-editor-foreground, #d4d4d4)' },
    { tag: tags.punctuation, color: 'var(--vscode-editor-foreground, #d4d4d4)' },
  ]);

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
      // ignore - invalid JSON, can't format
    }
  }

  onMount(() => {
    validate(value);

    view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          json(),
          vscodeTheme,
          Prec.highest(syntaxHighlighting(jsonHighlight)),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const raw = update.state.doc.toString();
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

  // Sync value changes coming from outside (e.g. history selection)
  $effect(() => {
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value ?? '' } });
    }
  });
</script>

<div class="field json-editor-field">
  <div class="row" style="margin-bottom: 4px;">
    <span class="body-label">Body</span>
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
    overflow: hidden;
    background: var(--vscode-input-background);
    border: 1px solid var(--vscode-input-border, var(--vscode-editorWidget-border, transparent));
    border-radius: 2px;
  }

  .cm-wrap:focus-within {
    border-color: var(--vscode-focusBorder);
  }

  .cm-wrap.invalid {
    border-color: var(--vscode-inputValidation-errorBorder, #f44336) !important;
  }

  .cm-wrap :global(.cm-editor) {
    height: 100%;
  }

  .body-label {
    flex: 1;
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
  }
</style>
