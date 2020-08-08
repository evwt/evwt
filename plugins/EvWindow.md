# EvWindow

## Window State

EvWindow can automatically store BrowserWindow state across restarts. Just pass a unique ID into `getStoredOptions`/`startStoringOptions`, and EvWindow will take care of the rest.

```js
let storedOptions = EvWindow.getStoredOptions('MyWindow', defaultOptions);
let win = new BrowserWindow({ width: 800, height: 600, ...storedOptions });
EvWindow.startStoringOptions(restoreId, win);
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
