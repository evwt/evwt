<template>
  <div class="ev-toolbar-item d-flex flex-center flex-middle h-100 p-w-sm p-e-sm" :title="tooltip">
    <ev-icon :name="icon" />
    <label v-if="label" class="p-w-xs">
      {{ label }}
    </label>
  </div>
</template>

<script>
import EvIcon from '../../EvIcon';
import '../../../style/utilities.scss';

export default {
  components: {
    EvIcon
  },

  props: {
    icon: String,
    label: String,
    tooltip: String
  }
};
</script>

<style lang="scss" scoped>
.ev-icon {
  height: 1rem;
}
</style>
