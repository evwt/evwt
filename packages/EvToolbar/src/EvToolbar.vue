<script>
export default {
  props: {
    iconShow: {
      type: Boolean,
      default: true
    },
    labels: Boolean,
    minWidth: Number,
    height: Number,
    fontSize: Number,
    iconSize: Number,
    padding: Number,
    iconPos: {
      type: String,
      default: 'aside'
    }
  },

  computed: {
    toolbarStyle() {
      return `height: ${this.height}px`;
    }
  },

  created() {
    this.addActiveClasses();
  },

  methods: {
    addActiveClasses() {
      if (!this.$evmenu) return;

      this.$evmenu.$on('input', ({ id }) => {
        document.querySelector(`[data-ev-toolbar-item="${id}"]`).classList.add('ev-active');
        setTimeout(() => {
          document.querySelector(`[data-ev-toolbar-item="${id}"]`).classList.remove('ev-active');
        }, 150);
      });
    }
  },

  render(createElement) {
    for (const vnode of this.$slots.default) {
      vnode.componentOptions.propsData = {
        labels: this.labels,
        iconPos: this.iconPos,
        iconSize: this.iconSize,
        fontSize: this.fontSize,
        minWidth: this.minWidth,
        padding: this.padding,
        iconShow: this.iconShow,
        ...vnode.componentOptions.propsData
      };
    }

    let attrs = {
      class: 'ev-toolbar d-flex h-100 flex-middle p-n-xs p-s-xs p-w-xs p-e-xs',
      style: this.toolbarStyle,
      props: {
        iconPos: this.iconPos,
        iconSize: this.iconSize
      }
    };

    return createElement('div', attrs, this.$slots.default);
  }
};
</script>

<style lang="scss" scoped>
@import '@/../style/utilities.scss';

.ev-toolbar {
  user-select: none;
}
</style>
