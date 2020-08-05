# Electron Vue Window Toolkit

EVWT's goal is to provide components, plugins and other tools to assist in building great Electron/Vue apps.

<img src="https://avatars2.githubusercontent.com/u/69093854?s=400&u=700c335218280e5a3bfd1d88f82bcc8c05714df6&v=4" align="right" height="240">

### Priorities
* Vue-first
  * Do more in Vue, less in background scripts
* Performance
  * Virtualized lists, lazy loading, GPU-accelerated transforms, no CSS reflows
* OS Integration
  * Drap and drop, context menus, window management, native friendly features

### Setup

In any Electron/Vue app:

`yarn add evwt` (or `npm install evwt`)

That's it, now read on for how to use the various parts of EVWT. There's no global setup since each part of EVWT can be used independently.

### Usage

#### Plugins

* [EvMenu](https://github.com/evwt/evwt/blob/master/EvMenu.md)
  - Vue data bindings and events for native menus

* [EvStore](https://github.com/evwt/evwt/blob/master/EvStore.md)
  - Simple persistent data storage, unified across your app

* [EvWindow](https://github.com/evwt/evwt/blob/master/EvWindow.md)
  - Window memory and management

#### Components

##### General

* [EvLayout](https://github.com/evwt/evwt/blob/master/EvLayout.md)
  - A customizable pane-based app layout

* [EvIcon](https://github.com/evwt/evwt/blob/master/EvIcon.md)
  - Easily create and use a library of inline svg icons in your app

##### Undocumented

* [EvVirtualScroll](https://github.com/evwt/evwt/blob/master/EvVirtualScroll.md)
  - A simple virtual scroller for any large lists of items

* [EvToolbar](https://github.com/evwt/evwt/blob/master/EvToolbar.md)
  - A toolbar to place items on

* [EvToolbarItem](https://github.com/evwt/evwt/blob/master/EvToolbarItem.md)
  - Items for your toolbars
