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




## Reference
### Background

#### Functions

<dl>
<dt><a href="#attach">attach(win)</a></dt>
<dd><p>Start using EvMenu with this BrowserWindow</p>
</dd>
<dt><a href="#activate">activate()</a></dt>
<dd><p>Set up IPC event handlers</p>
</dd>
</dl>

<a name="attach"></a>

#### attach(win)
Start using EvMenu with this BrowserWindow

**Kind**: global function  

| Param | Type |
| --- | --- |
| win | <code>BrowserWindow</code> | 

<a name="activate"></a>

#### activate()
Set up IPC event handlers

**Kind**: global function  


### Plugin

#### Functions

<dl>
<dt><a href="#get">get(id)</a> ⇒ <code>MenuItem</code></dt>
<dd><p>Get menu by id</p>
</dd>
<dt><a href="#on">on(eventName, callback)</a></dt>
<dd><p>Listen to events on the menu</p>
</dd>
</dl>

<a name="get"></a>

#### get(id) ⇒ <code>MenuItem</code>
Get menu by id

**Kind**: global function  

| Param | Type |
| --- | --- |
| id | <code>String</code> | 

<a name="on"></a>

#### on(eventName, callback)
Listen to events on the menu

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>String</code> | Event name e.g. `evmenu:my-menu:item-1` |
| callback | <code>function</code> | (menuItem) => {} |

