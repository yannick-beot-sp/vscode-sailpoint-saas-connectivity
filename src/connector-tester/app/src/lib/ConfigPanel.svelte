<script lang="ts">
  import type { ConnectorConfig } from '../types';

  let {
    config,
    loading = false,
    onsync,
  }: {
    config: ConnectorConfig | null;
    loading?: boolean;
    onsync?: () => void;
  } = $props();

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
</script>

<div class="panel">
  <div class="row">
    <p class="panel-title" style="flex: 1; margin: 0;">Config</p>
    <button class="secondary" style="padding: 1px 6px; font-size: 11px;" onclick={onsync} disabled={loading}>
      {#if loading}
        <span class="spinner"></span>
      {:else}
        Sync
      {/if}
    </button>
  </div>

  {#if config !== null && config !== undefined}
    <pre class="json-pre config-pre"><!-- eslint-disable-next-line svelte/no-at-html-tags -->{@html highlight(config)}</pre>
  {:else}
    <p class="empty">Click Sync to load configuration.</p>
  {/if}
</div>

<style>
  .config-pre {
    flex: 1;
    max-height: 120px;
    margin: 0;
  }
</style>
