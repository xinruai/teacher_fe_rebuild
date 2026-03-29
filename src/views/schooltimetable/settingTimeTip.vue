<script setup lang="ts">
import { ElNotification } from 'element-plus'
import { seeSettingTime as seeSettingTimeApi } from '@/api/modules/persondetail'
import timesettingImg from '@/assets/images/card/timesetting.png'
import tipImg from '@/assets/images/card/tip.png'

defineProps<{
  isShow: boolean
}>()

const emit = defineEmits<{
  'update:isShowTip': []
}>()

function closeModal() {
  emit('update:isShowTip')
  markSeen()
}

async function markSeen() {
  const res: any = await seeSettingTimeApi()
  if (res.status != 200) {
    ElNotification.error(res.msg)
  }
}
</script>

<template>
  <div>
    <el-dialog
      :model-value="isShow"
      width="500px"
      :before-close="closeModal"
      :close-on-click-modal="false"
      class="tip-dialog"
    >
      <img :src="timesettingImg" alt="" />
      <h3>时间设置</h3>
      <div>
        请前往课堂表设置您最近是否有空余时间处理订单，最多设置30天
      </div>
      <div>设置后您可以从更多订单中选择您所要接的订单</div>
      <img :src="tipImg" alt="" />
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.tip-dialog {
  :deep(.el-dialog__header) {
    padding: 0;
  }
  text-align: center;
  img {
    &:nth-of-type(1) {
      width: 66px;
      height: 66px;
    }
    &:nth-of-type(2) {
      width: 410px;
      height: auto;
      margin-top: 10px;
    }
  }
  h3 {
    font-size: 18px;
    line-height: 36px;
    margin-top: 10px;
  }
  div {
    font-size: 13px;
    line-height: 26px;
    &:nth-of-type(2) {
      color: #ff001d;
    }
  }
}
</style>
