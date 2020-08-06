# Electron Vue Window Toolkit

EVWT's goal is to provide Vue components, plugins and other tools to assist in building great Electron/Vue apps.

<img src="https://avatars2.githubusercontent.com/u/69093854?s=400&u=700c335218280e5a3bfd1d88f82bcc8c05714df6&v=4" align="right" height="240">

### Priorities
* Vue-first
  * Do more in Vue, less in background scripts
* Performance
  * Virtualized lists, lazy loading, GPU-accelerated transforms, 60fps target
* OS Integration
  * Drap and drop, context menus, window management, native friendly features

### Goals 
* Short term
  * Provide components and plugins, get Electron+Vue developers writing their apps quicker ASAP.
  * Get word out about project and try to get some people to try it.
* Medium term
  * Build out more cohesive native-desktop-first UI/component library.
  * Try to find a contributor or co-maintainer.
* Long term
  * Provide a serious alternative to SwiftUI/AppKit, UWP/WPF and Qt/GTK for writing desktop apps.
  * Grow team and documentation at pace with ambitions.

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

* [EvToolbar](https://github.com/evwt/evwt/blob/master/EvToolbar.md)
  - A toolbar to place items on

* [EvIcon](https://github.com/evwt/evwt/blob/master/EvIcon.md)
  - Easily create and use a library of inline svg icons in your app

##### Undocumented

* [EvVirtualScroll](https://github.com/evwt/evwt/blob/master/EvVirtualScroll.md)
  - A simple virtual scroller for any large lists of items
