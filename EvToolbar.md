# EvToolbar

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
  <ev-toolbar :icon-size="16" icon-pos="above" :icon-show="true" :labels="true" :min-width="32" :font-size="11" padding="xs">
    <ev-toolbar-item icon="file-plus" label="New" tooltip="New File" />
    <ev-toolbar-item icon="folder-open" label="Open" tooltip="Open File" @click.native="handleOpenFile" />
    <ev-toolbar-item icon="save" label="Save" tooltip="Save File" />
  </ev-toolbar>
```
