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
  },
  laptop: {
    name: 'Laptop',
    modelPath: '/macbook_mockup.glb',
    screenMeshName: 'Object_21',
    caseMaterialNames: ['Material.017'],
    matteMeshNames: ['Object_4', 'Object_18'],
    defaultScreenshot: '/my_screenshot.jpg',
    defaultMatte: true,
    initialPosition: { x: 0, y: -0.25, z: 0 },
    initialRotation: { x: 0, y: 0, z: 0 },
  },
};
