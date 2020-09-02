import { ipcMain, BrowserWindow } from 'electron';
import EvWindow from './EvWindow';
import { store as uiStore } from './lib/uiStore';
import userStore from './lib/userStore';

/**
 * Activates EVStore stores (User and UI) & listeners to sync them with frontend
 *
 * @param {Object} options - [electron-store options](https://github.com/sindresorhus/electron-store#api)
 * @returns {Object} electron-store instance
 */
function activate(options = {}) {
  activateUiStore();
  activateUserStore(options);
}

function activateUiStore() {
  uiStore.onDidAnyChange((newStore) => {
    for (let browserWindow of BrowserWindow.getAllWindows()) {
      let evWindow = EvWindow.fromBrowserWindow(browserWindow);
      if (!evWindow) return;
      browserWindow.webContents.send('evstore:ipc:ui:changed', newStore[evWindow.restoreId]);
    }
  });

  ipcMain.on('evstore:ipc:ui:read', (event) => {
    let browserWindow = BrowserWindow.fromWebContents(event.sender);
    let evWindow = EvWindow.fromBrowserWindow(browserWindow);

    if (!evWindow) return;

    if (!uiStore.get(evWindow.restoreId)) {
      uiStore.set(evWindow.restoreId, {});
    }

    event.returnValue = uiStore.get(evWindow.restoreId);
  });

  ipcMain.on('evstore:ipc:ui:write', (event, newState) => {
    let browserWindow = BrowserWindow.fromWebContents(event.sender);
    let evWindow = EvWindow.fromBrowserWindow(browserWindow);
    if (!evWindow) return;

    uiStore.set(evWindow.restoreId, newState);

    event.returnValue = uiStore.get(evWindow.restoreId);
  });
}

function activateUserStore(options) {
  let store = userStore.create(options);

  ipcMain.on('evstore:ipc:user:read', (event) => {
    event.returnValue = store.store;
  });

  ipcMain.on('evstore:ipc:user:write', (event, newStore) => {
    store.set(newStore);
    event.returnValue = store.store;
  });

  return store;
}

export default {
  activate,
  uiState: uiStore
};
