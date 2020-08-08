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

EvWindow can arrange windows on the screen in various ways. Call it like this:

```js
EvWindow.arrange('cascade');
```
## Reference

### Functions

<dl>
<dt><a href="#startStoringOptions">startStoringOptions(restoreId, win)</a></dt>
<dd></dd>
<dt><a href="#arrange">arrange(arrangement)</a></dt>
<dd><p>Arranges windows on the screen.</p>
</dd>
<dt><a href="#getStoredOptions">getStoredOptions(restoreId, defaultOptions)</a></dt>
<dd></dd>
</dl>

<a name="startStoringOptions"></a>

### startStoringOptions(restoreId, win)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| restoreId | <code>String</code> | A unique ID for the window. For single-window apps, this can be anything. For multi-window apps, give each window a unique ID. |
| win | <code>BrowserWindow</code> | https://www.electronjs.org/docs/api/browser-window |

<a name="arrange"></a>

### arrange(arrangement)
Arranges windows on the screen.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| arrangement | <code>String</code> | `tile`, `cascade`, `rows` or `columns` |

<a name="getStoredOptions"></a>

### getStoredOptions(restoreId, defaultOptions)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| restoreId | <code>String</code> | A unique ID for the window. For single-window apps, this can be anything. For multi-window apps, give each window a unique ID. |
| defaultOptions | <code>Object</code> | https://www.electronjs.org/docs/api/browser-window#new-browserwindowoptions |

