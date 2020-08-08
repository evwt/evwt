# EvIcon

Easily create and use a library of svg icons for your app. Icon svg is inlined into the html so it can be styled with css.

## Props

<!-- @vuese:EvIcon:props:start -->
|Name|Description|Type|Required|Default|
|---|---|---|---|---|
|name|The filename of the icon without the .svg extension|`String`|`true`|-|

<!-- @vuese:EvIcon:props:end -->




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
