# EvLayout

Flexible pane-based app layouts, using CSS grid. Supports collapsible panes and sizing by relative or absolute units.

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
| name | String | Name of the pane, used to create css classes and slots ||
| minSize | Number | The minimum size of the pane ||
| panes | Array | An array of child pane definitions to nest inside this pane ||
| sizes | Array | Sizes of the child panes in css grid units | `['200px', '1fr']` |
| direction | String: row\|column | Direction of child panes ||

### Events

| Event | Params | Description |
| --- | --- | --- |
| dragStart | direction, track | Fired when any pane starts dragging |
| drag | direction, track, gridTemplateStyle | Fired when any pane is dragging |
| dragEnd | direction, track | Fired when any pane ends dragging |


