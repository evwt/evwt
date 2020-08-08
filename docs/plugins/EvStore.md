# EvStore

A reactive persistent data store, based on [electron-store](https://github.com/sindresorhus/electron-store).

## Usage

Use `this.$evstore.store` to work with the store as you would any other reactive Vue data.

Everything is magically synced across across your app and to disk. 🧙🏻‍♂️

```vue
<span>{{ $evstore.store.foo }}</span>
<input v-model="$evstore.store.foo" />
```

> In your background script, you can work with `store` as usual per the [electron-store docs](https://github.com/sindresorhus/electron-store) and everything will still be automatically synced.

## Setup

### Background

```js
import { EvStore } from 'evwt';
import Store from 'electron-store';

let store = new Store();
EvStore.activate(store);
```

### Vue

In your main.js file:

```js
import { EvStore } from 'evwt';

Vue.use(EvStore);
```
## Reference

<a name="activate"></a>

### activate(store)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| store | <code>Store</code> | [electron-store Store](https://github.com/sindresorhus/electron-store#usage) |

