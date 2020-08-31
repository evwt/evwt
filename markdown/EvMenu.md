# EvMenu

Reactive native menus.

![evmenu-demo](https://user-images.githubusercontent.com/611996/89112631-2654df00-d42b-11ea-8f7a-eec2c9ab4e83.gif)

?> 💡 EvMenu gives you an easier way of working with native application menus using Vue.

## Build Menu

Edit the [menu definition](https://www.electronjs.org/docs/api/menu#main-process) in `src/menu.js`. Make sure all your menu items have a unique `id`.

For each user action in your app, there should be a corresponding menu item (and shortcut key) where possible. This is one of those details that makes for a great native app.

## Menu Events

Listen for menu events with `this.$evmenu.on('input')`

```js
// Listen for any menu input
this.$evmenu.on('input', item => {
  console.log(item);
});

// Listen for input on a specific menu item
this.$evmenu.on('input:open-file', item => {
  console.log(item);
});
```

Send native menu commands with `this.$evmenu.$emit`

```js
this.$evmenu.$emit('click', 'open-file');
```

## Menu Data Binding

Use `this.$evmenu.get(id)` to get a menu item.

```html
<input v-model="$evmenu.get('file').label">
<input v-model="$evmenu.get('show-preview').checked" type="checkbox">
```

> You can also access the entire menu with `this.$evmenu.menu`.

## Background

EvMenu events are also accessible in the background script.

```js
// Listen for any menu input in this BrowserWindow
win.on('evmenu', item => {
  console.log(item);
});

// Listen for specific menu input in this BrowserWindow
win.on('evmenu:open-file', item => {
  console.log(item);
});
```

```js
// Listen for any menu input across the app
app.on('evmenu', item => {
  console.log(item);
});

// Listen for specific menu input across the app
app.on('evmenu:open-file', item => {
  console.log(item);
});
```

> Menu item (checkbox and radio) state is saved based on the focused EvWindow's restoreId to evwt-ui-state.json in the [userData](https://www.electronjs.org/docs/api/app#appgetpathname) directory

