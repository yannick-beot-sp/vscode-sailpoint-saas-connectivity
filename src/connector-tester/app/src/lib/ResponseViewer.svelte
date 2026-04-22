<script lang="ts">
  import { tick } from 'svelte';
  import type { ConnectorResponse } from '../types';
  import JsonNode from './JsonNode.svelte';

  let {
    response,
  }: {
    response: ConnectorResponse | null;
  } = $props();

  function statusClass(status: number): string {
    if (status >= 200 && status < 300) return 'status-2xx';
    if (status >= 400 && status < 500) return 'status-4xx';
    if (status >= 500) return 'status-5xx';
    return 'status-err';
  }

  function statusLabel(status: number): string {
    if (status === 0) return 'ERR';
    return String(status);
  }

  function rawJson(obj: any): string {
    return JSON.stringify(obj);
  }

  function parseNdjson(str: string): any[] | null {
    const lines = str.split('\n').filter((l) => l.trim());
    if (lines.length < 2) return null;
    try {
      return lines.map((l) => JSON.parse(l));
    } catch {
      return null;
    }
  }

  let parsedNdjson = $derived(
    typeof response?.body === 'string' ? parseNdjson(response.body) : null
  );

  let showHeaders = $state(false);
  let prettyPrint = $state(true);
  let searchTerm = $state('');
  let collapseVersion = $state(0);
  let expandVersion = $state(0);
  let allCollapsed = $state(false);

  // Search navigation state
  let treeEl = $state<HTMLElement | null>(null);
  let matchCount = $state(0);
  let currentMatch = $state(-1);
  let matchEls: Element[] = [];

  function toggleCollapseAll() {
    if (allCollapsed) {
      expandVersion += 1;
      allCollapsed = false;
    } else {
      collapseVersion += 1;
      allCollapsed = true;
    }
  }

  // After search term changes and DOM updates, find all mark elements
  $effect(() => {
    const term = searchTerm;
    tick().then(() => {
      matchEls.forEach((el) => el.classList.remove('search-match-active'));
      if (!treeEl || !term.trim()) {
        matchEls = [];
        matchCount = 0;
        currentMatch = -1;
        return;
      }
      matchEls = Array.from(treeEl.querySelectorAll('mark.search-match'));
      matchCount = matchEls.length;
      currentMatch = matchEls.length > 0 ? 0 : -1;
      applyActive();
    });
  });

  function applyActive() {
    matchEls.forEach((el) => el.classList.remove('search-match-active'));
    if (currentMatch >= 0 && matchEls[currentMatch]) {
      matchEls[currentMatch].classList.add('search-match-active');
      (matchEls[currentMatch] as HTMLElement).scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }

  function nextMatch() {
    if (matchEls.length === 0) return;
    currentMatch = (currentMatch + 1) % matchEls.length;
    applyActive();
  }

  function prevMatch() {
    if (matchEls.length === 0) return;
    currentMatch = (currentMatch - 1 + matchEls.length) % matchEls.length;
    applyActive();
  }

  function onSearchKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.shiftKey ? prevMatch() : nextMatch();
    } else if (e.key === 'Escape') {
      searchTerm = '';
    }
  }

  // Reset tree state when response changes
  $effect(() => {
    response;
    allCollapsed = false;
    searchTerm = '';
  });
</script>

<div class="response-viewer">
  {#if response}
    <div class="row response-meta">
      <span class="status-badge {statusClass(response.status)}">{statusLabel(response.status)}</span>
      <span class="duration">{response.duration}ms</span>
      <div style="display:flex; gap:4px; margin-left: auto; align-items: center; flex-wrap: wrap;">
        {#if prettyPrint}
          <div class="search-box">
            <input
              type="text"
              placeholder="Search…"
              bind:value={searchTerm}
              class="search-input"
              aria-label="Search in response"
              onkeydown={onSearchKeydown}
            />
            {#if searchTerm}
              <span class="match-count" class:no-match={matchCount === 0}>
                {matchCount === 0 ? '0' : `${currentMatch + 1}/${matchCount}`}
              </span>
              <button
                class="secondary nav-btn"
                onclick={prevMatch}
                disabled={matchCount === 0}
                title="Previous match (Shift+Enter)"
                aria-label="Previous match"
              >↑</button>
              <button
                class="secondary nav-btn"
                onclick={nextMatch}
                disabled={matchCount === 0}
                title="Next match (Enter)"
                aria-label="Next match"
              >↓</button>
              <button
                class="secondary nav-btn"
                onclick={() => (searchTerm = '')}
                title="Clear search (Escape)"
                aria-label="Clear search"
              >✕</button>
            {/if}
          </div>
          <button
            class="secondary"
            style="padding: 1px 6px; font-size: 11px;"
            onclick={toggleCollapseAll}
            title={allCollapsed ? 'Expand all' : 'Collapse all'}
          >{allCollapsed ? 'Expand all' : 'Collapse all'}</button>
        {/if}
        <button
          class="secondary"
          class:active={prettyPrint}
          style="padding: 1px 6px; font-size: 11px;"
          onclick={() => (prettyPrint = !prettyPrint)}
          title="Toggle pretty print"
        >Pretty</button>
        {#if response.headers && Object.keys(response.headers).length > 0}
          <button
            class="secondary"
            style="padding: 1px 6px; font-size: 11px;"
            onclick={() => (showHeaders = !showHeaders)}
          >{showHeaders ? 'Hide headers' : 'Headers'}</button>
        {/if}
      </div>
    </div>

    {#if response.error}
      <div class="error-banner">{response.error}</div>
    {/if}

    {#if response.truncated}
      <div class="truncated-banner">
        ⚠ Response body truncated — original size: {response.body?._originalSizeKB ?? '?'} KB.
        Increase <code>connectorTester.maxResponseBodyKB</code> in VS Code settings to raise the limit.
      </div>
    {/if}

    {#if showHeaders && response.headers}
      <pre class="json-pre" style="max-height: 100px; flex-shrink: 0;">{#each Object.entries(response.headers).filter(([k, v]) => k.trim() !== '' && v !== '') as [k, v]}<span class="jk">"{k.trim()}"</span>: <span class="js">"{v}"</span>{'\n'}{/each}</pre>
    {/if}

    {#if prettyPrint}
      <div class="json-pre json-tree" bind:this={treeEl}>
        {#if parsedNdjson}
          {#each parsedNdjson as item, i}
            <JsonNode
              value={item}
              isLast={i === parsedNdjson.length - 1}
              {collapseVersion}
              {expandVersion}
              {searchTerm}
              depth={0}
            />
          {/each}
        {:else if response.body !== null && response.body !== undefined}
          <JsonNode
            value={response.body}
            isLast={true}
            {collapseVersion}
            {expandVersion}
            {searchTerm}
            depth={0}
          />
        {:else}
          <span class="jl">null</span>
        {/if}
      </div>
    {:else}
      <pre class="json-pre raw">{response.body !== null && response.body !== undefined
          ? rawJson(response.body)
          : 'null'}</pre>
    {/if}
  {:else}
    <p class="empty">No response yet. Execute an action to see the result.</p>
  {/if}
</div>

<style>
  .response-viewer {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 6px;
    min-height: 0;
    overflow: hidden;
  }

  .response-meta {
    flex-shrink: 0;
  }

  button.active {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border-color: var(--vscode-button-background);
  }

  .json-pre.raw {
    white-space: pre-wrap;
    word-break: break-all;
  }

  .json-tree {
    white-space: pre;
    font-family: var(--vscode-editor-font-family, 'Courier New', monospace);
    font-size: var(--vscode-editor-font-size, 12px);
    overflow: auto;
  }

  .truncated-banner {
    flex-shrink: 0;
    padding: 4px 8px;
    border-radius: 3px;
    font-size: 12px;
    background: var(--vscode-inputValidation-warningBackground, #6c4f00);
    border: 1px solid var(--vscode-inputValidation-warningBorder, #b89500);
    color: var(--vscode-inputValidation-warningForeground, #fff);
  }

  .truncated-banner code {
    font-family: var(--vscode-editor-font-family, monospace);
    font-size: 11px;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .search-input {
    width: 120px;
    padding: 1px 6px;
    font-size: 11px;
    height: 20px;
  }

  .match-count {
    font-size: 10px;
    color: var(--vscode-descriptionForeground);
    white-space: nowrap;
    padding: 0 2px;
    min-width: 32px;
    text-align: center;
  }

  .match-count.no-match {
    color: var(--vscode-inputValidation-errorForeground, #f44336);
  }

  .nav-btn {
    padding: 0 5px;
    font-size: 12px;
    height: 20px;
    min-width: 22px;
    line-height: 1;
  }
</style>
