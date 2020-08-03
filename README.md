# Electron Vue Window Toolkit

EVWT's goal is to provide components, plugins and other tools to assist in building great Electron/Vue apps.

![evmenu-demo](https://user-images.githubusercontent.com/611996/89112631-2654df00-d42b-11ea-8f7a-eec2c9ab4e83.gif)

### Priorities
* Vue-first
  * Do more in Vue, less in background scripts
* Performance
  * Virtualized lists, lazy loading, GPU-accelerated transforms, no CSS reflows
* OS Integration
  * Drap and drop, context menus, window management, native friendly features

### Setup

`yarn add evwt` (or `npm install evwt`)

If you are using any of the .vue components you should import the css:

```js
import 'evwt/dist/evwt.esm.css';
```

That's it, now read on for how to use the various parts of EVWT.

### Usage

#### Plugins

* [EvMenu](https://github.com/evwt/evwt/blob/master/EvMenu.md)
  - Vue data bindings and events for native menus

* [EvStore](https://github.com/evwt/evwt/blob/master/EvStore.md)
  - Simple unified persistent reactive data storage

* [EvWindow](https://github.com/evwt/evwt/blob/master/EvWindow.md)
  - Window memory and management

#### Components

##### General

* [EvIcon](https://github.com/evwt/evwt/blob/master/EvIcon.md)
  - Easily create and use a library of inline svg icons in your app

* [EvVirtualScroll](https://github.com/evwt/evwt/blob/master/EvVirtualScroll.md)
  - A simple virtual scroller for any large lists of items

##### App Layout

Visual components for creating familiar app layouts.

* [EvWorkbench](https://github.com/evwt/evwt/blob/master/EvWorkbench.md)
  - A familiar pane-based app layout

* [EvToolbar](https://github.com/evwt/evwt/blob/master/EvToolbar.md)
  - A simple toolbar to place items on

* [EvToolbarItem](https://github.com/evwt/evwt/blob/master/EvToolbarItem.md)
  - Items for your toolbars
