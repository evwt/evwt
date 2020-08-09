<template>
  <div class="ev-icon" :class="`ev-icon-${name}`">
    <component :is="`ev-icon-${name}`" />
  </div>
</template>

<script>
// @group Components
// Easily create and use a library of svg icons for your app. Icon svg is inlined into the html so it can be styled with css.
export default {
  props: {
    // The filename of the icon without the .svg extension
    name: {
      type: String,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/../style/reset.scss';
@import '@/../style/utilities.scss';

svg {
  width: auto;
  height: 100%;
}
</style>

<docs>

## Setup

See [EvIcon plugin reference](/plugins/EvIcon)

## Usage

Assuming you have a file named folder-open.svg in /src/icons:
```vue
<template>
  <ev-icon name="folder-open" :size="16" />
</template>

<script>
import { EvIcon } from 'evwt';

export default {
  components: {
    EvIcon
  }
};
</script>

<style>
.ev-icon-folder-open svg {
  fill: red;
}
</style>
```
</docs>
