# EvToolbar

A horizontal container of [toolbar items](/EvToolbarItem).

<img width="397" alt="Screen Shot 2020-08-12 at 11 55 25 PM" src="https://user-images.githubusercontent.com/611996/90095800-53d93c80-dcf7-11ea-86d4-b7a558631432.png">

## Requirements

[EvIcon](/EvIcon) must be set up before using EvToolbar.

## Setup

```js
import { EvToolbar, EvToolbarItem } from 'evwt';

export default {
  components: {
    EvToolbar,
    EvToolbarItem
  }
}
```

## Usage
```vue
  <ev-toolbar>
    <ev-toolbar-item menu-id="new-file" icon="file-plus" label="New" tooltip="New File" />
    <ev-toolbar-item menu-id="open-file" icon="folder-open" label="Open" tooltip="Open File" />
    <ev-toolbar-item menu-id="save-file" icon="save" label="Save" tooltip="Save File" />
  </ev-toolbar>
```