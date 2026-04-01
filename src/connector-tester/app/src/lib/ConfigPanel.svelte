<script lang="ts">
  import type { EnvFile } from '../types';
  import JsonEditor from './JsonEditor.svelte';

  let {
    config = $bindable('{}'),
    configValid = $bindable(true),
    selectedEnvFilePath = $bindable<string | null>(null),
    envFiles = [],
    canSync = true,
    loading = false,
    onsync,
    onrefreshenvfiles,
  }: {
    config: string;
    configValid: boolean;
    selectedEnvFilePath: string | null;
    envFiles?: EnvFile[];
    canSync?: boolean;
    loading?: boolean;
    onsync?: () => void;
    onrefreshenvfiles?: () => void;
  } = $props();
</script>

<div class="panel config-panel">
  <div class="row">
    <p class="panel-title" style="flex: 1; margin: 0;">Config</p>

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
