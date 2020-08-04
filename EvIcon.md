# EvIcon

Easily create and use a library of svg icons for your app. Icon svg is inlined into the html so it can be styled with css.

## Setup

### Webpack

`yarn add --dev vue-svg-loader`

In your electronBuilder config (typically in vue.config.js):

```js
let { useEvIcon } = require('evwt/plugins/EvIcon');
```

```js
electronBuilder: {
  chainWebpackRendererProcess: (config) => {
    useEvIcon(config);
  }
}
```

### Icon Directory

Create an index.js file in your folder of svg icons:

```js
import Vue from 'vue';
import { buildIconLibrary } from 'evwt/plugins/EvIcon';

let context = require.context('.', true, /\.svg$/);
buildIconLibrary(Vue, context);
```

## Usage

Assuming you have a file named folder-open.svg in the same directory as the index.js you created above:
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
