<template>
  <div class="ev-list-item" :class="liClass">
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    active: Boolean,
    disabled: Boolean
  },

  computed: {
    liClass() {
      return {
        active: this.active,
        disabled: this.disabled
      };
    }
  }
};
</script>

<style lang="scss">
.ev-list-item {
  display: block;
  padding: 4px 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &.disabled,
  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  &:hover {
    background-color: var(--color-gray-95);
  }

  &.active,
  &:active {
    background-color: var(--color-gray-90);
  }
}

.ev-list-flush {
  .ev-list-item {
    border: 0;

    &:last-child {
      border-bottom: 0;
    }
  }
}
</style>
