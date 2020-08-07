<template>
  <div class="ev-icon" :class="`ev-icon-${name}`">
    <component :is="`ev-icon-${name}`" />
  </div>
</template>

<script>
// Easily create and use a library of svg icons for your app. Icon svg is inlined into the html so it can be styled with css.
export default {
  props: {
    name: {
      type: String,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/../style/utilities.scss';

svg {
  width: auto;
  height: 100%;
}
</style>

<docs>
## Setup

### Webpack

`yarn add --dev vue-svg-loader`

In your electronBuilder config (typically in `vue.config.js`):

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

Assuming you have a folder of svgs in `/src/icons`, first create an `index.js` file in this folder:

```js
import Vue from 'vue';
import { buildIconLibrary } from 'evwt/plugins/EvIcon';

let context = require.context('.', true, /\.svg$/);
buildIconLibrary(Vue, context);
```

Then in your Vue `main.js` file:

```js
import '@/icons';
```

### Usage

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
