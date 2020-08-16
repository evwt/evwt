import {
  Menu, ipcMain, app, BrowserWindow
} from 'electron';
import log from '../lib/log';
import { serializableProperties, findMenuFromItem } from '../lib/menus';

let contextMenus = {};

/**
 * Activate event handlers for setting/showing menus
 *
 */
export function activate() {
  ipcMain.handle('evcontextmenu:set', onIpcSet);
  ipcMain.handle('evcontextmenu:show', onIpcShow);
  ipcMain.handle('evcontextmenu:emit', onIpcEmit);
}

function onIpcSet(e, { id, menu }) {
  if (!id || !menu) return;
  addClickToItems(menu, id);
  contextMenus[id] = Menu.buildFromTemplate(menu);
}

function onIpcShow(e, id) {
  if (!id) return;

  if (!contextMenus[id]) {
    log.debug('[EvContextMenu] Menu not found with that ID, not showing.');
    return;
  }

  contextMenus[id].popup({ window: e.sender });
}

function onIpcEmit(e, { id, item }) {
  if (!id || !item) return;

  let sender = BrowserWindow.fromWebContents(e.sender);

  app.emit('evcontextmenu', { item, id });
  app.emit(`evcontextmenu:${id}:${item.id}`, { item, id });
  sender.emit('evcontextmenu', { item, id });
  sender.emit(`evcontextmenu:${id}:${item.id}`, { item, id });
}

function addClickToItems(items, id) {
  if (!id || !items || !items.length) return;

  for (const item of items) {
    if (!item) return;
    item.click = (menuItem, focusedWindow) => handleNativeInput(menuItem, focusedWindow, id);
    if (item.submenu) {
      addClickToItems(item.submenu, id);
    }
  }
}

function handleNativeInput(menuItem, focusedWindow, id) {
  if (!id) {
    log.debug('[EvContextMenu] No context menu id, not sending events.');
    return;
  }

  if (!menuItem.id) {
    log.debug(`[EvContextMenu] Menu item "${menuItem.label}" has no ID, not sending events.`);
    return;
  }

  let ipcPayloads = [];

  // If this is a radio item, send down all the sibling items too
  if (menuItem.type === 'radio') {
    let radioMenu = findMenuFromItem(menuItem, contextMenus[id]);

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
    if (focusedWindow && focusedWindow.webContents) {
      onIpcEmit({ sender: focusedWindow }, { id, item: payload });
      focusedWindow.webContents.send('evcontextmenu:ipc:input', { item: payload, id });
    }
  }
}

export default {
  activate
};
