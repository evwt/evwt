# Electron Vue Window Toolkit

EVWT provides Vue components, plugins and other tools to assist in building great Electron/Vue apps.

<img src="https://avatars2.githubusercontent.com/u/69093854?s=400&u=700c335218280e5a3bfd1d88f82bcc8c05714df6&v=4" align="right" height="220">

### Priorities
* Productivity - Remove boilerplate and focus more on your app, less on Electron <-> Vue IPC wiring.
* Performance - Use virtualized components, lazy loading, GPU-accelerated transforms, and other techniques to achieve a 60fps target.
* Integration - Play nice with host OS with native menus, window management, and OS services.

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

New app:

```bash
npm install -g @vue/cli
vue create my-evwt-app
cd my-evwt-app
vue add electron-builder
npm install evwt
```

Existing Electron/Vue app:

`npm install evwt` (or `yarn add evwt`)

### Usage

#### Plugins

* [EvMenu](https://github.com/evwt/evwt/blob/master/EvMenu.md) - Work with native menus as easily as any Vue component.
* [EvStore](https://github.com/evwt/evwt/blob/master/EvStore.md) - Simple persistent storage in your Vue components.
* [EvWindow](https://github.com/evwt/evwt/blob/master/EvWindow.md) - Smarter windows out of the box.

#### Components

* [EvLayout](https://github.com/evwt/evwt/blob/master/EvLayout.md) - Perfect desktop app layouts.
* [EvToolbar](https://github.com/evwt/evwt/blob/master/EvToolbar.md) - The missing window toolbar component.
* [EvIcon](https://github.com/evwt/evwt/blob/master/EvIcon.md) - Create and use a library of SVG icons.
* [EvVirtualScroll](https://github.com/evwt/evwt/blob/master/EvVirtualScroll.md) - Minimize memory usage for long lists of items.

### Additional docs

* [EVWT CookBook](https://github.com/evwt/evwt/blob/master/CookBook.md)

### Example apps

* [Markdown Editor](https://github.com/evwt/evwt-example-markdown-editor)
