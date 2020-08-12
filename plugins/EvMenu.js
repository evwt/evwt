import { ipcRenderer } from 'electron';

const EvMenu = {};

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

export default EvMenu;
