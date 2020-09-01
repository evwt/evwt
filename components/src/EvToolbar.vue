<script>
import EvToolbarItemOverflow from './EvToolbarItemOverflow';

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
      default: 40
    },
    // Height of the toolbar in px
    height: {
      type: Number
    }
  },

  data() {
    return {
      hiddenItems: {}
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
    if (this.$evcontextmenu) {
      this.buildContextMenus();
    }
  },

  methods: {
    buildContextMenus() {
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

      this.$evcontextmenu.build({
        id: 'evtoolbar-overflow',
        menu: []
      });

      this.$evcontextmenu.on('input:evtoolbar-overflow', item => {
        let toolbarItem = Object.values(this.hiddenItems).find(hi => hi.id === item.id);
        toolbarItem.handleClick();
      });
    },

    rebuildOverflow() {
      let menu = [];

      for (const key of Object.keys(this.hiddenItems).sort()) {
        let item = this.hiddenItems[key];
        menu.push({
          id: item.id,
          label: item.label
        });
      }

      this.$evcontextmenu.menus['evtoolbar-overflow'] = menu;
    }
  },

  render(createElement) {
    let toolbarClass = 'ev-toolbar d-flex h-100 flex-middle p-n-xs p-s-xs p-w-xs p-e-xs overflow-hidden flex-space';

    let attrs = {
      class: toolbarClass,
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

    for (let idx = 0; idx < this.$slots.default.length; idx++) {
      const vnode = this.$slots.default[idx];

      vnode.componentOptions.listeners = {
        hide: (item) => {
          this.$set(this.hiddenItems, idx, item);
          this.rebuildOverflow();
        },
        show: (item) => {
          this.$delete(this.hiddenItems, idx);
          this.rebuildOverflow();
        },
        ...vnode.componentOptions.listeners
      };

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

    let overflowButton = createElement(EvToolbarItemOverflow, {
      props: {
        hidden: !Object.keys(this.hiddenItems).length
      },
      on: {
        click: () => this.$evcontextmenu.show('evtoolbar-overflow')
      }
    });

    let overFlowWrapperAttrs = {
      class: 'd-flex overflow-hidden'
    };

    let overflowWrapper = createElement('div', overFlowWrapperAttrs, this.$slots.default);

    return createElement('div', attrs, [overflowWrapper, overflowButton]);
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
