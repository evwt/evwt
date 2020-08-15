# EvContextMenu

Reactive context menus.

## Setup

### Background script

```js
import { EvContextMenu } from 'evwt/background';

EvContextMenu.activate();
```

### Vue

```js
import { EvContextMenu } from 'evwt';

Vue.use(EvContextMenu);
```

## Usage

### Vue

##### Build Menu

Pass a [menu template](https://www.electronjs.org/docs/api/menu#main-process) to `this.$evcontextmenu.build`. Make sure all your menu items have a unique `id`.

<details>
  <summary>Example context menu template</summary>

```js
let template = [
  {
    id: 'item-1',
    label: 'First'
  },
  { type: 'separator' },
  {
    id: 'item-2',
    label: 'Second',
    type: 'checkbox',
    checked: true
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

##### Binding

- Use `this.$evcontextmenu.get(menuId)` to get a context menu
- Use `this.$evcontextmenu.getItem(menuId, itemId)` to get a context menu item

These can then be used for data binding:

```html
<div v-if="$evcontextmenu.get('my-context-menu')">
  <input v-model="$evcontextmenu.getItem('my-context-menu', 'item-1').label">
  <input v-model="$evcontextmenu.getItem('my-context-menu', 'item-2').checked" type="checkbox">
</div>
```

##### Events

Listen for menu events with `this.$evcontextmenu.on('input')`

```js
this.$evcontextmenu.on('input:my-context-menu', item => {
  console.log(item);
});

this.$evcontextmenu.on('input:my-context-menu:item-2', item => {
  console.log(item);
});
```

### Background script

EvMenu events are also accessible in the background script.

```js
win.on('evcontextmenu', item => {
  console.log(item);
});

win.on('evcontextmenu:my-context-menu:item-1', item => {
  console.log(item);
});
```

```js
app.on('evcontextmenu', item => {
  console.log(item);
});

app.on('evcontextmenu:my-context-menu:item-1', item => {
  console.log(item);
});
```

