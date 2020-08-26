import {
  ipcMain, Menu, app, BrowserWindow
} from 'electron';
import { cloneDeep } from 'lodash';
import log from '../lib/log';
import { findMenuFromItem, serializableProperties } from '../lib/menus';
import EvWindow from './EvWindow';
import { uiState } from './EvStore';

let menu = {};

const MENU_STORE_PREFIX = 'evmenu.state';

/**
 * Start using EvMenu with this BrowserWindow
 *
 * @param {BrowserWindow} win
 */
export function attach(win) {
  win.on('focus', () => {
    try {
      if (menu && Object.keys(menu).length) {
        Menu.setApplicationMenu(menu);
      }
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

function onIpcSet(e, definition, initialSet) {
  console.log(definition, initialSet);

  if (!definition || !definition.length) return;

  if (initialSet) {
    loadUiState(e.sender, definition);
  }

  storeUiState(e.sender, definition);

  menu = Menu.buildFromTemplate(addClickToItems(cloneDeep(definition)));

  try {
    if (menu && Object.keys(menu).length) {
      Menu.setApplicationMenu(menu);
    }
  } catch (error) {
    log.error('[EvMenu] Error: Invalid menu passed to attach.');
  }

  return definition;
}

function storeUiState(webContents, definition) {
  let sender = BrowserWindow.fromWebContents(webContents);
  let evWindow = EvWindow.fromBrowserWindow(sender);
  let key = `${MENU_STORE_PREFIX}.${evWindow.sanitizedRestoreId}`;

  uiState.set(key, buildUiState(definition));
}

function loadUiState(webContents, definition) {
  let browserWindow = BrowserWindow.fromWebContents(webContents);
  let evWindow = EvWindow.fromBrowserWindow(browserWindow);
  let key = `${MENU_STORE_PREFIX}.${evWindow.sanitizedRestoreId}`;
  let menuState = uiState.get(key);

  definition = applyUiState(definition, menuState);

  return definition;
}

/**
 * Build a key/value object of menu items' state (currently just the `checked` property).
 *
 * Later, we'll use this to restore the state of these menu items on launch.
 *
 * @param {*} defintion
 */
function buildUiState(definition, state = {}) {
  for (let idx = 0; idx < definition.length; idx++) {
    let item = definition[idx];
    if (!item) continue;

    if (item.type === 'checkbox' || item.type === 'radio') {
      state[item.id] = {
        checked: !!item.checked
      };
    }

    if (item.submenu) {
      buildUiState(item.submenu, state);
    }
  }

  return state;
}

/**
 * Apply stored state to the menu definition
 *
 * @param {*} definition
 * @param {*} [state={}]
 * @returns
 */

function applyUiState(definition, state = {}) {
  for (let idx = 0; idx < definition.length; idx++) {
    let item = definition[idx];
    if (!item) continue;

    if (state[item.id]) {
      item.checked = state[item.id].checked;
    }

    if (item.submenu) {
      applyUiState(item.submenu, state);
    }
  }

  return definition;
}

function addClickToItems(definition) {
  for (let idx = 0; idx < definition.length; idx++) {
    if (!definition[idx]) return;

    definition[idx].click = emitPayloadsForMenuItem;

    if (definition[idx].submenu) {
      addClickToItems(definition[idx].submenu);
    }
  }

  return definition;
}

function emitPayloadsForMenuItem(menuItem, browserWindow) {
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
    emitPayload(payload, browserWindow);
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
