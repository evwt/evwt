<template>
  <div
    :style="childStyle(child)"
    :data-min-size="child.minSize"
    class="d-grid overflow-hidden h-100 w-100"
    :class="`ev-pane-${child.name}`">
    <div v-if="!child.panes" class="ev-layout-pane h-100 w-100 overflow-auto">
      <slot :name="child.name" class="overflow-auto" />
    </div>

    <template v-for="(grandChild, idx) in child.panes">
      <ev-layout-child
        :key="grandChild.name"
        :child="grandChild">
        <slot v-for="(_, name) in $slots" :slot="name" :name="name" />
        <template v-for="(_, name) in $scopedSlots" :slot="name" slot-scope="slotData">
          <slot :name="name" v-bind="slotData" />
        </template>
      </ev-layout-child>

      <div
        v-if="child.panes[idx + 1]"
        :key="grandChild.name + 'gutter'"
        :class="gutterClass(grandChild, child.direction)" />
    </template>
  </div>
</template>

<script>
export default {
  name: 'EvLayoutChild',

  props: {
    child: Object
  },

  methods: {
    gutterClass(child, direction) {
      let className = `ev-gutter ev-gutter-${child.name} ev-gutter-${direction}`;

      if (child.resizable === false) {
        className += ' ev-gutter-no-resize';
      }

      return className;
    },

    childStyle(child) {
      if (!child.sizes || !child.sizes.length || !child.direction) {
        return;
      }

      let sizes = child.sizes.map(s => [s, 0]).flat();
      sizes.pop();

      return `grid-template-${child.direction}s: ${sizes.join(' ')}`;
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/../style/reset.scss';
@import '@/../style/utilities.scss';
@import '@/../style/split-grid.scss';
</style>
