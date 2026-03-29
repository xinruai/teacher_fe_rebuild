<script setup lang="ts">
// TODO: Full implementation in Phase 5 (account module)
// Stub: displays list of uploaded files

defineProps<{
  fileList: Array<{ name: string; url: string }>
}>()
</script>

<template>
  <div class="file-area">
    <div v-for="(file, index) in fileList" :key="index" class="item">
      <span class="file-name">{{ file.name }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.file-area {
  display: flex;
  flex-wrap: wrap;
  .item {
    margin: 5px 10px 5px 0;
    .file-name {
      color: #3662ec;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 200px;
      display: inline-block;
    }
  }
}
</style>
