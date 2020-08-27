# EvStore

A reactive persistent data store, based on [electron-store](https://github.com/sindresorhus/electron-store).

?> 💡 EvStore gives you access to electron-store in the renderer process via Vue data binding.

## Setup

### Background

```js
import { EvStore } from 'evwt/background';

let store = EvStore.activate();
```

### Vue

In your main.js file:

```js
import { EvStore } from 'evwt/plugins';

Vue.use(EvStore);
```

## Usage

### Background

In your background script, work with `store` per the [electron-store docs](https://github.com/sindresorhus/electron-store).

### Vue

Use `this.$evstore.store` to work with the store as you would any other reactive Vue data. Everything is magically synced across across your app and to disk. 🧙🏻‍♂️

```vue
<span>{{ $evstore.store.foo }}</span>
<input v-model="$evstore.store.foo" />
```

```js
this.$evstore.store.foo = 'bar';
```

> State is saved to a file `evwt-store.json` in the [userData](https://www.electronjs.org/docs/api/app#appgetpathname) directory. This can be customized by passing options into `activate`. See reference below.





## Reference
### Background

<a name="activate"></a>

#### activate(options) ⇒ <code>Object</code>
Activates EVStore stores (User and UI) & listeners to sync them with frontend

**Kind**: global function  
**Returns**: <code>Object</code> - electron-store instance  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | [electron-store options](https://github.com/sindresorhus/electron-store#api) |



