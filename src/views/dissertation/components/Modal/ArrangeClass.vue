<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { useDissertationStore } from '@/stores/dissertation'
import { useAddCourse } from '@/composables/useAddCourse'
import {
  dissertation_findClassroomInfo,
  order_putClassroom,
  order_updateClassroom,
} from '@/api/modules/paper'

const dissertationStore = useDissertationStore()
const { overList, beijingTime, checkArrearsOrder, getBeiJinTime } = useAddCourse()

const visible = ref(false)
const mode = ref<'add' | 'edit'>('add')
const stageId = ref<string | number>('')
const classId = ref<string | number>('')
const classroomId = ref<string | number>('')
const courseIdVal = ref<string | number>('')

const name = ref('')
const dateStart = ref('')
const startTime = ref('')
const hour = ref('')
const minute = ref('')
const description = ref('')
const minstartTime = ref('')

const hourOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const minuteOptions = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

const endTime = computed(() => {
  if (!dateStart.value || !startTime.value) return ''
  const start = dayjs(`${dateStart.value} ${startTime.value}`)
  return start
    .add(Number(hour.value || 0), 'hour')
    .add(Number(minute.value || 0), 'minute')
    .format('YYYY-MM-DD HH:mm')
})

const overtimeTips = computed(() => {
  if (!overList.value.length) return ''
  return `您当前存在 ${overList.value.length} 个未处理欠费订单，请先联系运营确认后再安排新课。`
})

const disabledDate = (date: Date) => {
  return dayjs(date).isBefore(dayjs(beijingTime.value), 'day')
}

function getNowHour() {
  const t = dayjs(beijingTime.value)
  minstartTime.value = t.format('HH:mm')
  startTime.value = minstartTime.value
}

function onDateChange() {
  const nowDay = dayjs(beijingTime.value).format('YYYY-MM-DD')
  if (dateStart.value === nowDay) {
    getNowHour()
  } else {
    minstartTime.value = ''
  }
}

async function show(params: {
  mode: 'add' | 'edit'
  stageId: string | number
  classId: string | number
  classroomId?: string | number
  name: string
  courseId: string | number | null
}) {
  mode.value = params.mode
  stageId.value = params.stageId
  classId.value = params.classId
  classroomId.value = params.classroomId || ''
  name.value = params.name
  courseIdVal.value = params.courseId || ''
  dateStart.value = ''
  startTime.value = ''
  hour.value = ''
  minute.value = ''
  description.value = ''

  await checkArrearsOrder(courseIdVal.value)
  await getBeiJinTime()

  if (params.mode === 'edit' && params.classroomId) {
    try {
      const res = await dissertation_findClassroomInfo(params.classroomId, { flag: 1 })
      if (res.status === 200 && res.body) {
        const info = res.body
        dateStart.value = dayjs(info.startTime).format('YYYY-MM-DD')
        startTime.value = dayjs(info.startTime).format('HH:mm')
        description.value = info.description || ''
        const start = dayjs(info.startTime)
        const end = dayjs(info.endTime)
        const diff = end.diff(start, 'minute')
        hour.value = String(Math.floor(diff / 60)).padStart(2, '0')
        minute.value = String(diff % 60).padStart(2, '0')
      }
    } catch { /* ignore */ }
  }

  visible.value = true
}

async function submit() {
  if (!dateStart.value) {
    ElMessage.warning('请选择上课日期')
    return
  }
  if (!startTime.value) {
    ElMessage.warning('请选择上课时间')
    return
  }
  if (!hour.value) {
    ElMessage.warning('请选择课程小时')
    return
  }
  if (!minute.value) {
    ElMessage.warning('请选择课程分钟')
    return
  }

  const startDateTime = `${dateStart.value} ${startTime.value}`
  const endDateTime = dayjs(startDateTime)
    .add(Number(hour.value), 'hour')
    .add(Number(minute.value), 'minute')
    .format('YYYY-MM-DD HH:mm')

  if (mode.value === 'add') {
    await order_putClassroom({
      name: name.value,
      startTime: startDateTime,
      endTime: endDateTime,
      description: description.value,
      cdId: courseIdVal.value,
      bigPaperStageId: stageId.value,
      bigPaperClassId: classId.value,
    })
  } else {
    await order_updateClassroom({
      id: classroomId.value,
      cdId: courseIdVal.value,
      name: name.value,
      startTime: startDateTime,
      endTime: endDateTime,
      description: description.value,
    })
  }

  ElMessage.success(mode.value === 'add' ? '排课成功' : '修改成功')
  visible.value = false
  dissertationStore.reload()
  dissertationStore.initTitle()
}

defineExpose({ show })
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="mode === 'add' ? '排课' : '修改时间'"
    width="600px"
    :close-on-click-modal="false"
  >
    <div v-if="overtimeTips" class="overtime-tips">{{ overtimeTips }}</div>
    <el-form v-else label-width="100px">
      <el-form-item label="课堂名称">
        <el-input v-model="name" disabled />
      </el-form-item>
      <el-form-item label="上课日期">
        <el-date-picker
          v-model="dateStart"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          :disabled-date="disabledDate"
          @change="onDateChange"
        />
      </el-form-item>
      <el-form-item label="上课时间">
        <el-time-select
          v-model="startTime"
          start="00:00"
          step="00:10"
          end="24:00"
          :min-time="minstartTime"
          placeholder="选择时间"
        />
      </el-form-item>
      <el-form-item label="课时(时)">
        <el-select v-model="hour">
          <el-option v-for="h in hourOptions" :key="h" :label="h + '小时'" :value="h" />
        </el-select>
      </el-form-item>
      <el-form-item label="课时(分)">
        <el-select v-model="minute">
          <el-option v-for="m in minuteOptions" :key="m" :label="m + '分钟'" :value="m" />
        </el-select>
      </el-form-item>
      <el-form-item label="结束时间">
        <span>{{ endTime || '--' }}</span>
      </el-form-item>
      <el-form-item label="课堂说明">
        <el-input v-model="description" type="textarea" :maxlength="255" :rows="3" placeholder="请输入课堂说明" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submit">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.overtime-tips {
  color: #f00;
  font-size: 14px;
  margin-bottom: 10px;
  padding: 8px;
  background: #fff3f3;
  border-radius: 4px;
}
</style>
