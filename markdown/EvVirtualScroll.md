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
import { EvVirtualScroll } from 'evwt';

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