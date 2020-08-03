<template>
  <div class="ev-toolbar d-flex h-100 flex-middle p-xs">
    <slot />
  </div>
</template>

<script>
import '../../../style/utilities.scss';

export default {};
</script>

<style lang="scss" scoped>
.ev-toolbar {
  user-select: none;
}
</style>
