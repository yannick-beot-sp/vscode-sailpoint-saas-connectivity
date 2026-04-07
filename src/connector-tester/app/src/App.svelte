<script lang="ts">
  import { onMount } from 'svelte';
  import type { CallHistoryItem, ConnectorItem, ConnectorResponse, ConnectorSource, EnvFile, Target } from './types';
  import { ClientFactory } from './services/ClientFactory';
  import { Messenger } from './services/Messenger';
  import TargetSelector from './lib/TargetSelector.svelte';
  import ActionSelector from './lib/ActionSelector.svelte';
  import JsonEditor from './lib/JsonEditor.svelte';
  import ResponseViewer from './lib/ResponseViewer.svelte';
  import HistoryPanel from './lib/HistoryPanel.svelte';
  import ConfigPanel from './lib/ConfigPanel.svelte';

  // --- Resize state ---
  let mainHeightPct = $state(65);
  let reqWidthPct = $state(50);
  let histWidthPct = $state(50);
  let dragType = $state<null | 'v' | 'h-main' | 'h-bottom'>(null);

  let workspaceEl: HTMLElement;
  let mainLayoutEl: HTMLElement;
  let bottomEl: HTMLElement;

  function startDrag(e: MouseEvent, type: typeof dragType) {
    e.preventDefault();
    dragType = type;
  }

  function onMouseMove(e: MouseEvent) {
    if (!dragType) return;
    if (dragType === 'v') {
      const rect = workspaceEl.getBoundingClientRect();
      mainHeightPct = Math.min(85, Math.max(15, ((e.clientY - rect.top) / rect.height) * 100));
    } else if (dragType === 'h-main') {
      const rect = mainLayoutEl.getBoundingClientRect();
      reqWidthPct = Math.min(85, Math.max(15, ((e.clientX - rect.left) / rect.width) * 100));
    } else if (dragType === 'h-bottom') {
      const rect = bottomEl.getBoundingClientRect();
      histWidthPct = Math.min(85, Math.max(15, ((e.clientX - rect.left) / rect.width) * 100));
    }
  }

  function stopDrag() {
    dragType = null;
  }

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

  // Connectors list (for TargetSelector remote)
  let connectors = $state<ConnectorItem[]>([]);
  let connectorsLoading = $state(false);

  // Instance sources (for ConfigPanel Sync Config)
  let instanceSources = $state<ConnectorSource[]>([]);
  let instanceSourcesLoading = $state(false);
  let selectedSourceName = $state<string | null>(null);

  let envFiles = $state<EnvFile[]>([]);
  let selectedEnvFilePath = $state<string | null>(null);

  let historyPage = $state(0);
  let historyPageSize = $state(10);

  let loading = $state(false);
  let actionsLoading = $state(false);
  let configLoading = $state(false);
  let error = $state<string | null>(null);

  let isRemote = $derived(target.type === 'tenant');

  // --- Persistence ---
  let stateRestored = false;

  function saveState() {
    try {
      Messenger.setState({
        target: $state.snapshot(target),
        selectedAction,
        body,
        response: $state.snapshot(response),
        config,
        selectedSourceName,
        selectedEnvFilePath,
        historyPage,
        historyPageSize,
      });
    } catch {
      // not in VS Code context (dev mode)
    }
  }

  $effect(() => {
    // All reactive reads must happen BEFORE any early return,
    // otherwise Svelte never registers them as dependencies
    // and the effect will not re-run when they change.
    const snapshot = {
      target: $state.snapshot(target),
      selectedAction,
      body,
      response: $state.snapshot(response),
      config,
      selectedSourceName,
      selectedEnvFilePath,
      historyPage,
      historyPageSize,
    };
    if (!stateRestored) return;
    try {
      Messenger.setState(snapshot);
    } catch {
      // not in VS Code context (dev mode)
    }
  });

  onMount(async () => {
    let savedHistory: CallHistoryItem[] | undefined;
    let savedHistoryPage: number | undefined;
    try {
      const saved = Messenger.getState() as any;
      if (saved) {
        if (saved.target) {
          // Migrate old saved state that used sourceId/sourceName
          const t = saved.target;
          if (t.type === 'tenant' && 'sourceId' in t) {
            target = { type: 'tenant', connectorId: '', connectorAlias: '' };
          } else {
            target = t;
          }
        }
        if (saved.selectedAction !== undefined) selectedAction = saved.selectedAction;
        if (saved.body !== undefined) body = saved.body;
        if (saved.response !== undefined) response = saved.response;
        if (saved.config !== undefined) config = saved.config;
        if (saved.selectedSourceName !== undefined) selectedSourceName = saved.selectedSourceName;
        if (saved.selectedEnvFilePath !== undefined) selectedEnvFilePath = saved.selectedEnvFilePath;
        if (saved.historyPageSize !== undefined) historyPageSize = saved.historyPageSize;
        savedHistory = saved.history;
        // historyPage is saved for later — must be restored after history loads
        // so the $effect in HistoryPanel doesn't reset it to 0 on empty history
        savedHistoryPage = saved.historyPage;
      }
    } catch {
      // not in VS Code context (dev mode)
    }

    // Load history from workspaceState (persisted across sessions)
    try {
      const persistedHistory = await client.loadHistory();
      if (persistedHistory.length === 0 && savedHistory && savedHistory.length > 0) {
        // One-time migration from old webview state
        history = savedHistory;
        await client.saveHistory(savedHistory);
      } else {
        history = persistedHistory;
      }
      if (savedHistoryPage !== undefined) historyPage = savedHistoryPage;
    } catch {
      // not in VS Code context (dev mode)
    }

    stateRestored = true;

    // Pre-load commands/connectors for whichever target is active
    if (target.type === 'local') {
      loadActions();
    } else {
      loadConnectors();
      loadTenantActions();
    }

    client.getEnvFiles().then(files => { envFiles = files; }).catch(() => {});
    loadInstanceSources();
  });

  // --- Load connectors (for TargetSelector remote) ---
  async function loadConnectors() {
    connectorsLoading = true;
    try {
      connectors = await client.getConnectors();
    } catch (e: any) {
      error = `Failed to load connectors: ${e.message}`;
    } finally {
      connectorsLoading = false;
    }
  }

  // --- Load instance sources (for ConfigPanel Sync Config) ---
  async function loadInstanceSources() {
    instanceSourcesLoading = true;
    try {
      instanceSources = await client.getSources();
    } catch (e: any) {
      error = `Failed to load sources: ${e.message}`;
    } finally {
      instanceSourcesLoading = false;
    }
  }

  // --- Target change ---
  function handleTargetChange() {
    actions = [];
    error = null;
    if (target.type === 'local') {
      loadActions();
    } else {
      loadTenantActions();
      if (connectors.length === 0) {
        loadConnectors();
      }
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

  // --- Load remote (tenant) actions ---
  async function loadTenantActions() {
    actionsLoading = true;
    error = null;
    try {
      const connectorId = target.type === 'tenant' ? target.connectorId : '';
      actions = await client.getTenantActions(connectorId);
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
        resp = await client.executeTenantAction(target.connectorId, selectedAction, parsedPayload, parsedConfig);
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
      client.saveHistory($state.snapshot(history) as CallHistoryItem[]).catch(() => {});
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
      const result = await client.syncConfig(
        selectedEnvFilePath ?? undefined,
        selectedSourceName ?? undefined,
      );
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
    // Ensure connectors/actions are loaded for the restored target
    handleTargetChange();
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

<svelte:window onkeydown={handleKeydown} onmousemove={onMouseMove} onmouseup={stopDrag} />

<div
  class="container"
  class:is-dragging={dragType !== null}
  style={dragType === 'v' ? 'cursor: row-resize' : dragType ? 'cursor: col-resize' : ''}
>
  <!-- Single-line toolbar -->
  <div class="toolbar">
    <TargetSelector
      bind:target
      {connectors}
      {connectorsLoading}
      onchange={handleTargetChange}
      onrefresh={loadConnectors}
    />
    <ActionSelector
      {actions}
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

  <div class="workspace" bind:this={workspaceEl}>
    <!-- Main two-column layout -->
    <div class="main-layout" bind:this={mainLayoutEl} style="flex: 0 0 {mainHeightPct}%">
      <!-- Request panel -->
      <div class="resize-wrapper" style="flex: 0 0 {reqWidthPct}%">
        <div class="panel">
          <p class="panel-title">Request</p>
          <JsonEditor bind:value={body} bind:valid={bodyValid} />
        </div>
      </div>

      <div
        class="divider divider-h"
        class:active={dragType === 'h-main'}
        onmousedown={e => startDrag(e, 'h-main')}
      ></div>

      <!-- Response panel -->
      <div class="resize-wrapper" style="flex: 1">
        <div class="panel">
          <p class="panel-title">Response</p>
          <ResponseViewer {response} />
        </div>
      </div>
    </div>

    <div
      class="divider divider-v"
      class:active={dragType === 'v'}
      onmousedown={e => startDrag(e, 'v')}
    ></div>

    <!-- Bottom: history + config -->
    <div class="bottom-section" bind:this={bottomEl} style="flex: 1">
      <div class="resize-wrapper" style="flex: 0 0 {histWidthPct}%">
        <HistoryPanel
          {history}
          bind:page={historyPage}
          bind:pageSize={historyPageSize}
          onselect={restoreFromHistory}
          onclear={() => { history = []; client.saveHistory([]).catch(() => {}); }}
          ondeleteitem={async (id: string) => { history = await client.deleteHistoryItem(id); }}
        />
      </div>

      <div
        class="divider divider-h"
        class:active={dragType === 'h-bottom'}
        onmousedown={e => startDrag(e, 'h-bottom')}
      ></div>

      <div class="resize-wrapper" style="flex: 1">
        <ConfigPanel
          bind:config
          bind:configValid
          bind:selectedEnvFilePath
          bind:selectedSourceName
          {envFiles}
          sources={instanceSources}
          sourcesLoading={instanceSourcesLoading}
          loading={configLoading}
          onsync={syncConfig}
          onrefreshenvfiles={() => { client.getEnvFiles().then(files => { envFiles = files; }).catch(() => {}); }}
          onrefreshsources={loadInstanceSources}
        />
      </div>
    </div>
  </div>
</div>
