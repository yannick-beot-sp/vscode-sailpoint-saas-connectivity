<script lang="ts">
  import type { ConnectorItem, Target } from '../types';

  let {
    target = $bindable<Target>({ type: 'local', port: 3000 }),
    connectors = [],
    connectorsLoading = false,
    onchange,
    onrefresh,
  }: {
    target: Target;
    connectors: ConnectorItem[];
    connectorsLoading: boolean;
    onchange?: () => void;
    onrefresh?: () => void;
  } = $props();

  let lastPort = $state(3000);
  let selectEl = $state<HTMLSelectElement | null>(null);

  // Re-apply the select value after connectors load asynchronously.
  // Svelte only re-sets the DOM value when target.connectorId changes,
  // not when new <option> elements are added — so we do it manually here.
  $effect(() => {
    if (connectors.length > 0 && target.type === 'tenant' && selectEl) {
      selectEl.value = target.connectorId;
    }
  });

  function setLocal() {
    if (target.type !== 'local') {
      target = { type: 'local', port: lastPort };
      onchange?.();
    }
  }

  function setRemote() {
    if (target.type !== 'tenant') {
      target = { type: 'tenant', connectorId: '', connectorAlias: '' };
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

  function handleConnectorChange(e: Event) {
    const id = (e.target as HTMLSelectElement).value;
    const connector = connectors.find(c => c.id === id);
    target = { type: 'tenant', connectorId: id, connectorAlias: connector?.alias ?? '' };
    onchange?.();
  }

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
    {#if connectorsLoading}
      <span class="spinner"></span>
    {:else}
      <select
        bind:this={selectEl}
        class="connector-select"
        value={target.connectorId}
        onchange={handleConnectorChange}
        disabled={connectors.length === 0}
      >
        {#if connectors.length === 0}
          <option value="">No connectors</option>
        {:else}
          <option value="">— select a connector —</option>
          {#each connectors as connector (connector.id)}
            <option value={connector.id}>{connector.alias}</option>
          {/each}
        {/if}
      </select>
    {/if}
    <button class="secondary icon-btn" title="Refresh connectors" onclick={onrefresh}>⟳</button>
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

  .connector-select {
    min-width: 120px;
    max-width: 220px;
  }

  .icon-btn {
    padding: 1px 5px;
    font-size: 13px;
    line-height: 1;
  }
</style>
