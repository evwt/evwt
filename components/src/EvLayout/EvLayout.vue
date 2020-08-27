<template>
  <ev-layout-child v-if="layoutData" :child="layoutData">
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

  data() {
    return {
      layoutData: null
    };
  },

  async created() {
    this.layoutData = this.layout;
    this.loadUiState();
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

      if (this.$evstore && this.$evstore.$ui) {
        let { gridTemplateColumns, gridTemplateRows } = element.parentElement.style;
        let gridTemplate = gridTemplateColumns || gridTemplateRows;
        let sizes = gridTemplate.split(' 0px ');
        let name = element.parentElement.dataset.evlayoutName;
        this.syncLayoutDataForPane(name, this.layoutData, sizes);
        this.saveUiState();
      }
    };

    Split({
      columnGutters, rowGutters, columnMinSizes, rowMinSizes, onDragStart, onDrag, onDragEnd
    });
  },

  methods: {
    loadUiState() {
      if (typeof this.$evstore.$ui.store.layout === 'object') {
        for (const [paneName, paneSizes] of Object.entries(this.$evstore.$ui.store.layout)) {
          this.syncLayoutDataForPane(paneName, this.layoutData, paneSizes);
        }
      }
    },

    saveUiState() {
      this.$set(this.$evstore.$ui.store, 'layout', this.getSizesForPanes(this.layoutData));
    },

    syncLayoutDataForPane(name, layoutData, sizes) {
      if (layoutData.name === name) {
        layoutData.sizes = sizes;
        return;
      }

      for (let idx = 0; idx < layoutData.panes.length; idx++) {
        let pane = layoutData.panes[idx];
        if (!pane) continue;
        if (pane.name === name) {
          pane.sizes = sizes;
        }
        if (pane.panes) {
          this.syncLayoutDataForPane(name, pane, sizes);
        }
      }
    },

    getSizesForPanes(layoutData, sizes = {}) {
      sizes[layoutData.name] = layoutData.sizes;

      for (let idx = 0; idx < layoutData.panes.length; idx++) {
        let pane = layoutData.panes[idx];
        if (!pane) continue;
        sizes[pane.name] = pane.sizes;
        if (pane.panes) {
          this.getSizesForPanes(pane, sizes);
        }
      }

      return sizes;
    }

  }
};
</script>

<style lang="scss" scoped>
@import '../../../style/reset.scss';
@import '../../../style/utilities.scss';
@import '../../../style/split-grid.scss';
</style>
