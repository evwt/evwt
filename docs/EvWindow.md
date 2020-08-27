# EvWindow

?> 🧠 EvWindow is a smarter BrowserWindow that automatically remembers its size and position.

## Usage

### Create

```js
import { EvWindow } from 'evwt/background';

// Electron BrowserWindow options
// https://www.electronjs.org/docs/api/browser-window#new-browserwindowoptions
let options = {
  width: 800,
  height: 600,
  webPreferences: {
    nodeIntegration: true
  }
};

let restoreId = 'main'; // or a file path, database ID, etc in multiwindow apps
let evWindow = new EvWindow(restoreId, options);
let win = evWindow.browserWindow; // access the browserWindow for the full Electron API
```

A window created in this way will have its size and position remembered across restarts.
> Window state is saved based on the restoreId to evwt-ui-state.json in the [userData](https://www.electronjs.org/docs/api/app#appgetpathname) directory


### Window Management

EvWindow can arrange windows on the screen in various ways. See reference below for all options.

```js
import { EvWindow } from 'evwt/background';

EvWindow.arrange('tile'); // tile, cascade, rows or columns
```



## Reference
### Background

<a name="arrange"></a>

#### arrange(arrangement)
Arranges windows on the screen.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| arrangement | <code>String</code> | `tile`, `cascade`, `rows` or `columns` |



