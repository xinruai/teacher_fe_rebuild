<script setup lang="ts">
import { ref, watch, onMounted, nextTick, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElNotification, ElMessageBox } from 'element-plus'
import { formatSeconds } from '@/utils/task/Utils'
import contentnull from '@/views/contentnull.vue'
import handsUp from '@/views/orders/handsUp.vue'
import myorderNew from '@/views/myorders/myorderNew.vue'
import orderReceiving from '@/views/paperchedule/orderReceivingNow.vue'
import modelbox from './testorder/modelbox.vue'
import examTip from '@/views/orders/components/examTip.vue'
import newGetOrder from './newGetOrder.vue'
import { goToPreExamSchedule, goToBeiKe, goToPublicDetail, JudgeNewOrder } from '@/utils/common'
import salarySystem from '@/views/orders/components/salarySystem.vue'
import getOrderHasScheme from '@/views/orders/components/getOrderHasScheme.vue'
import rushOrder from '@/views/orders/components/rushOrder.vue'
import newOrderNotice from '@/views/orders/components/newOrderNotice.vue'
import registrationRecord from '@/views/orders/components/registrationRecord.vue'
import { useUserStore } from '@/stores/user'
import { useDissertationStore } from '@/stores/dissertation'
import request from '@/api/request'
import { BasicUrl } from '@/api/config'

import taplistbgImg from '@/assets/images/taplistbg.png'
import orderlistImg from '@/assets/images/orderlist.png'
import orderlistNoneImg from '@/assets/images/orderlist-none.png'
import orderlistChooseImg from '@/assets/images/orderlist-choose.png'
import myorderImg from '@/assets/images/myorder.png'
import myorderNoneImg from '@/assets/images/myorder-none.png'
import myorderChooseImg from '@/assets/images/myorder-choose.png'
import salaryImg from '@/assets/images/salary.png'
import noSalaryImg from '@/assets/images/no-salary.png'
import salaryChooseImg from '@/assets/images/salary-choose.png'
import testorderImg from '@/assets/images/test/testorder-img.png'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const dissertationStore = useDissertationStore()

// Refs for child components
const rushOrderRef = ref<InstanceType<typeof rushOrder>>()
const examTipRef = ref<InstanceType<typeof examTip>>()
const newGetOrderRef = ref<InstanceType<typeof newGetOrder>>()
const getOrderHasSchemeRef = ref<InstanceType<typeof getOrderHasScheme>>()
const newOrderNoticeRef = ref<InstanceType<typeof newOrderNotice>>()
const registrationRecordRef = ref<InstanceType<typeof registrationRecord>>()
const orderListScroll = ref<HTMLElement>()

const orderTatol = ref<any>({})
const modelObj = ref({
  btnno: '',
  btnyes: '',
  title: '',
  content: '',
  imgShow: false,
  zuoyecontent1: '',
  zuoyecontent2: '',
})
const timeIsSort = ref(1)
const testOrderObj = ref({
  show: false,
  title: '考试订单',
  text1: '1、Exam&Quiz订单接单后，须在考试前',
  text2: '2、接单后退单将面临<b>2倍</b>的订单预计收入扣除作为处罚（不可抗力因素除外）',
  textWeight: '填写考试信息',
  imgSrc: testorderImg,
})
const videourl = ref('')
const showvideo = ref(false)
const user = ref<any>('')
const clickObj = ref<any>({})
const clcikType = ref('')
const maskShow = ref(false)
const showInfo = ref(false)
const tableDataName = ref('')
const tableDataEnd = ref<any[]>([])
const total = ref(0)
const limit = ref(15)
const val = ref(1)
const loading = ref(false)
const isactive = ref(0)
const searchtext = ref('')
const liactive = ref(0)
const teacherType = localStorage.getItem('teacType')
const lookLwdlbStatus = ref(false)
const videoduration = ref('')
const videocurrent = ref('')
const noMore = ref(false)
const isLoadMore = ref(false)
const courseId = ref('')

const currentStatus = ref(1)
const statusList = [
  { label: '抢单池', value: 1 },
  { label: '接单池', value: 2 },
]

const ordertaplist = [
  { name: '订单池', num: 10, beforeimgsrc: orderlistImg, afterimgsrc: orderlistNoneImg, bgcolor: orderlistChooseImg },
  { name: '我的订单', num: 10, beforeimgsrc: myorderImg, afterimgsrc: myorderNoneImg, bgcolor: myorderChooseImg },
  { name: '薪资模式', num: 10, beforeimgsrc: salaryImg, afterimgsrc: noSalaryImg, bgcolor: salaryChooseImg },
]

// Provide showModal to children
async function showModal(type: string, row?: any) {
  await nextTick()
  const refs: Record<string, any> = {
    registrationRecord: registrationRecordRef,
    newOrderNotice: newOrderNoticeRef,
  }
  refs[type]?.value?.show(row)
}
provide('showModal', showModal)

// Watchers
watch(isactive, (val) => {
  if (val == 0) {
    timeIsSort.value = 1
    getTableData()
  }
  getClasstotal()
})

watch(currentStatus, (newVal, oldVal) => {
  nextTick(() => {
    const el = orderListScroll.value
    if (newVal === 2 && el && tableDataEnd.value.length) {
      if (!(el as any)._hasScrollListener) {
        el.addEventListener('scroll', handleOrderListScroll)
        ;(el as any)._hasScrollListener = true
      }
    } else if (oldVal === 2 && el && (el as any)._hasScrollListener) {
      el.removeEventListener('scroll', handleOrderListScroll)
      ;(el as any)._hasScrollListener = false
    }
  })
})

onMounted(() => {
  if (route.query.isactive) isactive.value = Number(route.query.isactive)
  if (localStorage.getItem('ordertap')) {
    isactive.value = Number(localStorage.getItem('ordertap'))
  }
  videoready()
  getTableData()
  getUser()
  getClasstotal()
})

// Methods
function newPreExam(list: any) {
  return [1].includes(list.spoType) && [2, 3].includes(list.spoVersion)
}

function hasBeike(list: any) {
  return list.hasCoursewarePlatform
}

function hasScheme(list: any) {
  return [0, 1, 26, 65, 67, 71].includes(list.spoType)
}

function videoready() {
  const timer = setInterval(() => {
    const myvideo = document.getElementById('myvideo') as HTMLVideoElement
    if (myvideo) {
      myvideo.controls = false
      if (lookLwdlbStatus.value) {
        myvideo.controls = true
      } else {
        myvideo.addEventListener('timeupdate', (event) => {
          const target = event.target as HTMLVideoElement
          const showtimes = formatSeconds(target.currentTime)
          videocurrent.value = showtimes.m + ':' + showtimes.s
          if (videoduration.value) return
          const times = formatSeconds(target.duration)
          videoduration.value = times.m + ':' + times.s
        })
      }
      myvideo.addEventListener('ended', () => {
        if (lookLwdlbStatus.value) {
          lookLwdlbStatus.value = false
          closevideo()
          return
        }
        request({
          url: '/order/teacherSeenMovie',
          method: 'post',
          data: { courseId: courseId.value },
        }).then((mr: any) => {
          if (mr.status == 200) {
            closevideo()
            if (!newPreExam(clickObj.value)) newGetOrderRef.value?.show()
          }
        })
      })
      clearInterval(timer)
    }
  }, 1000)
}

function closevideo() {
  showvideo.value = false
  videourl.value = ''
  if (newPreExam(clickObj.value)) {
    newGetOrderRef.value?.show()
  }
}

function getUser() {
  request({
    url: '/user/getMyInfo',
    method: 'get',
  }).then((r: any) => {
    if (r.status === 400 && r.body?.code === 4011) {
      router.push({ path: '/login' })
      return
    }
    user.value = r.body
  }).catch(() => {})
}

function getClasstotal() {
  request({
    url: '/order/order/class/total',
    method: 'get',
  }).then((r: any) => {
    if (r.status === 400 && r.body?.code === 4011) {
      router.push({ path: '/login' })
      return
    }
    orderTatol.value = r.body
    userStore.changeOrderNum(r.body?.orderPoolCount)
  }).catch(() => {})
}

function showModel(row: any, type: number) {
  clickObj.value = row
  clcikType.value = String(type)
  if (type) {
    request({
      url: '/order/checkIsFirstReceiveExamGiftOrder',
      method: 'get',
      params: { courseId: row.courseId },
    }).then((res: any) => {
      if (res.status == 400) {
        ElNotification({ title: '提示', message: res.body?.msg, type: 'warning' })
        return
      }
      if (res.status == 200) {
        if (row.spoType == 69 && row.copywritingCourse && row.copywritingCourse.type == 3) {
          examTipRef.value?.show(row)
          return
        }
        if (hasScheme(row)) {
          getOrderHasSchemeRef.value?.show()
        } else {
          newGetOrderRef.value?.show()
        }
      }
    }).catch(() => {})
  } else {
    modelObj.value = {
      btnno: '我再看看',
      btnyes: '确定',
      title: '是否要退单?',
      content: '',
      imgShow: false,
      zuoyecontent1: '',
      zuoyecontent2: '',
    }
    clcikType.value = 'tuidan'
    openMask()
  }
}

function confirmgetFun(row: any) {
  closeMask()
  if (row.firstFreeCourse == 1) {
    ElMessageBox.confirm(
      '请在1小时内联系学生，确定破冰课上课时间，需要在24小时内开始课堂哦',
      '提示',
      { confirmButtonText: '确定', type: 'warning', customClass: 'confirmAlert' },
    )
  }
  loading.value = true
  request({
    url: '/order/receiveOrder',
    method: 'post',
    data: { courseId: row.courseId },
  }).then((r: any) => {
    loading.value = false
    if (r.status == 200) {
      ElNotification({ title: '提示', message: r.body?.msg, type: 'success' })
      if (hasBeike(row)) goToBeiKe(row)
      getTableData()
      getClasstotal()
      closeModal()
    } else {
      ElNotification.error(r.body?.msg || '请求失败')
    }
  }).catch(() => {
    loading.value = false
  })
}

function yesFun() {
  const row = clickObj.value
  if (clcikType.value == 'playvideo') {
    courseId.value = row.courseId
    showvideo.value = true
    closeMask()
  } else if (clcikType.value == 'getorder') {
    confirmgetFun(row)
  } else if (clcikType.value == 'tuidan') {
    noapply(row)
  } else {
    closeMask()
  }
}

function openMask() {
  maskShow.value = true
}

function closeMask() {
  maskShow.value = false
  if (newPreExam(clickObj.value)) {
    if (modelObj.value.title == '观看视频?' && !showvideo.value) {
      newGetOrderRef.value?.show()
    }
  }
}

function changeTaps(index: number) {
  isactive.value = index
  localStorage.setItem('ordertap', String(isactive.value))
  searchtext.value = ''
  tableDataName.value = ''
}

function getTableData(isLoadMoreFlag = false) {
  loading.value = true
  request({
    url: '/order/list',
    method: 'get',
    params: {
      page: val.value,
      limit: limit.value,
      statused: 0,
      hasOrderPool: true,
      key: searchtext.value,
      pool: 1,
    },
  }).then((r: any) => {
    loading.value = false
    const list = r.body?.list || []
    total.value = r.body?.totalCount
    if (isLoadMoreFlag) {
      tableDataEnd.value = tableDataEnd.value.concat(list)
    } else {
      tableDataEnd.value = list
    }
    noMore.value = tableDataEnd.value.length >= total.value
    isLoadMore.value = false
  }).catch(() => {
    loading.value = false
  })
}

function see(row: any) {
  if (JudgeNewOrder(row)) {
    goToPublicDetail(row)
  } else if (row.spoType === 64) {
    const resolved = router.resolve({ path: '/bigClassRoom', query: { id: row.courseId, parentId: '' } })
    window.open(resolved.href)
  } else {
    let type = 'daobi'
    if (row.courseType === 4) type = 'wenyaold'
    if (row.spoType === 69) type = 'wenya'
    const resolved = router.resolve({ path: '/sellerDetail', query: { id: row.courseId, type } })
    window.open(resolved.href)
  }
}

function noapply(row: any) {
  request({
    url: '/order/returnedOrder',
    method: 'post',
    data: { courseId: row.courseId },
  }).then((r: any) => {
    if (r.status == 200) {
      ElNotification({ title: '提示', message: r.body?.msg, type: 'success' })
      getTableData()
      getClasstotal()
      closeMask()
    }
    if (r.status == 400) {
      ElNotification({ title: '错误提示', message: r.body?.msg, type: 'error' })
    }
  }).catch(() => {})
}

function handleOrderListScroll() {
  if (loading.value || noMore.value || currentStatus.value !== 2) return
  const el = orderListScroll.value
  if (!el) return
  const threshold = 100
  if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold) {
    loadMoreOrders()
  }
}

function loadMoreOrders() {
  if (loading.value || noMore.value) return
  isLoadMore.value = true
  val.value++
  getTableData(true)
}

function closeModalTest() {
  testOrderObj.value.show = false
}

function receivOrderTest() {
  closeModalTest()
  confirmgetFun(clickObj.value)
}

function closeModal() {
  showInfo.value = false
  examTipRef.value?.closeModal()
  newGetOrderRef.value?.closeModal()
  getOrderHasSchemeRef.value?.closeModal()
}

function receivOrder() {
  confirmgetFun(clickObj.value)
}

function playDLWvideo() {
  videourl.value = 'https://classbro-oss.oss-cn-hongkong.aliyuncs.com/staticUpload/10-15s%E6%94%B9%E6%94%B9%E6%94%B9%E5%8A%A0%E6%B0%B4%E5%8D%B0.mp4'
  showvideo.value = true
  lookLwdlbStatus.value = true
}

function seeOrderScheme(row: any) {
  getOrderHasSchemeRef.value?.show(row)
}

function changeStatus(val: number) {
  currentStatus.value = val
}
</script>

<template>
  <div class="order">
    <div class="orderlist-box minwidth">
      <div
        class="list-wrap cursorpointer"
        @click="changeTaps(i)"
        v-for="(item, i) in ordertaplist"
        :key="i"
      >
        <img :src="isactive == i ? item.bgcolor : taplistbgImg" class="bg-img" />
        <div class="list-box">
          <img :src="isactive == i ? item.beforeimgsrc : item.afterimgsrc" class="icon" />
          <div :class="isactive == i ? 'colorwhite' : ''">
            {{ item.name }}
            <b :class="isactive == i ? 'colorwhite' : ''" v-if="i < 2">
              {{ i == 0 ? orderTatol.orderPoolCount : orderTatol.orderActiveCount }}
            </b>
          </div>
        </div>
      </div>
    </div>
    <div class="content-box">
      <div class="table-list" v-if="isactive == 0" v-loading="loading">
        <div class="head-wrap">
          <div class="type-btn">
            <div
              :class="{ active: currentStatus == item.value }"
              v-for="item in statusList"
              :key="item.value"
              @click="changeStatus(item.value)"
            >
              {{ item.label }}
              <template v-if="item.value == 2 && tableDataEnd.length">
                <span class="red-dot"></span>
              </template>
            </div>
          </div>
          <div class="registration-record" @click="showModal('registrationRecord')" v-show="currentStatus == 1">
            <img src="@/assets/images/registrationRecord.png" style="width: 16px; margin-right: 4px;" />
            报名记录
          </div>
          <div class="notice-set">
            <span v-show="currentStatus == 1">
              设置【每单提醒】可解锁更多抢单权限噢
              <img src="@/assets/images/right.png" alt="" style="vertical-align: sub; margin-right: 4px;" />
            </span>
            <div @click="showModal('newOrderNotice', { teacId: user.id })">
              <i class="el-icon-bell"></i>新订单通知设置
            </div>
          </div>
        </div>
        <rushOrder ref="rushOrderRef" @seeOrderDetail="see" v-if="currentStatus == 1" />
        <template v-else>
          <template v-if="tableDataEnd.length">
            <div ref="orderListScroll" style="height: 520px; overflow: auto;">
              <div v-for="(list, i) in tableDataEnd" :key="i">
                <div class="list-warp">
                  <div class="order-num" v-if="list.borderCount && [6].includes(list.borderType)">{{ list.borderCount }}</div>
                  <img src="@/assets/images/orderlist-new.png" v-if="list.spoType == 67" class="list-newimg" />
                  <div>
                    <div class="order-line">
                      <span class="order-no" @click="see(list)">{{ list.orderNo }}</span>
                      <span class="lighttext-box">预计收入{{ list.planIncome }}G</span>
                    </div>
                    <div class="school-line">
                      <span class="overflowdot cursorpointer">学校名称：{{ list.newSchoolName }}</span>
                      <span>专业：{{ list.professionalCourseName }}</span>
                      <span class="overflowdot cursorpointer">
                        <span v-show="list.endCourseTime && list.borderType != 6">Deal Deadline：{{ list.endCourseTime }}</span>
                      </span>
                    </div>
                    <template v-if="list.copywritingCourse && list.copywritingCourse.type">
                      <div class="mt10" v-if="list.realExamStartTime">
                        Start From:{{ list.realExamStartTime }}
                        <span v-if="list.realExamEndTime"> — To:{{ list.realExamEndTime }}</span>
                      </div>
                    </template>
                    <div v-if="list.borderType" class="b-desc">*此订单为B端订单</div>
                  </div>
                  <i class="el-icon-remove-outline cancel-btn" @click="showModel(list, 0)"></i>
                  <div class="list-btn">
                    <button class="schedule" @click="showModel(list, 1)">接 单</button>
                  </div>
                </div>
              </div>
              <div v-if="noMore" style="text-align: center; color: #999; padding: 20px 0;">没有更多订单了</div>
            </div>
          </template>
          <template v-else>
            <contentnull v-if="tableDataName" :statuscode="tableDataName ? 3 : 0" />
            <handsUp type="2" v-else />
          </template>
        </template>
      </div>
      <myorderNew
        v-if="isactive == 1"
        :postTitle="liactive"
        :tableDataNameto="searchtext"
        :timechangesort="timeIsSort"
        @updategetTime="getUser"
        @seeOrderScheme="seeOrderScheme"
      />
      <salarySystem v-if="isactive == 2" />
    </div>
    <!-- 考试订单接单展示 -->
    <modelbox :datas="testOrderObj" type="1" :current="clickObj" @receivOrder="receivOrderTest" @closeModal="closeModalTest" />
    <!-- 接单框展示 -->
    <div class="new-mask" v-if="maskShow">
      <div class="mask-content" style="z-index: 999999">
        <h3 class="title">{{ modelObj.title }} <b @click="closeMask">+</b></h3>
        <img v-if="!modelObj.imgShow" src="@/assets/images/login-tips.png" class="tips-icon" />
        <p style="padding-left: 20px; padding-right: 20px" v-if="modelObj.content" class="two-box" v-html="modelObj.content"></p>
        <p style="padding-left: 20px; padding-right: 20px; text-align: left;" v-if="modelObj.zuoyecontent1">{{ modelObj.zuoyecontent1 }}</p>
        <p style="padding-left: 20px; padding-right: 20px; text-align: left;" class="two-box" v-if="modelObj.zuoyecontent2" v-html="modelObj.zuoyecontent2"></p>
        <div class="btnbox">
          <button class="default-btn forget-pwd" v-if="modelObj.btnno" @click="closeMask">{{ modelObj.btnno }}</button>
          <button class="defaultlight-btn forget-pwd" v-if="modelObj.btnyes" @click="yesFun">{{ modelObj.btnyes }}</button>
        </div>
      </div>
    </div>
    <el-dialog @close="closevideo" v-model="showvideo" width="50%">
      <video autoplay id="myvideo" ref="myvideo" oncontextmenu="return false;" style="width: 100%" :controls="false" :src="videourl"></video>
      <div class="canclick-box" v-if="videoduration">{{ videocurrent }}/{{ videoduration }}</div>
    </el-dialog>
    <orderReceiving :isShow="showInfo" :current="clickObj" @receivOrder="receivOrder" @closeModal="closeModal" @playVideo="playDLWvideo" />
    <examTip :loading="loading" ref="examTipRef" :current="clickObj" @receivOrder="receivOrder" />
    <newGetOrder :loading="loading" @receivOrder="receivOrder" ref="newGetOrderRef" :current="clickObj" />
    <getOrderHasScheme ref="getOrderHasSchemeRef" @receivOrder="receivOrder" :loading="loading" :row="clickObj" />
    <newOrderNotice ref="newOrderNoticeRef" />
    <registrationRecord ref="registrationRecordRef" />
  </div>
</template>

<style>
.mask-content h3.title {
  line-height: 56px !important;
}
.two-box b {
  color: #ff4e4e;
  font-size: 16px;
}
.search-box .el-select:hover .el-input__inner {
  border-color: rgba(255, 135, 35, 1);
}
.search-box .el-select .el-input__inner {
  border-color: rgba(255, 135, 35, 1);
  color: rgba(255, 135, 35, 1);
}
.search-box .el-input.is-active .el-input__inner,
.el-input__inner:focus {
  border-color: rgba(255, 135, 35, 1);
}
</style>

<style scoped>
.content-box {
  width: 1280px;
  margin: 0 auto;
}
</style>

<style lang="scss" scoped>
.order {
  height: 100%;
  overflow: auto;
}
.orderlist-box {
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
  width: 100%;
  background: url('@/assets/images/ordertapbg.png') no-repeat center center;
  background-size: cover;
  .list-wrap {
    position: relative;
    width: 270px;
    height: 102px;
    .bg-img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }
  }
  .list-box {
    position: relative;
    display: flex;
    width: 250px;
    height: 70px;
    margin: 16px auto;
    z-index: 1;
    .icon {
      position: relative;
      z-index: 1;
      width: 30px;
      height: 30px;
      margin: 10px 14px 0 20px;
    }
    div {
      position: relative;
      width: 50%;
      z-index: 1;
      padding-top: 18px;
      font-size: 18px;
      line-height: 10px;
      text-align: center;
      b {
        display: block;
        margin-top: 10px;
        font-size: 20px;
        line-height: 24px;
      }
    }
  }
}
.colorwhite {
  color: #ffffff;
}
.table-list {
  padding-top: 40px;
  .head-wrap {
    position: relative;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
  }
  .type-btn {
    display: flex;
    height: 25px;
    line-height: 23px;
    border-radius: 15px;
    border: 1px solid #d3d6d9;
    width: 140px;
    div {
      border-radius: 15px;
      flex: 1;
      text-align: center;
      cursor: pointer;
      position: relative;
    }
    .active {
      color: #60b1ff;
      background: #eff4ff;
    }
    .red-dot {
      display: inline-block;
      position: absolute;
      top: 4px;
      right: 8px;
      width: 4px;
      height: 4px;
      background: #ef4343;
      border-radius: 50%;
      z-index: 2;
    }
  }
  .registration-record {
    margin-left: 12px;
    border-radius: 15px;
    border: 1px solid #d3d6d9;
    font-size: 12px;
    padding: 4px 8px;
    cursor: pointer;
    display: flex;
  }
  .notice-set {
    position: absolute;
    right: 0;
    top: 0;
    div {
      cursor: pointer;
      background-color: #ff8723;
      color: #fff;
      font-size: 12px;
      border-radius: 14px;
      line-height: 25px;
      display: inline-block;
      padding: 0 10px;
    }
    span {
      font-size: 12px;
    }
    i {
      color: #fff;
      margin-right: 3px;
      font-size: 12px;
    }
  }
  .list-warp {
    position: relative;
    min-width: 1200px;
    margin-bottom: 10px;
    padding: 20px 30px;
    background: rgba(255, 255, 255, 1);
    border-radius: 6px;
    border: 1px solid rgba(231, 231, 231, 1);
    .list-newimg {
      position: absolute;
      top: 0;
      left: 0;
      width: 50px;
      height: 30px;
    }
    .order-num {
      position: absolute;
      top: 0;
      left: 0;
      width: 25px;
      height: 25px;
      background: #f39c12;
      color: #fff;
      line-height: 25px;
      text-align: center;
      border-radius: 5px 0 0 0;
    }
    .list-btn {
      display: flex;
      align-items: center;
      align-content: center;
      position: absolute;
      right: 120px;
      top: 50px;
      button {
        margin-right: 4px;
      }
    }
  }
}
.mask-content {
  width: 450px;
}
.b-desc {
  color: red !important;
  margin-top: 10px;
}
.cancel-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 17px;
  color: #c0c0c0;
}
:deep(.schedule) {
  background: #ff8723;
  padding: 0 15px;
  border-radius: 16px;
  color: #fff;
  border: none;
  width: 120px;
  height: 25px;
  font-size: 14px;
}
.order-line {
  width: 800px;
  display: flex;
  justify-content: space-between;
  .order-no {
    font-size: 16px;
    font-weight: 600;
    display: inline-block;
    width: 637px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    cursor: pointer;
  }
  .lighttext-box {
    position: relative;
    top: -3px;
  }
}
.school-line {
  width: 800px;
  display: flex;
  margin-top: 10px;
  > span {
    &:nth-of-type(1) {
      flex: 1.6;
    }
    &:nth-of-type(2) {
      flex: 0.8;
      margin: 0 45px;
    }
    &:nth-of-type(3) {
      flex: 1.3;
    }
  }
}
.mt10 {
  margin-top: 10px;
}
.cursorpointer {
  cursor: pointer;
}
</style>
