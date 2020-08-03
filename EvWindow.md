# EvWindow

Window memory and management for Electron BrowserWindows

## Setup

```js
import { EvWindow } from 'evwt';
import Store from 'electron-store';

let store = new Store();
let evWindow = new EvWindow(options, 'main', store);
let win = evWindow.win; // BrowserWindow reference
```

- `options` - [BrowserWindow](https://www.electronjs.org/docs/api/browser-window) options
- `id` - a unique string id for the window, for saving/loading window positions
- `store` - the electron-store instance to use for saving window positions


## Usage

### Window Memory

* EvWindow will create the BrowserWindow and automatically size/position it from storage.
* When a window is dragged or resized it is automatically saved to the store.

### Window Management

#### Collection
EvWindow provides a collection of windows in a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).

```js
typeof EvWindow.windows // Map
typeof EvWindow.windows.get('main') // EvWindow
typeof EvWindow.windows.get('main').win // BrowserWindow
```

As windows are created and destroyed, they are automatically added and removed from this collection. Use this to find your windows by id in a multi-window application.

#### Arranging Windows

##### Cascading

`EvWindow.arrange.cascade()`

Cascades windows in the center of the screen.

##### Tiling

`EvWindow.arrange.tile()`

Tiles all windows across the screen.

##### Rows

`EvWindow.arrange.rows()`

Places windows into rows.

##### Columns

`EvWindow.arrange.columns()`

Places windows into columns.
