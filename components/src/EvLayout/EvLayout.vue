<template>
  <ev-layout-child v-if="layoutData" :child="layoutData">
    <!-- EvLayout will create one slot for each pane you define -->
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

let cloneDeep = require('lodash.clonedeep');

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
      layoutData: {}
    };
  },

  watch: {
    layout: {
      deep: true,
      handler() {
        this.layoutData = cloneDeep(this.layout);
      }
    },

    layoutData: {
      handler() {
        this.saveUiState();
      }
    }
  },

  created() {
    if (!this.$evstore || !this.$evstore.$ui || typeof this.$evstore.$ui.store.layout !== 'object') {
      this.layoutData = cloneDeep(this.layout);
      this.saveUiState();
    }

    this.layoutData = this.$evstore.$ui.store.layout;
    this.$emit('update:layout', this.layoutData);
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

    // Return the panes before and after this gutter to their default sizes
    for (const gutter of [...this.$el.querySelectorAll('.ev-gutter')]) {
      gutter.addEventListener('doubleclick', (e) => {
        let parent = e.target.parentElement;
        let parentName = parent.dataset.evlayoutName;
        let track = Array.prototype.indexOf.call(e.target.parentNode.children, e.target);
        let leadingIndex = Math.floor(track / 2);
        let trailingIndex = Math.ceil(track / 2);
        let gridTemplate = parent.style.gridTemplateColumns || parent.style.gridTemplateRows;
        let sizes = gridTemplate.split(' ').filter(s => s !== '0px');
        let defaultSizes = this.defaultSizeForTrack(parentName, this.layout);

        sizes[leadingIndex] = defaultSizes[leadingIndex];
        sizes[trailingIndex] = defaultSizes[trailingIndex];

        if (gutter.classList.contains('ev-gutter-row')) {
          parent.style.gridTemplateRows = sizes.join(' 0px ');
        } else {
          parent.style.gridTemplateColumns = sizes.join(' 0px ');
        }

        if (this.$evstore && this.$evstore.$ui) {
          this.updateLayoutSizes(parentName, this.layoutData, sizes);
          this.$emit('update:layout', this.layoutData);
        }
      });
    }

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

    let dragStartCoords = {};

    let onDragStart = (direction, track, element) => {
      let { gridTemplateColumns, gridTemplateRows } = element.parentElement.style;
      let gridTemplate = gridTemplateColumns || gridTemplateRows;
      let sizes = gridTemplate.split(' 0px ');
      let parentName = element.parentElement.dataset.evlayoutName;

      dragStartCoords[parentName] = sizes;

      // Fired when any pane starts dragging
      // @arg direction, track, gutter element
      this.$emit('dragStart', { direction, track, element });
    };

    let onDrag = (direction, track, element, gridTemplateStyle) => {
      addMinimizedMaximizedClasses(direction, track, element);

      // Fired when any pane is dragging
      // @arg direction, track, gutter element, gridTemplateStyle
      this.$emit('drag', {
        direction, track, element, gridTemplateStyle
      });
    };

    let addMinimizedMaximizedClasses = (direction, track, element) => {
      let maximizedClassName = 'ev-layout-pane-maximized';
      let minimizedClassName = 'ev-layout-pane-minimized';
      let offsetKey = direction === 'column' ? 'offsetWidth' : 'offsetHeight';
      let parent = element.parentElement;
      let previousPane = element.previousElementSibling;
      let nextPane = element.nextElementSibling;

      if (previousPane && previousPane[offsetKey] === parent[offsetKey]) {
        previousPane.classList.add(maximizedClassName);
      } else if (previousPane.classList.contains(maximizedClassName)) {
        previousPane.classList.remove(maximizedClassName);
      }

      if (previousPane && previousPane[offsetKey] === 0) {
        previousPane.classList.add(minimizedClassName);
      } else if (previousPane.classList.contains(minimizedClassName)) {
        previousPane.classList.remove(minimizedClassName);
      }

      if (nextPane && nextPane[offsetKey] === parent[offsetKey]) {
        nextPane.classList.add(maximizedClassName);
      } else if (nextPane.classList.contains(maximizedClassName)) {
        nextPane.classList.remove(maximizedClassName);
      }

      if (nextPane && nextPane[offsetKey] === 0) {
        nextPane.classList.add(minimizedClassName);
      } else if (nextPane.classList.contains(minimizedClassName)) {
        nextPane.classList.remove(minimizedClassName);
      }
    };

    for (const gutter of rowGutters) {
      addMinimizedMaximizedClasses('row', gutter.track, gutter.element);
    }

    for (const gutter of columnGutters) {
      addMinimizedMaximizedClasses('column', gutter.track, gutter.element);
    }

    let onDragEnd = async (direction, track, element) => {
      // Fired when any pane ends dragging
      // @arg direction, track, gutter element
      this.$emit('dragEnd', { direction, track, element });

      if (this.$evstore && this.$evstore.$ui) {
        let { gridTemplateColumns, gridTemplateRows } = element.parentElement.style;
        let gridTemplate = gridTemplateColumns || gridTemplateRows;
        let sizes = gridTemplate.split(' 0px ');
        let parentName = element.parentElement.dataset.evlayoutName;
        let pane = this.getPane(parentName, this.layoutData);
        let startCoords = dragStartCoords[parentName];

        for (let idx = 0; idx < pane.panes.length; idx++) {
          const p = pane.panes[idx];
          if (parseFloat(sizes[idx]) < 0.001) {
            this.hidePane(p.name, startCoords[idx]);
          } else {
            this.setPropertyDeep(p.name, this.layoutData.panes, 'unhiddenSize', sizes[idx]);
          }

          if (parseFloat(startCoords[idx]) < 0.001) {
            this.showPane(p.name);
          }
        }

        this.updateLayoutSizes(parentName, this.layoutData, sizes);
        this.$emit('update:layout', this.layoutData);
      }
    };

    Split({
      columnGutters, rowGutters, columnMinSizes, rowMinSizes, onDragStart, onDrag, onDragEnd
    });
  },

  methods: {
    showPane(name) {
      this.setPropertyDeep(name, this.layoutData.panes, 'hidden', false);
      let paneSize = this.getPaneUnhiddenSize(name, this.layoutData);
      this.setPaneSize(name, paneSize, this.layoutData);
      this.$emit('update:layout', this.layoutData);
      this.$emit('pane-shown', name);
    },

    hidePane(name, unhiddenSize = this.getPaneSize(name, this.layoutData)) {
      if (parseFloat(unhiddenSize) > 0.001) {
        this.setPropertyDeep(name, this.layoutData.panes, 'unhiddenSize', unhiddenSize);
      }
      this.setPropertyDeep(name, this.layoutData.panes, 'hidden', true);
      this.setPaneSize(name, 0, this.layoutData);
      this.$emit('update:layout', this.layoutData);
      this.$emit('pane-hidden', name);
    },

    loadUiState() {
      if (!this.$evstore || !this.$evstore.$ui) return;

      if (typeof this.$evstore.$ui.store.layout === 'object') {
        for (const [paneName, paneSizes] of Object.entries(this.$evstore.$ui.store.layout)) {
          this.updateLayoutSizes(paneName, this.layoutData, paneSizes);
        }
      }
    },

    saveUiState() {
      this.$set(this.$evstore.$ui.store, 'layout', this.layoutData);
    },

    // Keep dom changes in sync with layoutData
    updateLayoutSizes(name, layoutData, sizes, initialSizes) {
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
          this.updateLayoutSizes(name, pane, sizes, initialSizes);
        }
      }
    },

    defaultSizeForTrack(name, layoutData) {
      if (layoutData.name === name) {
        return layoutData.sizes;
      }

      for (let idx = 0; idx < layoutData.panes.length; idx++) {
        let pane = layoutData.panes[idx];
        if (!pane) continue;
        if (pane.name === name) {
          return pane.sizes;
        }
        if (pane.panes) {
          this.defaultSizeForTrack(name, pane);
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
    },

    getPaneUnhiddenSize(name, layoutData) {
      for (let idx = 0; idx < layoutData.panes.length; idx++) {
        let pane = layoutData.panes[idx];
        if (!pane) continue;

        if (pane.name === name) {
          return pane.unhiddenSize;
        }

        if (pane.panes) {
          let res = this.getPaneUnhiddenSize(name, pane);
          if (res) return res;
        }
      }
    },

    setPropertyDeep(name, data, property, value) {
      for (let idx = 0; idx < data.length; idx++) {
        let pane = data[idx];

        if (!pane) continue;

        if (pane.name === name) {
          pane[property] = value;
          this.$set(pane, property, value);
          return;
        }

        if (pane.panes) {
          this.setPropertyDeep(name, pane.panes, property, value);
        }
      }
    },

    getPane(name, layoutData = this.layoutData) {
      for (let idx = 0; idx < layoutData.panes.length; idx++) {
        let pane = layoutData.panes[idx];
        if (!pane) continue;
        if (pane.name === name) return pane;

        if (pane.panes) {
          let res = this.getPane(name, pane);
          if (res) return res;
        }
      }
    },

    getPaneSize(name, layoutData) {
      for (let idx = 0; idx < layoutData.panes.length; idx++) {
        let pane = layoutData.panes[idx];
        if (!pane) continue;

        if (pane.panes) {
          for (let jdx = 0; jdx < pane.panes.length; jdx++) {
            const innerPane = pane.panes[jdx];
            if (innerPane.name === name) {
              let size = pane.sizes[jdx];
              return size;
            }
          }
        }

        if (pane.panes) {
          let res = this.getPaneSize(name, pane);
          if (res) return res;
        }
      }
    },

    setPaneSize(name, size, layoutData) {
      for (let idx = 0; idx < layoutData.panes.length; idx++) {
        let pane = layoutData.panes[idx];
        if (!pane) continue;

        if (pane.panes) {
          for (let jdx = 0; jdx < pane.panes.length; jdx++) {
            const innerPane = pane.panes[jdx];
            if (innerPane.name === name) {
              console.log('setting sizes');
              pane.sizes[jdx] = size;
              this.$set(pane.sizes, jdx, size);
            }
          }
        }

        if (pane.panes) {
          this.setPaneSize(name, size, pane);
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../../../style/reset.scss';
@import '../../../style/utilities.scss';
@import '../../../style/split-grid.scss';
</style>
