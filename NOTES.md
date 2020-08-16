## Notes

### NiM
This [extension](https://chrome.google.com/webstore/detail/nodejs-v8-inspector-manag/gnhhdgbaldcilmgcpfddgdbkhjohddkj) is really helpful for autmatically relaunching _background_ dev tools during development of apps.

### EvMenu Events

Understanding what EvMenu is doing can be a little tricky because of four event systems involved:
- Electron App events (e.g. app.on('foo')...)
- Electron BrowserWindow events (e.g. win.on('foo')...)
- Electron IPC events (e.g. ipcRenderer.on('foo')...)
- Vue events (e.g. this.$evmenu.$on('foo')...)

Below is a list of all EvMenu events with their types and purpose.

#### BrowserWindow events

* evmenu
  - BrowserWindow event to inform window that a menu item has been changed/activated

* evmenu:\<menuitem-id\>
  - BrowserWindow event for a specific menu item with id

#### App events

App-level events are useful on MacOS when all windows are closed, but you still need to process menu input.

* evmenu
  - App event to inform app that a menu item has been changed/activated

* evmenu:\<menuitem-id\>
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

