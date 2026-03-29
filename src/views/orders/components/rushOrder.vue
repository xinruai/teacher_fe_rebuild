<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import rushModal from '@/views/orders/components/rushModal.vue'
import rushFail from '@/views/orders/components/rushFail.vue'
import rushAutoModal from '@/views/orders/components/rushAutoModal.vue'
import registrationRecord from '@/views/orders/components/registrationRecord.vue'
import packageClassesRushAutoModal from '@/views/orders/components/packageClassesRushAutoModal.vue'
import newOrderNotice from '@/views/orders/components/newOrderNotice.vue'
import { copyText } from '@/utils/index'
import { tagConfig } from '@/views/orders/cfg'
import {
  getRushOrderList,
  handRushOrder,
  queryRushOrderError,
  queryGrabOrderCarousel,
} from '@/api/modules/order'
import { getLocal } from '@/utils/auth'

const emit = defineEmits<{
  (e: 'seeOrderDetail', row: any): void
}>()

const bannerList = ref<string[]>([])
const queryParams = ref({
  page: 1,
  limit: 50,
  sort: undefined as number | undefined,
})
const total = ref(0)
const loading = ref(false)
const tableData = ref<any[]>([])
const noMore = ref(false)
const isLoadMore = ref(false)
const teacId = getLocal('teacinfo')?.id

const rushOrderTable = ref<any>(null)
const scrollContent = ref<HTMLElement>()
const rushModalRef = ref<InstanceType<typeof rushModal>>()
const rushFailRef = ref<InstanceType<typeof rushFail>>()
const rushAutoModalRef = ref<InstanceType<typeof rushAutoModal>>()
const packageClassesRushAutoModalRef = ref<InstanceType<typeof packageClassesRushAutoModal>>()
const newOrderNoticeRef = ref<InstanceType<typeof newOrderNotice>>()
const registrationRecordRef = ref<InstanceType<typeof registrationRecord>>()

const showScrollBanner = computed(() => {
  return getLocal('teacinfo')?.grabOrderPermission != 4 && bannerList.value.length > 0 && tableData.value.length > 0
})

onMounted(async () => {
  await getList()
  doQueryRushOrderError()
  queryGrabOrderCarousel({ teacId }).then((res: any) => {
    if (res.status == 200) {
      bannerList.value = (res.body || []).map((item: any) => {
        return `讲师${item.teacherName}抢单成功，用时${item.duration}，订单：${item.orderNo}`
      })
      if (bannerList.value.length) {
        nextTick(() => startScroll())
      }
    }
  })
  nextTick(() => {
    const table = rushOrderTable.value
    if (table && table.$el) {
      const bodyWrapper = table.$el.querySelector('.el-table__body-wrapper')
      if (bodyWrapper) {
        bodyWrapper.addEventListener('scroll', handleScroll)
      }
    }
  })
})

function handleScroll() {
  const table = rushOrderTable.value
  if (!table || !table.$el) return
  const bodyWrapper = table.$el.querySelector('.el-table__body-wrapper')
  if (!bodyWrapper || loading.value || noMore.value) return
  const threshold = 100
  if (bodyWrapper.scrollHeight - bodyWrapper.scrollTop - bodyWrapper.clientHeight < threshold) {
    loadMore()
  }
}

function loadMore() {
  if (loading.value || noMore.value) return
  queryParams.value.page++
  isLoadMore.value = true
  getList(true)
}

async function getList(isLoadMoreFlag = false) {
  loading.value = true
  const res = await getRushOrderList(queryParams.value as any)
  loading.value = false
  if (res.status == 200) {
    const list = res.body?.list || []
    total.value = res.body?.total || 0
    if (isLoadMoreFlag) {
      tableData.value = tableData.value.concat(list)
    } else {
      tableData.value = list
    }
    noMore.value = tableData.value.length >= total.value
  }
  isLoadMore.value = false
}

async function showModal(type: string, row?: any) {
  await nextTick()
  const refs: Record<string, any> = {
    registrationRecord: registrationRecordRef,
    rushModal: rushModalRef,
    rushFail: rushFailRef,
    rushAutoModal: rushAutoModalRef,
    packageClassesRushAutoModal: packageClassesRushAutoModalRef,
    newOrderNotice: newOrderNoticeRef,
  }
  refs[type]?.value?.show(row)
}

function copy(row: any) {
  copyText(row.orderNo)
}

function seeOrderDetail(row: any) {
  emit('seeOrderDetail', row)
}

function rushOrder(row: any) {
  if (row.isAutoReceiveOrder) {
    if (row.spoType == 26) {
      packageClassesRushAutoModalRef.value?.show(row)
    } else {
      rushAutoModalRef.value?.show(row)
    }
  } else {
    rushModalRef.value?.show(row)
  }
}

async function doQueryRushOrderError() {
  const res = await queryRushOrderError()
  if (res.status == 200) {
    res.body?.count && showModal('rushFail')
  }
}

function sortList({ prop, order }: { prop: string; order: string }) {
  if (prop == 'endCourseTime') {
    queryParams.value.sort = order == 'ascending' ? 1 : 2
  }
  queryParams.value.page = 1
  getList()
}

function startScroll() {
  const el = scrollContent.value
  if (!el) return
  let pos = 0
  const contentWidth = el.scrollWidth / 2
  const step = 1
  const scroll = () => {
    pos -= step
    if (Math.abs(pos) >= contentWidth) {
      pos = 0
    }
    el.style.transform = `translateX(${pos}px)`
    requestAnimationFrame(scroll)
  }
  scroll()
}

async function confirmRegistration(row: any) {
  const res = await handRushOrder({ courseId: row.courseId })
  if (res.status == 200) {
    rushModalRef.value?.closeModal()
    getList()
  }
}

defineExpose({ showModal })
</script>

<template>
  <div class="rush-order-area">
    <template>
      <div class="scroll-banner" v-if="showScrollBanner">
        <div class="scroll-content" ref="scrollContent">
          <span v-for="(item, idx) in bannerList" :key="idx" class="banner-item">{{ item }}</span>
          <span v-for="(item, idx) in bannerList" :key="'copy' + idx" class="banner-item">{{ item }}</span>
        </div>
      </div>

      <el-table v-loading="loading" :data="tableData" class="table" @sort-change="sortList" ref="rushOrderTable" height="480">
        <el-table-column label="订单号" :show-overflow-tooltip="true">
          <template #default="scope">
            <div class="order ellipsis">
              <div class="recommend" v-if="(scope.row.tags || []).includes(1)">
                <img src="@/assets/images/order/recommend1.png" alt="" />推荐
              </div>
              <span @click="seeOrderDetail(scope.row)" class="cursor underline">{{ scope.row.orderNo }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="operName" label="标签" width="240px">
          <template #default="scope">
            <div class="tag-area">
              <div
                v-for="(tag, index) in tagConfig.filter(item1 => (scope.row.tags || []).some((item2: number) => item2 == item1.value))"
                :key="index"
                :style="{ borderColor: tag.bgColor }"
                class="tag"
              >
                <img :src="tag.icon" alt="" />{{ tag.label }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="学生期望首课时间" width="140">
          <template #default="scope">
            {{ scope.row.expectFirstDateTime ? `${scope.row.expectFirstDateTime.split(' ')[0]}之前` : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="endCourseTime" label="Dead Deadline" sortable="custom" width="160" />
        <el-table-column prop="fixedIncome" label="预计收入G" width="90">
          <template #default="scope">
            {{ [0].includes(+scope.row.spoType) ? '时薪' : scope.row.fixedIncome }}
          </template>
        </el-table-column>
        <el-table-column prop="teacCount" label="在线浏览人数" width="110" />
        <el-table-column label="Action" width="120">
          <template #default="scope">
            <div class="action-area">
              <template v-if="scope.row.buttonStatus == 4">
                <span @click="showModal('registrationRecord')">报名进度</span>
              </template>
              <template v-else>
                <div v-if="scope.row.buttonStatus == 1" class="rush-btn" @click="rushOrder(scope.row)">抢单</div>
                <div v-if="scope.row.buttonStatus == 2" class="signup-btn" @click="rushOrder(scope.row)">报名</div>
                <img class="icon" src="@/assets/images/order/copy.png" alt="" @click="copy(scope.row)" />
              </template>
            </div>
          </template>
        </el-table-column>
        <template #empty>
          <div style="padding: 40px 0; text-align: center; color: #999;">
            <img src="@/assets/images/order/empty.png" alt="empty" style="height: 100px; display: block; margin: 0 auto;" />
            <div style="color: #a8abae; line-height: initial;">暂时还没有订单，请关注公众号[小班带你飞]的新订单通知</div>
          </div>
        </template>
      </el-table>
      <div v-if="noMore" style="text-align: center; color: #999; padding: 20px 0;">没有更多订单了</div>
    </template>

    <registrationRecord ref="registrationRecordRef" />
    <rushModal ref="rushModalRef" @confirmRegistration="confirmRegistration" />
    <rushFail ref="rushFailRef" />
    <rushAutoModal ref="rushAutoModalRef" @refresh="getList" />
    <packageClassesRushAutoModal ref="packageClassesRushAutoModalRef" @refresh="getList" />
    <newOrderNotice ref="newOrderNoticeRef" />
  </div>
</template>

<style scoped lang="scss">
.scroll-banner {
  background: #f5f5f7;
  overflow: hidden;
  white-space: nowrap;
  padding: 8px 0;
  margin: 0 0 15px 0;
  position: relative;
}
.scroll-content {
  display: inline-block;
  white-space: nowrap;
  will-change: transform;
}
.banner-item {
  display: inline-block;
  margin: 0 24px;
  font-size: 14px;
  color: #333;
}
.rush-order-area {
  margin-bottom: 20px;
  position: relative;
}
.icon {
  height: 18px;
  width: 18px;
  cursor: pointer;
  display: inline-block;
}
.cursor {
  cursor: pointer;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.underline {
  text-decoration: underline;
  font-size: 12px;
}
.table {
  border-radius: 7px;
  :deep(tbody .el-table__row) {
    height: 44px;
  }
}
:deep(td) {
  text-align: center;
}
:deep(tr),
:deep(td),
:deep(.el-table .el-table__cell) {
  text-align: center !important;
}
.order {
  text-align: left;
}
:deep(.el-table th) {
  padding: 0px !important;
}
:deep(th) {
  .cell {
    color: #303133 !important;
    font-weight: 400;
  }
}
.recommend {
  width: 55px;
  height: 18px;
  background: #ffefe4;
  border-radius: 0px 0px 8px 0px;
  padding: 0 6px;
  position: absolute;
  left: 0;
  top: 0;
  font-size: 12px;
  line-height: 18px;
  color: #ff8723;
  transform: scale(0.8);
  margin: -2px 0 0 -5px;
  img {
    height: 11px;
    width: 11px;
    top: 1px;
    position: relative;
    margin-right: 3px;
  }
}
.tag-area {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  .tag {
    display: inline-block;
    color: #3d3d3d;
    border: 1px solid #fff;
    border-radius: 4px;
    font-size: 12px;
    padding: 2px 5px;
    margin: 4px;
    img {
      height: 12px;
      width: auto;
      position: relative;
      top: 2px;
      margin-right: 5px;
    }
  }
}
.rush-btn,
.signup-btn {
  width: 40px;
  height: 20px;
  background: linear-gradient(270deg, #ff5000 0%, #ff8723 100%);
  border-radius: 2px;
  color: #fff;
  font-style: italic;
  font-weight: 700;
  font-size: 12px;
  line-height: 18px;
  letter-spacing: 2px;
  display: inline-block;
  cursor: pointer;
  margin-right: 10px;
}
.signup-btn {
  border: 1px solid #ff8723;
  background: transparent !important;
  color: #ff8723;
}
.action-area {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  span {
    color: #508ff6;
    display: inline-block;
    width: 100%;
    text-align: center;
    font-size: 12px;
    cursor: pointer;
  }
}
:deep(.el-table.table .el-table__cell) {
  padding: 3px 0 !important;
}
</style>
