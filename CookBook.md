# Cookbook 📒

## Add window management

This is a quick one that assumes EvMenu has been set up already.

Add this to your menu definition:

```js
{
  label: 'Arrange',
  submenu: [
    {
      id: 'arrange-cascade',
      label: 'Cascade'
    },
    {
      id: 'arrange-tile',
      label: 'Tile'
    },
    {
      id: 'arrange-rows',
      label: 'Rows'
    },
    {
      id: 'arrange-columns',
      label: 'Columns'
    }
  ]
}
```

Then add this to your background script:

```js
app.on('evmenu:arrange-cascade', () => {
  EvWindow.arrange('cascade');
});

app.on('evmenu:arrange-tile', () => {
  EvWindow.arrange('tile');
});

app.on('evmenu:arrange-rows', () => {
  EvWindow.arrange('rows');
});

app.on('evmenu:arrange-columns', () => {
  EvWindow.arrange('columns');
});
```

Done. 🎉

---

## Remember window positions

New Electron apps don't remember their window positions out of the box. EVWT provides EVWindow to help with this and some other window management features. Let's add it to our app!

You just need to pick a unique string for the restoration ID. For single-window apps, this can be anything. For multi-window apps, give each window a unique ID.

Now, create your BrowserWindow, adding calls to `getStoredOptions`/`startStoringOptions`
```js
import { EvWindow } from 'evwt/background';

let restoreId = 'MyWindow';
let defaultOptions = { width: 800, height: 600, webPreferences: { nodeIntegration: true } };
let storedOptions = EvWindow.getStoredOptions(restoreId, defaultOptions);

let win = new BrowserWindow({ ...defaultOptions, ...storedOptions });

EvWindow.startStoringOptions(restoreId, win);
```

Now window positions will automatically be saved in your app. 🎉

### Notes

* Window positions are saved to a file `evwt-ui-state.json` in your app's working directory.

---

## Adding a feature

Let's pretend we have an app that edits files, and want to add a save feature. What's the "EVWT way" to do this?

> This recipe assumes [EvMenu](https://evwt.net/#/plugins/EvMenu) setup has been completed.

<!-- ### Plan it

First, note all the places that this functionality can happen

- File -> Save
- Cmd/Ctrl-S
- Click Save Button

You'll notice this pattern often that there's usually

- A menu item
- A keyboard shortcut
- A UI/toolbar button -->

### Name it

Start with a unique name to refer to your feature. How about `save-file` for this one?

### Write it

#### Background script

To save our file, we'll use `fs.writeFileSync` from the nodejs core library, and we'll pass in the filename and bytes.

```js
ipcMain.handle('save-file', async (e, filePath, fileBytes) => {
  fs.writeFileSync(filePath, fileBytes);
});
```

#### Vue

Now we need to invoke that 'save-file' IPC event we just created with the right parameters. We'll do this when a user selects save in the menu, uses a shortcut key, or clicks the toolbar item. This is all handled by EvMenu:

```js
this.$evmenu.on('input:save-file', () => {
  ipcRenderer.invoke('save-file', '/home/me/example.md', '# It Works!');
});
```

#### Menu definition

Just add this to your [EvMenu](https://evwt.net/#/plugins/EvMenu) definition to tie all the pieces together:

```
{
  id: 'save-file',
  accelerator: 'CmdOrCtrl+S',
  label: 'Save'
}
```

### Add it to toolbar

Many commands you'll want in a toolbar too, either an EvToolbar or your own. Just do this anywhere in a component:

```js
this.$evmenu.$emit('input', 'save-file')
```

### Try it

Click File -> Save or try Ctrl/Cmd+S, it should save the file. If you added a toolbar item, give that a try too. That was as easy as it should be. 🎉

### Notes

* You should add error handling around the file saving and invoke calls.
* The IPC events can be named differently than the $evmenu events, I just used 'save-file' for both here for simplicity.

### References

- https://www.electronjs.org/docs/api/ipc-renderer#ipcrendererinvokechannel-args
- https://nodejs.org/api/fs.html#fs_fs_writefilesync_file_data_options
- https://evwt.net/#/plugins/EvMenu
