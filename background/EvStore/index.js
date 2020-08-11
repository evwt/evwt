import { ipcMain, BrowserWindow } from 'electron';
import Store from 'electron-store';

/**
 *
 *
 * @param {Object} options - [electron-store options](https://github.com/sindresorhus/electron-store#api)
 */
function activate(options = {}) {
  console.log(Store);

  let store = new Store({
    name: 'evwt-store',
    ...options
  });

  ipcMain.on('evstore:ipc:store', (event) => {
    event.returnValue = store.store;
  });

  ipcMain.on('evstore:ipc:write', (event, newStore) => {
    store.set(newStore);
    event.returnValue = store.store;
  });

  store.onDidAnyChange((newStore) => {
    for (let browserWindow of BrowserWindow.getAllWindows()) {
      browserWindow.webContents.send('evstore:ipc:changed', newStore);
    }
  });

  return store;
}

export default {
  activate
}