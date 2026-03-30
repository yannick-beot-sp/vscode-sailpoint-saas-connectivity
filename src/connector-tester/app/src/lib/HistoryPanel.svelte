<script lang="ts">
  import type { CallHistoryItem } from '../types';

  let {
    history = [],
    onselect,
    onclear,
  }: {
    history: CallHistoryItem[];
    onselect?: (item: CallHistoryItem) => void;
    onclear?: () => void;
  } = $props();

  function statusClass(status: number | undefined): string {
    if (!status || status === 0) return 'status-err';
    if (status >= 200 && status < 300) return 'status-2xx';
    if (status >= 400 && status < 500) return 'status-4xx';
    if (status >= 500) return 'status-5xx';
    return 'status-err';
  }

  function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString();
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
    <div class="history-list">
      {#each history as item (item.id)}
        <button
          class="history-item"
          title="{item.request.action} — {formatTime(item.timestamp)}"
          onclick={() => onselect?.(item)}
        >
          <span class="action-name">{item.request.action}</span>
          {#if item.response}
            <span class="status-badge {statusClass(item.response.status)}" style="font-size: 10px; padding: 0 5px;">
              {item.response.status || 'ERR'}
            </span>
            <span style="font-size: 10px; color: var(--vscode-descriptionForeground); flex-shrink: 0;">{item.response.duration}ms</span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>
