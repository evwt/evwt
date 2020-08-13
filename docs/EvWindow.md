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



## Reference
### Background

#### Functions

<dl>
<dt><a href="#startStoringOptions">startStoringOptions(restoreId, win)</a> ⇒ <code>function</code></dt>
<dd></dd>
<dt><a href="#arrange">arrange(arrangement)</a></dt>
<dd><p>Arranges windows on the screen.</p>
</dd>
<dt><a href="#getStoredOptions">getStoredOptions(restoreId, defaultOptions)</a></dt>
<dd></dd>
</dl>

<a name="startStoringOptions"></a>

#### startStoringOptions(restoreId, win) ⇒ <code>function</code>
**Kind**: global function  
**Returns**: <code>function</code> - Function that saves the window position/size to storage. Use after moving the window manually.  

| Param | Type | Description |
| --- | --- | --- |
| restoreId | <code>String</code> | A unique ID for the window. For single-window apps, this can be anything. For multi-window apps, give each window a unique ID. |
| win | <code>BrowserWindow</code> | https://www.electronjs.org/docs/api/browser-window |

<a name="arrange"></a>

#### arrange(arrangement)
Arranges windows on the screen.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| arrangement | <code>String</code> | `tile`, `cascade`, `rows` or `columns` |

<a name="getStoredOptions"></a>

#### getStoredOptions(restoreId, defaultOptions)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| restoreId | <code>String</code> | A unique ID for the window. For single-window apps, this can be anything. For multi-window apps, give each window a unique ID. |
| defaultOptions | <code>Object</code> | https://www.electronjs.org/docs/api/browser-window#new-browserwindowoptions |



