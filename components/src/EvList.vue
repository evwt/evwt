<template>
  <div class="ev-list ev-list-flush">
    <slot />
  </div>
</template>

<style lang="scss">
.ev-list {
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  user-select: none;

  a {
    text-decoration: none;
    color: inherit;
  }
}

</style>
