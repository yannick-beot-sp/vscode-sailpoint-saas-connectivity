<script lang="ts">
  import type { ConnectorAction, LocalAction } from '../types';

  let {
    actions = [],
    selectedAction = $bindable<string | null>(null),
    loading = false,
    showReload = false,
    onload,
  }: {
    actions: (LocalAction | ConnectorAction)[];
    selectedAction: string | null;
    loading: boolean;
    showReload?: boolean;
    onload?: () => void;
  } = $props();

  let inputValue = $state(selectedAction ?? '');
  let open = $state(false);
  let inputEl = $state<HTMLInputElement | null>(null);
  let wrapperEl = $state<HTMLDivElement | null>(null);

  // Sync inputValue when selectedAction changes externally (history restore)
  $effect(() => {
    if (selectedAction !== (inputValue || null)) {
      inputValue = selectedAction ?? '';
    }
  });

  let filtered = $derived(
    inputValue.trim() === ''
      ? actions
      : actions.filter(a => a.name.toLowerCase().includes(inputValue.toLowerCase()))
  );

  function handleInput(e: Event) {
    inputValue = (e.target as HTMLInputElement).value;
    selectedAction = inputValue.trim() || null;
    open = true;
  }

  function handleFocus() {
    open = true;
  }

  function select(name: string) {
    inputValue = name;
    selectedAction = name;
    open = false;
    inputEl?.focus();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      open = false;
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const first = wrapperEl?.querySelector<HTMLLIElement>('.option');
      first?.focus();
    } else if (e.key === 'Enter') {
      open = false;
    }
  }

  function handleOptionKeydown(e: KeyboardEvent, name: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      select(name);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      (e.currentTarget as HTMLElement).nextElementSibling?.querySelector<HTMLElement>('.option')
        ?? (e.currentTarget as HTMLElement).nextElementSibling as HTMLElement | null
        ?? null;
      const next = (e.currentTarget as HTMLElement).nextElementSibling as HTMLElement | null;
      next?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (e.currentTarget as HTMLElement).previousElementSibling as HTMLElement | null;
      if (prev) {
        prev.focus();
      } else {
        inputEl?.focus();
      }
    } else if (e.key === 'Escape') {
      open = false;
      inputEl?.focus();
    }
  }

  function handleBlur(e: FocusEvent) {
    // Close only if focus leaves the whole component
    const related = e.relatedTarget as Node | null;
    if (!wrapperEl?.contains(related)) {
      open = false;
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="combobox-wrapper"
  bind:this={wrapperEl}
  onblur={handleBlur}
>
  <div class="combobox-input-row">
    <input
      bind:this={inputEl}
      type="text"
      placeholder="command"
      value={inputValue}
      oninput={handleInput}
      onfocus={handleFocus}
      onkeydown={handleKeydown}
      autocomplete="off"
      spellcheck="false"
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-autocomplete="list"
    />
    <button
      class="secondary toggle-btn"
      tabindex="-1"
      onclick={() => { open = !open; inputEl?.focus(); }}
      title="Show commands"
    >▾</button>
    {#if showReload}
      <button
        class="secondary reload-btn"
        onclick={onload}
        disabled={loading}
        title="Load commands from connector"
      >
        {#if loading}
          <span class="spinner"></span>
        {:else}
          ⟳
        {/if}
      </button>
    {/if}
  </div>

  {#if open && filtered.length > 0}
    <ul class="dropdown" role="listbox">
      {#each filtered as action (action.name)}
        <!-- svelte-ignore a11y_interactive_supports_focus -->
        <li
          class="option"
          class:selected={action.name === selectedAction}
          role="option"
          aria-selected={action.name === selectedAction}
          tabindex="0"
          onmousedown={(e) => { e.preventDefault(); select(action.name); }}
          onkeydown={(e) => handleOptionKeydown(e, action.name)}
        >
          {action.name}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .combobox-wrapper {
    position: relative;
    flex: 1;
    min-width: 0;
  }

  .combobox-input-row {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .combobox-input-row input {
    flex: 1;
    min-width: 0;
    border-radius: 2px 0 0 2px;
  }

  .toggle-btn {
    padding: 3px 5px;
    border-radius: 0 2px 2px 0;
    border-left: none;
    flex-shrink: 0;
    font-size: 11px;
    line-height: 1;
  }

  .reload-btn {
    flex-shrink: 0;
    padding: 3px 7px;
    margin-left: 2px;
  }

  .dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 100;
    margin: 1px 0 0;
    padding: 2px 0;
    list-style: none;
    background: var(--vscode-dropdown-background, var(--vscode-input-background));
    border: 1px solid var(--vscode-focusBorder);
    border-radius: 2px;
    max-height: 220px;
    overflow-y: auto;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  .option {
    padding: 4px 10px;
    cursor: pointer;
    font-size: 13px;
    color: var(--vscode-dropdown-foreground, var(--vscode-editor-foreground));
    outline: none;
  }

  .option:hover,
  .option:focus {
    background: var(--vscode-list-hoverBackground);
  }

  .option.selected {
    background: var(--vscode-list-activeSelectionBackground);
    color: var(--vscode-list-activeSelectionForeground);
  }
</style>
