<script lang="ts">
  import Controls from './components/Controls.svelte';
  import ThreeViewer from './components/ThreeViewer.svelte';
  import StatusDisplay from './components/StatusDisplay.svelte';
  import { theme } from './stores/theme';
  import { selection } from './stores/selection';
  import { MessageHandler } from './services/messageHandler';
  import ErrorBoundary from './components/ErrorBoundary.svelte';

  let selectedColor = '#000000';
  let selectedModel = 'iphone';

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

  function handleModelChange(modelId: string): void {
    selectedModel = modelId;
  }
</script>

<svelte:window onmessage={MessageHandler.handle} />

<main data-theme={$theme}>
  <h2
    class="text-center mb-2 tracking-widest hover:tracking-[0.7rem] transition-all duration-700 font-bold"
  >
    3D Mockups
  </h2>
  <div class="flex flex-col gap-4">
    <ErrorBoundary
      fallback="Unable to load preview. Please try selecting a different image."
      onError={handlePreviewError}
    >
      <div class="preview-container">
        <StatusDisplay />
        <div class=" border-gray-300 border-2">
          <ThreeViewer
            imageData={$selection.exportedImage?.data}
            {selectedColor}
            {selectedModel}
            onScreenshotCapture={handleScreenshotCapture}
          />
        </div>
        <div class="text-xs">
          <details class="accordion">
            <summary class="cursor-pointer">View Attribution</summary>
            <div class="mt-2">
              Model made by <p>
                SDC PERFORMANCE™️
                ("https://sketchfab.com/3d-models/free-iphone-13-pro-2021-a35156d91cf44e70a2fdfeade54ae0b2")
              </p>
              <br />
              under
              <p>CC 4.0 (https://creativecommons.org/licenses/by/4.0/)</p>
            </div>
          </details>
          <br />
          Recommended resolution: 2532px x 1170px
        </div>
      </div>
    </ErrorBoundary>

    <ErrorBoundary
      fallback="Controls are temporarily unavailable. Please refresh the page."
    >
      <Controls
        onColorChange={handleColorChange}
        onModelChange={handleModelChange}
        {selectedModel}
      />
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

  .accordion {
    border: 1px solid #ddd;
    padding: 0.5rem;
    border-radius: 4px;
  }

  .accordion summary:hover {
    color: #666;
  }
</style>
