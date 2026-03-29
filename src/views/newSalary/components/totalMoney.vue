<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { getTotalMoney } from '@/api/modules/newSalary'
import yueImg from '@/assets/images/salary/yue.png'
import noyueImg from '@/assets/images/salary/noyue.png'
import keImg from '@/assets/images/salary/ke.png'
import nokeImg from '@/assets/images/salary/noke.png'
import bukeImg from '@/assets/images/salary/buke.png'
import nobukeImg from '@/assets/images/salary/nobuke.png'

const emit = defineEmits<{
  getStatus: [status: number, row?: any]
}>()

const route = useRoute()
const currentStatus = ref(1)
const moneyData = ref<Record<string, any>>({})
const loading = ref(false)
let refreshData: any = undefined

const moneyList = [
  {
    label: '账户余额（税前）',
    value: 1,
    prop: 'totalMoney',
    color: '#FF8D29',
    background: '#FFF6ED',
    activeBackground: '#FD9535',
    img: yueImg,
    noimg: noyueImg,
  },
  {
    label: '可提现金额（税前）',
    value: 3,
    prop: 'withdrawalMoney',
    color: '#55C567',
    background: '#F1FAF2',
    activeBackground: '#46B959',
    img: keImg,
    noimg: nokeImg,
  },
  {
    label: '不可提现金额（税前）',
    value: 4,
    prop: 'noWithdrawalMoney',
    color: '#ED5A5C',
    background: '#FEF6F6',
    activeBackground: '#ED5A5C',
    img: bukeImg,
    noimg: nobukeImg,
  },
]

function init(row?: any) {
  refreshData = row
  fetchTotalMoney()
  changeType(moneyList[0])
}

async function fetchTotalMoney() {
  loading.value = true
  const res = await getTotalMoney({ teacId: route.query.teacId as string })
  loading.value = false
  if (res.status == 200) {
    moneyData.value = res.body || {}
  }
}

function changeType(item: typeof moneyList[number]) {
  currentStatus.value = item.value
  emit('getStatus', item.value, refreshData)
}

init()

defineExpose({ init })
</script>

<template>
  <div>
    <div class="item-title">账户总览</div>
    <div class="item-area" v-loading="loading">
      <div
        v-for="(item, index) in moneyList"
        class="item"
        :style="{
          color: item.color,
          background: item.value === currentStatus ? item.activeBackground : item.background,
          borderColor: item.color,
        }"
        :class="{ actived: item.value === currentStatus }"
        :key="index"
        @click="changeType(item)"
      >
        <div
          class="label"
          :style="{ color: item.value === currentStatus ? '#fff' : item.color }"
        >
          <img :src="item.value === currentStatus ? item.img : item.noimg" alt="" />
          {{ item.label }}
        </div>
        <div
          class="money"
          :style="{ color: item.value === currentStatus ? '#fff' : item.color }"
        >￥{{ moneyData[item.prop] }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.item-title {
  font-weight: 700;
}
.item-area {
  display: flex;
  cursor: pointer;
  margin-top: 20px;
  margin-right: 90px;
  .item {
    width: 30%;
    height: 100px;
    padding: 10px 22px;
    margin-right: 20px;
    border-radius: 8px;
    display: flex;
    justify-content: space-around;
    flex-direction: column;
    background: #ececec;
    border: 1px solid #ed5a5c;
    &:hover {
      transform: scale(1.1);
    }
    .label {
      font-size: 14px;
      white-space: nowrap;
    }
    .money {
      font-size: 20px;
      font-weight: 700;
    }
    img {
      width: 18px;
      margin-right: 2px;
      position: relative;
      top: 4px;
    }
  }
  .item.actived {
    border: none;
  }
}
</style>
