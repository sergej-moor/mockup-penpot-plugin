<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

  export let imageData: Uint8Array | undefined;
  export let selectedColor = '#000000';
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
  const MODEL_PATH = '/iphone_mockup.glb';

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
  };

  // Watch for changes in imageData
  $: if (imageData) {
    updateScreenTexture(imageData);
  }

  // Watch for changes in selectedColor
  $: if (selectedColor && caseMaterials.length > 0) {
    updateCaseColor(selectedColor);
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
    const loader = new GLTFLoader();
    loader.load(
      MODEL_PATH,
      (gltf) => {
        model = gltf.scene;
        scene.add(model);

        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.name === 'Object_13') {
              screenMesh = child;
              const material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
              });
              screenMesh.material = material;
            } else {
              const materialPreset =
                child.name === 'Object_6'
                  ? MATERIAL_PRESETS.matte
                  : MATERIAL_PRESETS.shiny;

              if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.metalness = materialPreset.metalness;
                child.material.roughness = materialPreset.roughness;
                child.material.envMapIntensity = materialPreset.envMapIntensity;
                caseMaterials.push(child.material);
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
      },
      undefined,
      (error) => {
        console.error('Error loading GLB model:', error);
      }
    );
  }

  onMount(() => {
    let animationFrameId: number;

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Camera setup
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 2);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(300, 300);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
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

    // Load environment map
    new RGBELoader().load(ENV_MAP_PATH, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      loadModel();
    });

    // Animation loop
    function animate(): void {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
    };
  });
</script>

<div class="viewer-container" bind:this={container}></div>

<style>
  .viewer-container {
    width: 300px;
    height: 300px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
  }
</style>
