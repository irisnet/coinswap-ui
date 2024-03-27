<template>
  <div class="loading_container">
    <div style="text-align: center">
      <div class="sk-swing">
        <div class="sk-swing-dot"></div>
        <div class="sk-swing-dot"></div>
      </div>
    </div>
  </div>

</template>

<script>
export default {
  name: "LoadingComponent"
}
</script>

<style scoped lang="scss">
.loading_container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 1.5rem;
  height: 100%;

  .sk-swing {
    margin: 0;

    .sk-swing-dot {
      background-color: var(--btnColor);
    }
  }
}
</style>