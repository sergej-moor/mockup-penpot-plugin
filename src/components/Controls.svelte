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
  <div class="form-group">
    <label class="select-label-hidden" for="select-1">Device Selection</label>
    <select class="select" id="select-1">
      <option value="1">Phone</option>
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
</style>
