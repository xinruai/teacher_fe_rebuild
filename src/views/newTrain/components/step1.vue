<script setup lang="ts">
import { download } from '@/utils/index'

const link = {
  url: 'https://mcnq2n9i1voi.feishu.cn/slides/Ni9ZsaW7xlSY8idedTdcWFkEn8e?from=from_copylink',
  size: '3.37M',
  name: '教师使用手册（电脑版）.pdf',
}

function openLink(url: string, preview = false) {
  if (preview) {
    window.open(`${url}?response-content-type=application/pdf`)
    return
  }
  download(url, link.name)
}
</script>

<template>
  <div class="step">
    <div class="title">Step2 腾讯会议课堂操作指南</div>
    <div class="file">
      <div>
        <div class="cursor" @click="openLink(link.url, true)">{{ link.name }}</div>
        <div class="size">{{ link.size }}</div>
      </div>
      <el-button link type="primary" @click="openLink(link.url)">下载</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.step { width: 480px; margin: 0 auto; }
.title { font-weight: 700; font-size: 14px; color: #3d3d3d; text-align: center; margin-bottom: 20px; }
.file { border: 1px solid #e3e3e3; border-radius: 6px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; }
.cursor { cursor: pointer; color: #3662ec; }
.size { color: #777; font-size: 12px; margin-top: 6px; }
</style>
