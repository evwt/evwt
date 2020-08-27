# EvIcon

A library for all your vector icons, out of the box.

?> 🎨 Icon svg is inlined into the html so it can be styled with css.

## Usage

Put your svg icons into `/src/assets/icons`. Assuming you have a file named `folder-open.svg` there:

```vue
<template>
  <ev-icon name="folder-open" />
</template>

<script>
import { EvIcon } from 'evwt/components';

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
