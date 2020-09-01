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
  addClickToItems(menu, id, e.sender);
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

function addClickToItems(items, id, webContents) {
  if (!id || !items || !items.length) return;

  for (const item of items) {
    if (!item) return;
    item.click = (menuItem, focusedWindow) => handleNativeInput(menuItem, focusedWindow, id, webContents);
    if (item.submenu) {
      addClickToItems(item.submenu, id, webContents);
    }
  }
}

function handleNativeInput(menuItem, focusedWindow, id, webContents) {
  if (!id) {
    log.debug('[EvContextMenu] No context menu id, not sending events.');
    return;
  }

  if (!menuItem.id) {
    log.debug(`[EvContextMenu] Menu item "${menuItem.label}" has no ID, not sending events.`);
    return;
  }

  let menu = findMenuFromItem(menuItem, contextMenus[id]);
  let ipcPayloads = [];

  for (let item of menu) {
    let payload = serializableProperties(item);
    ipcPayloads.push(payload);
  }

  if (webContents) {
    let payload = serializableProperties(menuItem);
    if (focusedWindow) {
      onIpcEmit({ sender: focusedWindow }, { id, item: payload });
    }
    webContents.send('evcontextmenu:ipc:menu', { menu: ipcPayloads, id });
    webContents.send('evcontextmenu:ipc:input', { item: payload, id });
  }
}

export default {
  activate
};
