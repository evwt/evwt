# EvMenu

Reactive native menus.

![evmenu-demo](https://user-images.githubusercontent.com/611996/89112631-2654df00-d42b-11ea-8f7a-eec2c9ab4e83.gif)

?> 💡 EvMenu gives you an easier way of working with Electron menus in the renderer process.

?> 🧠 EvMenu automatically remembers menu checkbox/radio state across restarts.

## Build Menu

Edit the [menu definition](https://www.electronjs.org/docs/api/menu#main-process) in `src/menu.js`. Make sure all your menu items have a unique `id`.

For each user action in your app, there should be a corresponding menu item (and shortcut key) where possible. This is one of those details that makes for a great native app.

## Menu Events

Listen for menu events with `this.$evmenu.$on('input')`

```js
// Listen for any menu input
this.$evmenu.$on('input', item => {
  console.log(item);
});

// Listen for input on a specific menu item
this.$evmenu.$on('input:open-file', item => {
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
<dt><a href="#buildUiState">buildUiState(defintion)</a></dt>
<dd><p>Build a key/value object of menu items&#39; state (currently just the <code>checked</code> property).</p>
<p>Later, we&#39;ll use this to restore the state of these menu items on launch.</p>
</dd>
<dt><a href="#applyUiState">applyUiState(definition, [state])</a> ⇒ <code>*</code></dt>
<dd><p>Apply stored state to the menu definition</p>
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
<a name="buildUiState"></a>

#### buildUiState(defintion)
Build a key/value object of menu items' state (currently just the `checked` property).

Later, we'll use this to restore the state of these menu items on launch.

**Kind**: global function  

| Param | Type |
| --- | --- |
| defintion | <code>\*</code> | 

<a name="applyUiState"></a>

#### applyUiState(definition, [state]) ⇒ <code>\*</code>
Apply stored state to the menu definition

**Kind**: global function  
**Returns**: <code>\*</code> - definition  

| Param | Type | Default |
| --- | --- | --- |
| definition | <code>\*</code> |  | 
| [state] | <code>\*</code> | <code>{}</code> | 



### Plugin

<a name="get"></a>

#### get(id) ⇒ <code>MenuItem</code>
Get menu by id

**Kind**: global function  

| Param | Type |
| --- | --- |
| id | <code>String</code> | 

