<script lang="ts">
  export let size: 'small' | 'medium' | 'large' = 'medium';

  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  $: sizeClass = sizes[size];
</script>

<div class="spinner {sizeClass}" role="status">
  <span class="sr-only">Loading...</span>
</div>

<style>
  .spinner {
    border: 2px solid var(--surface-color);
    border-top: 2px solid var(--text-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
