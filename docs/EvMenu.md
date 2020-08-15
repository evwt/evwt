# EvMenu

Reactive native menus.

![evmenu-demo](https://user-images.githubusercontent.com/611996/89112631-2654df00-d42b-11ea-8f7a-eec2c9ab4e83.gif)

## Setup

### Background script

```js
import { EvMenu } from 'evwt/background';

EvMenu.activate();
```

After creating a window:

```js
EvMenu.attach(win);
```

### Vue

Pass a [menu template](https://www.electronjs.org/docs/api/menu#main-process) to Vue.use. Make sure all your menu items have a unique `id`.

<details>
  <summary>Example menu template</summary>

  ```js
const isMac = process.platform === 'darwin';

const menu = [
  {
    label: 'File',
    id: 'file',
    submenu: [
      {
        id: 'open-file',
        label: 'Open...'
      },
      { role: 'quit' }
    ]
  },
  {
    label: 'View',
    id: 'view',
    submenu: [
      {
        id: 'show-preview',
        label: 'Show Preview',
        type: 'checkbox',
        checked: true
      }
    ]
  }
];

if (isMac) {
  menu.unshift({ role: 'appMenu' });
}

export default menu;
  ```
</details>

```js
import { EvMenu } from 'evwt';

Vue.use(EvMenu, template);
```

## Usage

### Vue

##### Binding

Use `this.$evmenu.get(id)` to get a menu item. This can then be used for data binding:

```html
<input v-model="$evmenu.get('file').label">
<input v-model="$evmenu.get('show-preview').checked" type="checkbox">
```

> You can also access the entire menu with `this.$evmenu.menu`.

##### Events

Listen for menu events with `this.$evmenu.$on('input')`

```js
this.$evmenu.$on('input', item => {
  console.log(item);
});

this.$evmenu.$on('input:open-file', item => {
  console.log(item);
});
```

Send native menu commands with `this.$evmenu.$emit`

```js
this.$evmenu.$emit('click', 'open-file');
```

### Background script

EvMenu events are also accessible in the background script.

```js
win.on('evmenu', item => {
  console.log(item);
});

win.on('evmenu:open-file', item => {
  console.log(item);
});
```

```js
app.on('evmenu', item => {
  console.log(item);
});

app.on('evmenu:open-file', item => {
  console.log(item);
});
```




## Reference
### Background

#### Functions

<dl>
<dt><a href="#attach">attach(win)</a></dt>
<dd></dd>
<dt><a href="#activate">activate()</a></dt>
<dd></dd>
</dl>

<a name="attach"></a>

#### attach(win)
**Kind**: global function  

| Param | Type |
| --- | --- |
| win | <code>BrowserWindow</code> | 

<a name="activate"></a>

#### activate()
**Kind**: global function  


### Plugin

<a name="get"></a>

#### get(id) ⇒ <code>MenuItem</code>
Get menu by id

**Kind**: global function  

| Param | Type |
| --- | --- |
| id | <code>String</code> | 

