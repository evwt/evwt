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

  ipcRenderer.on('evmenu:ipc:input', (event, message) => {
    let menuItem = findDeep(menu, (_, __, item) => {
      if (item.id === message.id) return true;
    });

    menuItem.parent.checked = message.item.checked;
  });

  let menuVm = new Vue({
    data() {
      return {
        menu
      };
    },

    created() {
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
        ipcRenderer.on('evmenu:ipc:input', (event, message) => {
          this.$emit('input', message);

          this.$emit(`input:${message.id}`, {
            event: message.event,
            item: message.item
          });
        });
      }
    }
  });

  Vue.prototype.$menu = menuVm;
};

//
// This is the Electron/main portion of EvMenu
//

function activate(win) {
  let menu;

  win.on('focus', () => {
    Menu.setApplicationMenu(menu);
  });

  ipcMain.on('evmenu:ipc:set', (e, definition) => {
    menu = Menu.buildFromTemplate(buildMenuTemplate(definition));
    Menu.setApplicationMenu(menu);
  });
}

function handleClick(menuItem, focusedWindow, event) {
  if (!menuItem.id) {
    console.warn(`[EvMenu] Menu item "${menuItem.label}" has no ID, not sending event.`);
    return;
  }

  let item = {
    accelerator: menuItem.accelerator,
    label: menuItem.label,
    type: menuItem.type,
    sublabel: menuItem.sublabel,
    toolTip: menuItem.toolTip,
    enabled: menuItem.enabled,
    visible: menuItem.visible,
    checked: menuItem.checked,
    acceleratorWorksWhenHidden: menuItem.acceleratorWorksWhenHidden,
    registerAccelerator: menuItem.registerAccelerator,
    commandId: menuItem.commandId
  };

  app.emit('evmenu:app:input', {
    id: menuItem.id,
    event,
    item
  });

  app.emit(`evmenu:app:input:${menuItem.id}`, item);

  if (focusedWindow) {
    focusedWindow.emit('evmenu:win:input', {
      id: menuItem.id,
      event,
      item
    });

    focusedWindow.emit(`evmenu:win:input:${menuItem.id}`, item);

    if (focusedWindow.webContents) {
      focusedWindow.webContents.send('evmenu:ipc:input', {
        id: menuItem.id,
        event,
        item
      });
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
