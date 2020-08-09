<script>
// @group Components
export default {
  props: {
    iconShow: {
      type: Boolean,
      default: true
    },
    labels: Boolean,
    minWidth: Number,
    height: Number,
    fontSize: Number,
    iconSize: Number,
    padding: Number,
    iconPos: {
      type: String,
      default: 'aside'
    }
  },

  computed: {
    toolbarStyle() {
      if (this.height) {
        return `height: ${this.height}px`;
      }

      return '';
    }
  },

  render(createElement) {
    for (const vnode of this.$slots.default) {
      vnode.componentOptions.propsData = {
        labels: this.labels,
        iconPos: this.iconPos,
        iconSize: this.iconSize,
        fontSize: this.fontSize,
        minWidth: this.minWidth,
        padding: this.padding,
        iconShow: this.iconShow,
        ...vnode.componentOptions.propsData
      };
    }

    let attrs = {
      class: 'ev-toolbar d-flex h-100 flex-middle p-n-xs p-s-xs p-w-xs p-e-xs',
      style: this.toolbarStyle,
      props: {
        iconPos: this.iconPos,
        iconSize: this.iconSize
      }
    };

    return createElement('div', attrs, this.$slots.default);
  }
};
</script>

<style lang="scss" scoped>
@import '@/../style/reset.scss';
@import '@/../style/utilities.scss';

.ev-toolbar {
  user-select: none;
}
</style>

<docs>

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
  <ev-toolbar :icon-size="16" icon-pos="above" :icon-show="true" :labels="true" :min-width="32" :font-size="11" :padding="5">
    <ev-toolbar-item menu-id="new-file" icon="file-plus" label="New" tooltip="New File" />
    <ev-toolbar-item menu-id="open-file" icon="folder-open" label="Open" tooltip="Open File" @click.native="handleOpenFile" />
    <ev-toolbar-item menu-id="save-file" icon="save" label="Save" tooltip="Save File" />
  </ev-toolbar>
```
</docs>
