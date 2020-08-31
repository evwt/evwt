# EvLayout

**Layouts for your app windows.**

?> 🖥 [Try out the EvLayout playground](https://evwt-layout-playground.netlify.app/)

?> 🧠 EvLayout automatically remembers user pane sizes across restarts.


## Usage

Provide a definition of your UI layout and EvLayout will build it and provide slots to place your components.

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
import { EvLayout } from 'evwt/components';

export default {
  components: {
    EvLayout
  },

  data() {
    return {
      layout: {
        // Paste layout from playground here
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

> Tip: For dividers, put a border on one side of a pane.

> Pane sizes are saved based on their EvWindow's restoreId to evwt-ui-state.json in the [userData](https://www.electronjs.org/docs/api/app#appgetpathname) directory

### Pane definition

| Property | Type | Description | Example
| --- | --- | --- | --- |
| name | String | A slot with this name will be created for use in your template. A css class is also added in the format `ev-pane-{name}`. ||
| minSize | Number | The minimum size of the pane. ||
| panes | Array: \[Pane] | An array of child pane definitions to nest inside this pane. ||
| sizes | Array: \[String] | Sizes of the child panes in [css grid units](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Basic_Concepts_of_Grid_Layout). 'auto' is valid only on non-resizable panes. | `['200px', '1fr']` |
| direction | String: 'row'\|'column' | Direction of child panes. ||
| resizable | Boolean | Whether the trailing edge of the pane can be dragged to resize the pane. ||



## Props

<!-- @vuese:EvLayout:props:start -->
|Name|Description|Type|Required|Default|
|---|---|---|---|---|
|layout|The top-level Pane|`Object`|`true`|-|

<!-- @vuese:EvLayout:props:end -->


## Events

<!-- @vuese:EvLayout:events:start -->
|Event Name|Description|Parameters|
|---|---|---|
|update:layout|-|-|
|dragStart|Fired when any pane starts dragging| direction, track, gutter element|
|drag|Fired when any pane is dragging| direction, track, gutter element, gridTemplateStyle|
|dragEnd|Fired when any pane ends dragging| direction, track, gutter element|
|pane-shown|-|-|
|pane-hidden|-|-|

<!-- @vuese:EvLayout:events:end -->


## Slots

<!-- @vuese:EvLayout:slots:start -->
|Name|Description|Default Slot Content|
|---|---|---|
|name|EvLayout will create one slot for each pane you define|-|

<!-- @vuese:EvLayout:slots:end -->






