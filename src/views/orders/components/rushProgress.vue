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
  <div>
    <el-dialog
      v-model="isShow"
      title="报名进度"
      width="520px"
      :show-close="false"
    >
      <template #header>
        <div class="dialog-title">
          <p>报名进度</p>
        </div>
      </template>
      <div class="content">
        <p>师资运营审核中，预计12H内审核完成</p>
        <p>讲师可直接联系运营加速匹配</p>
      </div>
      <div class="footer">
        <el-button type="primary" @click="closeModal">我知道了</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.content {
  padding: 20px 14px;
}
.footer {
  text-align: right;
}
.dialog-title {
  p:first-child {
    font-weight: 700;
    font-size: 18px;
    margin-bottom: 4px;
  }
}
:deep(.el-dialog) {
  border-radius: 10px;
  .el-dialog__header {
    padding: 30px 70px 0px;
  }
  .el-dialog__body {
    padding: 0px 70px 40px 70px;
  }
  .el-button--primary {
    background: #ff8723 !important;
    border: none;
    span {
      color: #fff;
    }
  }
}
</style>
