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
      title="抢单失败"
      width="520px"
      :show-close="false"
      :close-on-click-modal="false"
      append-to-body
    >
      <div class="content">
        <img src="@/assets/images/order/wanle.png" alt="" />
        手慢了，订单已经被抢走了
      </div>
      <div class="footer">
        <el-button type="primary" @click="closeModal" size="small">我知道了</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.content {
  color: #3d3d3d;
  text-align: center;
  padding: 42px 0;
  img {
    height: 100px;
    vertical-align: middle;
    margin-right: 31px;
  }
}
.footer {
  margin-top: 42px;
  text-align: right;
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
