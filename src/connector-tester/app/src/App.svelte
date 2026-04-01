<script lang="ts">
  import { onMount } from 'svelte';
  import type { CallHistoryItem, ConnectorResponse, ConnectorSource, EnvFile, Target } from './types';
  import { ClientFactory } from './services/ClientFactory';
  import { Messenger } from './services/Messenger';
  import TargetSelector from './lib/TargetSelector.svelte';
  import ActionSelector from './lib/ActionSelector.svelte';
  import JsonEditor from './lib/JsonEditor.svelte';
  import ResponseViewer from './lib/ResponseViewer.svelte';
  import HistoryPanel from './lib/HistoryPanel.svelte';
  import ConfigPanel from './lib/ConfigPanel.svelte';

  const REMOTE_COMMANDS = [
    'std:account:list',
    'std:account:read',
    'std:entitlement:list',
    'std:entitlement:read',
    'std:test-connection',
    'std:account:update',
    'std:account:create',
    'std:account:delete',
    'std:account:disable',
    'std:account:enable',
    'std:account:unlock',
    'std:account:discover-schema',
  ];

  const client = ClientFactory.getClient();

  // --- State ---
  let target = $state<Target>({ type: 'local', port: 3000 });
  let actions = $state<string[]>([]);
  let selectedAction = $state<string | null>(null);
  let body = $state('{}');
  let bodyValid = $state(true);
  let response = $state<ConnectorResponse | null>(null);
  let history = $state<CallHistoryItem[]>([]);
  let config = $state('{}');
  let configValid = $state(true);

  let sources = $state<ConnectorSource[]>([]);
  let sourcesLoading = $state(false);
  let envFiles = $state<EnvFile[]>([]);
  let selectedEnvFilePath = $state<string | null>(null);

  let loading = $state(false);
  let actionsLoading = $state(false);
  let configLoading = $state(false);
  let error = $state<string | null>(null);

  let isRemote = $derived(target.type === 'tenant');
  let canSync = $derived(target.type === 'local' || (target.type === 'tenant' && !!target.sourceId));

  // Remote commands are always available; local commands are loaded on demand
  let displayedActions = $derived(isRemote ? REMOTE_COMMANDS : actions);

  // --- Persistence ---
  function saveState() {
    try {
      Messenger.setState({ target, selectedAction, body, response, history, config });
    } catch {
      // not in VS Code context (dev mode)
    }
  }

  onMount(() => {
    try {
      const saved = Messenger.getState() as any;
      if (saved) {
        if (saved.target) target = saved.target;
        if (saved.selectedAction !== undefined) selectedAction = saved.selectedAction;
        if (saved.body !== undefined) body = saved.body;
        if (saved.response !== undefined) response = saved.response;
        if (saved.history) history = saved.history;
        if (saved.config !== undefined) config = saved.config;
      }
    } catch {
      // not in VS Code context (dev mode)
    }

    // Pre-load commands for whichever target is active
    if (target.type === 'local') {
      loadActions();
    } else {
      loadSources();
    }

    client.getEnvFiles().then(files => { envFiles = files; }).catch(() => {});
  });

  // --- Load sources (for Remote) ---
  async function loadSources() {
    sourcesLoading = true;
    try {
      sources = await client.getSources();
    } catch (e: any) {
      error = `Failed to load sources: ${e.message}`;
    } finally {
      sourcesLoading = false;
    }
  }

  // --- Target change ---
  function handleTargetChange() {
    selectedAction = null;
    actions = [];
    error = null;
    if (target.type === 'local') {
      loadActions();
    } else if (sources.length === 0) {
      loadSources();
    }
  }

  // --- Load local actions ---
  async function loadActions() {
    if (target.type !== 'local') return;
    actionsLoading = true;
    error = null;
    try {
      actions = await client.getLocalActions();
    } catch (e: any) {
      error = `Failed to load commands: ${e.message}`;
    } finally {
      actionsLoading = false;
    }
  }

  // --- Execute ---
  async function execute() {
    if (!selectedAction || !bodyValid || loading) return;

    let parsedPayload: any = {};
    try {
      parsedPayload = JSON.parse(body || '{}');
    } catch {
      error = 'Invalid JSON body';
      return;
    }

    let parsedConfig: Record<string, any> = {};
    if (configValid) {
      try {
        parsedConfig = JSON.parse(config || '{}');
      } catch {
        // ignore malformed config
      }
    }

    loading = true;
    error = null;

    try {
      let resp: ConnectorResponse;
      if (target.type === 'local') {
        resp = await client.executeLocalAction(target.port, selectedAction, parsedPayload, parsedConfig);
      } else {
        resp = await client.executeTenantAction(target.sourceId, selectedAction, parsedPayload, parsedConfig);
      }

      response = resp;

      const item: CallHistoryItem = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        request: { target, action: selectedAction, payload: parsedPayload },
        response: resp,
        config,
      };
      history = [item, ...history].slice(0, 50);

      saveState();
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  // --- Sync config ---
  async function syncConfig() {
    configLoading = true;
    try {
      const result = await client.syncConfig($state.snapshot(target) as Target, selectedEnvFilePath ?? undefined);
      config = JSON.stringify(result, null, 2);
      saveState();
    } catch (e: any) {
      error = `Failed to sync config: ${e.message}`;
    } finally {
      configLoading = false;
    }
  }

  // --- History restore ---
  function restoreFromHistory(item: CallHistoryItem) {
    target = item.request.target;
    selectedAction = item.request.action;
    body = JSON.stringify(item.request.payload, null, 2);
    response = item.response ?? null;
    if (item.config !== undefined) config = item.config;
    saveState();
  }

  // --- Keyboard shortcut ---
  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      execute();
    }
  }

  let canExecute = $derived(!!selectedAction && bodyValid && !loading);
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="container">
  <!-- Single-line toolbar -->
  <div class="toolbar">
    <TargetSelector bind:target {sources} {sourcesLoading} onchange={handleTargetChange} />
    <ActionSelector
      actions={displayedActions}
      bind:selectedAction
      loading={actionsLoading}
      showReload={!isRemote}
      onload={loadActions}
    />
    <button
      onclick={execute}
      disabled={!canExecute}
      title="Execute (Ctrl+Enter)"
      style="flex-shrink: 0;"
    >
      {#if loading}
        <span class="spinner"></span>
      {:else}
        Send ▶
      {/if}
    </button>
  </div>

  {#if error}
    <div class="error-banner">
      {error}
      <button class="secondary" style="padding: 1px 5px; font-size: 11px; margin-left: 8px;" onclick={() => (error = null)}>✕</button>
    </div>
  {/if}

  <!-- Main two-column layout -->
  <div class="main-layout">
    <!-- Request panel -->
    <div class="panel">
      <p class="panel-title">Request</p>

      <JsonEditor bind:value={body} bind:valid={bodyValid} />
    </div>

    <!-- Response panel -->
    <div class="panel">
      <p class="panel-title">Response</p>
      <ResponseViewer {response} />
    </div>
  </div>

  <!-- Bottom: history + config -->
  <div class="bottom-section">
    <HistoryPanel
      {history}
      onselect={restoreFromHistory}
      onclear={() => { history = []; saveState(); }}
    />
    <ConfigPanel bind:config bind:configValid bind:selectedEnvFilePath {envFiles} {canSync} loading={configLoading} onsync={syncConfig} onrefreshenvfiles={() => { client.getEnvFiles().then(files => { envFiles = files; }).catch(() => {}); }} />
  </div>
</div>
