# EvMenu

Vue data bindings and events for Electron menus

![evmenu-demo](https://user-images.githubusercontent.com/611996/89112631-2654df00-d42b-11ea-8f7a-eec2c9ab4e83.gif)

- Adds `this.$evmenu` so you can use familiar Vue bindings to update the window menu as you would any Vue component.
- Creates a unified event system to respond to menu input in background or renderer, or both.

## Setup

#### Background script

```js
import { EvMenu } from 'evwt';

EvMenu.activate(win); // win should be a BrowserWindow instance
```

#### Vue

Pass a [menu template](https://www.electronjs.org/docs/api/menu#main-process) to Vue.use. Make sure all your menu entries have a unique `id`.

```js
import { EvMenu } from 'evwt';

Vue.use(EvMenu, template);
```

## Usage

#### Background script

```js
win.on('evmenu:win:input', item => {
  console.log(`${item.id} clicked`);
  // if menuItem is a radio/checkbox, item.checked will have its value
});

// or item-specific listener
win.on('evmenu:win:input:open-file', checked => {
  console.log('open-file clicked');
});
```

```js
app.on('evmenu:app:input', item => {
  console.log(`${item.id} clicked`);
  // if menuItem is a radio/checkbox, item.checked will have its value
});

// or item-specific listener
app.on('evmenu:app:input:open-file', checked => {
  console.log('open-file clicked');
});
```

#### Vue

EvMenu introduces a new instance variable `this.$evmenu` that represents the application menu.

##### Data Binding

* Use `this.$evmenu.menu` in components for data binding.

```html
<!-- Changes menu item label as you type -->
<input v-model="$evmenu.menu[1].label">

<!-- Bind to checkbox -->
<input v-model="$evmenu.menu[3].submenu.find(m => m.id === 'show-activity-bar').checked" type="checkbox">
```

> These are minimal examples, you would probably want to use computed properties or methods to more easily reference your submenus.

##### Events

* Listen for menu events with `this.$evmenu.$on('input')`

```js
this.$evmenu.$on('input', item => {
  console.log(`${item.id} clicked`);
  // if menuItem is a radio/checkbox, item.checked will have its value
});

// or item-specific listener
this.$evmenu.$on('input:open-file', checked => {
  console.log('open-file clicked');
});
```

* Send menu commands with `this.$evmenu.$emit`
  * Ideally, all user commands/actions in your app will be available in the menus.
  * Triggering these actions via $evmenu events allows you to handle all events in the same place whether they come from menu clicks, keyboard shortcuts or your UI.

```js
this.$evmenu.$emit('click', 'open-file');
```

## Development

**This information isn't required to use EvMenu, but might be useful if you are forking or doing development on EvMenu.**

Understanding what EvMenu is doing can be a little tricky because of four event systems involved:
- Electron App events (e.g. app.on('foo')...)
- Electron BrowserWindow events (e.g. win.on('foo')...)
- Electron IPC events (e.g. ipcRenderer.on('foo')...)
- Vue events (e.g. this.$evmenu.$on('foo')...)

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

* evmenu:ipc:click
  - Shuttles click command from the renderer (Vue event) to BrowserWindow/Win events

* evmenu:ipc:input
  - IPC event to inform renderer that a menu item has been changed/activated