<template>
  <div class="ev-icon d-inline-flex flex-center flex-middle" :class="`ev-icon-${name}`">
    <component :is="`ev-icon-${name}`" />
  </div>
</template>

<script>
export default {
  props: {
    name: String
  }
};
</script>

<style lang="scss" scoped>
@import '@/../style/utilities.scss';

svg {
  width: auto;
  height: 100%;
}
</style>
