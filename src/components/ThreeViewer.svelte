<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
  import { MODEL_CONFIGS, DEFAULT_MODEL } from '../config/models';

  export let imageData: Uint8Array | undefined;
  export let selectedColor = '#000000';
  export let selectedModel = DEFAULT_MODEL;
  export let onScreenshotCapture: (data: Uint8Array) => void;

  let container: HTMLDivElement;
  let model: THREE.Group;
  let screenMesh: THREE.Mesh;
  let caseMaterials: THREE.Material[] = [];
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let controls: OrbitControls;

  const ENV_MAP_PATH = '/meadow_2_2k.hdr';

  // Current model configuration
  let currentConfig = MODEL_CONFIGS[selectedModel];

  const MATERIAL_PRESETS = {
    shiny: {
      metalness: 1.0,
      roughness: 0.05,
      envMapIntensity: 1.5,
    },
    matte: {
      metalness: 0.2,
      roughness: 0.8,
      envMapIntensity: 0.5,
    },
    semiMatte: {
      metalness: 0.9,
      roughness: 0.2,
      envMapIntensity: 1.0,
    },
  };

  // Watch for changes in imageData
  $: if (imageData) {
    updateScreenTexture(imageData);
  }

  // Watch for changes in selectedColor
  $: if (selectedColor && caseMaterials.length > 0) {
    updateCaseColor(selectedColor);
  }

  // Watch for model changes
  let previousModel = selectedModel;
  $: if (selectedModel !== previousModel && scene) {
    /*    console.log('Model changed from', previousModel, 'to:', selectedModel); */
    previousModel = selectedModel;
    currentConfig = MODEL_CONFIGS[selectedModel];
    /*  console.log('New config:', currentConfig); */
    // Clear existing model
    if (model) {
      /*      console.log('Removing existing model'); */
      scene.remove(model);
      model = undefined;
      screenMesh = undefined;
      caseMaterials = [];
    }
    loadModel();
  }

  function updateScreenTexture(data: Uint8Array): void {
    if (!screenMesh) return;

    const blob = new Blob([data], { type: 'image/png' });
    const imageUrl = URL.createObjectURL(blob);

    const newMaterial = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1,
    });

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(imageUrl, (texture) => {
      texture.repeat.set(1, 1);
      texture.offset.set(0, 0);
      texture.rotation = 0;
      texture.center.set(0.5, 0.5);
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.colorSpace = THREE.SRGBColorSpace;

      newMaterial.map = texture;
      newMaterial.needsUpdate = true;
      screenMesh.material = newMaterial;

      URL.revokeObjectURL(imageUrl);
    });
  }

  function updateCaseColor(color: string): void {
    caseMaterials.forEach((material) => {
      if (material instanceof THREE.MeshStandardMaterial) {
        material.color.setStyle(color);
        material.needsUpdate = true;
      }
    });
  }

  function loadModel(): void {
    /*   console.log('Loading model with config:', currentConfig);
    console.log('Model path:', currentConfig?.modelPath); */

    const loader = new GLTFLoader();
    loader.load(
      currentConfig.modelPath,
      (gltf) => {
        /*  console.log('Model loaded successfully:', gltf); */
        model = gltf.scene;
        scene.add(model);

        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.name === currentConfig.screenMeshName) {
              screenMesh = child;
              const material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
              });
              screenMesh.material = material;
            } else {
              // Check if this mesh should be matte
              const isMatteMesh =
                currentConfig.defaultMatte ||
                currentConfig.matteMeshNames.includes(child.name);

              const materialPreset = currentConfig.defaultMatte
                ? MATERIAL_PRESETS.semiMatte
                : isMatteMesh
                  ? MATERIAL_PRESETS.matte
                  : MATERIAL_PRESETS.shiny;

              if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.metalness = materialPreset.metalness;
                child.material.roughness = materialPreset.roughness;
                child.material.envMapIntensity = materialPreset.envMapIntensity;

                // Only add to caseMaterials if it's a case material
                if (
                  currentConfig.caseMaterialNames.includes(child.material.name)
                ) {
                  caseMaterials.push(child.material);
                }
              }
            }
          }
        });

        // Set initial color
        updateCaseColor(selectedColor);

        // Center and scale model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1 / maxDim;
        model.scale.multiplyScalar(scale);

        // Set initial rotation (90 degrees around Y axis)
        model.position.set(
          currentConfig.initialPosition.x,
          currentConfig.initialPosition.y,
          currentConfig.initialPosition.z
        );
        model.rotation.set(
          currentConfig.initialRotation.x,
          currentConfig.initialRotation.y,
          currentConfig.initialRotation.z
        );

        // If we have image data, update the texture
        if (imageData) {
          updateScreenTexture(imageData);
        }
      },
      (progress) => {
        /*   console.log(
          'Loading progress:',
          (progress.loaded / progress.total) * 100 + '%'
        ); */
      },
      (error) => {
        console.error('Error loading GLB model:', error);
      }
    );
  }

  // Add screenshot capture handler
  function handleScreenshotRequest(): void {
    if (!scene || !camera) {
      /*   console.log('Scene or camera not ready'); */
      return;
    }

    try {
      // Store original settings
      const originalSize = {
        width: 350, // Force original size to be 350x350
        height: 350,
      };

      // Set high-res render settings
      renderer.setSize(2000, 2000);
      renderer.setPixelRatio(2);
      scene.background = null;

      // Render high-res version
      renderer.render(scene, camera);

      // Get the canvas data
      const imageData = renderer.domElement.toDataURL('image/png');

      // Convert base64 to Uint8Array
      const binaryString = atob(imageData.split(',')[1]);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Restore to exactly 350x350
      renderer.setSize(350, 350);
      renderer.setPixelRatio(window.devicePixelRatio);
      scene.background = null;

      // Force a re-render with original settings
      renderer.render(scene, camera);

      // Send the data back through the callback
      onScreenshotCapture(bytes);
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    }
  }

  onMount(() => {
    let animationFrameId: number;

    // Scene setup
    scene = new THREE.Scene();
    // Remove or comment out this line to make background transparent
    // scene.background = new THREE.Color(0xffffff);

    // Add axes helper
    /*    const axesHelper = new THREE.AxesHelper(0.5); // Size of 0.5 units
    scene.add(axesHelper); */

    // Camera setup
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 2);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(350, 350);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Controls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.enableRotate = true;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    // Load environment map and initial model
    new RGBELoader().load(ENV_MAP_PATH, (texture) => {
      /*   console.log('Environment map loaded'); */
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      currentConfig = MODEL_CONFIGS[selectedModel];
      /*   console.log('Initial config:', currentConfig); */
      loadModel();
    });

    // Animation loop
    function animate(): void {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Add event listener for screenshot capture
    container.addEventListener('capture-screenshot', handleScreenshotRequest);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      container.removeEventListener(
        'capture-screenshot',
        handleScreenshotRequest
      );
    };
  });
</script>

<div class="viewer-container" bind:this={container}></div>

<style>
  .viewer-container {
    width: 350px;
    height: 350px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
  }
</style>
