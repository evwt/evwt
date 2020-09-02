const EvMenu = {};

/**
 * Get menu by id
 *
 * @param {String} id
 * @returns {MenuItem}
 */
function get(id) {
  return this.findMenuItem(this.menu, id);
}

/**
 * Listen to events on the menu
 *
 * @param {String} eventName - Event name e.g. `evmenu:my-menu:item-1`
 * @param {Function} callback - (menuItem) => {}
 */
function on(event, cb) {
  this.$on(event, cb);
}

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
        handler(newMenu) {
          electron.ipcRenderer.invoke('evmenu:ipc:set', newMenu);
          this.menu = Vue.observable(newMenu);
        }
      }
    },

    async created() {
      await electron.ipcRenderer.invoke('evmenu:ipc:set', this.menu, true);

      this.handleClick();
      this.handleFocus();
      this.listenIpc();
    },

    methods: {
      get,
      on,

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
        window.addEventListener('focus', async () => {
          let newMenu = await electron.ipcRenderer.invoke('evmenu:ipc:set', this.menu, true);
          this.menu = Vue.observable(newMenu);
        });
      },

      handleClick() {
        this.$on('click', command => {
          let menuItem = this.get(command);

          this.$emit(`input:${command}`, menuItem);
          this.$emit('input', menuItem);
          electron.ipcRenderer.send('evmenu:ipc:click', menuItem);
        });
      },

      listenIpc() {
        electron.ipcRenderer.on('evmenu:ipc:input', (event, payload) => {
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

export default EvMenu;
