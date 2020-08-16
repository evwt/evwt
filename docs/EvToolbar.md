# EvToolbar

A horizontal container of [toolbar items](/EvToolbarItem).

<img width="397" alt="EvToolbar" src="https://user-images.githubusercontent.com/611996/90095800-53d93c80-dcf7-11ea-86d4-b7a558631432.png">

## Requirements

[EvIcon](/EvIcon) and [EvMenu](/EvMenu) must be set up before using EvToolbar.

## Setup

```js
import { EvToolbar, EvToolbarItem } from 'evwt/components';

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



## Props

<!-- @vuese:EvToolbar:props:start -->
|Name|Description|Type|Required|Default|
|---|---|---|---|---|
|iconShow|Whether to display icons for items by default|`Boolean`|`false`|true|
|iconSize|Default size of the icons in px|`Number`|`false`|16|
|iconPos|Default position of icon in relation to the label|`'above'`/`'aside'`|`false`|above|
|labelShow|Whether to display labels for items by default|`Boolean`|`false`|false|
|fontSize|Default font size of the labels in px|`Number`|`false`|11|
|padding|Default padding within the items in px|`Number`|`false`|3|
|minWidth|Default minimum width of items|`Number`|`false`|44|
|height|Height of the toolbar in px|`Number`|`false`|-|

<!-- @vuese:EvToolbar:props:end -->






