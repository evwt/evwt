<template>
  <div
    :style="childStyle"
    :data-min-size="child.minSize"
    :data-evlayout-name="child.name"
    class="d-grid overflow-hidden h-100 w-100"
    :class="classForChild">
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

  computed: {
    classForChild() {
      if (this.child && this.child.name) {
        return `ev-pane-${this.child.name}`;
      }

      return '';
    },

    childStyle() {
      if (!this.child.sizes || !this.child.sizes.length || !this.child.direction) {
        return;
      }

      let sizes = [];

      for (const childSize of this.child.sizes) {
        if (Array.isArray(childSize)) {
          sizes.push(childSize[0]);
        } else {
          sizes.push(childSize);
        }
        sizes.push('0');
      }
      sizes.pop();

      return `grid-template-${this.child.direction}s: ${sizes.join(' ')}`;
    }
  },

  methods: {
    gutterClass(child, direction) {
      let className = `ev-gutter ev-gutter-${child.name} ev-gutter-${direction}`;

      if (child.resizable === false) {
        className += ' ev-gutter-no-resize';
      }

      return className;
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../../style/reset.scss';
@import '../../style/utilities.scss';
@import '../../style/split-grid.scss';
</style>
