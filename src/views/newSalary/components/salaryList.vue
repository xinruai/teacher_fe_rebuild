<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElRadioGroup, ElRadioButton } from 'element-plus'
import { formatTime } from '@/utils/task/Utils'
import { getSalaryList, queryTeacPayrollListCount } from '@/api/modules/newSalary'
import nozhanweiImg from '@/assets/images/nozhanwei.png'

const emit = defineEmits<{
  selectSalary: [item: Record<string, any>]
}>()

const route = useRoute()
const countObj = ref<Record<string, any>>({})
const query = reactive({ type: '1' })
const loading = ref(false)
const current = ref<Record<string, any>>({})
const list = ref<any[]>([])
const currentStatus = ref('1')

const teacId = computed(() => route.query.teacId as string)

const statusEnum: Record<string, { color: string; backgroundColor: string; cardBg: string }> = {
  '1': { color: '#46B959', backgroundColor: '#E4F5E6', cardBg: '#F1FAF2' },
  '2': { color: '#46B959', backgroundColor: '#E4F5E6', cardBg: '#F1FAF2' },
  '4': { color: '#939393', backgroundColor: '#EDEDED', cardBg: '#F4F4F4' },
  '8': { color: '#ED5A5C', backgroundColor: '#FEF2F2', cardBg: '#FEF6F6' },
  '16': { color: '#46B959', backgroundColor: '#E4F5E6', cardBg: '#F1FAF2' },
  '32': { color: '#ED5A5C', backgroundColor: '#FEF2F2', cardBg: '#FEF6F6' },
}

const statusTextEnum: Record<string, string> = {
  '1': '待提现',
  '2': '已确认',
  '4': '已打款',
  '8': '打款失败',
  '16': '打款中',
  '32': '不可提现',
}

function fmtTime(time: string) {
  return formatTime(time.replace(/-/g, '/'), 'Y.M.D').slice(2)
}

async function changeType() {
  await init()
}

async function init(status: string | number = '', row: any = '') {
  if (status) currentStatus.value = String(status)
  if (row && row.salary && row.salary.version == 2) {
    query.type = row.type
  }
  fetchTeacPayrollListCount()
  await getList()
  if (row && row.salary) {
    selectSalary(row.salary)
  } else if (list.value.length) {
    selectSalary(list.value[0])
  }
}

async function fetchTeacPayrollListCount() {
  const params = { status: currentStatus.value, teacId: teacId.value }
  const res = await queryTeacPayrollListCount(params)
  if (res.status == 200) {
    countObj.value = res.body || {}
  }
}

async function getList() {
  const params: Record<string, any> = { ...query, status: currentStatus.value, teacId: teacId.value }
  if (query.type == '2') delete params.status
  loading.value = true
  const res = await getSalaryList(params)
  loading.value = false
  if (res.status == 200) {
    list.value = res.body || []
  }
}

function selectSalary(item: Record<string, any>) {
  current.value = item
  emit('selectSalary', item)
}

defineExpose({ init, list, query })
</script>

<template>
  <div>
    <div class="item-title">工资单</div>
    <el-radio-group v-model="query.type" @change="changeType" class="radio-area">
      <el-radio-button value="1">当前（{{ countObj.nowTeacPayrollCount }}）</el-radio-button>
      <el-radio-button value="2">历史（{{ countObj.historyTeacPayrollCount }}）</el-radio-button>
    </el-radio-group>
    <div class="list" v-loading="loading">
      <template v-if="list.length">
        <div
          v-for="(item, index) in list"
          :key="index"
          class="list-item"
          :style="{
            backgroundColor: item.teacPayrollId === current.teacPayrollId && !(item.version == 1 && query.type == '1')
              ? statusEnum[item.status]?.cardBg
              : 'transparent'
          }"
          @click="selectSalary(item)"
        >
          <template v-if="item.teacPayrollId === current.teacPayrollId">
            <span class="before" :style="{ backgroundColor: statusEnum[item.status]?.color }"></span>
            <span class="after"></span>
          </template>
          <div class="date" v-if="item.version == 1">历史薪资</div>
          <div class="date" v-else>{{ fmtTime(item.settlementStartDate) }}至{{ fmtTime(item.settlementEndDate) }}</div>
          <div
            v-if="!(item.version == 1 && query.type == '1')"
            class="money"
            :style="{ color: item.teacPayrollId === current.teacPayrollId ? statusEnum[item.status]?.color : '' }"
          >￥{{ item.money }}</div>
          <div
            v-if="!(item.version == 1 && query.type == '1')"
            class="tag"
            :style="{ color: statusEnum[item.status]?.color, backgroundColor: statusEnum[item.status]?.backgroundColor }"
          >{{ statusTextEnum[item.status] }}</div>
        </div>
      </template>
      <div class="no-data" v-else>
        <img :src="nozhanweiImg" alt="" />
        <div class="text">暂无数据</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
:deep(.radio-area) {
  background: #fff6ed;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  .el-radio-button {
    width: 100%;
  }
  .el-radio-button__inner {
    border: none !important;
    background: transparent;
    color: #3d3d3d;
    font-weight: 700;
    width: 100%;
  }
  .el-radio-button__original-radio:checked + .el-radio-button__inner {
    background: #fd9535;
    color: #fff;
    box-shadow: unset;
  }
}
.list {
  margin-top: 10px;
  border-radius: 8px;
  cursor: pointer;
  .list-item {
    padding: 12px 10px;
    border-bottom: 1px solid #ececec;
    position: relative;
    height: 70px;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    div {
      color: #3d3d3d;
    }
    .date {
      color: #939393;
    }
    .money {
      font-weight: 700;
      font-size: 18px;
      margin-top: 8px;
    }
    .tag {
      position: absolute;
      top: 8px;
      right: 8px;
      height: 22px;
      line-height: 22px;
      font-size: 12px;
      padding: 0 8px;
      border-radius: 3px;
    }
  }
  .list-item {
    .after {
      display: inline-block;
      content: "";
      background: #fff;
      position: absolute;
      right: -15px;
      width: 15px;
      height: 30px;
      top: 20px;
      border-radius: 0 18px 18px 0;
      box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.03);
    }
    .before {
      display: inline-block;
      content: "";
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #f26f70;
      position: absolute;
      right: -5px;
      top: 32px;
      z-index: 2;
    }
  }
}
.no-data {
  margin: 40px auto;
  width: 120px;
  text-align: center;
  img {
    width: 60px;
  }
  .text {
    color: #939393;
    margin-top: 12px;
  }
}
</style>
