# EvContextMenu

Reactive context menus.

?> 💡 Work with Electron context menus using Vue.

## Build Menu

Pass a [menu template](https://www.electronjs.org/docs/api/menu#main-process) to `this.$evcontextmenu.build`. Make sure all your menu items have a unique `id`.

<details>
  <summary>Example context menu template</summary>

```js
let template = [
  {
    id: 'item-1',
    label: 'Plain'
  },
  { type: 'separator' },
  {
    id: 'checkbox-1',
    label: 'Checkbox',
    type: 'checkbox',
    checked: true
  },
  { type: 'separator' },
  {
    id: 'radio-1',
    label: 'Radio A',
    type: 'radio',
    checked: true
  },
  {
    id: 'radio-2',
    label: 'Radio B',
    type: 'radio',
    // All radio items need a `checked` property,
    // even if false.
    checked: false
  },
  {
    id: 'radio-3',
    label: 'Radio C',
    type: 'radio',
    checked: false
  }
]
```
</details>

```js
this.$evcontextmenu.build({
  id: 'my-context-menu',
  menu: template
});
```

## Show Menu

```vue
<div @contextmenu="$evcontextmenu.show('my-context-menu')">
  Right click me!
</div>
```

## Menu Events

Listen for menu events with `this.$evcontextmenu.on('input:menu-id')`

```js
// Listen for any context menu input
this.$evcontextmenu.on('input:my-context-menu', item => {
  console.log(item);
});

// Listen for specific context menu item input
this.$evcontextmenu.on('input:my-context-menu:checkbox-1', item => {
  console.log(item);
});
```

## Menu Data Binding

- Use `this.$evcontextmenu.get(menuId)` to get a context menu
- Use `this.$evcontextmenu.getItem(menuId, itemId)` to get a context menu item

These can then be used for data binding:

```html
<div v-if="$evcontextmenu.get('my-context-menu')">
  <input v-model="$evcontextmenu.getItem('my-context-menu', 'item-1').label">
  <input v-model="$evcontextmenu.getItem('my-context-menu', 'checkbox-1').checked" type="checkbox">
</div>
```

## Background

EvMenu events are also accessible in the background script.

```js
// Listen for any context menu input in this BrowserWindow
win.on('evcontextmenu', item => {
  console.log(item);
});

// Listen for specific context menu item input in this BrowserWindow
win.on('evcontextmenu:my-context-menu:item-1', item => {
  console.log(item);
});
```

```js
// Listen for any context menu input in this BrowserWindow
app.on('evcontextmenu', item => {
  console.log(item);
});

// Listen for specific context menu item input in this BrowserWindow
app.on('evcontextmenu:my-context-menu:item-1', item => {
  console.log(item);
});
```




## Reference
### Background

<a name="activate"></a>

#### activate()
Activate event handlers for setting/showing menus

**Kind**: global function  


### Plugin

#### Functions

<dl>
<dt><a href="#build">build(menu)</a></dt>
<dd><p>Build context menu from a menu definition</p>
</dd>
<dt><a href="#show">show(id)</a></dt>
<dd><p>Show context menu</p>
</dd>
<dt><a href="#get">get(menuId)</a></dt>
<dd><p>Get context menu</p>
</dd>
<dt><a href="#getItem">getItem(menuId, itemId)</a></dt>
<dd><p>Get context menu item</p>
</dd>
<dt><a href="#on">on(eventName, callback)</a></dt>
<dd><p>Listen to events on the context menu</p>
</dd>
</dl>

<a name="build"></a>

#### build(menu)
Build context menu from a menu definition

**Kind**: global function  

| Param | Type |
| --- | --- |
| menu | <code>Object</code> | 

<a name="show"></a>

#### show(id)
Show context menu

**Kind**: global function  

| Param | Type |
| --- | --- |
| id | <code>String</code> | 

<a name="get"></a>

#### get(menuId)
Get context menu

**Kind**: global function  

| Param | Type |
| --- | --- |
| menuId | <code>String</code> | 

<a name="getItem"></a>

#### getItem(menuId, itemId)
Get context menu item

**Kind**: global function  

| Param | Type |
| --- | --- |
| menuId | <code>String</code> | 
| itemId | <code>String</code> | 

<a name="on"></a>

#### on(eventName, callback)
Listen to events on the context menu

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>String</code> | Event name e.g. `evcontextmenu:my-context-menu:item-1` |
| callback | <code>function</code> | (menuItem) => {} |

