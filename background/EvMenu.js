import {
  ipcMain, Menu, app, BrowserWindow
} from 'electron';

let menu = {};

/**
 *
 *
 * @param {BrowserWindow} win
 */
export function attach(win) {
  win.on('focus', () => {
    Menu.setApplicationMenu(menu);
  });
}

/**
 *
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
  if (!definition) {
    console.log('[EvMenu] No definition to build menu from');
    return;
  }

  menu = Menu.buildFromTemplate(buildMenuTemplate(definition));

  for (let item of definition) {
    decorateMenu(item, menu);
  }

  Menu.setApplicationMenu(menu);

  return definition;
}

function decorateMenu(menuItem, builtMenu) {
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
      decorateMenu(item, builtMenu);
    }
  }
}

function buildMenuTemplate(definition) {
  addClickToItems(definition);
  return definition;
}

function addClickToItems(menuToAttach) {
  for (let idx = 0; idx < menuToAttach.length; idx++) {
    if (!menuToAttach[idx]) return;
    menuToAttach[idx].click = handleNativeClick;
    if (menuToAttach[idx].submenu) {
      addClickToItems(menuToAttach[idx].submenu);
    }
  }
}

function handleNativeClick(menuItem, focusedWindow) {
  if (!menuItem.id) {
    console.log(`[EvMenu] Menu item "${menuItem.label}" has no ID, not sending events.`);
    return;
  }

  let payload = payloadFromMenuItem(menuItem);

  app.emit('evmenu', payload);
  app.emit(`evmenu:${payload.id}`, payload);

  if (focusedWindow) {
    focusedWindow.emit('evmenu', payload);
    focusedWindow.emit(`evmenu:${payload.id}`, payload);

    if (focusedWindow.webContents) {
      focusedWindow.webContents.send('evmenu:ipc:input', payload);
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

function payloadFromMenuItem(menuItem) {
  let payload = {};

  for (let key of Object.keys(menuItem)) {
    if (['string', 'number', 'boolean'].includes(typeof menuItem[key])) {
      payload[key] = menuItem[key];
    }
  }

  return payload;
}

export default {
  activate,
  attach
};
