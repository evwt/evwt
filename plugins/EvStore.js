const EvStore = {};

EvStore.install = function (Vue) {
  setupUserStore(Vue);
  setupUiStore(Vue);
};

function setupUserStore(Vue) {
  let initialStore = electron.ipcRenderer.sendSync('evstore:ipc:user:read');

  let storeVm = new Vue({
    data() {
      return {
        store: initialStore,
        storeProxy: null,
        isProxyClean: false
      };
    },

    watch: {
      storeProxy: {
        handler() {
          if (this.isProxyClean) {
            this.isProxyClean = false;
            return;
          }

          electron.ipcRenderer.sendSync('evstore:ipc:user:write', { ...this.storeProxy });
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
        electron.ipcRenderer.on('evstore:ipc:user:changed', (e, store) => {
          this.isProxyClean = true;
          this.store = store;
          this.storeProxy = new Proxy(this.store, {});
        });
      }
    }
  });

  Vue.prototype.$evstore = storeVm;
}

function setupUiStore(Vue) {
  let initialStore = electron.ipcRenderer.sendSync('evstore:ipc:ui:read');

  let storeVm = new Vue({
    data() {
      return {
        store: initialStore,
        storeProxy: null,
        isProxyClean: false
      };
    },

    watch: {
      storeProxy: {
        handler() {
          if (this.isProxyClean) {
            this.isProxyClean = false;
            return;
          }

          electron.ipcRenderer.sendSync('evstore:ipc:ui:write', { ...this.storeProxy });
        },
        deep: true
      }
    },

    created() {
      this.storeProxy = new Proxy(this.store, {});
      this.watchRemote();
    },

    methods: {
      watchRemote() {
        electron.ipcRenderer.on('evstore:ipc:ui:changed', (e, store) => {
          this.isProxyClean = true;
          this.store = store;
          this.storeProxy = new Proxy(this.store, {});
        });
      }
    }
  });

  Vue.prototype.$evstore.$ui = storeVm;
}

export default EvStore;
