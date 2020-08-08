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

## Reference

### Functions

<dl>
<dt><a href="#buildIconLibrary">buildIconLibrary(Vue, requireComponent)</a></dt>
<dd></dd>
<dt><a href="#useEvIcon">useEvIcon(config)</a></dt>
<dd></dd>
</dl>

<a name="buildIconLibrary"></a>

### buildIconLibrary(Vue, requireComponent)
**Kind**: global function  

| Param | Type |
| --- | --- |
| Vue | <code>\*</code> | 
| requireComponent | <code>\*</code> | 

<a name="useEvIcon"></a>

### useEvIcon(config)
**Kind**: global function  

| Param | Type |
| --- | --- |
| config | <code>\*</code> | 

