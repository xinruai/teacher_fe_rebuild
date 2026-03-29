<script setup lang="ts">
import { ref } from 'vue'
import { doOrderListFlag } from '@/api/modules/order'
import orderItemImg from '@/assets/images/order/order-item.png'
import orderTipImg from '@/assets/images/order/order-tip.png'

const isShow = ref(false)

const closeModal = () => {
  doOrderListFlag()
  isShow.value = false
}

const show = () => {
  isShow.value = true
}

defineExpose({ show })
</script>

<template>
  <el-dialog
    v-model="isShow"
    append-to-body
    lock-scroll
    :close-on-click-modal="false"
    :show-close="false"
  >
    <img class="order-item" :src="orderItemImg" alt="" />
    <img class="tip-img" :src="orderTipImg" alt="" @click="closeModal" />
  </el-dialog>
</template>

<style scoped lang="scss">
:deep(.el-dialog) {
  background: transparent;
  width: 100vw;
}
:deep(.el-dialog__header) {
  display: none;
}
:deep(.el-dialog__body) {
  width: 1280px;
  margin: 0px auto;
  height: 0;
  padding: 0;
}
.order-item {
  width: 1280px;
  position: relative;
  margin-top: 80px;
  height: auto;
}
.tip-img {
  display: block;
  margin: 20px 390px;
  width: 300px;
  height: auto;
  cursor: pointer;
}
</style>
