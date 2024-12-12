import type { ModelConfig } from '../types';

export const DEFAULT_MODEL = 'Laptop' as const;

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  iphone: {
    name: 'iPhone',
    modelPath: '/iphone_mockup.glb',
    screenMeshName: 'Object_13',
    caseMaterialNames: ['Back.001', 'GOLD.001'],
    matteMeshNames: ['Object_6'],
    defaultScreenshot: '/my_screenshot.jpg',
    defaultMatte: false,
    initialPosition: { x: 0, y: 0, z: 0 },
    initialRotation: { x: 0, y: -Math.PI / 2, z: 0 },
    attribution: {
      author: 'SDC PERFORMANCE™️',
      authorUrl: 'https://sketchfab.com/Lambo_SC04',
      modelUrl:
        'https://sketchfab.com/3d-models/free-iphone-13-pro-2021-a35156d91cf44e70a2fdfeade54ae0b2',
      license: 'CC 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    },
    recommendedResolution: {
      width: 2532,
      height: 1170,
    },
  },
  laptop: {
    name: 'Laptop',
    modelPath: '/macbook_mockup.glb',
    screenMeshName: 'Object_21',
    caseMaterialNames: ['Material.003'],
    matteMeshNames: ['Object_4', 'Object_18'],
    defaultScreenshot: '/my_screenshot.jpg',
    defaultMatte: true,
    initialPosition: { x: 0, y: -0.25, z: 0 },
    initialRotation: { x: 0, y: 0, z: 0 },
    attribution: {
      author: 'jc1245',
      authorUrl: 'https://sketchfab.com/jasperchui2007',
      modelUrl:
        'https://sketchfab.com/3d-models/apple-macbook-pro-16-inch-2021-6a42b31bac064b00a91fbfebec07c852',
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    },
    recommendedResolution: {
      width: 3456,
      height: 2234,
    },
  },
};
