# EvStore

A reactive persistent data store, based on [electron-store](https://github.com/sindresorhus/electron-store).

?> 💡 EvStore gives you access to electron-store in the renderer process via Vue data binding.

## Getting/Setting Data

Use `this.$evstore.store` to work with the store as you would any other reactive Vue data. Everything is automatically saved and synced across your app (renderer/background and all windows) and to disk.

```vue
<template>
  <div>
    <span>{{ $evstore.store.foo }}</span>
    <input v-model="$evstore.store.foo" />
  </div>
</template>
```

Consider debouncing or throttling for frequently updated (many times a second) values, since every change to $evstore is a write to disk.

> State is saved to a file `evwt-store.json` in the [userData](https://www.electronjs.org/docs/api/app#appgetpathname) directory. This can be customized by passing options into `activate`. See reference below.


## Background

In your background script, work with the `store` variable (returned by EvStore.activate() - see background.js) per the [electron-store docs](https://github.com/sindresorhus/electron-store).
