<script lang="ts">
  import Controls from './components/Controls.svelte';
  import ThreeViewer from './components/ThreeViewer.svelte';
  import StatusDisplay from './components/StatusDisplay.svelte';
  import { theme } from './stores/theme';
  import { selection } from './stores/selection';
  import { MessageHandler } from './services/messageHandler';
  import ErrorBoundary from './components/ErrorBoundary.svelte';

  let selectedColor = '#000000';

  function handlePreviewError(error: Error): void {
    console.error('Preview error:', error);
  }

  function handleColorChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    selectedColor = target.value;
  }

  function handleScreenshotCapture(imageData: Uint8Array): void {
    console.log('App received screenshot data:', imageData.length);
    window.parent.postMessage(
      {
        type: 'upload-screenshot',
        imageData: Array.from(imageData),
      },
      '*'
    );
  }
</script>

<svelte:window onmessage={MessageHandler.handle} />

<main data-theme={$theme}>
  <h2
    class="text-center mb-2 font-GamjaFlower tracking-widest hover:tracking-[0.7rem] transition-all duration-700 font-bold"
  >
    3D Mockup
  </h2>
  <div class="flex flex-col gap-4">
    <ErrorBoundary
      fallback="Unable to load preview. Please try selecting a different image."
      onError={handlePreviewError}
    >
      <div class="preview-container">
        <ThreeViewer
          imageData={$selection.exportedImage?.data}
          {selectedColor}
          onScreenshotCapture={handleScreenshotCapture}
        />
        <StatusDisplay />
      </div>
    </ErrorBoundary>

    <ErrorBoundary
      fallback="Controls are temporarily unavailable. Please refresh the page."
    >
      <Controls onColorChange={handleColorChange} />
    </ErrorBoundary>
  </div>
</main>

<style>
  main {
    padding: var(--spacing-8);
    max-width: 408px;
    margin: 0 auto;
  }

  .preview-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
