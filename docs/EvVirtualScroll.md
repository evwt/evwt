# EvVirtualScroll

Display long lists of items without keeping all the components in memory.

## Usage

```vue
<template>
  <ev-virtual-scroll key-field="id" :items="items" :row-height="18">
    <template v-slot="{item}">
      <div>
        {{ item.label }}
      </div>
    </template>
  </ev-virtual-scroll>
</template>

<script>
import { EvVirtualScroll } from 'evwt/components';

export default {
  components: {
    EvVirtualScroll
  },

  data() {
    return {
      items: []
    };
  },

  created() {
    for (let id = 1; id <= 10000; id++) {
      this.items.push({
        id,
        label: `Item # ${id}`
      });
    }
  }
};
</script>
```


## Props

<!-- @vuese:EvVirtualScroll:props:start -->
|Name|Description|Type|Required|Default|
|---|---|---|---|---|
|items|Array of objects with your data|`Array`|`true`|-|
|keyField|Unique identifying field within each item object|`String`|`false`|'id'|
|rowHeight|The height of each item|`Number`|`false`|18|

<!-- @vuese:EvVirtualScroll:props:end -->


## Slots

<!-- @vuese:EvVirtualScroll:slots:start -->
|Name|Description|Default Slot Content|
|---|---|---|
|default|Slot for your item component. Slot scope of `item` available with item properties.|-|

<!-- @vuese:EvVirtualScroll:slots:end -->






