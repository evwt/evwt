# EvStore

A unified persistent store across your entire app, based on [electron-store](https://github.com/sindresorhus/electron-store).

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

## Usage

Use `this.$evstore.store` to work with the store as you would any other reactive data. Everything is magically synced across processes/windows/disk.

```vue
<span>{{ $evstore.store.foo }}</span>
<input v-model="$evstore.store.foo" />
```

In your background script, you can work with `store` as usual per the [electron-store docs](https://github.com/sindresorhus/electron-store) and changes will automatically be synced with your components.
