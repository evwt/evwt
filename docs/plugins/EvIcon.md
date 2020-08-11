## Setup

### Webpack

`yarn add --dev vue-svg-loader`

Chain your webpack config for the renderer process through `useEvIcon`.

If you're using [vue-cli-plugin-electron-builder](https://github.com/nklayman/vue-cli-plugin-electron-builder), which all the EVWT examples use, the config will look like this:

```js
let { useEvIcon } = require('evwt/plugins/EvIcon');

module.exports = {
  pluginOptions: {
    electronBuilder: {
      chainWebpackRendererProcess(config) {
        useEvIcon(config);
      }
    }
  }
};
```

### Icon Library

Create this `index.js` file in the folder with all your SVG icons:

```js
import Vue from 'vue';
import { buildIconLibrary } from 'evwt/plugins/EvIcon';

let context = require.context('.', true, /\.svg$/);
buildIconLibrary(Vue, context);
```

Assuming that folder is `/src/assets/icons`, then in your Vue `main.js` file:

```js
import '@/assets/icons';
```

## Usage

See [EvIcon component reference](/components/EvIcon)
## Reference

### Functions

<dl>
<dt><a href="#buildIconLibrary">buildIconLibrary(Vue, requireContext)</a></dt>
<dd></dd>
<dt><a href="#useEvIcon">useEvIcon(config)</a></dt>
<dd></dd>
</dl>

<a name="buildIconLibrary"></a>

### buildIconLibrary(Vue, requireContext)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| Vue | <code>\*</code> |  |
| requireContext | <code>function</code> | https://webpack.js.org/api/module-methods/#requirecontext |

<a name="useEvIcon"></a>

### useEvIcon(config)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | https://github.com/neutrinojs/webpack-chain#config |

