<script lang="ts">
  import { selection } from '../stores/selection';
  import { tooltip } from '../actions/tooltip';
  import { MODEL_CONFIGS, DEFAULT_MODEL } from '../config/models';

  export let onColorChange: (event: Event) => void;
  export let onModelChange: (modelId: string) => void;
  export let selectedModel = DEFAULT_MODEL;

  $: isDisabled = !$selection.exportedImage?.data;

  function handleExport(): void {
    window.parent.postMessage({ type: 'capture-screenshot' }, '*');
  }

  function handleModelSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    onModelChange(select.value);
  }
</script>

<div class="flex flex-col gap-4">
  <div class="form-group">
    <label class="select-label-hidden" for="model-select"
      >Device Selection</label
    >
    <select
      class="select w-full"
      id="model-select"
      value={selectedModel}
      on:change={handleModelSelect}
    >
      {#each Object.entries(MODEL_CONFIGS) as [id, config]}
        <option value={id}>{config.name}</option>
      {/each}
    </select>
  </div>

  <div class="color-picker-container flex w-full justify-end gap-2">
    <div
      class="w-full flex flex-col"
      use:tooltip={{
        text: 'Change the color of the device',
        position: 'left',
        maxWidth: 'max-w-[200px]',
      }}
    >
      <p>Device color:</p>
      <input
        id="colorPicker"
        type="color"
        on:input={onColorChange}
        disabled={isDisabled}
        class="color-picker-input w-full"
      />
    </div>
  </div>

  <button
    on:click={handleExport}
    disabled={isDisabled}
    data-appearance="primary"
    class="flex-1 flex justify-center gap-2 items-center"
    use:tooltip={{
      text: 'Export the current view as an image',
      position: 'bottom',
      maxWidth: 'max-w-[300px]',
    }}
  >
    Export View
  </button>
</div>

<style>
  .select-label {
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
    color: var(--text-color);
  }

  .select {
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--surface-color);
    color: var(--text-color);
    width: 100%;
  }

  .select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .color-picker-input {
    width: 40px;
    height: 40px;
    padding: 0;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .color-picker-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
