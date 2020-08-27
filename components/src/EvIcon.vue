<template>
  <div class="ev-icon" :class="`ev-icon-${name}`">
    <component :is="`ev-icon-${name}`" />
  </div>
</template>

<script>
export default {
  name: 'EvIcon',

  props: {
    // The filename of the icon without the .svg extension
    name: {
      type: String,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../../style/reset.scss';
@import '../../style/utilities.scss';

svg {
  width: auto;
  height: 100%;
}
</style>
