import {
  ipcRenderer, ipcMain, BrowserWindow
} from 'electron';

const EvStore = {
  activate
};

//
// This is the Vue/renderer portion of EvStore
//

EvStore.install = function (Vue) {
  let initialStore = ipcRenderer.sendSync('evstore:ipc:store');

  let storeVm = new Vue({
    data() {
      return {
        store: initialStore,
        storeProxy: null,
        isClean: false
      };
    },

    computed: {
      size() {
        return ipcRenderer.invoke('evstore:ipc:size');
      },

      path() {
        return ipcRenderer.invoke('evstore:ipc:path');
      }
    },

    watch: {
      store: {
        handler(newStore) {
          if (this.isClean) {
            this.isClean = false;
            return;
          }

          ipcRenderer.sendSync('evstore:ipc:write', newStore);
        },
        deep: true
      },
      storeProxy: {
        handler() {
          ipcRenderer.sendSync('evstore:ipc:write', { ...this.storeProxy });
        },
        deep: true
      }
    },

    created() {
      // Creating and then watching this proxy notices more changes on objects, so you can do this:
      // this.$evstore.store.key = value;
      // instead of this:
      // this.$set(this.$evstore.store, key, value);
      this.storeProxy = new Proxy(this.store, {});

      this.watchRemote();
    },

    methods: {
      watchRemote() {
        ipcRenderer.on('evstore:ipc:changed', (e, store) => {
          this.isClean = true;
          this.store = store;
        });
      }
    }
  });

  Vue.prototype.$evstore = storeVm;
};

//
// This is the Electron/main portion of EvStore
//

/**
 *
 *
 * @param {Object} options - [electron-store options](https://github.com/sindresorhus/electron-store#api)
 */
function activate(options = {}) {
  let Store = require('electron-store');

  let store = new Store({
    name: 'evwt-store',
    ...options
  });

  ipcMain.on('evstore:ipc:store', (event) => {
    event.returnValue = store.store;
  });

  ipcMain.on('evstore:ipc:write', (event, newStore) => {
    store.set(newStore);
    event.returnValue = store.store;
  });

  store.onDidAnyChange((newStore) => {
    for (let browserWindow of BrowserWindow.getAllWindows()) {
      browserWindow.webContents.send('evstore:ipc:changed', newStore);
    }
  });

  return store;
}

export default EvStore;
