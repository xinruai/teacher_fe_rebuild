<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ElButton, ElTable, ElTableColumn, ElPagination,
  ElTooltip, ElNotification,
} from 'element-plus'
import {
  cashWithdrawal as cashWithdrawalApi,
  getBankcardList,
  queryTeacPayrollView,
  getWeekSalaryDetail,
  getMonthSalaryDetail,
  queryNoNextWeekClassOrder,
  facialVerification,
} from '@/api/modules/newSalary'
import { goToOrderDetail, goToBeiKe } from '@/utils/common'
import forceCash from '@/views/newSalary/components/forceCash.vue'
import { typeEnum, childTypeEnum } from '@/views/newSalary/cfg'
import deductDetail from '@/views/newSalary/components/deductDetail.vue'
import { formatTime } from '@/utils/task/Utils'
import uploadvideoTip from '@/views/newTrain/components/uploadvideoTip.vue'
import { getTeacherInfo } from '@/api/modules/persondetail'
import relevantRegulations from '@/views/newSalary/components/relevantRegulations.vue'
import realNameAuthentication from './realNameAuthentication.vue'
import nozhanweiImg from '@/assets/images/nozhanwei.png'

const emit = defineEmits<{
  getRefreshData: [data: Record<string, any>]
  refresh: []
}>()

const route = useRoute()
const router = useRouter()

const tableData = ref<any[]>([])
const query = reactive({ limit: 5, page: 1 })
const total = ref(0)
const loading = ref(false)
const totalLoading = ref(false)
const cashloading = ref(false)
const current = ref<Record<string, any> | null>(null)
const viewObj = ref<Record<string, any>>({})
const bankCardList = ref<any[]>([])
const salaryType = ref(1)
const orderList = ref<any[]>([])
const orderLoading = ref(false)
const teacherInfo = ref<Record<string, any>>({})

const forceCashRef = ref<InstanceType<typeof forceCash>>()
const deductDetailRef = ref<InstanceType<typeof deductDetail>>()
const uploadvideoTipRef = ref<InstanceType<typeof uploadvideoTip>>()
const relevantRegulationsRef = ref<InstanceType<typeof relevantRegulations>>()
const realNameAuthenticationRef = ref<InstanceType<typeof realNameAuthentication>>()

const forceCashPermision = computed(() => route.query.forceCashPermision == '1')
const isNewCrm = computed(() => route.query.isNewCrm === 'true')
const teacId = computed(() => route.query.teacId as string)

function init(val: Record<string, any>) {
  query.page = 1
  current.value = val
  fetchTeacPayrollView()
  getSalaryDetail()
}

function getType(val: number) {
  salaryType.value = val
}

function getSalaryDetail() {
  current.value!.version == 1 ? fetchMonthSalaryDetail() : fetchWeekSalaryDetail()
}

async function fetchWeekSalaryDetail() {
  const params = {
    startTime: current.value!.settlementStartDate,
    endTime: current.value!.settlementEndDate,
    teacId: teacId.value,
    teacPayrollId: current.value!.teacPayrollId,
    ...query,
  }
  loading.value = true
  const res = await getWeekSalaryDetail(params)
  loading.value = false
  if (res.status == 200) {
    tableData.value = res.body.list || []
    total.value = res.body.totalCount || 0
  }
}

async function fetchMonthSalaryDetail() {
  if (salaryType.value == 2) return
  const params = {
    teacId: teacId.value,
    ...query,
  }
  loading.value = true
  const res = await getMonthSalaryDetail(params)
  loading.value = false
  if (res.status == 200) {
    tableData.value = res.body.list || []
    total.value = res.body.totalCount || 0
  }
}

async function fetchTeacPayrollView() {
  if (salaryType.value == 2 && current.value!.version == 1) return
  const params: Record<string, any> = {
    startTime: current.value!.settlementStartDate,
    endTime: current.value!.settlementEndDate,
    teacId: teacId.value,
  }
  if (current.value!.version == 2) params.teacPayrollId = current.value!.teacPayrollId
  totalLoading.value = true
  const res = await queryTeacPayrollView(params)
  totalLoading.value = false
  if (res.status == 200) {
    viewObj.value = res.body || {}
  }
}

function handlePageChange(val: number, type: 'limit' | 'page') {
  query[type] = val
  getSalaryDetail()
}

async function doCashWithdrawal(callback?: () => void) {
  if (!callback) {
    const res1 = await facialVerification()
    if (res1.status == 200 && res1.body === false) {
      realNameAuthenticationRef.value?.show()
      return false
    }
  }

  await fetchBankcardList()
  if (!bankCardList.value.length) {
    return ElNotification.error('不可提现：请前往【小班带你飞】公众号绑定银行卡')
  }
  const params = {
    payId: current.value!.teacPayrollId,
    bankId: bankCardList.value[0].id,
    teacId: teacId.value,
    isMonthWithdraw: current.value!.version == 1,
    forceCashPermision: forceCashPermision.value,
  }
  cashloading.value = true
  const res = await cashWithdrawalApi(params)
  cashloading.value = false
  if (res.status == 200) {
    callback?.()
    refresh()
    ElNotification.success('操作成功')
  }
}

async function fetchBankcardList() {
  const params = {
    limit: 1000,
    page: 1,
    teacId: teacId.value,
    platform: 'web',
  }
  cashloading.value = true
  const res = await getBankcardList(params)
  cashloading.value = false
  if (res.status == 200) {
    bankCardList.value = res.body.list || []
  }
}

function forceCashWithdrawal() {
  forceCashRef.value?.show()
}

function refresh() {
  emit('getRefreshData', { salary: current.value, status: 1, type: 2 })
  emit('refresh')
}

function seeDeductDetail(row: Record<string, any>) {
  deductDetailRef.value?.show(row)
}

function goToDetail(row: Record<string, any>) {
  goToOrderDetail(row, router)
}

function gotMonth() {
  const url = router.resolve({ path: '/account/withdrawlist' })
  window.open(url.href)
}

function fmtTime(time: string) {
  return time ? formatTime(time.replace(/-/g, '/'), 'Y.M.D').slice(2) : ''
}

function showModal() {
  relevantRegulationsRef.value?.show()
}

defineExpose({ init, getType })
</script>

<template>
  <div class="right-content">
    <template v-if="current">
      <!-- 历史数据 -->
      <div v-if="current.version == 1 && salaryType == 2" class="month-data">
        <div class="money">￥{{ current.money }}</div>
        <div v-if="!isNewCrm" @click="gotMonth" class="see-btn">查看明细</div>
      </div>
      <template v-else>
        <!-- 不可提现提示 -->
        <div class="tip" v-if="current.version == 2 && salaryType == 1">
          <div v-if="!current.isBankCard">
            <i class="el-icon-warning"> </i>
            <span> 不可提现：请前往【小班带你飞】公众号绑定银行卡</span>
          </div>
          <div v-if="!current.historyIncomeDeficiency && current.historyIncomeDeficiencyStartWeek">
            <i class="el-icon-warning"> </i>
            <span>不可提现：因提现后账户余额不足50G,即 【{{ fmtTime(current.historyIncomeDeficiencyStartWeek) }}至{{ fmtTime(current.historyIncomeDeficiencyEndWeek) }}】的累计收入未满50G</span>
          </div>
          <div v-else>
            <template v-if="current.status == 32">
              <i class="el-icon-warning"> </i>
              <!-- firstWeek tip omitted — requires parent ref access -->
            </template>
          </div>
        </div>
        <div class="total-money" v-loading="totalLoading">
          <!-- 讲师当前历史月度数据 -->
          <div v-if="current.version == 1 && !isNewCrm" class="history-money">
            <div class="history-text">历史工资单请联系师资经理（Eureka）处理</div>
            <div v-if="!isNewCrm" @dblclick="gotMonth" class="see-btn">明细</div>
          </div>
          <div class="money-area" v-else>
            <template v-if="viewObj.taxVersion == 1">
              <div class="total">
                <div>
                  <div class="money">￥{{ viewObj.totalMoney || 0 }}
                    <span v-if="current.status !== 4"><i class="el-icon-warning-outline" style="color: #999;"></i> 税前金额</span>
                  </div>
                  <template v-if="[1, 32].includes(current.status)">
                    <el-button
                      v-if="!isNewCrm && salaryType == 1 && [1].includes(current.status)"
                      class="btn"
                      :class="{ 'disabled-btn': current.status == 32 }"
                      :loading="cashloading"
                      :disabled="current.status == 32"
                      @click="doCashWithdrawal()"
                    >提现</el-button>
                    <el-button
                      v-if="forceCashPermision && salaryType == 1 && current.version != 1"
                      class="btn"
                      :loading="cashloading"
                      @click="forceCashWithdrawal"
                    >强制提现</el-button>
                  </template>
                </div>
              </div>
              <div class="symbol"> =</div>
              <div class="money-item">
                <div>
                  <div>税前总收入</div>
                  <div class="money">{{ viewObj.totalIncome || 0 }}</div>
                </div>
              </div>
              <div class="symbol">-</div>
              <div class="money-item">
                <div>
                  <div>总扣除</div>
                  <div class="money">{{ viewObj.totalDeduct || 0 }}</div>
                </div>
              </div>
              <div class="symbol" v-if="viewObj.taxConfirmedFlag">-</div>
              <div class="symbol no-tax-money" v-else></div>
              <div class="money-item" :class="{ 'no-tax-money': !viewObj.taxConfirmedFlag }">
                <div v-if="viewObj.taxConfirmedFlag">
                  <div>预缴税额</div>
                  <div class="money">{{ viewObj.taxMoney || 0 }}</div>
                </div>
                <div v-else>
                  <div>预缴税额</div>
                  <div class="money">
                    <span>暂未生成
                      <el-tooltip class="item" effect="dark" content="预缴税额将于发薪后开放查询" placement="top-start">
                        <i class="el-icon-warning-outline" style="color: #999; transform: rotate(180deg);"></i>
                      </el-tooltip>
                    </span>
                  </div>
                  <p class="see-more" @click="showModal">查看相关规定<i class="el-icon-d-arrow-right"></i></p>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="total">
                <div>
                  <div class="money">￥{{ viewObj.totalMoney || 0 }}</div>
                  <template v-if="[1, 32].includes(current.status)">
                    <el-button
                      v-if="!isNewCrm && salaryType == 1 && [1].includes(current.status)"
                      class="btn"
                      :class="{ 'disabled-btn': current.status == 32 }"
                      :loading="cashloading"
                      :disabled="current.status == 32"
                      @click="doCashWithdrawal()"
                    >提现</el-button>
                    <el-button
                      v-if="forceCashPermision && salaryType == 1 && current.version != 1"
                      class="btn"
                      :loading="cashloading"
                      @click="forceCashWithdrawal"
                    >强制提现</el-button>
                  </template>
                </div>
              </div>
              <div class="symbol"> =</div>
              <div class="money-item">
                <div>
                  <div>总收入</div>
                  <div class="money">{{ viewObj.totalIncome || 0 }}</div>
                </div>
              </div>
              <div class="symbol">-</div>
              <div class="money-item">
                <div>
                  <div>总扣除</div>
                  <div class="money">{{ viewObj.totalDeduct || 0 }}</div>
                </div>
              </div>
              <div class="symbol">-</div>
              <div class="money-item">
                <div>
                  <div>平台手续费（1%）</div>
                  <div class="money">{{ viewObj.taxMoney || 0 }}</div>
                </div>
              </div>
            </template>
          </div>
        </div>
        <div class="table-area" v-if="!(current.version == 1 && !isNewCrm)">
          <template v-if="tableData.length">
            <el-table
              :data="tableData"
              v-loading="loading"
              :header-cell-style="{ height: '36px', color: '#939393', background: '#ECECEC' }"
              border
            >
              <el-table-column
                v-if="current.version == 1"
                property="orderNo"
                label="工资单"
                width="300px"
                :show-overflow-tooltip="true"
              />
              <el-table-column
                v-else
                property="orderNo"
                label="订单号"
                width="450px"
                :show-overflow-tooltip="true"
              >
                <template #default="{ row }">
                  <span v-if="[521].includes(+row.type)">{{ row.description }}</span>
                  <span v-else class="link" @click="goToDetail(row)">{{ row.orderNo }}</span>
                </template>
              </el-table-column>
              <el-table-column label="类型">
                <template #default="{ row }">
                  {{ current!.version == 1 ? '历史数据' : typeEnum[row.type] }}
                </template>
              </el-table-column>
              <el-table-column label="节点">
                <template #default="{ row }">
                  <div class="two-line">
                    {{ current!.version == 1 ? '历史数据' : childTypeEnum[row.childType] }}
                    <div
                      v-if="row.deductOtherWeekGb"
                      class="deduct-detail"
                      @click="seeDeductDetail(row)"
                    >共扣除{{ row.deductOtherWeekGb }}G明细</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column property="gb" label="GB">
                <template #default="{ row }">
                  <span :class="{ 'green-font': row.gb > 0, 'red-font': row.gb < 0 }">{{ row.gb }}</span>
                </template>
              </el-table-column>
              <el-table-column property="createTime" label="时间" width="170px" />
            </el-table>
            <el-pagination
              class="bottom-page"
              small
              :page-size="5"
              layout="total, prev, pager, next"
              :total="total"
              @size-change="handlePageChange($event, 'limit')"
              @current-change="handlePageChange($event, 'page')"
            />
          </template>
          <div class="no-data" v-else>
            <img :src="nozhanweiImg" alt="" />
            <div class="text">暂无薪资</div>
          </div>
        </div>
      </template>
    </template>

    <!-- 强制提现 -->
    <forceCash
      ref="forceCashRef"
      :loading="cashloading"
      @cashWithdrawal="doCashWithdrawal"
    />
    <!-- 扣除明细 -->
    <deductDetail
      ref="deductDetailRef"
      @goToDetail="goToDetail"
    />
    <uploadvideoTip ref="uploadvideoTipRef" type="2" />
    <relevantRegulations ref="relevantRegulationsRef" />
    <!-- 实名认证弹出 -->
    <realNameAuthentication ref="realNameAuthenticationRef" />
  </div>
</template>

<style scoped lang="scss">
.right-content {
  background: #fbfbfb;
}
.total-money {
  margin: 20px 0;
  .money-value {
    text-align: center;
    font-size: 30px;
    font-weight: 700;
  }
  .money-area {
    display: flex;
    align-items: center;
    background: #ffffff;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.03);
    border-radius: 8px;
    padding: 24px 15px;
    div {
      color: #303133;
    }
    .total {
      padding: 10px 0 10px 0px;
      height: 86px;
      border-radius: 8px;
      border: none;
      align-items: center;
      .money {
        font-size: 24px;
        font-weight: 700;
        color: #3d3d3d;
        white-space: nowrap;
        display: flex;
        align-items: center;
        span {
          font-weight: normal;
          font-size: 12px;
          color: #999;
          margin-left: 4px;
        }
      }
      :deep(.btn) {
        width: 112px;
        height: 26px;
        border-radius: 15px;
        border: 1px solid #46b959;
        background: transparent;
        margin-top: 8px;
        span,
        .el-icon-loading {
          color: #46b959;
          position: relative;
          top: -6px;
        }
      }
      :deep(.disabled-btn) {
        border: 1px solid #939393;
        span {
          color: #939393;
        }
      }
    }
    > .symbol {
      width: 34px;
      text-align: center;
      border: none;
      color: #3d3d3d;
      align-items: center;
      position: relative;
      &.no-tax-money::before {
        content: "";
        position: absolute;
        left: 50%;
        top: 0;
        bottom: 0;
        width: 1px;
        background-color: #ccc;
        transform: translateX(-50%);
      }
    }
    > div {
      display: flex;
      padding: 12px 10px;
      border-radius: 8px;
      align-items: flex-end;
      justify-content: center;
      border: 1px dashed #383838;
      height: 66px;
      flex: 1;
      > div {
        text-align: center;
        color: #303133;
      }
      &.no-tax-money {
        border-color: #3662ec;
      }
    }
    .money-item {
      position: relative;
      .money {
        margin-top: 8px;
        color: #303133;
        span {
          color: #999;
          font-size: 12px;
        }
      }
      .symbol {
        width: 26px;
      }
      .see-more {
        position: absolute;
        bottom: -36px;
        color: #fd9535;
        cursor: pointer;
        font-size: 12px;
        i {
          color: #fd9535;
        }
      }
    }
  }
  .history-money {
    background: #ffffff;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.03);
    text-align: center;
    border-radius: 8px;
    padding: 24px 15px;
    position: relative;
    .see-btn {
      margin: 20px auto 0;
      position: absolute;
      right: 0;
      top: -20px;
      width: 40px;
      font-size: 12px;
      border-radius: 5px;
      height: 20px;
      line-height: 20px;
      opacity: 0;
    }
  }
}
.tip {
  background: #fdf0f0;
  padding: 0 25px;
  line-height: 30px;
  border-radius: 8px;
  margin-bottom: 30px;
  span,
  i {
    color: #f56c6c;
  }
}
.green-font {
  color: #67c23a;
}
.red-font {
  color: #f56c6c;
}
.link {
  color: #3662ec;
  cursor: pointer;
}
.table-area {
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.03);
  padding: 15px;
}
.el-table {
  min-height: 260px;
}
.bottom-page {
  margin-top: 10px;
  text-align: right;
  height: 40px;
}
.month-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 300px);
  flex-direction: column;
  background: #ffffff;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  .money {
    color: #3d3d3d;
    font-size: 24px;
    font-weight: 700;
  }
}
.no-data {
  height: calc(100vh - 545px);
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  img {
    width: 100px;
  }
  .text {
    color: #939393;
    font-size: 20px;
    margin-top: 30px;
  }
}
.two-line {
  line-height: 16px;
  .deduct-detail {
    color: #f56c6c;
    text-decoration: underline;
    font-size: 12px;
    cursor: pointer;
  }
}
:deep(.el-table td),
:deep(.el-table th) {
  padding: 8px 0;
}
.underline {
  text-decoration: underline;
  cursor: pointer;
}
.see-btn {
  color: #fd9535;
  border: 1px solid #fd9535;
  border-radius: 15px;
  margin-top: 10px;
  width: 144px;
  height: 26px;
  line-height: 26px;
  text-align: center;
  cursor: pointer;
}
.history-text {
  font-size: 20px;
  font-weight: 700;
  text-align: center;
}
.lh25 {
  line-height: 25px;
}
</style>
