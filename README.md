# Electron Vue Window Toolkit

EVWT's goal is to provide components, plugins and other tools to assist in building great Electron/Vue apps.

### Priorities
* Performance
  * Virtualized lists, lazy loading, GPU-accelerated transforms, no CSS reflows
* OS Integration
  * Drap and drop, context menus, window management, native friendly

### Setup

`yarn add evwt` or `npm install evwt`

All of the .vue components share some common utility css, which you should import in your vue main.js before getting started.

```js
import 'evwt/dist/evwt.esm.css';
```

That's it, now read on for how to use the various parts of EVWT.

### Components

* [EvMenu](https://github.com/evwt/evwt/blob/master/EvMenu.md)
  - Vue data bindings and events for Electron menus

* [EvIcon](https://github.com/evwt/evwt/blob/master/EvIcon.md)

* [EvToolbar](https://github.com/evwt/evwt/blob/master/EvToolbar.md)

* [EvToolbarItem](https://github.com/evwt/evwt/blob/master/EvToolbarItem.md)

* [EvVirtualScroll](https://github.com/evwt/evwt/blob/master/EvVirtualScroll.md)

* [EvWorkbench](https://github.com/evwt/evwt/blob/master/EvWorkbench.md)



