import { ipcRenderer } from 'electron';

const EvMenu = {};

// Walk the menu and find any submenus that contain only radio items
// Then apply the mutually-exclusive logic to these items
function setRadioMenus(menu) {
  for (let idx = 0; idx < menu.length; idx++) {
    let submenu = menu[idx];
    if (!submenu) return;

    if (submenu.submenu && submenu.submenu.length) {
      let isRadioMenu = submenu.submenu.every(item => item.type === 'radio');

      if (isRadioMenu) {
        for (let jdx = 0; jdx < submenu.submenu.length; jdx++) {
          if (submenu.submenu[jdx].lastChecked) {
            // This was the last checked item, set it to true
            submenu.submenu[jdx].checked = true;
            submenu.submenu[jdx].lastChecked = false;
          } else {
            // Everything else, set to false
            submenu.submenu[jdx].checked = false;
          }
        }
      }
    }

    if (submenu.submenu) {
      setRadioMenus(submenu.submenu);
    }
  }
}

/**
 * Get menu by id
 *
 * @param {String} id
 * @returns {MenuItem}
 */
function get(id) {
  return this.findMenuItem(this.menu, id);
}

EvMenu.install = function (Vue, menuDefinition) {
  let menuVm = new Vue({
    data() {
      return {
        menu: Vue.observable(menuDefinition),
        initialLoad: true,
        isDirty: false
      };
    },

    watch: {
      menu: {
        deep: true,
        handler(newMenu) {
          if (this.isDirty) {
            this.isDirty = false;
            return;
          }

          if (this.initialLoad) {
            this.initialLoad = false;
          } else {
            this.isDirty = true;

            setRadioMenus(newMenu);
          }

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
    },

    methods: {
      get,

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

          if (menuItem.type === 'radio') {
            menuItem.lastChecked = true;
          }

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

          if (menuItem.type === 'radio') {
            menuItem.lastChecked = true;
          }

          this.$emit('input', payload);
          this.$emit(`input:${payload.id}`, payload);
        });
      }
    }
  });

  Vue.prototype.$evmenu = menuVm;
};

export default EvMenu;
