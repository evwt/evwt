<template>
  <div class="ev-icon d-inline-flex flex-center flex-middle" :class="`ev-icon-${name}`">
    <component :is="`ev-icon-${name}`" />
  </div>
</template>

<script>
import '../../../style/utilities.scss';

export default {
  props: {
    name: String
  }
};
</script>

<style lang="scss" scoped>
svg {
  width: auto;
  height: 100%;
}
</style>
