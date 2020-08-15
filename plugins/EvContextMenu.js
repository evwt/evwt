import { ipcRenderer } from 'electron';
import ObservableSlim from 'observable-slim';
import diff from 'deep-diff';
import log from '../lib/log';

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
  return this.findMenuItem(this.menus[menuId], itemId);
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
      this.handleInput();
    },

    methods: {
      getItem,
      on,
      build,
      show,
      get,

      handleBuild() {
        this.$on('build', async ({ id, menu }) => {
          // Send it to the background first of all so it has it stored in its collection,
          // and we'll get back a built menu with additional properties
          let builtMenu = await ipcRenderer.invoke('evcontextmenu:build', { id, menu });

          let menuItems = [];

          // Build observable menu items so we can send changes to the background
          for (const menuItem of builtMenu) {
            // We are using ObservableSlim because Vue watchers have a limitation [1]
            // where the old and new values are the same for mutations of
            // objects, so there's no way to tell which menu changed, and
            // therefore no way to know which input event to send.
            //
            // [1] See the note here https://vuejs.org/v2/api/#vm-watch
            //
            let observableMenuItem = ObservableSlim.create(menuItem, false, async (changes) => {
              for (const change of changes) {
                if (change.type === 'update') {
                  if (!change.target.id) continue;

                  let item = change.target;

                  // eslint-disable-next-line no-await-in-loop
                  await this.syncMenu(id, this.menus[id]);

                  // eslint-disable-next-line no-await-in-loop
                  await ipcRenderer.invoke('evcontextmenu:emit', { item, id });

                  this.$emit(`input:${id}`, item);
                  this.$emit(`input:${id}:${item.id}`, item);

                  //   // setRadioMenus(newMenu);
                } else {
                  log.debug(change);
                }
              }
            });

            menuItems.push(observableMenuItem);
          }

          // Add to our collection of all context menus
          // so that we can refer to them when e.g. the
          // user calls .get(id)
          this.$set(this.menus, id, menuItems);

          // Watch for changes and send IPC events to background,
          // so that everything stays in sync. This will watch for additions,
          // the ObservableSlim stuff above watches for changes to items
          this.$watch(() => this.menus[id], async (newMenu) => {
            // This prevents an infinte loop where the watcher keeps
            // calling itself from the evcontextmenu:set call
            if (this.isDirty[id]) {
              this.isDirty[id] = false;
              return;
            }

            this.isDirty[id] = true;

            log.debug(`Change! sending evcontextmenu:set ${id}`);

            // setRadioMenus(newMenu);

            this.syncMenu(id, newMenu);
          }, { deep: true });
        });
      },

      async syncMenu(id, newMenu) {
        let serializedNewMenu = JSON.parse(JSON.stringify(newMenu));
        log.trace(serializedNewMenu);

        let setMenu = await ipcRenderer.invoke('evcontextmenu:set', { id, menu: serializedNewMenu });

        // `setMenu` refers to the menu that was built in the background, and will have additional
        // properties, so we add those to the local object. This happens when dynamically adding new
        // menu items.
        let changes = diff(this.menus[id], setMenu) || [];
        for (const { kind, path, rhs } of changes) {
          if (kind === 'N') {
            log.debug('Setting new property from background onto menu item');
            this.$set(this.menus[id][path[0]], path[1], rhs);
          }
        }
      },

      handleShow() {
        this.$on('show', async id => {
          await ipcRenderer.invoke('evcontextmenu:show', id);
        });
      },

      handleInput() {
        ipcRenderer.on('evcontextmenu:ipc:input', (e, { id, item }) => {
          let menu = this.menus[id];

          if (!menu) {
            log.warn(`[EvContextMenu] Could not find menu from id ${id}`);
            return;
          }

          log.debug('Got menu', menu);

          // Get the menu item in our collection
          let menuItem = this.getItem(id, item.id);

          log.debug('Got menu item', menuItem);

          // set the item's properties from the payload
          for (let key of Object.keys(item)) {
            log.debug(`setting ${key} to ${item[key]}`);
            this.$set(menuItem, key, item[key]);
          }

          // if (menuItem.type === 'radio') {
          //   menuItem.lastChecked = true;
          // }

          this.$emit(`input:${id}`, item);
          this.$emit(`input:${id}:${item.id}`, item);
        });
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
      }
    }
  });

  Vue.prototype.$evcontextmenu = menuVm;
};

export default EvContextMenu;
