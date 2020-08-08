# EvDropZone

Simplest possible file drop component with a non-intrusive customizable overlay.

## Props

<!-- @vuese:EvDropZone:props:start -->
|Name|Description|Type|Required|Default|
|---|---|---|---|---|
|radius|Border radius of overlay|`Number`|`false`|10|
|stroke|Color of overlay border|`String`|`false`|#ccc|
|strokeWidth|Width of overlay border|`Number`|`false`|10|
|strokeDashArray|Dash array spacing|`String`|`false`|10, 20|
|strokeDashOffset|Dash offset|`Number`|`false`|35|

<!-- @vuese:EvDropZone:props:end -->


## Events

<!-- @vuese:EvDropZone:events:start -->
|Event Name|Description|Parameters|
|---|---|---|
|drop|Emits array of Files when one or more files are dropped|Array of https://developer.mozilla.org/en-US/docs/Web/API/File|

<!-- @vuese:EvDropZone:events:end -->


## Slots

<!-- @vuese:EvDropZone:slots:start -->
|Name|Description|Default Slot Content|
|---|---|---|
|default|Component to wrap|-|

<!-- @vuese:EvDropZone:slots:end -->



