<script lang="ts">
  import { selection } from '../stores/selection';
  import LoadingSpinner from './LoadingSpinner.svelte';

  $: status = getStatus($selection);

  function getStatus(state: typeof $selection): {
    text: string;
    loading: boolean;
  } {
    if (state.isLoading) {
      return { text: 'Loading selection...', loading: true };
    }
    if (state.isPixelizing) {
      return { text: 'Processing image...', loading: true };
    }
    if (state.isUploadingFill) {
      return { text: 'Uploading image...', loading: true };
    }
    if (state.isPreviewLoading) {
      return { text: 'Generating preview...', loading: true };
    }
    if (state.error) {
      return { text: state.error, loading: false };
    }
    if (!state.name) {
      return { text: 'No selection', loading: false };
    }
    if (!state.exportedImage?.data) {
      return { text: 'Loading an image to preview', loading: false };
    }
    return { text: 'Ready', loading: false };
  }
</script>

<div class="status-container">
  {#if status.loading}
    <div class="flex items-center gap-2">
      <LoadingSpinner size="small" />
      <span>{status.text}</span>
    </div>
  {:else}
    <span class:error={$selection.error}>
      {status.text}
    </span>
  {/if}
</div>

<style>
  .status-container {
    text-align: center;
    font-size: 0.875rem;
    color: var(--text-color);
    padding: 0.5rem;
    border-radius: 4px;
    background-color: var(--surface-color);
    margin-top: -0.5rem;
  }

  .error {
    color: var(--error-color);
  }
</style>
