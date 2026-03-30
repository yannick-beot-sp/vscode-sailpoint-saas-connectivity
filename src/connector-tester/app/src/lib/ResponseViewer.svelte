<script lang="ts">
  import type { ConnectorResponse } from '../types';

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

  function highlight(obj: any): string {
    const json = JSON.stringify(obj, null, 2);
    return json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
          if (/^"/.test(match)) {
            return /:$/.test(match)
              ? `<span class="jk">${match}</span>`
              : `<span class="js">${match}</span>`;
          }
          if (/true|false/.test(match)) return `<span class="jb">${match}</span>`;
          if (/null/.test(match)) return `<span class="jl">${match}</span>`;
          return `<span class="jn">${match}</span>`;
        }
      );
  }

  let showHeaders = $state(false);
</script>

<div class="response-viewer">
  {#if response}
    <div class="row response-meta">
      <span class="status-badge {statusClass(response.status)}">{statusLabel(response.status)}</span>
      <span class="duration">{response.duration}ms</span>
      {#if response.headers && Object.keys(response.headers).length > 0}
        <button
          class="secondary"
          style="padding: 1px 6px; font-size: 11px; margin-left: auto;"
          onclick={() => (showHeaders = !showHeaders)}
        >
          {showHeaders ? 'Hide headers' : 'Headers'}
        </button>
      {/if}
    </div>

    {#if response.error}
      <div class="error-banner">{response.error}</div>
    {/if}

    {#if showHeaders && response.headers}
      <pre class="json-pre" style="max-height: 100px; flex-shrink: 0;">
        {#each Object.entries(response.headers) as [k, v]}
          <span class="jk">"{k}"</span>: <span class="js">"{v}"</span>{'\n'}
        {/each}
      </pre>
    {/if}

    <pre class="json-pre"><!-- eslint-disable-next-line svelte/no-at-html-tags -->{@html response.body !== null && response.body !== undefined
        ? highlight(response.body)
        : '<span class="jl">null</span>'}</pre>
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
</style>
