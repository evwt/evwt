import {
  ipcRenderer, ipcMain, Menu, app
} from 'electron';
import findDeep from 'deepdash-es/findDeep';

const EvMenu = {
  activate
};

//
// This is the Vue/renderer portion of EvMenu
//

EvMenu.install = function (Vue, menu) {
  menu = Vue.observable(menu);

  ipcRenderer.send('evmenu:ipc:set', menu);

  ipcRenderer.on('evmenu:ipc:input', (event, { id, checked }) => {
    let menuItem = findDeep(menu, (_, __, item) => {
      if (item.id === id) return true;
    });

    menuItem.parent.checked = checked;
  });

  let menuVm = new Vue({
    data() {
      return {
        menu
      };
    },

    created() {
      this.$on('input', command => {
        let menuItem = findDeep(menu, (_, __, item) => {
          if (item.id === command) return true;
        });

        ipcRenderer.send('evmenu:ipc:click', {
          id: menuItem.parent.id,
          checked: menuItem.parent.checked
        });
      });

      this.watchMenu();
      this.listenIpc();
    },

    methods: {
      watchMenu() {
        this.$watch(() => menu, (newMenu) => {
          ipcRenderer.send('evmenu:ipc:set', newMenu);
        },
        {
          deep: true
        });
      },

      listenIpc() {
        ipcRenderer.on('evmenu:ipc:input', (event, payload) => {
          this.$emit('input', payload);
          this.$emit(`input:${payload.id}`, payload.checked);
        });
      }
    }
  });

  Vue.prototype.$evmenu = menuVm;
};

//
// This is the Electron/main portion of EvMenu
//

function activate(win) {
  let menu;

  ipcMain.on('evmenu:ipc:set', (e, definition) => {
    if (!definition) {
      console.warn('[EvMenu] No definition to build menu from');
      return;
    }
    menu = Menu.buildFromTemplate(buildMenuTemplate(definition));
    Menu.setApplicationMenu(menu);
  });

  win.on('focus', () => {
    if (!menu) {
      console.warn('[EvMenu] No menu to set app menu from');
      return;
    }

    Menu.setApplicationMenu(menu);
  });

  ipcMain.on('evmenu:ipc:click', (e, payload) => {
    if (e.sender !== win.webContents) return;

    win.emit('evmenu', payload);
    win.emit(`evmenu:${payload.id}`, payload.checked);
    app.emit('evmenu', payload);
    app.emit(`evmenu:${payload.id}`, payload.checked);
  });
}

function handleClick(menuItem, focusedWindow) {
  if (!menuItem.id) {
    console.warn(`[EvMenu] Menu item "${menuItem.label}" has no ID, not sending events.`);
    return;
  }

  let payload = {
    id: menuItem.id,
    checked: menuItem.checked
  };

  app.emit('evmenu', payload);
  app.emit(`evmenu:${payload.id}`, payload.checked);

  if (focusedWindow) {
    focusedWindow.emit('evmenu', payload);
    focusedWindow.emit(`evmenu:${payload.id}`, payload.checked);

    if (focusedWindow.webContents) {
      focusedWindow.webContents.send('evmenu:ipc:input', payload);
    }
  }
}

function addClickToItems(menu) {
  for (let idx = 0; idx < menu.length; idx++) {
    menu[idx].click = handleClick;
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
