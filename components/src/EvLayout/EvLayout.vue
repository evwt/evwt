<template>
  <ev-layout-child :child="layout">
    <!-- @vuese-ignore -->
    <slot v-for="(_, name) in $slots" :slot="name" :name="name" />
    <template v-for="(_, name) in $scopedSlots" :slot="name" slot-scope="slotData">
      <!-- @vuese-ignore -->
      <slot :name="name" v-bind="slotData" />
    </template>
  </ev-layout-child>
</template>

<script>
import Split from '../../../vendor/split-grid';
import EvLayoutChild from '../EvLayoutChild.vue';

export default {
  name: 'EvLayout',

  components: {
    EvLayoutChild
  },

  props: {
    // The top-level Pane
    layout: {
      type: Object,
      required: true
    }
  },

  async mounted() {
    let rowGutters = [...this.$el.querySelectorAll('.ev-gutter-row')].map((gutter) => ({
      track: Array.prototype.indexOf.call(gutter.parentNode.children, gutter),
      element: gutter
    }));

    let columnGutters = [...this.$el.querySelectorAll('.ev-gutter-column')].map((gutter) => ({
      track: Array.prototype.indexOf.call(gutter.parentNode.children, gutter),
      element: gutter
    }));

    let minSizeReducer = (acc, gutter) => {
      let prevPane = gutter.previousElementSibling;

      if (prevPane) {
        let minSize = parseInt(prevPane.dataset.minSize || 0);
        let index = Array.prototype.indexOf.call(prevPane.parentNode.children, prevPane);
        acc[index] = minSize;
      }

      let nextPane = gutter.nextElementSibling;

      if (nextPane) {
        let minSizeNext = parseInt(nextPane.dataset.minSize || 0);
        let indexNext = Array.prototype.indexOf.call(nextPane.parentNode.children, nextPane);

        acc[indexNext] = minSizeNext;
      }

      return acc;
    };

    let columnMinSizes = [...this.$el.querySelectorAll('.ev-gutter-column')].reduce(minSizeReducer, {});
    let rowMinSizes = [...this.$el.querySelectorAll('.ev-gutter-row')].reduce(minSizeReducer, {});

    let onDragStart = (direction, track, element) => {
      // Fired when any pane starts dragging
      // @arg direction, track, gutter element
      this.$emit('dragStart', { direction, track, element });
    };

    let onDrag = (direction, track, element, gridTemplateStyle) => {
      let parent = element.parentElement;
      let adjacentPane = element.previousElementSibling;
      let maximizedClassName = 'ev-layout-pane-maximized';
      let minimizedClassName = 'ev-layout-pane-minimized';

      if (adjacentPane && adjacentPane.offsetWidth === parent.offsetWidth) {
        adjacentPane.classList.add(maximizedClassName);
      } else if (adjacentPane.classList.contains(maximizedClassName)) {
        adjacentPane.classList.remove(maximizedClassName);
      }

      if (adjacentPane && adjacentPane.offsetWidth === 0) {
        adjacentPane.classList.add(minimizedClassName);
      } else if (adjacentPane.classList.contains(minimizedClassName)) {
        adjacentPane.classList.remove(minimizedClassName);
      }

      // Fired when any pane is dragging
      // @arg direction, track, gutter element, gridTemplateStyle
      this.$emit('drag', {
        direction, track, element, gridTemplateStyle
      });
    };

    let onDragEnd = async (direction, track, element) => {
      // Fired when any pane ends dragging
      // @arg direction, track, gutter element
      this.$emit('dragEnd', { direction, track, element });
    };

    Split({
      columnGutters, rowGutters, columnMinSizes, rowMinSizes, onDragStart, onDrag, onDragEnd
    });
  }
};
</script>

<style lang="scss" scoped>
@import '../../../style/reset.scss';
@import '../../../style/utilities.scss';
@import '../../../style/split-grid.scss';
</style>
