import {
  ipcMain, Menu, app, BrowserWindow
} from 'electron';
import log from '../lib/log';
import { findMenuFromItem, serializableProperties } from '../lib/menus';

let menu = {};

/**
 * Start using EvMenu with this BrowserWindow
 *
 * @param {BrowserWindow} win
 */
export function attach(win) {
  win.on('focus', () => {
    try {
      Menu.setApplicationMenu(menu);
    } catch (error) {
      log.error('[EvMenu] Invalid menu passed to attach.');
    }
  });
}

/**
 * Set up IPC event handlers
 *
 */
export function activate() {
  ipcMain.on('evmenu:ipc:click', onIpcClick);
  ipcMain.handle('evmenu:ipc:set', onIpcSet);
}

function onIpcClick(e, payload) {
  let sender = BrowserWindow.fromWebContents(e.sender);

  app.emit('evmenu', payload);
  app.emit(`evmenu:${payload.id}`, payload);
  sender.emit('evmenu', payload);
  sender.emit(`evmenu:${payload.id}`, payload);
}

function onIpcSet(e, definition) {
  if (!definition || !definition.length) return;
  addClickToItems(definition);
  menu = Menu.buildFromTemplate(definition);
  try {
    Menu.setApplicationMenu(menu);
  } catch (error) {
    log.error('[EvMenu] Error: Invalid menu passed to attach.');
  }
}

function addClickToItems(menuToAttach) {
  for (let idx = 0; idx < menuToAttach.length; idx++) {
    if (!menuToAttach[idx]) return;

    menuToAttach[idx].click = handleNativeInput;

    if (menuToAttach[idx].submenu) {
      addClickToItems(menuToAttach[idx].submenu);
    }
  }
}

function handleNativeInput(menuItem, focusedWindow) {
  if (!menuItem || !menuItem.id) {
    log.warn(`[EvMenu] Menu item "${menuItem.label}" has no ID, not sending events.`);
    return;
  }

  let ipcPayloads = [];

  // If this is a radio item, send down all the sibling items too
  if (menuItem.type === 'radio') {
    let radioMenu = findMenuFromItem(menuItem, menu);

    if (radioMenu && radioMenu.length) {
      for (let radioMenuItem of radioMenu) {
        let payload = serializableProperties(radioMenuItem);
        ipcPayloads.push(payload);
      }
    }
  } else {
    let payload = serializableProperties(menuItem);
    ipcPayloads.push(payload);
  }

  for (let payload of ipcPayloads) {
    emitPayload(payload, focusedWindow);
  }
}

function emitPayload(payload, window) {
  app.emit('evmenu', payload);
  app.emit(`evmenu:${payload.id}`, payload);

  if (window) {
    window.emit('evmenu', payload);
    window.emit(`evmenu:${payload.id}`, payload);

    if (window.webContents) {
      window.webContents.send('evmenu:ipc:input', payload);
    }
  }
}

export default {
  activate,
  attach
};
