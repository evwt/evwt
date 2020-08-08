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

