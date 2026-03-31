<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  videoList: Record<string, any>[]
}>(), {
  videoList: () => [],
})

const emit = defineEmits<{
  showVideoFun: [video: Record<string, any>]
  showQuestionFun: [question: Record<string, any>]
}>()

const list = computed(() => props.videoList || [])

function showVideo(item: any) {
  emit('showVideoFun', {
    id: item.id,
    url: item.videoUrl || item.url,
    name: item.name || item.stepName || '培训视频',
  })
}

function showQuestion(item: any) {
  emit('showQuestionFun', {
    id: item.id,
    type: item.type,
    name: item.name || item.stepName || '测验',
  })
}
</script>

<template>
  <div class="video-item-wrap">
    <div class="item" v-for="item in list" :key="item.id || item.type">
      <div class="left">
        <div class="name">{{ item.stepName || item.name || '学习项' }}</div>
        <div class="desc">状态：{{ item.status == 2 ? '已完成' : item.status == 4 ? '跳过' : '待完成' }}</div>
      </div>
      <div class="right">
        <el-button size="small" @click="showVideo(item)">观看</el-button>
        <el-button size="small" type="primary" @click="showQuestion(item)">答题</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.video-item-wrap { border: 1px solid #ececec; border-radius: 8px; padding: 12px; }
.item { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #eee; padding: 10px 0; }
.item:last-child { border-bottom: none; }
.name { font-weight: 600; margin-bottom: 6px; }
.desc { color: #808080; font-size: 12px; }
</style>
