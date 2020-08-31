<script>
export default {
  name: 'EvToolbar',

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

  data() {
    return {
      renderKey: 0
    };
  },

  computed: {
    toolbarStyle() {
      if (this.height) {
        return `height: ${this.height}px`;
      }

      return '';
    }
  },

  created() {
    let template = [
      {
        id: 'evtoolbar-mode-icontext',
        label: 'Icon and Text',
        type: 'radio',
        checked: true
      },
      {
        id: 'evtoolbar-mode-icon',
        label: 'Icon only',
        type: 'radio',
        checked: false
      },
      {
        id: 'evtoolbar-mode-text',
        label: 'Text only',
        type: 'radio',
        checked: false
      },
      { type: 'separator' },
      {
        id: 'evtoolbar-customize',
        label: 'Customize...'
      }
    ];

    this.$evcontextmenu.build({
      id: 'evtoolbar-context',
      menu: template
    });
  },

  render(createElement) {
    let attrs = {
      class: 'ev-toolbar d-flex h-100 flex-middle p-n-xs p-s-xs p-w-xs p-e-xs',
      style: this.toolbarStyle,
      on: {
        contextmenu: () => this.$evcontextmenu.show('evtoolbar-context')
      },
      props: {
        iconShow: this.iconShow,
        labelShow: this.labelShow
      },
      // Without a changing key, things don't seem to actually re-render
      key: Math.random().toString()
    };

    if (this.$evcontextmenu.get('evtoolbar-context')) {
      let checked = this.$evcontextmenu.get('evtoolbar-context').find(m => m.checked) || {};

      if (['evtoolbar-mode-icontext', 'evtoolbar-mode-icon'].includes(checked.id)) {
        attrs.props.iconShow = true;
      } else if (['evtoolbar-mode-text'].includes(checked.id)) {
        attrs.props.iconShow = false;
      }

      if (['evtoolbar-mode-icontext', 'evtoolbar-mode-text'].includes(checked.id)) {
        attrs.props.labelShow = true;
      } else if (['evtoolbar-mode-icon'].includes(checked.id)) {
        attrs.props.labelShow = false;
      }
    }

    if (!this.$slots.default) {
      return createElement('div', attrs);
    }

    for (const vnode of this.$slots.default) {
      vnode.componentOptions.propsData = {
        iconPos: this.iconPos,
        iconSize: this.iconSize,
        fontSize: this.fontSize,
        minWidth: this.minWidth,
        padding: this.padding,
        ...vnode.componentOptions.propsData,
        labelShow: attrs.props.labelShow,
        iconShow: attrs.props.iconShow
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
