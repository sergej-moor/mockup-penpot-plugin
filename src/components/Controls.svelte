<script lang="ts">
  import { selection } from '../stores/selection';
  import { tooltip } from '../actions/tooltip';

  export let onColorChange: (event: Event) => void;

  $: isDisabled = !$selection.exportedImage?.data;

  function handleExport(): void {
    window.parent.postMessage({ type: 'capture-screenshot' }, '*');
  }
</script>

<div class="flex flex-col gap-4">
  <div class="color-picker-container flex items-center justify-end gap-2">
    <div
      use:tooltip={{
        text: 'Change the color of the device',
        position: 'left',
        maxWidth: 'max-w-[200px]',
      }}
    >
      <label for="colorPicker" class="text-sm">Device Color</label>
      <input
        id="colorPicker"
        type="color"
        on:input={onColorChange}
        disabled={isDisabled}
        class="color-picker-input"
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

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
