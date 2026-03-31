<script setup lang="ts">
import { ref } from 'vue'

const isShow = ref(false)

function show() {
  isShow.value = true
}

function closeModal() {
  isShow.value = false
}

defineExpose({ show, closeModal })
</script>

<template>
  <el-dialog v-model="isShow" width="406px" title="温馨提示" class="qyweixin-dialog">
    <div class="content">检测到您还未激活企业微信，请先关注企业微信插件并激活。</div>
    <div class="footer">
      <el-button @click="closeModal" class="confirm-btn">确定</el-button>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.content { line-height: 25px; }
.footer { text-align: center; margin-top: 20px; }
.confirm-btn { background: #17d1d6; border: none; height: 36px; border-radius: 30px; width: 117px; color: #fff; font-weight: 700; }
</style>
