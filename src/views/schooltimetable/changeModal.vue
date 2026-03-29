<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { changeTimeSwitch } from '@/api/modules/classtable'
import hasbtnImg from '@/assets/images/card/hasbtn.png'
import nobtnImg from '@/assets/images/card/nobtn.png'

const props = defineProps<{
  dateType: number
  dayIndex: number
  today: string
  dayData: any[]
  firstTime: number
}>()

const emit = defineEmits<{
  closeModal: []
  getdayCardList: []
  getTableList: [type: number, time: number]
  changeSwitch: [obj: any, index: number, type: number, flag: number]
}>()

const loading1 = ref(false)
const loading2 = ref(false)

const positionLeft = computed(() => {
  if (props.dateType) {
    return props.dayIndex === 5
      ? 10 + props.dayIndex * 13 + '%'
      : 8 + props.dayIndex * 13 + '%'
  }
  return '220px'
})

watch(() => props.dateType, (val) => {
  // no-op, matches original
})

function closeModal() {
  emit('closeModal')
  loading1.value = false
  loading2.value = false
}

async function confirm(type: number) {
  if (type === 1) loading1.value = true
  else loading2.value = true

  const res: any = await changeTimeSwitch({
    timeState: type,
    id: props.dayData[props.dayIndex].teacScheduleVo.id,
  })
  if (res.status === 200) {
    closeModal()
    emit('changeSwitch', props.dayData[props.dayIndex], props.dayIndex, type, props.dateType)
  }
}
</script>

<template>
  <div
    class="box-content"
    :style="{ left: positionLeft, height: dateType ? '105px' : '125px' }"
  >
    <i class="el-icon-close close" @click="closeModal"></i>
    <div class="desc">
      <div class="date" v-if="!dateType">{{ today }}</div>
      请设置您当日是否有空余时间处理订单，长期未设置会影响您接单
    </div>
    <div class="btn-box">
      <el-button :loading="loading1">
        <img
          :src="hasbtnImg"
          alt=""
          @click="confirm(1)"
        />
      </el-button>
      <el-button :loading="loading2">
        <img
          :src="nobtnImg"
          alt=""
          @click="confirm(2)"
        />
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.box-content {
  position: fixed;
  width: 200px;
  height: 125px;
  top: 200px;
  background: #fff;
  box-shadow: 0px 2px 12px 0px rgba(35, 35, 55, 0.24);
  left: 12%;
  padding: 10px;
  border-radius: 3px;
  .close {
    position: absolute;
    top: 5px;
    right: 5px;
  }
  .desc {
    font-size: 13px;
    line-height: 20px;
  }
  .date {
    text-align: center;
    font-weight: 700;
  }
  .btn-box {
    margin-top: 5px;
    font-size: 12px;
    position: relative;
    .el-button {
      height: 24px;
      width: 78px;
      padding: 0;
      border: none;
      position: absolute;
      top: 0;
      &:nth-of-type(1) {
        left: 5px;
        :deep(.el-icon-loading) {
          color: #29ad6f;
        }
      }
      &:nth-of-type(2) {
        right: 5px;
        :deep(.el-icon-loading) {
          color: #ff3232;
        }
      }
    }
    img {
      position: absolute;
      top: 0;
      left: 0;
      height: 24px;
      width: auto;
    }
    .el-button:focus,
    .el-button:hover {
      background: transparent;
    }
  }
}
</style>
