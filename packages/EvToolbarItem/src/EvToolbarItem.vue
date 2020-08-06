<template>
  <div
    class="ev-toolbar-item d-flex h-100 m-e-xs"
    :data-ev-toolbar-item="menuId"
    :title="tooltip"
    :class="itemClass"
    :style="itemStyle"
    @click="handleClick">
    <ev-icon v-if="iconShow" class="h-100" :name="icon" :style="iconStyle" />
    <label v-if="labels" :class="labelClass" :style="labelStyle">
      {{ label }}
    </label>
  </div>
</template>

<script>
import EvIcon from '../../EvIcon';

const PADDING_XS = 5;

export default {
  name: 'EvToolbarItem',

  components: {
    EvIcon
  },

  props: {
    menuId: String,
    icon: String,
    iconPos: String,
    fontSize: Number,
    iconSize: Number,
    label: String,
    labels: Boolean,
    iconShow: Boolean,
    minWidth: Number,
    tooltip: String,
    padding: Number,
    disabled: Boolean
  },

  computed: {
    labelStyle() {
      let style = {
        lineHeight: 1
      };

      if (this.fontSize) {
        style.fontSize = `${this.fontSize}px`;
      }

      return style;
    },

    itemStyle() {
      let style = {
        padding: `${this.padding || PADDING_XS}px`
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

      if (this.menuItem.enabled === false) {
        classes += ' ev-disabled';
      }

      if (this.menuItem.checked === true) {
        classes += ' ev-selected';
      }

      return classes;
    },

    menuItem() {
      return this.$evmenu.get(this.menuId) || {};
    }
  },

  methods: {
    handleClick() {
      if (!this.$evmenu) return;

      let menuItem = this.$evmenu.get(this.menuId);

      if (menuItem.type === 'checkbox') {
        menuItem.checked = !menuItem.checked;
      }

      this.$el.classList.remove('ev-active');
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/../style/utilities.scss';

.ev-toolbar-item {
  user-select: none;

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
