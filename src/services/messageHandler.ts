import type { Fill } from '@penpot/plugin-types';
import type { PluginMessage } from '../types';
import { updateTheme } from '../stores/theme';
import {
  updateSelection,
  updateExportedImage,
  setUploadingFill,
  setLoading,
} from '../stores/selection';
import { selection } from '../stores/selection';
import type { SelectionState } from '../types';

export class MessageHandler {
  static handle(event: MessageEvent<PluginMessage>): void {
    try {
      const message = event.data;
      let imageArray: Uint8Array;

      switch (message.type) {
        case 'theme':
          updateTheme(message.content);
          break;

        case 'selection': {
          const selectionData = message.content && {
            id: message.content.id,
            name: message.content.name,
            fills: message.content.fills as Fill[] | 'mixed',
          };
          updateSelection(selectionData);
          break;
        }

        case 'selection-loading':
          setLoading(message.isLoading);
          break;

        case 'selection-loaded':
          imageArray = new Uint8Array(message.imageData);
          updateExportedImage(
            imageArray,
            message.width,
            message.height,
            message.selectionId
          );
          break;

        case 'fill-upload-complete':
          setUploadingFill(false);
          break;

        case 'export-error':
          console.error('Export error:', message.error);
          setLoading(false);
          selection.update((state: SelectionState) => ({
            ...state,
            error: 'Unable to export image. Please try again.',
          }));
          break;

        case 'capture-screenshot':
          if (event.source === window.parent) {
            /*  console.log(
              'MessageHandler: Received capture-screenshot from plugin'
            ); */
            const viewer = document.querySelector('.viewer-container');
            if (viewer) {
              /*  console.log('Found viewer, dispatching event'); */
              viewer.dispatchEvent(new CustomEvent('capture-screenshot'));
            } else {
              /*    console.log('Could not find viewer element'); */
            }
          } else {
            /*   console.log('Ignoring capture-screenshot from non-plugin source'); */
          }
          break;

        default:
          console.warn(`Unhandled message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Message handler error:', error);
      setLoading(false);
    }
  }
}
