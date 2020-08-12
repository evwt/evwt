# EvWindow

## Window State

EvWindow can automatically store BrowserWindow state across restarts, just pass a unique ID into `getStoredOptions`/`startStoringOptions`.

```js
import { EvWindow } from 'evwt/background';

// Get stored options based on unique window ID
let storedOptions = EvWindow.getStoredOptions('MyWindow', defaultOptions);

// Create your window like normal, passing in the stored options
let win = new BrowserWindow({ width: 800, height: 600, /* ... */, ...storedOptions });

// Start saving options on resize/move
EvWindow.startStoringOptions(restoreId, win);
```

Currently the automatically saved properties are `width`, `height`, `x` and `y`.

## Window Management

EvWindow can arrange windows on the screen in various ways. See reference below for all options.

```js
import { EvWindow } from 'evwt/background';

EvWindow.arrange('tile'); // tile, cascade, rows or columns
```
