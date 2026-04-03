<script lang="ts">
  import type { ConnectorSource, EnvFile } from '../types';
  import JsonEditor from './JsonEditor.svelte';

  let {
    config = $bindable('{}'),
    configValid = $bindable(true),
    selectedEnvFilePath = $bindable<string | null>(null),
    selectedSourceName = $bindable<string | null>(null),
    envFiles = [],
    sources = [],
    sourcesLoading = false,
    canSync = true,
    loading = false,
    onsync,
    onrefreshenvfiles,
    onrefreshsources,
  }: {
    config: string;
    configValid: boolean;
    selectedEnvFilePath: string | null;
    selectedSourceName: string | null;
    envFiles?: EnvFile[];
    sources?: ConnectorSource[];
    sourcesLoading?: boolean;
    canSync?: boolean;
    loading?: boolean;
    onsync?: () => void;
    onrefreshenvfiles?: () => void;
    onrefreshsources?: () => void;
  } = $props();
</script>

<div class="panel config-panel">
  <div class="row">
    <p class="panel-title" style="flex: 1; margin: 0;">Config</p>

    <label class="env-label" for="source-select">Source:</label>
    <select
      id="source-select"
      class="env-select"
      value={selectedSourceName ?? ''}
      onchange={(e) => { selectedSourceName = (e.target as HTMLSelectElement).value || null; }}
      disabled={sourcesLoading || sources.length === 0}
    >
      {#if sourcesLoading}
        <option value="">Loading…</option>
      {:else if sources.length === 0}
        <option value="">— none —</option>
      {:else}
        <option value="">— select source —</option>
        {#each sources as s (s.id)}
          <option value={s.name}>{s.name}</option>
        {/each}
      {/if}
    </select>
    <button class="secondary icon-btn" title="Refresh sources" onclick={onrefreshsources}>⟳</button>

    <label class="env-label" for="env-select">Env:</label>
    <select
      id="env-select"
      class="env-select"
      value={selectedEnvFilePath ?? ''}
      onchange={(e) => { selectedEnvFilePath = (e.target as HTMLSelectElement).value || null; }}
    >
      <option value="">— none —</option>
      {#each envFiles as f (f.path)}
        <option value={f.path}>{f.name}</option>
      {/each}
    </select>
    <button class="secondary icon-btn" title="Refresh env files" onclick={onrefreshenvfiles}>⟳</button>

    <button class="secondary" style="padding: 1px 6px; font-size: 11px;" onclick={onsync} disabled={loading || !canSync}>
      {#if loading}
        <span class="spinner"></span>
      {:else}
        Sync Config ⚙️
      {/if}
    </button>
  </div>

  <JsonEditor bind:value={config} bind:valid={configValid} label="Config" />
</div>

<style>
  .config-panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .env-label {
    font-size: 12px;
    color: var(--vscode-editor-foreground);
    white-space: nowrap;
  }

  .icon-btn {
    padding: 1px 5px;
    font-size: 13px;
    line-height: 1;
  }

  .env-select {
    font-size: 12px;
    min-width: 80px;
    max-width: 160px;
  }
</style>
