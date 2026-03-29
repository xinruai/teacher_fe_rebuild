<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  loading?: boolean
  current?: any
}>(), {
  loading: false,
  current: () => ({}),
})

const emit = defineEmits<{
  (e: 'receivOrder'): void
}>()

const isShow = ref(false)

function show() {
  isShow.value = true
}

function closeModal() {
  isShow.value = false
}

function receivOrder() {
  emit('receivOrder')
}

defineExpose({ show, closeModal })
</script>

<template>
  <el-dialog v-model="isShow" width="500px" :close-on-click-modal="false" class="paper-dialog">
    <h3 class="title">确定接单？</h3>
    <div class="first">讲师您好！</div>
    <div class="text">
      接单前，讲师需要完全确认好课程内容、课程时间和学生需求等，严禁<span>接单后又吐单</span>的行为，若出现，讲师将面临收入被扣除的风险。
    </div>
    <div class="desc text">请各位讲师谨慎接单，认真完成每个订单噢～</div>
    <div class="text" v-if="[6].includes(current.borderType)">
      <span>*该订单为包课辅导，接单后将承接其下所有子订单</span>
    </div>
    <div class="btn-box">
      <el-button class="defaultlight-btn" :loading="loading" @click="receivOrder">确定</el-button>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.first {
  font-weight: 700;
}
div {
  line-height: 28px;
  span {
    color: red;
  }
}
div.text {
  margin-top: 15px;
  padding: 0 20px;
}
.defaultlight-btn,
.default-btn {
  height: 30px;
  width: 150px;
  line-height: 8px;
  :deep(span) {
    color: #fff !important;
  }
}
.default-btn {
  :deep(span) {
    color: #ff8723 !important;
  }
}
.defaultlight-btn.el-button.is-disabled {
  background: #c0c4cc !important;
  border: none;
  color: #222 !important;
  :deep(span) {
    color: #222 !important;
  }
}
.btn-box {
  text-align: center;
  margin-top: 30px;
}
</style>
