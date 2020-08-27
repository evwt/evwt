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



## Props

<!-- @vuese:EvIcon:props:start -->
|Name|Description|Type|Required|Default|
|---|---|---|---|---|
|name|The filename of the icon without the .svg extension|`String`|`true`|-|

<!-- @vuese:EvIcon:props:end -->



## Reference
### Background

<a name="use"></a>

#### use(config)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | https://github.com/neutrinojs/webpack-chain#config |



### Plugin

<a name="build"></a>

#### build(Vue, requireContext)
Build icon library

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| Vue | <code>\*</code> |  |
| requireContext | <code>function</code> | https://webpack.js.org/api/module-methods/#requirecontext |

