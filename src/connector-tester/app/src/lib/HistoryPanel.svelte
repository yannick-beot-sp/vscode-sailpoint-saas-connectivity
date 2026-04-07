<script lang="ts">
  import type { CallHistoryItem } from '../types';

  const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

  let {
    history = [],
    page = $bindable(0),
    pageSize = $bindable(10),
    onselect,
    onclear,
    ondeleteitem,
  }: {
    history: CallHistoryItem[];
    page?: number;
    pageSize?: number;
    onselect?: (item: CallHistoryItem) => void;
    onclear?: () => void;
    ondeleteitem?: (id: string) => void;
  } = $props();

  let pageCount = $derived(Math.max(1, Math.ceil(history.length / pageSize)));
  let pageItems = $derived(history.slice(page * pageSize, (page + 1) * pageSize));

  $effect(() => {
    const maxPage = Math.max(0, Math.ceil(history.length / pageSize) - 1);
    if (page > maxPage) page = maxPage;
  });

  function statusClass(status: number | undefined): string {
    if (!status || status === 0) return 'status-err';
    if (status >= 200 && status < 300) return 'status-2xx';
    if (status >= 400 && status < 500) return 'status-4xx';
    if (status >= 500) return 'status-5xx';
    return 'status-err';
  }

  function formatRelativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  }

  function targetLabel(item: CallHistoryItem): string {
    const t = item.request.target;
    if (t.type === 'local') return `Local :${t.port}`;
    const name = t.connectorAlias;
    return name.length > 10 ? name.slice(0, 10) + '…' : name;
  }

  function targetTitle(item: CallHistoryItem): string {
    const t = item.request.target;
    if (t.type === 'local') return `Local :${t.port}`;
    return `Remote ${t.connectorAlias}`;
  }

  function statusLabel(item: CallHistoryItem): string {
    if (!item.response) return '…';
    return item.response.status ? String(item.response.status) : 'ERR';
  }
</script>

<div class="panel">
  <div class="row">
    <p class="panel-title" style="flex: 1; margin: 0;">History</p>
    {#if history.length > 0}
      <button class="secondary" style="padding: 1px 6px; font-size: 11px;" onclick={onclear}>Clear</button>
    {/if}
  </div>

  {#if history.length === 0}
    <p class="empty">No history yet.</p>
  {:else}
    <div class="history-table-wrapper">
      <table class="history-table">
        <colgroup>
          <col class="col-time" />
          <col class="col-action" />
          <col class="col-target" />
          <col class="col-status" />
          <col class="col-delete" />
        </colgroup>
        <thead>
          <tr>
            <th>When</th>
            <th>Action</th>
            <th>Target</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each pageItems as item (item.id)}
            <tr
              class="history-row"
              onclick={() => onselect?.(item)}
              title="{item.request.action} — {targetTitle(item)} — {formatRelativeTime(item.timestamp)}"
            >
              <td class="col-time">{formatRelativeTime(item.timestamp)}</td>
              <td class="col-action">{item.request.action}</td>
              <td class="col-target" title={targetTitle(item)}>{targetLabel(item)}</td>
              <td class="col-status">
                {#if item.response !== undefined}
                  <span class="status-badge {statusClass(item.response?.status)}">{statusLabel(item)}</span>
                {:else}
                  <span class="spinner"></span>
                {/if}
              </td>
              <td class="col-delete">
                <button class="delete-btn" onclick={(e) => { e.stopPropagation(); ondeleteitem?.(item.id); }}>✕</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="history-pagination">
      <button class="secondary" style="padding: 1px 5px; font-size: 11px;" disabled={page === 0} onclick={() => page--}>‹</button>
      <span style="font-size: 11px; color: var(--vscode-descriptionForeground);">{page + 1} / {pageCount}</span>
      <button class="secondary" style="padding: 1px 5px; font-size: 11px;" disabled={page >= pageCount - 1} onclick={() => page++}>›</button>
      <span style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-left: auto;">Rows:</span>
      <select
        class="page-size-select"
        value={pageSize}
        onchange={(e) => { pageSize = Number((e.target as HTMLSelectElement).value); page = 0; }}
      >
        {#each PAGE_SIZE_OPTIONS as opt}
          <option value={opt}>{opt}</option>
        {/each}
      </select>
    </div>
  {/if}
</div>

<style>
  .history-table-wrapper {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .history-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    table-layout: fixed;
  }

  .col-time   { width: 55px; }
  .col-action { width: auto; }
  .col-target { width: 85px; }
  .col-status { width: 48px; }
  .col-delete { width: 24px; }

  .delete-btn {
    visibility: hidden;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--vscode-descriptionForeground);
    padding: 0 2px;
    font-size: 11px;
    line-height: 1;
  }

  .history-row:hover .delete-btn {
    visibility: visible;
  }

  .history-table thead th {
    text-align: left;
    color: var(--vscode-descriptionForeground);
    font-weight: 600;
    padding: 0 4px 3px;
    border-bottom: 1px solid var(--vscode-panel-border, var(--vscode-editorGroup-border));
    white-space: nowrap;
  }

  .history-table thead th:last-child {
    text-align: center;
  }

  .history-row {
    cursor: pointer;
  }

  .history-row:hover td {
    background: var(--vscode-list-hoverBackground);
  }

  .history-row td {
    padding: 2px 4px;
    border-bottom: 1px solid var(--vscode-panel-border, transparent);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .col-time {
    color: var(--vscode-descriptionForeground);
  }

  .col-target {
    color: var(--vscode-descriptionForeground);
  }

  .col-status {
    text-align: center;
  }

  .history-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex-shrink: 0;
    padding-top: 4px;
  }

  .page-size-select {
    font-size: 11px;
    background: var(--vscode-dropdown-background);
    color: var(--vscode-dropdown-foreground);
    border: 1px solid var(--vscode-dropdown-border);
    border-radius: 2px;
    padding: 0 2px;
    height: 18px;
    width: auto;
  }
</style>
