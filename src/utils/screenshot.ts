import * as THREE from 'three';

export function captureScreenshot(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  width = 2000,
  height = 2000
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    try {
      // Create high-res renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(2);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.5;
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      // Important: Set background to null for transparency
      const originalBackground = scene.background;
      scene.background = null;

      // Render scene
      renderer.render(scene, camera);

      // Get the canvas data
      const canvas = renderer.domElement;
      const imageData = canvas.toDataURL('image/png');

      // Convert base64 to Uint8Array
      const binaryString = atob(imageData.split(',')[1]);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Restore original background
      scene.background = originalBackground;

      // Cleanup
      renderer.dispose();

      resolve(bytes);
    } catch (error) {
      reject(error);
    }
  });
}
