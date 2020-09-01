<template>
  <div class="ev-toolbar-overflow-item h-100 d-flex flex-middle m-w-xs" @click="$emit('click')">
    <chevronDoubleRight />
  </div>
</template>

<script>
import chevronDoubleRight from '../../svg/chevron-double-right.svg';

export default {
  name: 'EvToolbarItemOverflow',

  components: {
    chevronDoubleRight
  }
};
</script>

<style lang="scss" scoped>
svg {
  width: 12px;
}
</style>
