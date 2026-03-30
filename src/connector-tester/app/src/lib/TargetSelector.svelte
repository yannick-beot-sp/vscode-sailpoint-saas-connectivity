<script lang="ts">
  import type { ConnectorSource, Target } from '../types';

  let {
    target = $bindable<Target>({ type: 'local', port: 3000 }),
    sources = [],
    sourcesLoading = false,
    onchange,
  }: {
    target: Target;
    sources: ConnectorSource[];
    sourcesLoading: boolean;
    onchange?: () => void;
  } = $props();

  let lastPort = $state(3000);

  function setLocal() {
    if (target.type !== 'local') {
      target = { type: 'local', port: lastPort };
      onchange?.();
    }
  }

  function setRemote() {
    if (target.type !== 'tenant') {
      const firstSourceId = sources[0]?.id ?? '';
      target = { type: 'tenant', sourceId: firstSourceId };
      onchange?.();
    }
  }

  function handlePortChange(e: Event) {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    if (!isNaN(val)) {
      lastPort = val;
      target = { type: 'local', port: val };
    }
  }

  function handleSourceChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    target = { type: 'tenant', sourceId: val };
    onchange?.();
  }

  // When sources load, auto-select first if none selected
  $effect(() => {
    if (target.type === 'tenant' && sources.length > 0 && !target.sourceId) {
      target = { type: 'tenant', sourceId: sources[0].id };
    }
  });
</script>

<div class="target-selector">
  <label class="radio-label">
    <input type="radio" name="target-type" checked={target.type === 'local'} onchange={setLocal} />
    Local
  </label>
  <label class="radio-label">
    <input type="radio" name="target-type" checked={target.type === 'tenant'} onchange={setRemote} />
    Remote
  </label>

  {#if target.type === 'local'}
    <input
      class="port-input"
      type="number"
      min="1"
      max="65535"
      placeholder="3000"
      value={target.port}
      oninput={handlePortChange}
    />
  {:else}
    {#if sourcesLoading}
      <span class="spinner"></span>
    {:else}
      <select
        class="source-select"
        value={target.sourceId}
        onchange={handleSourceChange}
        disabled={sources.length === 0}
      >
        {#if sources.length === 0}
          <option value="">No sources</option>
        {:else}
          {#each sources as source (source.id)}
            <option value={source.id}>{source.name}</option>
          {/each}
        {/if}
      </select>
    {/if}
  {/if}
</div>

<style>
  .target-selector {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .radio-label {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    font-size: 13px;
    color: var(--vscode-editor-foreground);
    white-space: nowrap;
    margin: 0;
  }

  .radio-label input[type='radio'] {
    margin: 0;
    cursor: pointer;
    width: auto;
    border: none;
    padding: 0;
  }

  .port-input {
    width: 70px !important;
  }

  .source-select {
    min-width: 120px;
    max-width: 220px;
  }
</style>
