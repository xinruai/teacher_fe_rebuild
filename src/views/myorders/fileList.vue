<script setup lang="ts">
const props = withDefaults(defineProps<{
  fileList?: any[]
  filesName?: string
  disabled?: boolean
  type?: string
  formName?: string
}>(), {
  fileList: () => [],
  filesName: '',
  disabled: false,
  type: '1',
  formName: 'form',
})

const emit = defineEmits<{
  (e: 'deleteFile', index: number): void
}>()

const deleteFile = (_item: any, index: number) => {
  emit('deleteFile', index)
}

const seeFile = (item: any) => {
  const viewable = ['.txt', '.pdf', '.jpg', '.png', '.jpeg']
  const isViewable = viewable.some(ext => item.name?.indexOf(ext) > -1 || item.url?.indexOf(ext) > -1)
  isViewable ? window.open(item.url) : window.open(item.url, '_self')
}
</script>

<template>
  <div>
    <template v-if="fileList.length">
      <div v-for="(item, index) in fileList" :key="index" class="item">
        <span class="file-name" @click="seeFile(item)">{{ item.name }}</span>
        <div class="time">{{ item.createAt }}</div>
        <i
          v-if="!disabled"
          v-loading="item.loading"
          class="el-icon-delete delete-icon"
          @click="deleteFile(item, index)"
        ></i>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-loading-spinner .circular) {
  width: 20px;
  height: 20px;
  margin-top: 0 !important;
}
:deep(.el-loading-spinner) {
  top: 100%;
}
.item {
  width: 892px;
  height: 65px;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #e7e7e7;
  margin: 10px auto;
  padding: 10px 15px;
  position: relative;
}
.file-name {
  line-height: 25px;
  cursor: pointer;
  display: inline-block;
  width: 85%;
  color: #3496fb;
}
.delete-icon {
  color: #3496fb;
  font-size: 20px;
  margin-left: 20px;
  cursor: pointer;
  position: absolute;
  right: 20px;
  top: 10px;
}
.time {
  line-height: 20px;
  color: #666;
}
</style>
