<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElNotification } from 'element-plus'
import dayjs from 'dayjs'
import { useCalendar } from '@/composables/useCalendar'
import { useAddCourse } from '@/composables/useAddCourse'
import { useDissertationStore } from '@/stores/dissertation'
import { getPlanningTableVersion, getTaskStatus } from '@/api/modules/paper'
import { getPlanningChooseArea, putCatalogue, editClass, getOrderTime } from '@/api/modules/preExam'
import { getSelectlist } from '@/api/modules/order'
import { putClassroom, updateOrderClassroom } from '@/api/modules/order'
import { getOrderStageList } from '@/api/modules/classtable'
import { formatTime } from '@/utils/task/Utils'
import { goToPreExamSchedule } from '@/utils/common'
import iconCourse from '@/assets/images/icon-course.png'
import iconDesc from '@/assets/images/icon-desc.png'
import iconTime from '@/assets/images/icon-time.png'

const props = defineProps<{
  addcourestime: Record<string, any>
  courseDetail?: Record<string, any> | null
  classInfo?: Record<string, any>
}>()

const emit = defineEmits<{
  close: [status: string]
  successFun: []
}>()

const { fmtTimestamp, fmtDuration } = useCalendar()
const { beijingTime, getBeiJinTime } = useAddCourse()
const dissertationStore = useDissertationStore()

const orderObj = ref<any>({})
const dateStart = ref('')
const dateEnd = ref('')
const minstartTime = ref('')
const minendTime = ref('')
const ruleForm = ref<any>({
  order: '',
  startTime: '',
  stageId: '',
  taskId: '',
  endTime: '',
  description: '',
  times: '',
  beforeNotifyTime: '',
  hour: '',
  minute: '',
  teacherType: localStorage.getItem('teacType'),
})
const stagelist = ref<any[]>([])
const stageLoading = ref(false)
const rules = {
  // validators kept for form structure
}
const orderlist = ref<any[]>([])
const orderLoading = ref(false)
const canAddCourse = ref(false)
const timeTip = [
  { name: '不提醒', value: '-1' },
  { name: '开始时提醒', value: 0 },
  { name: '5分钟前', value: 5 },
  { name: '15分钟前', value: 15 },
  { name: '30分钟前', value: 30 },
  { name: '一个小时前', value: 60 },
  { name: '两个小时前', value: 120 },
  { name: '一天前', value: 240 },
]
const addLoading = ref(false)
const timeArr = ref('')
const pickerOptions2 = ref<any>('')
const taskInstances = ref<any[]>([])
const version = ref(1)
const taskCompleteStatus = ref(false)
const minList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']
const preExamClassTypeList = ref<any[]>([])
const editClassTimeObj = ref<any>({ hour: 0, min: 0 })
const orderTimeInfo = ref<any>({})
const showNeedNewFromParent = ref(false)

watch(dateStart, (val) => {
  pickerOptions2.value = {
    disabledDate(time: Date) {
      const mintime = new Date(val)
      return time.getTime() <= mintime.getTime() - 8.64e7
    },
  }
})

const list = computed(() => {
  let items = getCurStage(ruleForm.value.stageId)?.taskInstances || []
  if (isEdit.value && !['自主课堂', null].includes(ruleForm.value.taskId)) {
    items = items.filter((task: any) => task.classroomFlag == 2)
    items.push({ remark: '自主课堂', id: '自主课堂' })
    return items
  } else {
    items = items.filter((v: any) => v.mission != 1 && v.classroomFlag == 2)
    items.push({ remark: '自主课堂', id: '自主课堂' })
    return items
  }
})

const showfillNeed = computed(() => {
  const stage = getCurStage(ruleForm.value.stageId) || {} as any
  return (
    stage.type == 1 &&
    ruleForm.value.taskId &&
    ruleForm.value.taskId !== '自主课堂' &&
    version.value == 3 &&
    !taskCompleteStatus.value
  )
})

const isEdit = computed(() => {
  return Boolean(props.classInfo && props.classInfo.roomId)
})

const classEndTime = computed(() => {
  if (ruleForm.value.startTime && dateStart.value && ruleForm.value.minute && ruleForm.value.hour) {
    return dateEnd.value + ' ' + ruleForm.value.endTime
  }
  return ''
})

const newPreExam = computed(() => {
  return orderObj.value.spoType == 1 && [2, 3].includes(orderObj.value.spoVersion)
})

const BBPreExamOrCustomized = computed(() => {
  return orderTimeInfo.value.isBB && Number(timeInfo.value.residueTime) <= 0
})

const totalClassTime = computed(() => {
  return Number(((timeInfo.value.scheduledTime || 0) / 60).toFixed(1)) || 0
})

const usedTime = computed(() => {
  return (
    (Number(((timeInfo.value.schoolTime || 0) / 60).toFixed(1)) || 0) +
    (Number(ruleForm.value.hour || 0) - Number(editClassTimeObj.value.hour)) +
    (Number(ruleForm.value.minute || 0) - Number(editClassTimeObj.value.min)) / 60
  ).toFixed(1)
})

const showExtra = computed(() => {
  return orderTimeInfo.value.isBB && Number(totalClassTime.value) <= Number(usedTime.value)
})

const timeInfo = computed(() => {
  return orderTimeInfo.value.roomInfo || {}
})

onMounted(async () => {
  await getBeiJinTime()
  if (props.courseDetail) {
    orderlist.value = [
      {
        courseId: props.courseDetail.courseId,
        orderNo: props.courseDetail.orderNo,
      },
    ]
    ruleForm.value.order = props.courseDetail.courseId
    return
  }
  if (props.classInfo && props.classInfo.roomId) {
    ruleForm.value.name = props.classInfo.name
    ruleForm.value.description = props.classInfo.description
    dateStart.value = formatTime(props.classInfo.startTime.replace(/-/g, '/'), 'Y-M-D')
    initMin(dateStart.value)
    dateEnd.value = formatTime(props.classInfo.endTime.replace(/-/g, '/'), 'Y-M-D')
    ruleForm.value.startTime = formatTime(props.classInfo.startTime.replace(/-/g, '/'), 'h:m')
    ruleForm.value.endTime = formatTime(props.classInfo.endTime.replace(/-/g, '/'), 'h:m')
    editClassTimeObj.value = dealHourAndMin(props.classInfo.startTime, props.classInfo.endTime, 'ruleForm')
    await fetchSelectlist()
    ruleForm.value.order = props.classInfo.cdId
    chooseOrder(props.classInfo.cdId)
    ruleForm.value.stageId = props.classInfo.stageId
    ruleForm.value.taskId = props.classInfo.taskId || '自主课堂'
    ruleForm.value.id = props.classInfo.id
    ruleForm.value.stageType = props.classInfo.stageType
    ruleForm.value.beforeNotifyTime = [-1].includes(props.classInfo.beforeNotifyTime)
      ? String(props.classInfo.beforeNotifyTime)
      : props.classInfo.beforeNotifyTime
    return
  }
  if (props.addcourestime && props.addcourestime.hhmm) {
    fetchSelectlist()
    const { ymdhm, startTime, endTime, calc } = props.addcourestime
    const duration = calc
    let afterTime = ''
    let beforeTime = ''
    if (props.addcourestime.direction === '-') {
      beforeTime = ymdhm.substr(0, 10) + startTime + ':00'
      afterTime = dayjs(ymdhm).format('YYYY-MM-DD HH:mm:ss')
    } else {
      afterTime = dayjs(ymdhm).add(duration, 'hour').format('YYYY-MM-DD HH:mm:ss')
      beforeTime = dayjs(ymdhm).format('YYYY-MM-DD HH:mm')
    }
    timeArr.value = [beforeTime, afterTime] as any
    dateStart.value = beforeTime.substr(0, 10)
    dateEnd.value = afterTime.substr(0, 10)
    if (new Date(dateStart.value).getTime() < new Date(beijingTime.value).getTime()) {
      dateStart.value = formatTime(new Date(beijingTime.value).getTime(), 'Y-M-D')
      changpick(dateStart.value)
      return
    }
    if (props.addcourestime.calc) {
      ruleForm.value.startTime = beforeTime.substr(11, 5)
      ruleForm.value.endTime = afterTime.substr(11, 5)
    } else {
      ruleForm.value.startTime = ''
    }
  } else {
    fetchSelectlist()
    ruleForm.value.startTime = ''
  }
})

function gotopaper() {
  dissertationStore.gotoDissertation({
    courseId: orderObj.value.courseId,
    readonly: false,
  })
}

function getNowHour() {
  const hours = String(new Date(beijingTime.value as any).getHours()).padStart(2, '0')
  const mins = String(new Date(beijingTime.value as any).getMinutes()).padStart(2, '0')
  const startTimes = hours + ':' + mins
  minstartTime.value = startTimes
  minendTime.value = startTimes
  ruleForm.value.startTime = startTimes
}

function closeMask() {
  ruleForm.value.startTime = ''
  ruleForm.value.endTime = ''
  minstartTime.value = ''
  minendTime.value = ''
  emit('close', 'addstatus')
}

async function fetchSelectlist() {
  const params = { page: 1, limit: 1000, sidx: 1, statused: 3, pcrs: 1 }
  orderLoading.value = true
  const res: any = await getSelectlist(params)
  orderLoading.value = false
  if (res.status === 200) {
    orderlist.value = res.body?.list || []
  }
}

async function fetchStagelist() {
  stageLoading.value = true
  const res: any = await getOrderStageList({ courseId: orderObj.value.courseId })
  stageLoading.value = false
  if (res.status === 200) {
    stagelist.value = res.body || []
  }
}

function changpick(val: string) {
  const now = formatTime(new Date(beijingTime.value as any).getTime(), 'Y-M-D')
  if (val !== now) {
    minstartTime.value = ''
    minendTime.value = ''
    dateEnd.value = ''
    ruleForm.value.endTime = ''
  } else {
    getNowHour()
    ruleForm.value.endTime = ''
  }
  getEndTime()
}

function initMin(val: string) {
  const now = formatTime(new Date(beijingTime.value as any).getTime(), 'Y-M-D')
  if (val !== now) {
    minstartTime.value = ''
  } else {
    const hours = String(new Date(beijingTime.value as any).getHours()).padStart(2, '0')
    const mins = String(new Date(beijingTime.value as any).getMinutes()).padStart(2, '0')
    minstartTime.value = hours + ':' + mins
  }
}

function chooseOrder(val: string | number) {
  orderlist.value.forEach((item) => {
    if (item.courseId == val) {
      orderObj.value = item
    }
  })
  ruleForm.value.stageId = ''
  ruleForm.value.taskId = ''
  taskInstances.value = []
  if (newPreExam.value) fetchPlanningChooseArea()
  if (orderObj.value.spoType == 65 && orderObj.value.courseVersion > 1) {
    fetchStagelist()
  }
  canAddCourse.value = false
  if (orderObj.value.spoType == 4 || orderObj.value.spoType == 32 || orderObj.value.spoType == 64 || orderObj.value.spoType == 66) {
    canAddCourse.value = true
    ElNotification({ title: '提示', type: 'error', message: '改订单类型不能进行排课！' })
  }
  fetchOrderTime(val)
}

function chooseStage() {
  const arr = stagelist.value.filter((e) => e.id == ruleForm.value.stageId)
  taskInstances.value = arr[0].taskInstances
  const missionList = taskInstances.value.filter((v: any) => v.mission != 1 && v.classroomFlag == 2) || []
  missionList.push({ remark: '自主课堂', id: '自主课堂' })
  ruleForm.value.taskId = missionList[0].id
  fetchPlanningTableVersion()
  fetchTaskStatus()
}

async function submitForm1() {
  if (canAddCourse.value || addLoading.value) return
  if (orderObj.value.spoType == 4 || orderObj.value.spoType == 32 || orderObj.value.spoType == 64 || orderObj.value.spoType == 66) {
    return ElNotification({ title: '提示', type: 'error', message: '改订单类型不能进行排课！' })
  }
  const cdId = orderObj.value.courseId || (props.courseDetail && props.courseDetail.courseId)
  const { name, startTime, endTime, description, beforeNotifyTime, stageId, taskId, hour, minute } = ruleForm.value
  if (!cdId || !name || !startTime || !endTime || !description || beforeNotifyTime === '' || !hour || !minute) {
    return ElNotification({ title: '提示', type: 'error', message: '有数据未填写成功，请检查！' })
  }
  if (!stageId && orderObj.value.spoType == 65 && orderObj.value.courseVersion > 1 && !orderObj.value.borderType) {
    return ElNotification({ title: '提示', type: 'error', message: '课堂阶段未选择无法排课！' })
  }
  addLoading.value = true
  let params1: any = {
    cdId,
    name,
    startTime: dateStart.value + ' ' + startTime + ':00',
    endTime: dateEnd.value + ' ' + endTime + ':00',
    description,
    roomType: 1,
    decimalRoomCost: '',
    studId: '',
    taskId,
    stageId,
    beforeNotifyTime,
  }
  if (params1.taskId === '自主课堂') params1.taskId = null
  if (ruleForm.value.id) params1.id = ruleForm.value.id

  if (newPreExam.value) {
    await doPutCatalogue(params1)
  } else {
    const apiFn = isEdit.value ? updateOrderClassroom : putClassroom
    const res: any = await apiFn(params1)
    addLoading.value = false
    if (res.status === 200) {
      ElNotification({ title: '提示', type: 'success', message: '操作成功' })
      if (showfillNeed.value) {
        showNeedNewFromParent.value = true
      } else {
        emit('successFun')
      }
      closeMask()
    } else {
      canAddCourse.value = false
      ElNotification({ title: '提示', type: 'error', message: res.body?.msg })
    }
  }
}

async function fetchPlanningTableVersion() {
  const res: any = await getPlanningTableVersion({ courseId: orderObj.value.courseId })
  if (res.status === 200) {
    version.value = res.body?.version
  }
}

async function fetchTaskStatus() {
  const res: any = await getTaskStatus({ courseId: orderObj.value.courseId, taskType: 11 })
  if (res.status === 200) {
    taskCompleteStatus.value = res.body?.taskCompleteStatu == 2
  }
}

function getCurStage(id: any) {
  return stagelist.value.find((item) => item.id == id)
}

function getEndTime() {
  const { hour, minute } = ruleForm.value
  const start = dateStart.value + ' ' + ruleForm.value.startTime + ':00'
  const end = getTime(start) + (hour || 0) * 60 * 60 * 1000 + (minute || 0) * 60 * 1000
  dateEnd.value = formatTime(end, 'Y-M-D')
  ruleForm.value.endTime = formatTime(end, 'h:m')
}

function dealHourAndMin(start: string, end: string, type: string) {
  const time = getTime(end) - getTime(start)
  const hour = Math.floor(time / (1000 * 60 * 60))
  let min: string | number = Math.floor((time - hour * 1000 * 60 * 60) / (1000 * 60))
  min = min < 10 ? '0' + min : String(min)
  ruleForm.value.hour = String(hour)
  ruleForm.value.minute = min
  return { hour, min }
}

function getTime(time: string): number {
  return time ? new Date(time.replace(/-/g, '/')).getTime() : 0
}

async function fetchPlanningChooseArea() {
  const res: any = await getPlanningChooseArea({ courseId: orderObj.value.courseId })
  if (res.status === 200) {
    const data = res.body || []
    preExamClassTypeList.value = data.map((v: any) => ({ ...v, ...v.attribute }))
  }
}

async function doPutCatalogue(params: any) {
  params.stageType = ruleForm.value.stageType
  params.courseId = params.cdId
  delete params.taskId
  delete params.stageId
  delete params.decimalRoomCost
  delete params.cdId
  delete params.studId
  if (isEdit.value && props.classInfo) params.stepTaskId = props.classInfo.stepTaskId
  const res: any = isEdit.value ? await editClass(params) : await putCatalogue(params)
  addLoading.value = false
  if (res.status === 200) {
    ElNotification.success('操作成功')
    emit('successFun')
    closeMask()
  }
}

async function fetchOrderTime(courseId: string | number) {
  const res: any = await getOrderTime({ courseId })
  if (res.status === 200) {
    orderTimeInfo.value = res.body || {}
  }
}
</script>

<template>
  <div
    class="mask-content mask-width560"
    :class="{ 'min-content': newPreExam || BBPreExamOrCustomized || (orderObj.spoType == 67 && orderObj.change == 1 && !orderObj.borderType) }"
  >
    <h3 class="title">
      {{ isEdit ? '修改课堂' : '安排课堂' }}<b @click="closeMask">+</b>
      <div class="tip">课堂排课时间统一为北京时间,请讲师注意时差</div>
    </h3>
    <div
      style="color: red; text-align: center; margin-bottom: 10px"
      v-if="showfillNeed"
    >请在破冰课上课前完成【破冰课授课要求】填写</div>
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      v-loading="addLoading"
      class="demo-ruleForm"
    >
      <div class="content-box">
        <div class="dis-flex">
          <img class="cinput-icon" :src="iconCourse" />
          <label class="cinput-label">选择订单</label>
          <el-form-item prop="order">
            <el-select
              v-model="ruleForm.order"
              v-loading="orderLoading"
              filterable
              style="width: 340px"
              placeholder="请选择课堂"
              @change="chooseOrder"
              :disabled="Boolean(courseDetail) || isEdit"
            >
              <el-option
                v-for="item in orderlist"
                :key="item.courseId"
                :label="item.orderNo"
                :value="item.courseId"
                :disabled="item.spoType == 4 || item.spoType == 32 || item.spoType == 64 || item.spoType == 66"
              />
            </el-select>
            <div
              class="papers-tips"
              v-if="orderObj.spoType == 67 && orderObj.change == 1 && !orderObj.borderType"
            >
              毕业大论文需要前往论文规划表进行排课
            </div>
            <div class="papers-tips" v-if="newPreExam">
              {{ orderObj.borderType ? '此订单为B端考前突击订单，' : '' }}考前突击请前往规划表进行排课
            </div>
            <div v-if="BBPreExamOrCustomized" class="overtime-tips">
              学生存在<span>欠费</span>，<span>无法排课</span>，请联系<span>师资运营</span>或<span>教辅顾问</span>处理！
            </div>
          </el-form-item>
        </div>
        <template v-if="!newPreExam && !BBPreExamOrCustomized">
          <div class="dis-flex" v-if="orderObj.change != 1 && newPreExam">
            <img class="cinput-icon" :src="iconCourse" />
            <label class="cinput-label">课堂类型</label>
            <el-form-item prop="stageType">
              <el-select
                v-model="ruleForm.stageType"
                filterable
                style="width: 340px"
                placeholder="请选择课堂类型"
              >
                <el-option
                  v-for="item in preExamClassTypeList"
                  :key="item.stageType"
                  :label="item.name"
                  :value="item.stageType"
                />
              </el-select>
            </el-form-item>
          </div>
          <div class="dis-flex" v-if="!(orderObj.change == 1 && !orderObj.borderType)">
            <img class="cinput-icon" :src="iconCourse" />
            <label class="cinput-label">课堂名称</label>
            <el-form-item prop="name">
              <el-input
                style="height: 36px; width: 340px"
                v-model="ruleForm.name"
                placeholder="请输入课堂名称"
                :disabled="isEdit"
              />
            </el-form-item>
          </div>
          <template v-if="orderObj.spoType == 65 && orderObj.courseVersion > 1 && !orderObj.borderType">
            <div class="dis-flex">
              <img class="cinput-icon" :src="iconTime" />
              <label class="cinput-label">课堂阶段</label>
              <el-form-item prop="stageId">
                <el-select
                  v-model="ruleForm.stageId"
                  v-loading="stageLoading"
                  filterable
                  style="width: 340px"
                  placeholder="请选择课堂阶段"
                  @change="chooseStage"
                >
                  <el-option
                    v-for="item in stagelist"
                    :key="item.id"
                    :label="item.name + '(' + item.startDate + '-' + item.endDate + ')'"
                    :value="item.id"
                    :disabled="item.spoType == 4 || item.spoType == 32 || item.spoType == 64 || item.spoType == 66"
                  />
                </el-select>
                <div class="papers-tips" v-if="!stagelist.length">暂无阶段请先前往规划表排课</div>
              </el-form-item>
            </div>
            <div class="dis-flex">
              <img class="cinput-icon" :src="iconTime" />
              <label class="cinput-label">课堂任务</label>
              <el-form-item prop="taskId">
                <el-select
                  v-model="ruleForm.taskId"
                  style="width: 340px"
                  placeholder="请选择课堂任务"
                >
                  <el-option
                    v-for="item in list"
                    :key="item.id"
                    :label="item.remark"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </div>
          </template>
          <div class="dis-flex" v-if="!(orderObj.change == 1 && !orderObj.borderType)">
            <img class="cinput-icon" :src="iconDesc" />
            <label class="cinput-label">课堂说明</label>
            <el-form-item prop="description">
              <textarea
                v-model="ruleForm.description"
                placeholder="请输入课堂说明"
                class="cinput-textarea"
              />
            </el-form-item>
          </div>
          <div class="dis-flex" v-if="!(orderObj.change == 1 && !orderObj.borderType)">
            <img class="cinput-icon" :src="iconTime" />
            <label class="cinput-label">开课日期</label>
            <div>
              <p style="text-align: left">
                <el-date-picker
                  v-model="dateStart"
                  type="date"
                  :disabled-date="(time: Date) => time.getTime() < new Date(beijingTime as any).getTime() - 8.64e7"
                  placeholder="开始日期"
                  format="YYYY 年 MM 月 DD 日"
                  value-format="YYYY-MM-DD"
                  style="width: 190px"
                  @change="changpick"
                />
                <el-time-select
                  style="width: 135px; margin-left: 10px"
                  placeholder="起始时间"
                  v-model="ruleForm.startTime"
                  start="00:00"
                  step="00:10"
                  end="24:00"
                  :min-time="minstartTime"
                  @change="getEndTime"
                />
              </p>
            </div>
          </div>
          <div
            class="dis-flex"
            v-if="!(orderObj.change == 1 && !orderObj.borderType)"
            style="margin-left: 67px"
          >
            <label class="cinput-label">课节时长</label>
            <el-form-item>
              <el-select
                v-model="ruleForm.hour"
                placeholder=""
                class="time-select"
                @change="getEndTime"
                filterable
              >
                <el-option
                  v-for="(_, index) in 24"
                  :key="index"
                  :label="index < 10 ? `0${index}` : `${index}`"
                  :value="String(index)"
                />
              </el-select>
              小时
              <el-select
                v-model="ruleForm.minute"
                placeholder=""
                class="time-select"
                @change="getEndTime"
                filterable
              >
                <el-option
                  v-for="(item, index) in minList"
                  :key="index"
                  :label="item"
                  :value="item"
                />
              </el-select>
              分钟
              <div class="end" v-if="classEndTime">下课时间：{{ classEndTime }}</div>
            </el-form-item>
          </div>
          <div class="dis-flex time-tip" v-if="!(orderObj.change == 1 && !orderObj.borderType)">
            请输入准确上课时长到达结束时间<span>20分钟</span>后课堂关闭
          </div>
          <div class="dis-flex used-tip" v-if="showExtra">
            此订单排课时长为{{ usedTime }}h/{{ totalClassTime }}h，超出将不会为您结算<span>超额薪资</span>
          </div>
        </template>
      </div>
      <div
        class="dis-flex"
        v-if="!(orderObj.change == 1 && !orderObj.borderType) && !newPreExam && !BBPreExamOrCustomized"
      >
        <img class="cinput-icon" :src="iconCourse" />
        <label class="cinput-label">提醒</label>
        <el-form-item prop="beforeNotifyTime">
          <el-select
            v-model="ruleForm.beforeNotifyTime"
            placeholder="请选择"
            style="width: 340px"
          >
            <el-option
              v-for="item in timeTip"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </div>
    </el-form>
    <template v-if="!newPreExam && !BBPreExamOrCustomized">
      <div v-if="showfillNeed" style="line-height: 30px; color: red">
        排课后前往填写破冰课授课需求
      </div>
      <div class="btnbox" v-if="orderObj.spoType == 67 && orderObj.change == 1 && !orderObj.borderType">
        <button class="defaultlight-btn btn-width320" @click="gotopaper()">查看论文规划表</button>
      </div>
      <div class="btnbox" v-if="!(orderObj.change == 1 && !orderObj.borderType)">
        <button class="defaultlight-btn btn-width320" @click="submitForm1()">确定</button>
      </div>
    </template>
    <template v-if="newPreExam">
      <button class="defaultlight-btn btn-width320" @click="goToPreExamSchedule(orderObj)">
        查看考前突击规划表
      </button>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.upload-box {
  text-align: left;
  margin: 0;
}
.papers-tips {
  font-size: 12px;
  color: #ff8723;
  line-height: 30px;
  text-align: left;
}
.tip {
  color: red;
  line-height: 25px;
}
.title {
  margin: 20px 0 !important;
  line-height: 30px !important;
}
.time-select {
  width: 80px;
  margin-right: 2px;
}
.end {
  text-align: left;
}
.time-tip {
  margin: -15px 0 15px 170px;
  span {
    color: red;
  }
}
.min-content {
  height: 300px !important;
}
.overtime-tips {
  margin: 30px 0 0 -167px;
  span {
    color: red;
  }
}
.used-tip {
  margin: -10px 0 15px 170px;
  span {
    color: red;
  }
}
</style>
