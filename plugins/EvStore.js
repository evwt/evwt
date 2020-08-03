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
  let storeVm = new Vue({

    data() {
      return {
        store: {},
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

    async created() {
      this.store = await ipcRenderer.invoke('evstore:ipc:store');

      this.watchStore();
    },

    methods: {
      watchStore() {
        // Send local changes to remote
        this.$watch(() => this.store, async (newStore) => {
          if (this.isClean) {
            this.isClean = false;
            return;
          }

          await ipcRenderer.invoke('evstore:ipc:write', newStore);
        },
        {
          deep: true
        });

        // Watch remote and update local
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

function activate(store) {
  ipcMain.handle('evstore:ipc:store', () => store.store);

  ipcMain.handle('evstore:ipc:write', (e, newStore) => {
    store.store = newStore;
  });

  store.onDidAnyChange((newStore) => {
    for (let browserWindow of BrowserWindow.getAllWindows()) {
      browserWindow.webContents.send('evstore:ipc:changed', newStore);
    }
  });
}

export default EvStore;
