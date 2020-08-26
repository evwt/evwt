<template>
  <div
    class="ev-toolbar-item d-flex h-100 m-e-xs"
    :title="tooltip"
    :class="itemClass"
    :style="itemStyle"
    @click="handleClick">
    <ev-icon v-if="iconShow" class="h-100" :name="icon" :style="iconStyle" />
    <label v-if="labelShow" :class="labelClass" :style="labelStyle">
      {{ label }}
    </label>
  </div>
</template>

<script>
import EvIcon from './EvIcon';

let ipc;

try {
  let { ipcRenderer } = require('electron');
  ipc = ipcRenderer;
} catch (error) {
  console.log('No electron available.');
}

export default {
  name: 'EvToolbarItem',

  components: {
    EvIcon
  },

  props: {
    // Name of EvIcon to use for the icon
    icon: String,
    // Text to show above/aside icon
    label: String,
    // Text to display when hovering over item
    tooltip: String,
    // Whether the item is disabled and cannot receive clicks
    disabled: Boolean,
    // A menu item id to trigger when the item is clicked
    menuId: String,
    // Position of icon in relation to the label
    iconPos: {
      // `'above'`/`'aside'`
      type: String,
      default: 'above'
    },
    // Font size of the label in px
    fontSize: {
      type: Number,
      default: 11
    },
    // Size of the icon in px
    iconSize: {
      type: Number,
      default: 16
    },
    // Whether to display label
    labelShow: {
      type: Boolean,
      default: false
    },
    // Whether to display an icon
    iconShow: {
      type: Boolean,
      default: true
    },
    // Minimum width of item
    minWidth: {
      type: Number,
      default: 44
    },
    // Padding within the item in px
    padding: {
      type: Number,
      default: 3
    }
  },

  computed: {
    labelStyle() {
      let style = {};

      if (this.fontSize) {
        style.fontSize = `${this.fontSize}px`;
      }

      return style;
    },

    itemStyle() {
      let style = {
        padding: `${this.padding}px`
      };

      if (this.minWidth) {
        style.minWidth = `${this.minWidth}px`;
      }

      return style;
    },

    iconStyle() {
      return `height: ${this.iconSize}px`;
    },

    labelClass() {
      if (this.iconPos === 'aside') {
        return 'p-w-xs';
      }

      if (this.iconShow) return 'p-n-xxs';

      return '';
    },

    itemClass() {
      let classes = 'flex-center flex-middle';

      if (this.iconPos === 'above') {
        classes += ' flex-vertical p-n-xs p-s-xs';
      }

      if (this.menuItem) {
        classes += ` ev-toolbar-item-${this.menuItem.id}`;

        if (this.menuItem.enabled === false) {
          classes += ' ev-disabled';
        }

        if (this.menuItem.checked === true) {
          classes += ' ev-selected';
        }
      }

      return classes;
    },

    menuItem() {
      if (!this.$evmenu) return {};

      return this.$evmenu.get(this.menuId) || {};
    }
  },

  methods: {
    handleClick() {
      this.$emit('click');

      if (!this.$evmenu) return;

      let menuItem = this.$evmenu.get(this.menuId);

      if (menuItem) {
        if (menuItem.type === 'radio') {
          menuItem.lastChecked = true;
          menuItem.checked = true;
        }

        if (menuItem.type === 'checkbox') {
          menuItem.checked = !menuItem.checked;
        }

        this.$evmenu.$emit(`input:${this.menuId}`, menuItem);
        this.$evmenu.$emit('input', menuItem);

        ipc.send('evmenu:ipc:click', menuItem);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../../style/reset.scss';
@import '../../style/utilities.scss';

.ev-toolbar-item {
  user-select: none;

  label {
    line-height: 1.15;
  }

  &:active,
  &.ev-active {
    transform: scale(0.94);
  }

  &.ev-disabled {
    pointer-events: none;
    opacity: 0.5;
  }
}
</style>
