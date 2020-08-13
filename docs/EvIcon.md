# EvIcon

Easily create and use a library of svg icons for your app. Icon svg is inlined into the html so it can be styled with css.

## Setup

### Webpack

`yarn add --dev babel-loader vue-svg-loader`

Chain your webpack config for the renderer process through `EvIcon.use`.

If you're using [vue-cli-plugin-electron-builder](https://github.com/nklayman/vue-cli-plugin-electron-builder), which all the EVWT examples use, the config will look like this:

```js
let EvIcon = require('evwt/background/EvIcon');

module.exports = {
  pluginOptions: {
    electronBuilder: {
      chainWebpackRendererProcess(config) {
        EvIcon.use(config);
      }
    }
  }
};
```

### Icon Library

Create this `index.js` file in the folder with all your SVG icons:

```js
import Vue from 'vue';
import EvIcon from 'evwt/plugins/EvIcon';

let context = require.context('.', true, /\.svg$/);
EvIcon.build(Vue, context);
```

Assuming that folder is `/src/assets/icons`, then in your Vue `main.js` file:

```js
import '@/assets/icons';
```

## Usage

Assuming you have a file named `folder-open.svg` in `/src/assets/icons`:
```vue
<template>
  <ev-icon name="folder-open" />
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
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| Vue | <code>\*</code> |  |
| requireContext | <code>function</code> | https://webpack.js.org/api/module-methods/#requirecontext |

