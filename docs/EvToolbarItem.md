# EvToolbarItem

An item on a toolbar.

<img width="54" alt="EvToolbarItem" src="https://user-images.githubusercontent.com/611996/90172898-40ff5000-dd69-11ea-9772-419a94ce56e0.png">

## Usage
```vue
<ev-toolbar>
  <ev-toolbar-item menu-id="open-file" icon="folder-open" />
</ev-toolbar>
```


## Props

<!-- @vuese:EvToolbarItem:props:start -->
|Name|Description|Type|Required|Default|
|---|---|---|---|---|
|icon|Name of EvIcon to use for the icon|`String`|`false`|-|
|label|Text to show above/aside icon|`String`|`false`|-|
|tooltip|Text to display when hovering over item|`String`|`false`|-|
|disabled|Whether the item is disabled and cannot receive clicks|`Boolean`|`false`|-|
|menuId|A menu item id to trigger when the item is clicked|`String`|`false`|-|
|iconPos|Position of icon in relation to the label|`'above'`/`'aside'`|`false`|'above'|
|fontSize|Font size of the label in px|`Number`|`false`|11|
|iconSize|Size of the icon in px|`Number`|`false`|16|
|labelShow|Whether to display label|`Boolean`|`false`|false|
|iconShow|Whether to display an icon|`Boolean`|`false`|true|
|minWidth|Minimum width of item|`Number`|`false`|44|
|padding|Padding within the item in px|`Number`|`false`|3|

<!-- @vuese:EvToolbarItem:props:end -->


## Events

<!-- @vuese:EvToolbarItem:events:start -->
|Event Name|Description|Parameters|
|---|---|---|
|click|-|-|

<!-- @vuese:EvToolbarItem:events:end -->






