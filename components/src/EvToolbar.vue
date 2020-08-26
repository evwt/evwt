<script>
export default {
  props: {
    // Whether to display icons for items by default
    iconShow: {
      type: Boolean,
      default: true
    },
    // Default size of the icons in px
    iconSize: {
      type: Number,
      default: 16
    },
    // Default position of icon in relation to the label
    iconPos: {
      // `'above'`/`'aside'`
      type: String,
      default: 'above'
    },
    // Whether to display labels for items by default
    labelShow: {
      type: Boolean,
      default: false
    },
    // Default font size of the labels in px
    fontSize: {
      type: Number,
      default: 11
    },
    // Default padding within the items in px
    padding: {
      type: Number,
      default: 3
    },
    // Default minimum width of items
    minWidth: {
      type: Number,
      default: 44
    },
    // Height of the toolbar in px
    height: {
      type: Number
    }
  },

  computed: {
    toolbarStyle() {
      if (this.height) {
        return `height: ${this.height}px`;
      }

      return '';
    }
  },

  render(createElement) {
    let attrs = {
      class: 'ev-toolbar d-flex h-100 flex-middle p-n-xs p-s-xs p-w-xs p-e-xs',
      style: this.toolbarStyle
    };

    if (!this.$slots.default) {
      return createElement('div', attrs);
    }

    for (const vnode of this.$slots.default) {
      vnode.componentOptions.propsData = {
        labelShow: this.labelShow,
        iconPos: this.iconPos,
        iconSize: this.iconSize,
        fontSize: this.fontSize,
        minWidth: this.minWidth,
        padding: this.padding,
        iconShow: this.iconShow,
        ...vnode.componentOptions.propsData
      };
    }

    return createElement('div', attrs, this.$slots.default);
  }
};
</script>

<style lang="scss" scoped>
@import '../../style/reset.scss';
@import '../../style/utilities.scss';

.ev-toolbar {
  user-select: none;
}
</style>
