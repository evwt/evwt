# Cookbook

## Adding a feature to your app

Let's pretend we have an app that edits files, and want to add a save feature. What's the "EVWT way" to do this?

> This recipe assumes [EvMenu](https://github.com/evwt/evwt/blob/master/EvMenu.md) has been added to your app.

### Plan it

First, note all the places that this functionality can happen

- File -> Save
- Cmd/Ctrl-S
- Click Save Button

You'll notice this pattern often that there's usually

- A menu item
- A keyboard shortcut
- A UI/toolbar button

Next, consider: is this functionality scoped to the individual window, or the entire app? In our case, the save command is specific to the document in the current window. App scoped commands work a little different and aren't covered here.

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
this.$evmenu.$on('input:save-file', () => {
  ipcRenderer.invoke('save-file', '/home/me/example.md', '# It Works!');
});
```

#### Menu definition

Just add this to your [EvMenu](https://github.com/evwt/evwt/blob/master/EvMenu.md) definition to tie all the pieces together:

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

* You should add error handling around the file saving and invoke calls. The invoke call returns a promise, so will throw an error if something goes wrong.
* The IPC events can be named differently that the $evmenu events, I just used 'save-file' for both here for simplicity.

### References

- https://www.electronjs.org/docs/api/ipc-renderer#ipcrendererinvokechannel-args
- https://nodejs.org/api/fs.html#fs_fs_writefilesync_file_data_options
- https://github.com/evwt/evwt/blob/master/EvMenu.md
