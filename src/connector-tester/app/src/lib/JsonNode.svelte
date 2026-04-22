<script lang="ts">
  import { untrack } from 'svelte';
  import JsonNode from './JsonNode.svelte';

  interface Props {
    value: any;
    propKey?: string | null;
    isLast?: boolean;
    collapseVersion: number;
    expandVersion: number;
    searchTerm: string;
    depth?: number;
  }

  let {
    value,
    propKey = null,
    isLast = true,
    collapseVersion,
    expandVersion,
    searchTerm,
    depth = 0,
  }: Props = $props();

  let isCollapsed = $state(untrack(() => depth > 1));

  let prevCollapse = untrack(() => collapseVersion);
  let prevExpand = untrack(() => expandVersion);

  $effect(() => {
    const cv = collapseVersion;
    if (cv !== prevCollapse) {
      prevCollapse = cv;
      isCollapsed = true;
    }
  });

  $effect(() => {
    const ev = expandVersion;
    if (ev !== prevExpand) {
      prevExpand = ev;
      isCollapsed = false;
    }
  });

  function typeOf(val: any): string {
    if (val === null) return 'null';
    if (Array.isArray(val)) return 'array';
    return typeof val;
  }

  const type = $derived(typeOf(value));
  const isContainer = $derived(type === 'object' || type === 'array');
  const entries = $derived(
    type === 'object'
      ? Object.entries(value as object)
      : type === 'array'
        ? (value as any[]).map((v: any, i: number) => [String(i), v])
        : []
  ) as [string, any][];
  const isEmpty = $derived(entries.length === 0);
  const openBracket = $derived(type === 'array' ? '[' : '{');
  const closeBracket = $derived(type === 'array' ? ']' : '}');

  // When searching, force-expand nodes whose subtree contains a match
  const containsMatch = $derived(
    searchTerm.trim().length > 0 &&
    JSON.stringify(value).toLowerCase().includes(searchTerm.trim().toLowerCase())
  );
  const effectiveCollapsed = $derived(isCollapsed && !containsMatch);

  function escHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function hl(text: string): string {
    const escaped = escHtml(text);
    if (!searchTerm.trim()) return escaped;
    const rx = new RegExp(
      searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      'gi'
    );
    return escaped.replace(rx, (m) => `<mark class="search-match">${m}</mark>`);
  }

  function previewLabel(): string {
    if (type === 'array') return `${entries.length} item${entries.length !== 1 ? 's' : ''}`;
    const keys = entries
      .slice(0, 3)
      .map(([k]) => k)
      .join(', ');
    return entries.length > 3 ? `${keys}, …` : keys;
  }
</script>

<div class="jnode">
  <div class="jrow">
    <!-- toggle or spacer -->
    {#if isContainer && !isEmpty}
      <button
        class="jtoggle"
        onclick={() => (isCollapsed = !isCollapsed)}
        aria-label={effectiveCollapsed ? 'expand' : 'collapse'}
        tabindex="0"
      >{effectiveCollapsed ? '▶' : '▼'}</button>
    {:else}
      <span class="jtoggle-ph"></span>
    {/if}

    <!-- object key if any -->
    {#if propKey !== null}
      <span class="jk">{@html hl(`"${propKey}"`)}</span><span class="punct">: </span>
    {/if}

    <!-- value rendering -->
    {#if isContainer && isEmpty}
      <span class="punct">{openBracket}{closeBracket}</span>{#if !isLast}<span class="punct">,</span>{/if}
    {:else if isContainer && effectiveCollapsed}
      <span class="punct">{openBracket}</span
      ><span class="jpreview">{previewLabel()}</span
      ><span class="punct">{closeBracket}</span>{#if !isLast}<span class="punct">,</span>{/if}
    {:else if isContainer}
      <span class="punct">{openBracket}</span>
    {:else if type === 'string'}
      <span class="js">{@html hl(`"${value}"`)}</span>{#if !isLast}<span class="punct">,</span>{/if}
    {:else if type === 'boolean'}
      <span class="jb">{String(value)}</span>{#if !isLast}<span class="punct">,</span>{/if}
    {:else if type === 'number'}
      <span class="jn">{String(value)}</span>{#if !isLast}<span class="punct">,</span>{/if}
    {:else}
      <span class="jl">null</span>{#if !isLast}<span class="punct">,</span>{/if}
    {/if}
  </div>

  <!-- children when expanded container -->
  {#if isContainer && !isEmpty && !effectiveCollapsed}
    <div class="jchildren">
      {#each entries as [k, v], i}
        <JsonNode
          value={v}
          propKey={type === 'object' ? k : null}
          isLast={i === entries.length - 1}
          {collapseVersion}
          {expandVersion}
          {searchTerm}
          depth={depth + 1}
        />
      {/each}
    </div>
    <div class="jrow jclose">
      <span class="jtoggle-ph"></span>
      <span class="punct">{closeBracket}</span>{#if !isLast}<span class="punct">,</span>{/if}
    </div>
  {/if}
</div>

<style>
  .jnode {
    display: flex;
    flex-direction: column;
  }

  .jrow {
    display: flex;
    align-items: baseline;
    flex-wrap: nowrap;
    min-width: 0;
  }

  .jchildren {
    padding-left: 1.5em;
  }

  .jtoggle {
    background: none;
    border: none;
    padding: 0;
    margin: 0 2px 0 0;
    cursor: pointer;
    color: var(--vscode-descriptionForeground);
    font-size: 9px;
    line-height: 1;
    width: 12px;
    flex-shrink: 0;
    text-align: center;
    opacity: 0.7;
  }

  .jtoggle:hover {
    opacity: 1;
    background: none;
    color: var(--vscode-editor-foreground);
  }

  .jtoggle-ph {
    display: inline-block;
    width: 14px;
    flex-shrink: 0;
  }

  .jpreview {
    color: var(--vscode-descriptionForeground);
    font-style: italic;
    font-size: 0.9em;
    margin: 0 4px;
  }

  .punct {
    color: var(--vscode-editor-foreground);
    opacity: 0.7;
  }

  :global(mark.search-match) {
    background: var(--vscode-editor-findMatchHighlightBackground, rgba(234, 92, 0, 0.33));
    color: inherit;
    border-radius: 2px;
    padding: 0 1px;
    outline: 1px solid var(--vscode-editor-findMatchHighlightBorder, transparent);
  }

  :global(mark.search-match-active) {
    background: var(--vscode-editor-findMatchBackground, rgba(255, 150, 0, 0.6));
    outline: 1px solid var(--vscode-editor-findMatchBorder, #f0a020);
  }
</style>
