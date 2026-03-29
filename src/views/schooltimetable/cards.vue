<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { useCalendar } from '@/composables/useCalendar'
import { useClassroom } from '@/composables/useClassroom'
import { formatTime, getweekday } from '@/utils/task/Utils'
import { queryClassroomForDate } from '@/api/modules/classtable'
import ClassCalendarApp from '@/components/ClassCalendarApp/index.vue'
import CourseDetail from './coursedetail.vue'
import AddCourse from './addcourse.vue'
import ChangeModal from './changeModal.vue'
import SettingTimeTip from './settingTimeTip.vue'
import AddNeedNew from '@/views/paperchedule/addNeedNew.vue'
import DownloadApp from '@/components/DownloadApp/index.vue'
import GoClassIn from '@/components/ClassIn/goClassIn.vue'

const router = useRouter()
const { fmtTimestamp, fmtDuration, getZHDateRange, getDeadLine } = useCalendar()
const { goClassInRef, goInClassNew } = useClassroom()

const calendarApp = ref<InstanceType<typeof ClassCalendarApp> | null>(null)
const downloadAppRef = ref<InstanceType<typeof DownloadApp> | null>(null)

const firstTime = ref(0)
const isShowChange = ref(localStorage.getItem('teacType') == '2')
const showClassNum = ref(true)
const isShowTip = ref(false)
const cardloading = ref(false)
const maskShow = ref(false)
const addstatus = ref(false)
const seestatus = ref(false)
const dayValue = ref<any[]>([])
const topType = ref(localStorage.getItem('teacType') == '2' ? 2 : 1)
const showTime = ref(2)
const pickWidth = ref('460px')
const minHeight = ref(28)
const defaultEvents = ref<any[]>([])
const dayData = ref<any[]>([])
const dayCouseNum = ref(0)
const courseObj = ref<any>('')
const addcourestime = ref<any>({
  hhmm: '',
  month: '',
  today: '',
  ymdhm: '',
})
const statusText: Record<number, string> = {
  1: '学生未确认课堂',
  2: '等待上课',
  3: '等待上课',
  4: '正在上课',
  8: '已结束',
  16: '异常课堂',
  32: '取消排课中',
}
const fontColor: Record<number, string> = {
  1: '#355D98', 2: '#355D98', 3: '#355D98', 4: '#FF8D02', 8: '#999999', 16: '#999999',
}
const topColor: Record<number, string> = {
  1: '#5A9CFF', 2: '#5A9CFF', 3: '#5A9CFF', 4: '#FF8D02', 8: '#8A93A7', 16: '#8A93A7',
}
const Color: Record<number, string> = {
  1: '#E5EFFE', 2: '#E5EFFE', 3: '#E5EFFE', 4: '#FFF3E4', 8: '#E8E9EB', 16: '#E8E9EB',
}
const BGColor: Record<number, string> = {
  1: '#E5EFFE', 2: '#E5EFFE', 3: '#E5EFFE', 4: '#FFF3E4', 8: '#E8E9EB', 16: '#E8E9EB',
}
const defaultDate = ref(0)
const dateType = ref(1)
const isLeft0 = ref(true)
const dayIndex = ref(0)
const today = ref('')
const currentDay = ref<any>({})
const loading = ref(false)
const showNeedNew = ref(false)
const orderObj = ref<any>({})
const classInfo = ref<any>({})
const windowHeight = ref(800)
const cacheMoveCalendar = ref<any>({})

function getWindowHeight() {
  windowHeight.value = window.innerHeight
}

onMounted(() => {
  window.addEventListener('resize', getWindowHeight)
  getWindowHeight()
  initFun()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', getWindowHeight)
})

watch(dateType, (val) => {
  if (val !== 1) {
    getdayCardList()
    getTableList(0, new Date(initSummary()).getTime())
    isShowChange.value = false
  } else {
    if (localStorage.getItem('teacType') == '2') {
      isShowChange.value = true
    }
    dealbug()
  }
})

function initFun() {
  const timeData = JSON.parse(localStorage.getItem('dayspanState') || '{"around":0,"type":1}')
  defaultDate.value = timeData.around
  dateType.value = timeData.type
}

function updatetable() {
  const timeData = JSON.parse(localStorage.getItem('dayspanState') || '{"around":0,"type":1}')
  defaultDate.value = timeData.around
  dateType.value = timeData.type
  getTableList(timeData.type, timeData.around)
  firstTime.value = timeData.around
}

function showCourseFun(status: string, obj?: any) {
  if (obj && obj.recordType == 2) return
  if (status === 'addstatus') {
    // adding course
  } else {
    courseObj.value = obj
  }
  maskShow.value = true
  if (status === 'addstatus') addstatus.value = true
  if (status === 'seestatus') seestatus.value = true
}

function in_classroom(row: any) {
  goInClassNew(row.secretKey, row.teacherJoinUrl, row)
}

function closeMask(status: string) {
  maskShow.value = false
  if (status === 'addstatus') addstatus.value = false
  if (status === 'seestatus') seestatus.value = false
  classInfo.value = {}
}

function onPicked(data: any) {
  const day = data.calendar?.days?.[0]
  if (day && day.month !== currentDay.value.month) {
    currentDay.value = day
    getdayCardList()
  }
  isShowChange.value = false
  if (dateType.value === data.type && defaultDate.value === data.time) return
  defaultDate.value = data.time
  dateType.value = data.type
  getTableList(data.type, data.time)
  firstTime.value = data.time
}

function changeDate(eventUpdate: any) {
  if (dateType.value === eventUpdate.type && defaultDate.value === eventUpdate.time) return
  defaultDate.value = eventUpdate.time
  dateType.value = eventUpdate.type
  getTableList(eventUpdate.type, eventUpdate.time)
  firstTime.value = eventUpdate.time
  getDayIndex(eventUpdate)
}

function getDayIndex(day: any) {
  if (day.time < new Date().getTime()) {
    const nowday = formatTime(new Date(), 'Y-M-D') + ' 00:00:00'
    dayIndex.value =
      day.calendar?.days?.findIndex(
        (v: any) => v.date._d.getTime() === new Date(nowday).getTime(),
      ) ?? 0
  } else {
    dayIndex.value = 0
  }
}

function mouseDown(e: any) {
  const { time } = e
  const { month, today: td, hhmm, ymdhm } = fmtTimestamp(time.time)
  cacheMoveCalendar.value = { month, today: td, hhmm, ymdhm }
}

function mouseUp(e: any) {
  const { time } = e
  const { month, today: td, hhmm, ymdhm } = fmtTimestamp(time.time)
  const {
    month: startM,
    today: startT,
    hhmm: startH,
    ymdhm: startY,
  } = cacheMoveCalendar.value

  let _start: string, _end: string, _direction: string
  if (ymdhm < startY) {
    _direction = '-'
    _start = startY
    _end = ymdhm
  } else {
    _direction = '+'
    _start = ymdhm
    _end = startY
  }

  let calc = dayjs(_start).diff(dayjs(_end), 'minute') / 60

  if (startY) {
    if (calc < 0.5) calc = 0.5
    addcourestime.value = { month, today: td, hhmm, ymdhm }
    addcourestime.value.ymdhm = startY
    addcourestime.value.startTime = _end.substr(10, 20)
    addcourestime.value.endTime = _start.substr(10, 20)
    addcourestime.value.calc = calc
    addcourestime.value.direction = _direction
    showCourseFun('addstatus', addcourestime.value)
  }
  cacheMoveCalendar.value = {}
}

function handleMove(e: any) {
  const [_, move] = e
  move.callback()
}

function handleMoveData(e: any) {
  const { time, detail } = e
  const { month, today: td, hhmm, ymdhm } = fmtTimestamp(time)
  addcourestime.value = { month, today: td, hhmm, ymdhm }
}

function backDateRange() {
  if (!currentDay.value.date) {
    currentDay.value = calendarApp.value?.calendar?.days?.[0] || {}
  }
  const day = currentDay.value.date?._d || new Date()
  const year = day.getFullYear()
  const mm = day.getMonth() + 1
  const start = new Date(`${year}-${mm}-01`).getTime()
  const end = new Date(`${year}-${mm}-${new Date(year, mm, 0).getDate()}`).getTime() + 8.64e7
  return { startTime: start, endTime: end, status: [2] }
}

async function getdayCardList() {
  loading.value = true
  dayData.value = []
  const params = backDateRange()
  const res: any = await queryClassroomForDate(params)
  loading.value = false
  if (res.status === 400 && res.body?.code === 4011) {
    router.push({ path: '/login' })
    return
  }
  if (res.status === 200) {
    dayData.value = res.body || []
    dayData.value.forEach((v: any) => {
      v.off = v.teacScheduleVo && v.teacScheduleVo.timeState == 1
      v.disableFlag = v.teacScheduleVo && v.teacScheduleVo.disableFlag
    })
  }
}

async function getTableList(type: number, startTime: number) {
  dayValue.value = []
  defaultEvents.value = []
  const timeSpace = 86400000
  const endTime = startTime + timeSpace * (type ? 7 : 1)
  cardloading.value = true
  const start = formatTime(startTime, 'Y-M-D h:m:s')
  const end = formatTime(endTime, 'Y-M-D h:m:s')
  const res: any = await queryClassroomForDate({
    startTime: parseInt(String(startTime)),
    endTime: parseInt(String(endTime)),
    start,
    end,
  })
  cardloading.value = false
  if (res.status === 400 && res.body?.code === 4011) {
    router.push({ path: '/login' })
    return
  }
  if (res.status === 200) {
    const allData = res.body || []
    if (type === 0) {
      // Day mode
      const item = allData[0]
      if (!item) return
      addcourestime.value.ymdhm = item.date
      addcourestime.value.hhmm = ''
      dayCouseNum.value = item.classrooms?.length || 0
      const dayValueArr: any[] = []
      item.classrooms?.forEach((smallitem: any) => {
        const dayallobj = { ...smallitem }
        const t =
          (smallitem.spoType == 69 && smallitem.specialOrderExtType != 128) || smallitem.spoType == 65
            ? 2
            : 1
        dayallobj.time = handleTime(
          smallitem.startTime.replace(/-/g, '/'),
          smallitem.endTime.replace(/-/g, '/'),
          t,
        )
        dayallobj.data = []
        dayValueArr.push(dayallobj)
      })
      dayValue.value = JSON.parse(JSON.stringify(dayValueArr))
    } else {
      // Week mode
      clearLocalStorage()
      dayData.value = allData
      dayData.value.forEach((v: any) => {
        v.off = v.teacScheduleVo?.timeState == 1
        v.disableFlag = v.teacScheduleVo?.disableFlag
      })
      allData.forEach((list: any) => {
        list.classrooms?.forEach((listsmall: any) => {
          let {
            startTime: st,
            endTime: et,
            name,
            teacherJoinUrl,
            statused,
            id,
            cdId,
            orderNo,
            recordType,
            spoType,
            specialOrderExtType,
            shengwangFlag,
            secretKey,
            bordertype,
          } = listsmall
          st = st.replace(/-/g, '/')
          et = et.replace(/-/g, '/')
          let dateRange = getZHDateRange(st, et)

          if ((spoType == 69 && specialOrderExtType != 128) || spoType == 65) {
            dateRange = 'Deal dealine ' + getDeadLine(st)
            et = formatTime(new Date(st).getTime() + 60 * 1000, 'Y-M-D h:m')
          }

          const duration = fmtDuration(st, et)
          const { month, today: td, hhmm, ymdhm } = fmtTimestamp(st)
          setCalendar(month, td, hhmm, ymdhm, duration, dateRange, {
            className: name,
            teacherJoinUrl,
            statused,
            startTime: st,
            endTime: et,
            id,
            cdId,
            orderNo,
            recordType,
            spoType,
            specialOrderExtType,
            shengwangFlag,
            secretKey,
            bordertype,
          })
        })
      })
    }
  }
}

function clearLocalStorage() {
  const { data } = getLocalStorage()
  data.events = []
  localStorage.setItem('dayspanState', JSON.stringify(data))
}

function getLocalStorage() {
  const storage = localStorage.getItem('dayspanState')
  const data = storage ? JSON.parse(storage) : { events: [] }
  return {
    data,
    events: data.events,
    exist: data.events && data.events.length > 0,
  }
}

function setCalendar(
  month: number,
  td: number,
  hhmm: string,
  ymdhm: string,
  duration: number,
  dateRange: string,
  form: Record<string, any>,
) {
  const sto = JSON.parse(localStorage.getItem('dayspanState') || '{"events":[]}')
  const _data = { month, today: td, hhmm, ymdhm, duration, dateRange }
  const {
    className,
    startTime: st,
    endTime: et,
    statused,
    teacherJoinUrl,
    id,
    cdId,
    orderNo,
    recordType,
    spoType,
    shengwangFlag,
    secretKey,
    bordertype,
  } = form
  const statusedtext = statused >= 16 ? (statused != 32 ? 16 : 32) : statused
  const statused2 = statused >= 16 ? 16 : statused
  const data_ = {
    data: {
      className,
      orderNo,
      recordType,
      dateRange,
      startTime: st,
      endTime: et,
      statused: statusText[statusedtext],
      teacherJoinUrl,
      statusColor: Color[statused2],
      color: BGColor[statused2],
      fontColor: fontColor[statused2],
      topColor: topColor[statused2],
      id,
      cdId,
      _data,
      shengwangFlag,
      secretKey,
      spoType,
      bordertype,
    },
    schedule: {
      month: [month],
      dayOfMonth: [td],
      times: [hhmm],
      duration,
    },
  }
  defaultEvents.value.push(data_)
  sto.events.push(data_)
  localStorage.setItem('dayspanState', JSON.stringify(sto))
  calendarApp.value?.loadState()
}

function handleTime(startTime: string, endTime: string, type = 1): string {
  return type === 1
    ? formatTime(startTime, 'h:m') + '-' + formatTime(endTime, 'h:m')
    : formatTime(startTime, 'h:m')
}

function changeOff(day: any, index: number) {
  isShowChange.value = true
  dayIndex.value = index
  if (!dateType.value) {
    today.value = formatTime(new Date(day._d), 'Y-M-D')
    dayIndex.value = day.dayOfMonth - 1
  } else {
    today.value = formatTime(new Date(day._d), 'Y-M-D')
  }
}

function closeModal(type: string) {
  if (type === 'isShowChange') isShowChange.value = false
}

function goToday(data: any) {
  nextTick(() => {
    calendarApp.value?.changePattern(0)
  })
  const time = new Date(formatTime(data.startTime, 'Y/M/D') + ' 00:00:00')
  const params = { time: time.getTime(), type: 0 }
  const now = new Date(initSummary()).getTime()
  const days = getDaysBetween(params.time, now)
  setTimeout(() => {
    for (let i = 0; i < Math.abs(days); i++) {
      if (days < 0) {
        calendarApp.value?.prev()
      } else {
        calendarApp.value?.next()
      }
    }
    getTableList(0, params.time)
    getdayCardList()
  }, 1000)
}

function getExamStatus(list: any): string {
  const time = new Date(list.startTime).getTime()
  const endtime = new Date(list.endTime).getTime()
  const now = new Date().getTime()
  if (now < time) return '等待考试'
  if (now >= time && now < endtime) return '考试中'
  return '已完成'
}

function changeSwitch(obj: any, index: number, type: number, flag: number) {
  if (flag === 1) {
    dayData.value[index] = obj
    dayData.value[index].off = type === 1
  } else {
    dayData.value[index].teacScheduleVo.timeState = type
  }
}

function goToOrderDetail(row: any) {
  let url: any
  if (row.spoType === 64) {
    url = router.resolve({
      path: '/bigClassRoom',
      query: { id: row.cdId, parentId: '' },
    })
  } else {
    const type = row.orderTypeed === 4 ? 'wenya' : 'daobi'
    url = router.resolve({
      path: '/sellerDetail',
      query: { id: row.cdId, type },
    })
  }
  window.open(url.href)
}

function setdateType(val: number) {
  dateType.value = val
}

function dealbug() {
  const week = getweekday(initSummary())
  if (week === '日') {
    getTableList(1, calendarApp.value?.calendar?.start?.time || Date.now())
  }
}

function initSummary(): string {
  const date = calendarApp.value?.summary || dayjs().format('YYYY-MM-DD')
  const year = date.substring(0, 4)
  const month = date.substring(5, 7)
  const day = date.substring(8, 10)
  return `${year}/${month}/${day}`
}

function getDaysBetween(time1: number, time2: number): number {
  return (time1 - time2) / (1 * 24 * 60 * 60 * 1000)
}

function closeDialog() {
  showNeedNew.value = false
  updatetable()
}

function editClass(list: any) {
  showCourseFun('addstatus', list)
  classInfo.value = list || {}
}
</script>

<template>
  <section
    class="calendarcards"
    :class="{ 'small-view': windowHeight < 700 }"
    v-loading="cardloading"
  >
    <ClassCalendarApp
      class="calendar-wrap-style"
      ref="calendarApp"
      :value="defaultEvents"
      :dayValue="dayValue"
      :eventHeight="21.6"
      :dayData="dayData"
      :hasBorder="2"
      :showTime="showTime"
      :topType="topType"
      :pickWidth="pickWidth"
      :minHeight="minHeight"
      :showClassNum="showClassNum"
      :isLeft0="isLeft0"
      @picked="onPicked"
      @change-date="changeDate"
      @prompt="handleMove"
      @event-update="handleMoveData"
      @mouse-up="mouseUp"
      @mouse-down="mouseDown"
      @changeOff="changeOff"
      @setdateType="setdateType"
    >
      <!-- Week mode event slot -->
      <template #eventTimeTitle="{ calendarEvent, details }">
        <div
          class="pact-panel"
          @click.stop="goToday(details)"
          :style="{
            'background-color': details.statusColor,
            'border-color': details.topColor,
          }"
        >
          <el-tooltip
            :content="details.dateRange"
            placement="top"
            v-if="details.recordType"
          >
            <template #content>
              <div style="color: #fff">{{ details.dateRange }}</div>
              <div
                class="b-desc"
                v-if="(details.statused === '正在上课' || details.statused === '等待上课' || details.spoType == '64') && details.bordertype && details.recordType == 1"
              >*此为B端课堂</div>
            </template>
            <div
              class="card-item"
              @click.stop="goToday(details)"
              :style="{
                'background-color': details.recordType == 1 ? details.statusColor : '#E93A3A',
              }"
            >
              <span
                class="class-name"
                :style="{
                  color: details.recordType == 1 ? details.fontColor : '#FFF',
                  width: details.statused === '正在上课' || details.statused === '等待上课' ? '60%' : '100%',
                }"
              >{{ details.recordType == 1 ? details.className : details.orderNo }}</span>
              <div
                class="in-class"
                v-if="details.statused === '正在上课' || details.statused === '等待上课' || details.spoType == '64'"
                @click.stop="in_classroom(details)"
              > 进课堂</div>
            </div>
          </el-tooltip>
        </div>
      </template>

      <!-- Day mode content slot -->
      <template #classContent="{ dayValue: dv, summary }">
        <div class="showcurse-box">
          <h3>
            {{ summary }} <span>共{{ dayCouseNum }}节课</span>
          </h3>
          <ul v-if="dv.length > 0">
            <li
              v-for="list in dv"
              :key="list.id"
              class="class-box"
            >
              <h5 class="time-box">
                <h6 class="list-time">{{ list.time }}</h6>
                <span
                  :class="'status' + list.statused"
                  v-if="list.recordType == 1"
                >{{ statusText[list.statused] }}</span>
                <span v-if="list.recordType == 2">
                  <span
                    v-if="list.spoType == 69 && list.specialOrderExtType == 128"
                    class="bg-red"
                    :class="{ 'bg-gray': getExamStatus(list) === '已完成' }"
                  >{{ getExamStatus(list) }}</span>
                  <span
                    v-else
                    class="bg-red"
                    :class="{ 'bg-gray': [16, 32].includes(list.teacOrderStatused) }"
                  >Deal Dealine</span>
                </span>
              </h5>
              <div
                class="course-content cursorpointer"
                @click="showCourseFun('seestatus', list)"
              >
                <p class="b-desc" v-if="list.bordertype">*此为B端课堂</p>
                <p>
                  <b @click.stop="goToOrderDetail(list)">{{ list.orderNo }}</b>
                </p>
                <p>
                  <b style="font-weight: 400">{{ list.name }}</b>
                  {{ list.description }}
                </p>
                <template v-if="list.statused == 4 || list.statused == 2 || list.spoType == '64'">
                  <button class="default-btn" @click.stop="in_classroom(list)">
                    进入课堂
                  </button>
                </template>
                <button
                  class="default-btn edit-btn"
                  v-if="[1, 2].includes(list.statused)"
                  @click.stop="editClass(list)"
                > 修改课堂</button>
              </div>
            </li>
          </ul>
          <div
            class="addCourse-box cursorpointer"
            @click="showCourseFun('addstatus')"
          >
            <i class="el-icon-circle-plus-outline"></i>
            <div> 安排课程</div>
          </div>
          <div
            class="time-mask"
            :style="{ width: parseInt(pickWidth) - 10 + 'px' }"
            v-if="loading"
            v-loading="loading"
          ></div>
        </div>
      </template>
    </ClassCalendarApp>

    <!-- Modals -->
    <div class="new-mask" v-if="maskShow">
      <CourseDetail
        v-if="seestatus"
        @close="closeMask"
        :coursedata="courseObj"
        @successFun="updatetable"
      />
      <AddCourse
        v-if="addstatus"
        @close="closeMask"
        :addcourestime="addcourestime"
        :classInfo="classInfo"
        @successFun="updatetable"
      />
    </div>

    <ChangeModal
      v-if="isShowChange && ((dateType == 1 && dayData[dayIndex] && dayData[dayIndex].disableFlag) || !dateType)"
      :dayIndex="dayIndex"
      :today="today"
      :firstTime="firstTime"
      :dayData="dayData"
      :dateType="dateType"
      @getdayCardList="getdayCardList"
      @getTableList="getTableList"
      @closeModal="closeModal('isShowChange')"
      @changeSwitch="changeSwitch"
    />

    <AddNeedNew
      :isShow="showNeedNew"
      :hasPermision="true"
      :deadline="orderObj.endCourseTime"
      :orderObj="orderObj"
      @closeModal="closeDialog"
    />

    <DownloadApp ref="downloadAppRef" />
    <GoClassIn ref="goClassInRef" />
  </section>
</template>

<style lang="scss" scoped>
.calendar-wrap {
  height: 100%;
}
.card-item {
  line-height: 20px;
  width: 100%;
}
.pact-panel {
  border-top: 3px solid #fff;
}
.class-name {
  display: inline-block;
  width: 60%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 16px;
}
.in-class {
  position: absolute;
  right: 5px;
  top: 5px;
  display: inline-block;
  width: 50px;
  border-radius: 17px;
  height: 18px;
  line-height: 16px;
  border: 1px solid #ff8723;
  color: #ff8723;
  padding: 0 5px;
  font-size: 11px;
  box-sizing: border-box;
}
.calendar-wrap-style {
  // day picker styles
}
:deep(.ds-day-picker .ds-day-pick) {
  margin-bottom: 50px;
}
:deep(.switch-img) {
  margin-top: 20px;
  width: 15px;
  height: auto;
}
:deep(.ds-day .ds-week-class) {
  width: 100%;
  top: 60px;
  right: -2px;
}
.class-box {
  padding-left: 160px;
  position: relative;
}
.time-box {
  display: inline-block;
  width: 120px;
  position: absolute;
  left: 20px;
}
.list-time {
  font-weight: 700;
  font-size: 16px;
  border: none;
  padding: 10px 10px 10px 0;
}
.course-content {
  display: inline-block;
  width: 100%;
  position: relative;
  padding-right: 123px;
  p {
    font-size: 16px;
    line-height: 26px;
    word-break: break-all;
  }
}
.bg-red {
  background: #e93a3a;
}
:deep(.v-menu--inline) {
  left: 0;
  width: 100%;
}
.time-mask {
  height: 80%;
  background: rgba(255, 255, 255, 0.8);
  position: absolute;
  top: 80px;
  left: 16px;
}
.default-btn {
  position: absolute;
  top: calc(50% - 23px);
  right: 20px;
}
.bg-gray {
  background: #ccc;
}
:deep(.calendar-wrap-style .ds-week-header .ds-day .ds-week-weekday) {
  margin-bottom: 12px;
}
.edit-btn {
  right: 120px;
}
.help {
  width: 20px;
  height: 20px;
  float: right;
  margin-right: 10px;
}
.b-desc {
  color: red !important;
  font-size: 12px !important;
}
.tip {
  position: absolute;
  top: calc(50% + 20px);
  right: 20px;
  color: red;
  font-size: 12px !important;
}
.addCourse-box {
  padding: 10px 0;
  i {
    color: #ff8723;
    font-size: 40px;
    margin-bottom: 8px;
  }
}
:deep(.ds-week-view) {
  margin-bottom: 100px;
  height: 100%;
}
.small-view :deep(.ds-week-view-container .ds-week-view-bottom) {
  margin-bottom: calc(780px - 100vh);
}
.new-mask {
  align-items: unset !important;
  padding-top: 15vh;
}
:deep(.ds-day-picker) {
  min-height: 850px;
}
</style>
