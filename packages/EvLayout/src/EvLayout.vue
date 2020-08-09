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
import Split from '@/../vendor/split-grid';
import EvLayoutChild from './EvLayoutChild.vue';

// @group Components
// Flexible pane-based app layouts, using CSS grid. Supports collapsible panes and sizing by relative or absolute units.
export default {
  name: 'EvLayout',

  components: {
    EvLayoutChild
  },

  props: {
    // See usage section below
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
      // Fired when any pane starts dragging
      // @arg direction, track
      this.$emit('dragStart', { direction, track });
    };

    let onDrag = (direction, track, gridTemplateStyle) => {
      // Fired when any pane is dragging
      // @arg direction, track, gridTemplateStyle
      this.$emit('drag', { direction, track, gridTemplateStyle });
    };

    let onDragEnd = (direction, track) => {
      // Fired when any pane ends dragging
      // @arg direction, track
      this.$emit('dragEnd', { direction, track });
    };

    Split({
      columnGutters, rowGutters, columnMinSizes, rowMinSizes, onDragStart, onDrag, onDragEnd
    });
  }
};
</script>

<style lang="scss" scoped>
@import '@/../style/reset.scss';
@import '@/../style/utilities.scss';
@import '@/../style/split-grid.scss';
</style>

<docs>

## Setup

```js
import { EvLayout } from 'evwt';

export default {
  components: {
    EvLayout
  }
}
```

## Usage

Provide a definition of your UI layout and EvLayout will build it and provide slots to place your components. Panes can be infinitely nested.

```vue
<template>
  <ev-layout :layout="layout">
    <template v-slot:sidebar>
      side
    </template>
    <template v-slot:editor>
      main stuff
    </template>
    <template v-slot:panel>
      panel
    </template>
  </ev-layout>
</template>

<script>
import { EvLayout } from 'evwt';

export default {
  components: {
    EvLayout
  },

  data() {
    return {
      layout: {
        direction: 'column',
        sizes: ['250px', '1fr'],
        panes: [
          {
            name: 'sidebar',
            minSize: 50
          },
          {
            name: 'main',
            direction: 'row',
            sizes: ['3fr', '1fr'],
            panes: [
              {
                name: 'editor'
              },
              {
                name: 'panel'
              }
            ]

          }
        ]
      }
    };
  }
};
</script>

<style>
.ev-pane-sidebar {
  background: #eee;
}

.ev-pane-panel {
  background: #ddd;
}
</style>
```

### Pane definition

| Property | Type | Description | Example
| --- | --- | --- | --- |
| name | String | A slot with this name will be created for use in your template. A css class is also added in the format `ev-pane-{name}`. ||
| minSize | Number | The minimum size of the pane. ||
| panes | Array: \[Pane] | An array of child pane definitions to nest inside this pane. ||
| sizes | Array: \[String] | Sizes of the child panes in [css grid units](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Basic_Concepts_of_Grid_Layout). 'auto' is valid only on non-resizable panes. | `['200px', '1fr']` |
| direction | String: 'row'\|'column' | Direction of child panes. ||
| resizable | Boolean | Whether the trailing edge of the pane can be dragged to resize the pane. ||

</docs>
