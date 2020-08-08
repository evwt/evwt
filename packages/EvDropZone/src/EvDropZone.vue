<template>
  <div
    class="ev-drop-zone"
    @drop.stop="handleDrop"
    @dragenter="entered = true"
    @dragover.prevent.stop="entered = true"
    @dragleave="entered = false">
    <svg v-show="entered" class="ev-drop-zone-frame" :style="frameStyle">
      <rect
        width="100%"
        height="100%"
        fill="none"
        :rx="radius"
        :ry="radius"
        :stroke="stroke"
        :stroke-width="strokeWidth"
        :stroke-dasharray="strokeDashArray"
        :stroke-dashoffset="strokeDashOffset"
        stroke-linecap="square" />
    </svg>
    <!-- Component to wrap -->
    <slot />
  </div>
</template>

<script>
// @group Components
// Simplest possible file drop component with a non-intrusive customizable overlay.
export default {
  name: 'EvDropZone',

  props: {
    // Border radius of overlay
    radius: {
      type: Number,
      default: 10
    },
    // Color of overlay border
    stroke: {
      type: String,
      default: '#ccc'
    },
    // Width of overlay border
    strokeWidth: {
      type: Number,
      default: 10
    },
    // Dash array spacing
    strokeDashArray: {
      type: String,
      default: '10, 20'
    },
    // Dash offset
    strokeDashOffset: {
      type: Number,
      default: 35
    }
  },

  data() {
    return {
      entered: false
    };
  },

  computed: {
    frameStyle() {
      return `border-radius: ${this.radius}px`;
    }
  },

  methods: {
    handleDrop(ev) {
      this.entered = false;

      let files = [];
      let items = ev.dataTransfer.items;

      if (items && items.length) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].kind === 'file') {
            let file = items[i].getAsFile();
            files.push(file);
          }
        }

        // Emits array of Files when one or more files are dropped
        // @arg Array of https://developer.mozilla.org/en-US/docs/Web/API/File
        this.$emit('drop', files);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.ev-drop-zone-frame {
  position: absolute;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: 1;
}

.ev-drop-zone {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>

<docs>
</docs>
