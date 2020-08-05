<template>
  <ev-layout-child :child="layout">
    <slot v-for="(_, name) in $slots" :slot="name" :name="name" />
    <template v-for="(_, name) in $scopedSlots" :slot="name" slot-scope="slotData">
      <slot :name="name" v-bind="slotData" />
    </template>
  </ev-layout-child>
</template>

<script>
import Split from '@/../vendor/split-grid';
import EvLayoutChild from './EvLayoutChild.vue';

export default {
  name: 'EvLayout',

  components: {
    EvLayoutChild
  },

  props: ['layout'],

  async mounted() {
    let rowGutters = [...this.$el.querySelectorAll('.ev-gutter-row')].map((gutter) => ({
      track: Array.prototype.indexOf.call(gutter.parentNode.children, gutter),
      element: gutter
    }));

    let columnGutters = [...this.$el.querySelectorAll('.ev-gutter-column')].map((gutter) => ({
      track: Array.prototype.indexOf.call(gutter.parentNode.children, gutter),
      element: gutter
    }));

    let columnMinSizes = [...this.$el.querySelectorAll('.ev-gutter-column')].reduce((acc, gutter) => {
      let pane = gutter.previousElementSibling;
      let minSize = parseInt(pane.dataset.minSize || 0);
      let index = Array.prototype.indexOf.call(pane.parentNode.children, pane);
      acc[index] = minSize;
      return acc;
    }, {});

    let rowMinSizes = [...this.$el.querySelectorAll('.ev-gutter-row')].reduce((acc, gutter) => {
      let pane = gutter.previousElementSibling;
      let minSize = parseInt(pane.dataset.minSize || 0);
      let index = Array.prototype.indexOf.call(pane.parentNode.children, pane);
      acc[index] = minSize;
      return acc;
    }, {});

    let onDragStart = (direction, track) => {
      this.$emit('dragStart', { direction, track });
    };

    let onDrag = (direction, track, gridTemplateStyle) => {
      this.$emit('drag', { direction, track, gridTemplateStyle });
    };

    let onDragEnd = (direction, track) => {
      this.$emit('dragEnd', { direction, track });
    };

    Split({
      columnGutters, rowGutters, columnMinSizes, rowMinSizes, onDragStart, onDrag, onDragEnd
    });
  }
};
</script>

<style lang="scss" scoped>
@import '@/../style/utilities.scss';
@import '@/../style/split-grid.scss';
</style>
