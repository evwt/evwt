<template>
  <div ref="root" class="root" :style="rootStyle">
    <div ref="viewport" class="viewport" :style="viewportStyle">
      <div ref="spacer" class="spacer" :style="spacerStyle">
        <div v-for="item in visibleItems" :key="item[keyField]" :style="itemStyle">
          <slot :item="item">
            {{ item }}
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @group Components
export default {
  props: {
    items: Array,
    keyField: String,
    rowHeight: Number
  },

  data() {
    return {
      rootHeight: window.innerHeight,
      scrollTop: 0,
      nodePadding: 10
    };
  },

  computed: {
    viewportHeight() {
      return this.itemCount * this.rowHeight;
    },

    startIndex() {
      let startNode = Math.floor(this.scrollTop / this.rowHeight) - this.nodePadding;
      startNode = Math.max(0, startNode);
      return startNode;
    },

    visibleNodeCount() {
      let count = Math.ceil(this.rootHeight / this.rowHeight) + 2 * this.nodePadding;
      count = Math.min(this.itemCount - this.startIndex, count);
      return count;
    },

    visibleItems() {
      return this.items.slice(
        this.startIndex,
        this.startIndex + this.visibleNodeCount
      );
    },

    itemCount() {
      return this.items.length;
    },

    offsetY() {
      return this.startIndex * this.rowHeight;
    },

    spacerStyle() {
      return {
        transform: `translateY(${this.offsetY}px)`
      };
    },

    viewportStyle() {
      return {
        overflow: 'hidden',
        height: `${this.viewportHeight}px`,
        position: 'relative'
      };
    },

    rootStyle() {
      return {
        height: `${this.rootHeight}px`,
        overflow: 'auto'
      };
    },

    itemStyle() {
      return {
        height: `${this.rowHeight}px`
      };
    }
  },

  mounted() {
    this.$refs.root.addEventListener(
      'scroll',
      this.handleScroll,
      { passive: true }
    );

    this.observeSize();
  },

  beforeDestroy() {
    this.$refs.root.removeEventListener('scroll', this.handleScroll);
  },

  methods: {
    handleScroll() {
      this.scrollTop = this.$refs.root.scrollTop;
    },

    observeSize() {
      let rootSizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          let { contentRect } = entry;
          this.rootHeight = contentRect.height;
        }
      });

      rootSizeObserver.observe(this.$refs.root.parentElement);
    }
  }
};
</script>

<style lang="scss" scoped>
.root {
  min-height: 100%;
}

.viewport {
  overflow-y: auto;
}
</style>
