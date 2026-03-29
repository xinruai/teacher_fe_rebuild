<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElNotification } from 'element-plus'
import { getOrder } from '@/api/modules/order'
import { getTeacCanWorkTime } from '@/api/modules/newTrain'
import { getLocal } from '@/utils/auth'
import { useHandsUpStore } from '@/stores/handsup'
import setTimeTip from '@/views/account/newHome/setTimeTip.vue'

const props = withDefaults(defineProps<{
  type?: string
}>(), {
  type: '1',
})

const handsupStore = useHandsUpStore()
const userDetail = ref<any>({})
const weekTimes = ref<Record<string, any>>({})
const setTimeTipRef = ref<InstanceType<typeof setTimeTip>>()

const showGet = computed(() => handsupStore.showGet)

const isSetTime = computed(() => {
  return userDetail.value.schedClassTime == 1 &&
    Object.keys(weekTimes.value).map(k => weekTimes.value[k]).find(v => v?.length)
})

onMounted(() => {
  handsupStore.getStatus()
  getUserDetail()
})

async function doGetOrder() {
  if (showGet.value) {
    await fetchTeacCanWorkTime()
    getUserDetail()
    if (!isSetTime.value) {
      setTimeTipRef.value?.show()
    } else {
      const res = await getOrder()
      if (res.status == 200) {
        handsupStore.getStatus()
      } else {
        ElNotification.error(res.msg)
      }
    }
  }
}

function getUserDetail() {
  userDetail.value = getLocal('teacinfo') || {}
}

async function fetchTeacCanWorkTime() {
  const res = await getTeacCanWorkTime({ teacUserId: userDetail.value.id })
  if (res.status == 200) {
    weekTimes.value = res.body?.workTimes || {}
  }
}
</script>

<template>
  <div>
    <template v-if="type == '1'">
      <div class="operate-btn" @click="doGetOrder">
        <img src="@/assets/images/getorder.png" alt="" />
        <span>{{ showGet ? '我要接单' : '师资正在加速匹配订单中...' }}</span>
      </div>
    </template>
    <template v-else>
      <div class="no-order" v-if="userDetail.statused == 0 && userDetail.type == 2">
        <img src="@/assets/images/getOrder2.png" alt="" />
        <el-button class="ope-btn" v-if="showGet" @click="doGetOrder">我要接单</el-button>
        <div v-else>师资正在加速匹配订单中...</div>
      </div>
      <div v-else class="content">
        <img src="@/assets/images/order-contentnone.png" alt="" />
        订单空空如也，快去联系师资接单赚钱吧
      </div>
    </template>
    <setTimeTip ref="setTimeTipRef" />
  </div>
</template>

<style scoped lang="scss">
img {
  height: 29px;
  width: auto;
  vertical-align: top;
}
.operate-btn {
  padding-right: 8px;
  border-radius: 20px;
  height: 30px;
  cursor: pointer;
  margin-right: 20px;
  color: #ff8723;
  border: 1px solid;
  span {
    color: #ff8723;
    font-size: 14px;
    line-height: 30px;
  }
}
.no-order {
  margin: 100px auto;
  text-align: center;
  div {
    font-size: 15px;
  }
  img {
    width: 186px;
    height: auto;
    display: block;
    margin: 40px auto;
  }
  :deep(.el-button.ope-btn) {
    height: 30px;
    width: 190px;
    background: linear-gradient(143deg, #ff0878 0%, #ffa113 100%);
    border-radius: 33px;
    span {
      color: #fff;
      font-size: 16px;
      position: relative;
      top: -5px;
    }
  }
}
.content {
  text-align: center;
  img {
    width: 186px;
    height: auto;
    display: block;
    margin: 40px auto;
  }
}
</style>
