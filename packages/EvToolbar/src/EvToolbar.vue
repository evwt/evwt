<template>
  <div class="ev-toolbar d-flex h-100 flex-middle p-xs">
    <slot />
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
@import '@/../style/utilities.scss';

.ev-toolbar {
  user-select: none;
}
</style>
