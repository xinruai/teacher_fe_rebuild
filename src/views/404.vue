<script setup lang="ts">
</script>

<template>
  <div class="error-page">
    <h1>404</h1>
    <p>Page not found</p>
    <router-link to="/">Back to Home</router-link>
  </div>
</template>

<style scoped lang="scss">
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;

  h1 {
    font-size: 80px;
    color: #FF8723;
  }
}
</style>
