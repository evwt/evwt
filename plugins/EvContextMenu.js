import { ipcRenderer } from 'electron';
import ObservableSlim from 'observable-slim';

const EvContextMenu = {};

/**
 * Build context menu from a menu definition
 *
 * @param {Object} menu
 */
function build(menu) {
  this.$emit('build', menu);
}

/**
 * Show context menu
 *
 * @param {String} id
 */
function show(id) {
  this.$emit('show', id);
}

/**
 * Get context menu
 *
 * @param {String} menuId
 */
function get(menuId) {
  return this.menus[menuId];
}

/**
 * Get context menu item
 *
 * @param {String} menuId
 * @param {String} itemId
 */
function getItem(menuId, itemId) {
  return this.findMenuItemDeep(this.menus[menuId], itemId);
}

/**
 * Listen to events on the context menu
 *
 * @param {String} eventName - Event name e.g. `evcontextmenu:my-context-menu:item-1`
 * @param {Function} callback - (menuItem) => {}
 */
function on(event, cb) {
  this.$on(event, cb);
}

EvContextMenu.install = function (Vue) {
  let menuVm = new Vue({
    data() {
      return {
        menus: {},
        isDirty: {}
      };
    },

    created() {
      this.handleBuild();
      this.handleShow();
      this.handleNativeInput();
    },

    methods: {
      getItem,
      on,
      build,
      show,
      get,

      // We are using ObservableSlim because Vue watchers have a limitation [1]
      // where the old and new values are the same for mutations of
      // objects, so there's no way to tell which menu changed, and
      // therefore no way to know which input event to send.
      //
      // [1] See the note here https://vuejs.org/v2/api/#vm-watch
      //
      createObservableMenuItem(menuItem, id) {
        return ObservableSlim.create(menuItem, false, async (changes) => {
          for (const change of changes) {
            if (change.type === 'update') {
              if (change.newValue === change.previousValue) continue;
              if (!change.target.id) continue;

              let item = change.target;

              await ipcRenderer.invoke('evcontextmenu:emit', { item, id });
              this.$emit(`input:${id}`, item);
              this.$emit(`input:${id}:${item.id}`, item);
            }
          }
        });
      },

      handleBuild() {
        this.$on('build', async ({ id, menu }) => {
          await ipcRenderer.invoke('evcontextmenu:set', { id, menu });

          // We use a proxy here to watch for new items added to the menu
          // dynamically and make them observable, just like the initial items
          let menuItems = new Proxy([], {
            set: (obj, key, value) => {
              // If we're dealing with an array index (i.e. not the length property)
              if (!Number.isNaN(parseInt(key))) {
                // Make the new menu item observable like the initial ones
                return Reflect.set(obj, key, this.createObservableMenuItem(value, id));
              }

              return Reflect.set(obj, key, value);
            }
          });

          // Build observable menu items so we can send changes to the background
          for (const menuItem of menu) {
            let observableMenuItem = this.createObservableMenuItem(menuItem, id);
            menuItems.push(observableMenuItem);
          }

          // Add to our collection of all context menus
          // so that we can refer to them when e.g. the
          // user calls .get(id)
          this.$set(this.menus, id, menuItems);

          // Watch for changes and send IPC events to background
          this.$watch(() => this.menus[id], m => this.syncMenu(m, id), { deep: true });
        });
      },

      async syncMenu(menu, id) {
        // Turns out JSON.stringify is the best way to serialize something.
        // In this case we're removing all the observer/proxy stuff from the
        // object so it can be sent over IPC
        let serializedNewMenu = JSON.parse(JSON.stringify(menu));
        await ipcRenderer.invoke('evcontextmenu:set', { id, menu: serializedNewMenu });
      },

      handleShow() {
        this.$on('show', async id => ipcRenderer.invoke('evcontextmenu:show', id));
      },

      handleNativeInput() {
        ipcRenderer.on('evcontextmenu:ipc:input', (e, { id, item }) => {
          let menu = this.menus[id];
          if (!menu) return;

          let menuItem = this.getItem(id, item.id);

          // Apply properties from the event onto our reactive data
          for (let key of Object.keys(menuItem)) {
            this.$set(menuItem, key, item[key]);
          }
        });
      },

      findMenuItemDeep(items, id) {
        if (!items) { return; }

        for (let item of items) {
          if (item.id === id) return item;

          if (item.submenu) {
            let found = this.findMenuItemDeep(item.submenu, id);
            if (found) return found;
          }
        }
      }
    }
  });

  Vue.prototype.$evcontextmenu = menuVm;
};

export default EvContextMenu;
