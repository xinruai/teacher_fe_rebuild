<script setup lang="ts">
import { ref } from 'vue'

const isShow = ref(false)

const exampleList = [
  {
    label: '正式介绍型',
    desc: '我是金融课程的 Mandy 老师，拥有多年相关教学经验，擅长帮助学生理解核心概念并顺利通过课程考核。',
  },
  {
    label: '幽默风趣型',
    desc: '同学你好，我是 Peng 老师，擅长心理学和教育学，我的课堂风格轻松有趣，帮助你高效掌握知识点。',
  },
  {
    label: '梦想激励型',
    desc: '同学你好，我是 Chris，擅长理工和工程相关科目。学习是一种力量，让我们共同努力实现目标。',
  },
]

function show() {
  isShow.value = true
}

defineExpose({ show })
</script>

<template>
  <el-dialog v-model="isShow" width="900px" title="自我介绍参考示例">
    <div v-for="(item, index) in exampleList" :key="index" class="item">
      <div class="title-text">{{ item.label }}</div>
      <div class="desc">{{ item.desc }}</div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.item { margin-bottom: 18px; }
.title-text { font-size: 16px; font-weight: 700; color: #333; margin-bottom: 8px; }
.desc { color: #333; line-height: 26px; }
</style>
