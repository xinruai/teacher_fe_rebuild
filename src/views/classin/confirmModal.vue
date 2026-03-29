<script setup lang="ts">
import { ref } from 'vue'

const isShow = ref(false)
const emit = defineEmits<{
  comeInClass: []
}>()

function show() {
  isShow.value = true
}

function comeInClass() {
  emit('comeInClass')
  isShow.value = false
}

defineExpose({ show })
</script>

<template>
  <el-dialog v-model="isShow" width="480px" class="paper-dialog" :append-to-body="true">
    <h3 class="title">进入正式课堂</h3>
    <div class="content">
      <div>请在确认下课后再点击顶部【下课】/【End】按钮</div>
      <div>否则点击【下课】/【End】后将<span>无法再次打开</span>课堂</div>
    </div>
    <el-button class="btn" @click="comeInClass">打开课堂</el-button>
  </el-dialog>
</template>

<style scoped lang="scss">
.content {
  text-align: center;

  span {
    color: red;
  }
}

:deep(.btn) {
  width: 150px;
  height: 40px;
  background: linear-gradient(320deg, #ffd666 0%, #f65f20 100%);
  border-radius: 21px;
  border: none;
  margin: 30px auto 0;
  display: block;

  span {
    color: #fff;
  }
}
</style>
