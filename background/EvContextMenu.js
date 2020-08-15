import {
  Menu, ipcMain, app, BrowserWindow
} from 'electron';
import log from '../lib/log';

function payloadFromMenuItem(menuItem) {
  let payload = {};

  for (let key of Object.keys(menuItem)) {
    if (['string', 'number', 'boolean'].includes(typeof menuItem[key])) {
      payload[key] = menuItem[key];
    }
  }

  return payload;
}

function addClickToItems(menuToAttach, id) {
  for (let idx = 0; idx < menuToAttach.length; idx++) {
    if (!menuToAttach[idx]) return;
    menuToAttach[idx].click = (menuItem, focusedWindow) => handleNativeClick(menuItem, focusedWindow, id);
    if (menuToAttach[idx].submenu) {
      addClickToItems(menuToAttach[idx].submenu);
    }
  }
}

function handleNativeClick(menuItem, focusedWindow, id) {
  if (!id) {
    log.debug('[EvContextMenu] No context menu id, not sending events.');
    return;
  }

  if (!menuItem.id) {
    log.debug(`[EvContextMenu] Menu item "${menuItem.label}" has no ID, not sending events.`);
    return;
  }

  let payload = payloadFromMenuItem(menuItem);

  app.emit('evcontextmenu', { item: payload, id });
  app.emit(`evcontextmenu:${id}:${payload.id}`, { item: payload, id });

  if (focusedWindow) {
    focusedWindow.emit('evcontextmenu', { item: payload, id });
    focusedWindow.emit(`evcontextmenu:${id}:${payload.id}`, { item: payload, id });

    if (focusedWindow.webContents) {
      focusedWindow.webContents.send('evcontextmenu:ipc:input', { item: payload, id });
    }
  }
}

function buildMenuTemplate(definition, id) {
  addClickToItems(definition, id);
  return definition;
}

function decorateMenuItem(menuItem, builtMenu) {
  // This removes the click handler which can't be serialized for IPC
  delete menuItem.click;

  if (menuItem.id) {
    let builtMenuItem = findBuiltMenuItem(builtMenu.items, menuItem.id);

    // This adds properties from the built menu onto the menu definition
    for (let key of Object.keys(builtMenuItem)) {
      if (['string', 'number', 'boolean'].includes(typeof builtMenuItem[key])) {
        menuItem[key] = builtMenuItem[key];
      }
    }
  }

  if (menuItem.submenu) {
    for (let item of menuItem.submenu) {
      decorateMenuItem(item, builtMenu);
    }
  }
}

function findBuiltMenuItem(items, id) {
  if (!items) { return; }

  for (let item of items) {
    if (item.id === id) return item;

    if (item.submenu && item.submenu.items) {
      let child = findBuiltMenuItem(item.submenu.items, id);
      if (child) return child;
    }
  }
}

let menus = {};

/**
 *
 *
 */
export function activate() {
  ipcMain.handle('evcontextmenu:build', onIpcBuild);
  ipcMain.handle('evcontextmenu:set', onIpcSet);
  ipcMain.handle('evcontextmenu:show', onIpcShow);
  ipcMain.handle('evcontextmenu:emit', onIpcEmit);
}

function onIpcBuild(e, { id, menu }) {
  let builtMenu = Menu.buildFromTemplate(buildMenuTemplate(menu, id));
  menus[id] = builtMenu;

  let payload = [];

  for (let item of menu) {
    decorateMenuItem(item, builtMenu);
    payload.push(payloadFromMenuItem(item));
  }

  log.debug('Built menu - ', id);

  return payload;
}

function onIpcEmit(e, { id, item }) {
  let sender = BrowserWindow.fromWebContents(e.sender);

  app.emit('evcontextmenu', { item, id });
  app.emit(`evcontextmenu:${id}:${item.id}`, { item, id });
  sender.emit('evcontextmenu', { item, id });
  sender.emit(`evcontextmenu:${id}:${item.id}`, { item, id });
}

function onIpcSet(e, { id, menu }) {
  let sender = BrowserWindow.fromWebContents(e.sender);

  let builtMenu = Menu.buildFromTemplate(buildMenuTemplate(menu, id));
  menus[id] = builtMenu;

  let payload = [];

  for (let item of menu) {
    decorateMenuItem(item, builtMenu);
    payload.push(payloadFromMenuItem(item));
  }

  if (sender.webContents) {
    sender.webContents.send('evcontextmenu:ipc:set-done', { menu: payload, id });
  }

  log.debug('Set menu - ', id);

  return payload;
}

function onIpcShow(e, id) {
  log.debug('Got menu show request - ', id);

  if (!menus[id]) {
    log.debug('[EvContextMenu] Menu not found with that ID, not showing.');
    return;
  }

  menus[id].popup({ window: e.sender });
}

export default {
  activate
};
