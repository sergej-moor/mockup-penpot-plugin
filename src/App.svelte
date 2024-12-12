<script lang="ts">
  import Controls from './components/Controls.svelte';
  import ThreeViewer from './components/ThreeViewer.svelte';
  import StatusDisplay from './components/StatusDisplay.svelte';
  import { theme } from './stores/theme';
  import { selection } from './stores/selection';
  import { MessageHandler } from './services/messageHandler';
  import ErrorBoundary from './components/ErrorBoundary.svelte';
  import { MODEL_CONFIGS } from './config/models';

  let selectedColor = '#000000';
  let selectedModel = 'iphone';

  $: currentModel = MODEL_CONFIGS[selectedModel];

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
      fallback="Unable to load preview. Please reload the plugin. "
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
        <div class="text-xs max-w-[350px]">
          <details class="accordion">
            <summary class="cursor-pointer">View Attribution</summary>
            <div class="mt-2">
              Model made by {currentModel.attribution.author}
              <br />
              ({currentModel.attribution.modelUrl})
              <br />
              under {currentModel.attribution.license}
              <br />
              ({currentModel.attribution.licenseUrl})
            </div>
          </details>
          <br />
          Recommended resolution: {currentModel.recommendedResolution.width}px x{' '}
          {currentModel.recommendedResolution.height}px
        </div>
      </div>
    </ErrorBoundary>

    <ErrorBoundary
      fallback="Controls are temporarily unavailable. Please reload the plugin."
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
