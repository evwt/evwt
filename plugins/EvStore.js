import { ipcRenderer } from 'electron';

const EvStore = {
  activate
};

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

export default EvStore;
