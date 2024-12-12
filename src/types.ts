import type { Fill } from '@penpot/plugin-types';

// Data Types
export interface ImageData {
  data: Uint8Array;
  width: number;
  height: number;
}

// Plugin Configuration Types
export interface PixelatedShapeConfig {
  width: number;
  height: number;
  imageFill: Fill & { type: 'image' };
}

export interface NewLayerConfig {
  imageData: Uint8Array;
  width: number;
  height: number;
  originalFill: Fill;
}

// State Types
export interface SelectionState {
  id: string;
  name: string;
  fills: Fill[] | 'mixed';
  isLoading: boolean;
  isPixelizing: boolean;
  isUploadingFill: boolean;
  isPreviewLoading: boolean;
  pixelSize: number;
  error?: string;
  originalImage?: {
    data: number[];
    width: number;
    height: number;
  };
  exportedImage?: {
    data: number[];
    width: number;
    height: number;
  };
  previewImage?: {
    data: number[];
    width: number;
    height: number;
  };
}

// Message Types
export type PluginMessage =
  | { type: 'theme'; content: string }
  | { type: 'selection'; content: SelectionState | null }
  | { type: 'selection-loading'; isLoading: boolean }
  | {
      type: 'selection-loaded';
      imageData: ArrayBuffer;
      width: number;
      height: number;
      selectionId: string;
    }
  | { type: 'capture-screenshot' }
  | {
      type: 'upload-screenshot';
      imageData: number[];
    }
  | { type: 'export-error'; error: string }
  | {
      type: 'update-image-fill';
      imageData: Uint8Array;
      addNewLayer: boolean;
      originalFill: Fill;
      shouldDeleteFirst: boolean;
    }
  | { type: 'fill-upload-complete' }
  | { type: 'delete-top-layer' };

export interface ModelConfig {
  name: string;
  modelPath: string;
  screenMeshName: string;
  caseMaterialNames: string[];
  matteMeshNames: string[];
  defaultScreenshot: string;
  defaultMatte: boolean;
  initialPosition: { x: number; y: number; z: number };
  initialRotation: { x: number; y: number; z: number };
}
