import {
  ipcRenderer, ipcMain, Menu, app, BrowserWindow
} from 'electron';

const EvMenu = {
  activate,
  attach
};

//
// This is the Vue/renderer portion of EvMenu
//

EvMenu.install = function (Vue, menuDefinition) {
  let menuVm = new Vue({
    data() {
      return {
        menu: Vue.observable(menuDefinition)
      };
    },

    watch: {
      menu: {
        deep: true,
        immediate: true,
        handler(newMenu) {
          ipcRenderer.invoke('evmenu:ipc:set', newMenu);
        }
      }
    },

    async created() {
      // evmenu:ipc:set will return a built menu with all the details,
      // as opposed to just the definition
      this.menu = await ipcRenderer.invoke('evmenu:ipc:set', menuDefinition);

      this.handleClick();
      this.handleFocus();
      this.listenIpc();

      this.$emit('ready');
    },

    methods: {
      get(id) {
        return this.findMenuItem(this.menu, id);
      },

      findMenuItem(items, id) {
        if (!items) { return; }

        for (let item of items) {
          if (item.id === id) return item;

          if (item.submenu) {
            let child = this.findMenuItem(item.submenu, id);
            if (child) return child;
          }
        }
      },

      handleFocus() {
        window.addEventListener('focus', () => {
          ipcRenderer.invoke('evmenu:ipc:set', this.menu);
        });
      },

      handleClick() {
        this.$on('click', command => {
          let menuItem = this.get(command);

          this.$emit(`input:${command}`, menuItem);
          this.$emit('input', menuItem);
          ipcRenderer.send('evmenu:ipc:click', menuItem);
        });
      },

      listenIpc() {
        ipcRenderer.on('evmenu:ipc:input', (event, payload) => {
          let menuItem = this.get(payload.id);

          for (let key of Object.keys(payload)) {
            menuItem[key] = payload[key];
          }

          this.$emit('input', payload);
          this.$emit(`input:${payload.id}`, payload);
        });
      }
    }
  });

  Vue.prototype.$evmenu = menuVm;
};

//
// This is the Electron/main portion of EvMenu
//

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

function onIpcClick(e, payload) {
  let sender = BrowserWindow.fromWebContents(e.sender);

  app.emit('evmenu', payload);
  app.emit(`evmenu:${payload.id}`, payload);
  sender.emit('evmenu', payload);
  sender.emit(`evmenu:${payload.id}`, payload);
}

function attach(win) {
  ipcMain.on('evmenu:ipc:click', onIpcClick);

  win.on('focus', () => {
    Menu.setApplicationMenu(EvMenu.menu);
  });
}

function activate() {
  ipcMain.handle('evmenu:ipc:set', (e, definition) => {
    if (!definition) {
      console.log('[EvMenu] No definition to build menu from');
      return;
    }

    EvMenu.menu = Menu.buildFromTemplate(buildMenuTemplate(definition));

    for (let item of definition) {
      decorateMenu(item, EvMenu.menu);
    }

    Menu.setApplicationMenu(EvMenu.menu);

    return definition;
  });
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

function addClickToItems(menu) {
  for (let idx = 0; idx < menu.length; idx++) {
    menu[idx].click = handleNativeClick;
    if (menu[idx].submenu) {
      addClickToItems(menu[idx].submenu);
    }
  }
}

function buildMenuTemplate(definition) {
  addClickToItems(definition);
  return definition;
}

export default EvMenu;
