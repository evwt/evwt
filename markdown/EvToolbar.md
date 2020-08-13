# EvToolbar

A horizontal container of [toolbar items](/EvToolbarItem).

<img width="397" alt="EvToolbar" src="https://user-images.githubusercontent.com/611996/90095800-53d93c80-dcf7-11ea-86d4-b7a558631432.png">

## Requirements

[EvIcon](/EvIcon) and [EvMenu](/EvMenu) must be set up before using EvToolbar.

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
    <ev-toolbar-item menu-id="new-file" icon="file-plus" icon-pos="aside" :label-show="true" :min-width="60" label="New" tooltip="New File" />
    <ev-toolbar-item menu-id="open-file" icon="folder-open" label="Open" tooltip="Open File" />
    <ev-toolbar-item menu-id="save-file" icon="save" label="Save" tooltip="Save File" />
  </ev-toolbar>
```

Creates a toolbar like this:

<img width="169" alt="EvToolbarItem" src="https://user-images.githubusercontent.com/611996/90179446-15816300-dd73-11ea-8f9f-ada722c0c7ba.png">
