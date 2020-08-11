# EvWindow

## Window State

EvWindow can automatically store BrowserWindow state across restarts, just pass a unique ID into `getStoredOptions`/`startStoringOptions`.

```js
let storedOptions = EvWindow.getStoredOptions('MyWindow', defaultOptions);
let win = new BrowserWindow({ width: 800, height: 600, /* ... */, ...storedOptions });
EvWindow.startStoringOptions(restoreId, win);
```

Currently the automatically saved properties are `width`, `height`, `x` and `y`.

References:
- [BrowserWindow](https://www.electronjs.org/docs/api/browser-window) options


## Window Management

EvWindow can arrange windows on the screen in various ways.

```js
EvWindow.arrange('tile');
```
