# EvMenu
Vue data bindings and events for Electron menus

- EvMenu bridges application menus across the background and renderer/Vue processes.
- Adds `this.$menu` so you can use familiar Vue bindings to update the window menu as you would any Vue component.
- Creates a unified event system to respond to menu input in background or renderer, or both.

## Usage

#### Background script

##### Setup
```js
import EvMenu from 'EvMenu';

// win should be a BrowserWindow instance
EvMenu.activate(win);
```

##### Events

```js
win.on('evmenu:win:input', item => {
  console.log('menuItem changed:', item);
});

// or item-specific listener
win.on('evmenu:win:input:open-file', item => {
  console.log('menuItem with id "open-file" changed:', item);
});
```

#### Vue

##### Setup

Pass a [menu template](https://www.electronjs.org/docs/api/menu#main-process) to Vue.use. Make sure all your menu entries have a unique `id`.

```js
Vue.use(EvMenu, template);
```

##### this.$menu

* Listen for menu events with this.$menu.$on('input')
* Use this.$menu.menu in components to reactively update the window menu.

```html
<!-- Changes menu item label as you type -->
<input v-model="$menu[1].label">

<!-- Bind to checkbox -->
<input v-model="$menu[3].submenu.find(m => m.id === 'show-activity-bar').checked" type="checkbox">
```

Note: these are minimal examples, you would probably want to use computed properties or methods to more easily reference your submenus.

##### Events
```js
this.$menu.$on('input', item => {
  console.log('menuItem changed:', item);
});

// or item-specific listener
this.$menu.$on('input:open-file', item => {
  console.log('menuItem with id "open-file" changed:', item);
});
```

## Development

**This information isn't required to use EvMenu, but might be useful if you are forking or doing development on EvMenu.**

Understanding what EvMenu is doing can be a little tricky because of four event systems involved:
- Electron App events (e.g. app.on('foo')...)
- Electron BrowserWindow events (e.g. win.on('foo')...)
- Electron IPC events (e.g. ipcRenderer.on('foo')...)
- Vue events (e.g. this.$menu.$on('foo')...)

Below is a list of all EvMenu events with their types and purpose.

### Events List

#### BrowserWindow events

* evmenu:win:input
  - BrowserWindow event to inform background process that a menu item has been changed/activated

* evmenu:win:input:\<menuitem-id\>
  - BrowserWindow event for a specific menu item with id

#### App events

Useful on MacOS when all windows are closed, but you still need to process menu input.

* evmenu:app:input
  - App event to inform background process that a menu item has been changed/activated

* evmenu:app:input:\<menuitem-id\>
  - App event for a specific menu item with id

#### Vue events

* input
  - Vue event when a menu item is changed/activated

* input:\<menuitem-id\>
  - Vue event for a specific menu item with id

#### IPC events

These are internal to EvMenu to link things together, you'll probably not want to hook into these events.

* evmenu:ipc:set
  - To set the window menu from the renderer

* evmenu:ipc:input
  - IPC event to inform renderer that a menu item has been changed/activated
