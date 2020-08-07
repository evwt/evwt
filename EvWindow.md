# EvWindow

## Window State

* EvWindow can automatically store BrowserWindow state across restarts.

_**Restoration ID**_  | String
<br>
A unique ID for the window. For single-window apps, this can be anything. For multi-window apps, give each window a unique ID.


```js
// Options from here https://www.electronjs.org/docs/api/browser-window#class-browserwindow
let defaultOptions = { width: 800, height: 600, webPreferences: { nodeIntegration: true } };
// Choose a unique restoration ID for your window
let restoreId = 'MyWindow';
// Get previous values if they exist
let storedOptions = EvWindow.getStoredOptions(restoreId, defaultOptions);
// Create a BrowserWindow like normal, but spreading in the stored options
let win = new BrowserWindow({ ...defaultOptions, ...storedOptions });
// Finally, start saving postion and size for next time!
EvWindow.startStoringOptions(win, restoreId);
```

References:
- [BrowserWindow](https://www.electronjs.org/docs/api/browser-window) options


## Window Management

### Cascase

`EvWindow.arrange.cascade()`

Cascades windows in the center of the screen.

### Tile

`EvWindow.arrange.tile()`

Tiles all windows across the screen.

### Rows

`EvWindow.arrange.rows()`

Places windows into rows.

### Columns

`EvWindow.arrange.columns()`

Places windows into columns.
