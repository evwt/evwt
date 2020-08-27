import Store from 'electron-store';
import { BrowserWindow } from 'electron';

function create(options) {
  let store = new Store({
    name: 'evwt-store',
    ...options
  });

  store.onDidAnyChange((newStore) => {
    for (let browserWindow of BrowserWindow.getAllWindows()) {
      browserWindow.webContents.send('evstore:ipc:user:changed', newStore);
    }
  });

  return store;
}

export default {
  create
};
