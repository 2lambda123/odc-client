import log from './log';
import { dialog } from 'electron';

export function handleError(error: Error) {
  log.error(error);

  dialog.showMessageBoxSync({
    type: 'error',
    buttons: ['OK'],
    defaultId: 0,
    title: 'Error',
    message: 'An error occurred',
    detail: error.message,
  });
}
