<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import type { UploadFile } from 'element-plus'
import { useClassroom } from '@/composables/useClassroom'
import { cancelClass } from '@/api/modules/preExam'
import {
  queryClassroomObject,
  updateClassroom,
  getOrderStageList,
} from '@/api/modules/classtable'
import {
  cancelClassroom,
  queryClassroomsByCourseId,
} from '@/api/modules/order'
import { formatTime } from '@/utils/task/Utils'
import DownloadApp from '@/components/DownloadApp/index.vue'
import GoClassIn from '@/components/ClassIn/goClassIn.vue'
import iconDesc from '@/assets/images/icon-desc.png'
import iconCourse from '@/assets/images/icon-course.png'
import loginTips from '@/assets/images/login-tips.png'

const props = defineProps<{
  coursedata: Record<string, any>
}>()

const emit = defineEmits<{
  close: [status: string]
  successFun: []
}>()

const router = useRouter()
const { goClassInRef, goInClassNew } = useClassroom()
const downloadAppRef = ref<InstanceType<typeof DownloadApp> | null>(null)
const uploadRef = ref<any>(null)

const pickerOptions1 = {
  disabledDate(time: Date) {
    return time.getTime() < Date.now() - 8.64e7
  },
}
const pickerOptions2 = ref<any>('')
const dateStart = ref('')
const dateEnd = ref('')
const startTime = ref('')
const endTime = ref('')
const minstartTime = ref('')
const minendTime = ref('')
const statusText: Record<number, string> = {
  1: '学生未确认课堂',
  2: '等待上课',
  4: '正在上课',
  8: '已结束',
  16: '异常课堂',
  32: '取消排课中',
}
const hasOthering = ref(false)
const classrooms = ref<any[]>([])
const maskShow = ref(false)
const courseshowObj = ref<any>('')
const uploadFilesLength = ref<any[]>([])
const urls = ref('')
const stageLoading = ref(false)
const stagelist = ref<any[]>([])
const stageId = ref('')
const taskId = ref<string | null>('')
const taskInstances = ref<any[]>([])
const list = ref<any[]>([])
const accept = ['.pdf', '.ppt', '.mp3', '.mp4']
const fileList = ref<UploadFile[]>([])

const newPreExam = computed(() => {
  return [1].includes(props.coursedata.spoType) && [2, 3].includes(props.coursedata.spoVersion)
})

watch(dateStart, (val) => {
  pickerOptions2.value = {
    disabledDate(time: Date) {
      const mintime = new Date(val)
      return time.getTime() <= mintime.getTime() - 8.64e7
    },
  }
})

onMounted(() => {
  nextTick(() => {
    getCourseDetail()
  })
  getRelatedClassrooms()
})

function chooseStage(_event?: any, flag?: boolean) {
  list.value = []
  const arr = stagelist.value.filter((e) => e.id === stageId.value)
  taskInstances.value = arr[0].taskInstances
  if (taskId.value == null) {
    list.value = taskInstances.value.filter((v: any) => v.mission != 1 && v.classroomFlag == 2) || []
  } else {
    list.value = taskInstances.value.filter((v: any) => v.classroomFlag == 2) || []
  }
  list.value.push({ remark: '自主课堂', id: null })
  if (!flag) {
    taskId.value = list.value[0].id
  }
}

function getNowHour() {
  const hours = String(new Date().getHours()).padStart(2, '0')
  const mins = String(new Date().getMinutes()).padStart(2, '0')
  const startTimes = hours + ':' + mins
  minstartTime.value = startTimes
  minendTime.value = startTimes
  startTime.value = startTimes
}

function changpick(val: string) {
  const now =
    new Date().getFullYear() +
    '-' +
    String(new Date().getMonth() + 1).padStart(2, '0') +
    '-' +
    String(new Date().getDate()).padStart(2, '0')
  if (val !== now) {
    minstartTime.value = ''
    minendTime.value = ''
    startTime.value = '00:00'
    dateEnd.value = ''
    endTime.value = ''
  } else {
    getNowHour()
    endTime.value = ''
  }
}

function changpick2(val: string) {
  endTime.value = ''
  if (val === dateStart.value) {
    minendTime.value = startTime.value
  }
}

async function getStagelist() {
  stageLoading.value = true
  const res: any = await getOrderStageList({ courseId: courseshowObj.value.cdId })
  stageLoading.value = false
  if (res.status === 200) {
    stagelist.value = res.body
    chooseStage(undefined, true)
  }
}

function handlePreview(file: UploadFile) {
  // preview handler
}

function submitUpload() {
  uploadRef.value?.submit()
}

function uploadSuccess(val: any) {
  ElNotification({
    title: '提示',
    type: val.status === 400 ? 'error' : 'success',
    message: val.msg || '上传成功',
  })
}

function beforeUpload(file: File) {
  if (file.size / 1024 / 1024 > 100) {
    ElNotification.error('文件最大不可超过100M')
    return false
  }
}

function see(row: any) {
  if (row.spoType === 64) {
    const resolved = router.resolve({
      path: '/bigClassRoom',
      query: { id: row.cdId, parentId: '' },
    })
    window.open(resolved.href)
  } else {
    let type = 'daobi'
    if (row.courseType === 4) {
      type = 'wenya'
    }
    const resolved = router.resolve({
      path: '/sellerDetail',
      query: { id: row.cdId, type },
    })
    window.open(resolved.href)
  }
}

async function getCourseDetail() {
  const res: any = await queryClassroomObject(props.coursedata.id)
  if (res.status === 400 && res.body?.code === 4011) {
    router.push({ path: '/login' })
    return
  }
  if (res.status === 200) {
    courseshowObj.value = res.body
    dateStart.value = courseshowObj.value.startTime.substr(0, 10)
    dateEnd.value = courseshowObj.value.endTime.substr(0, 10)
    startTime.value = courseshowObj.value.startTime.substr(11, 5)
    endTime.value = courseshowObj.value.endTime.substr(11, 5)
    const baseApi = import.meta.env.VITE_APP_BASE_API
    urls.value =
      courseshowObj.value.shengwangFlag === 1
        ? `${baseApi}/courseware/saveFileToShengwang?roomNo=${courseshowObj.value.roomNo}`
        : `${baseApi}/courseware/saveFileToTalk?roomNo=${courseshowObj.value.roomNo}`
    courseshowObj.value.time = handleTime(
      courseshowObj.value.startTime,
      courseshowObj.value.endTime,
    )
    taskId.value = courseshowObj.value.stageTaskInstance
      ? courseshowObj.value.stageTaskInstance.id
      : null
    if (courseshowObj.value.studPaperSpreeStageInstanceVo) {
      stageId.value = courseshowObj.value.studPaperSpreeStageInstanceVo.id
    }
    if (courseshowObj.value.spoType === 65 && courseshowObj.value.courseVersion > 1) {
      getStagelist()
    }
  }
}

function in_classroom(row: any) {
  goInClassNew(row.secretKey, row.teacherJoinUrl, row)
}

async function cancelCourse() {
  if (newPreExam.value) {
    const params = { stepTaskId: props.coursedata.stepTaskId }
    const res: any = await cancelClass(params)
    if (res.status === 200) {
      ElNotification.success('操作成功')
      closeMask()
      emit('successFun')
    }
  } else {
    const res: any = await cancelClassroom({ classroomId: courseshowObj.value.id })
    if (res.status === 400 && res.body?.code === 4011) {
      router.push({ path: '/login' })
      return
    }
    if (res.status === 200) {
      ElNotification({ title: '提示', type: 'success', message: '取消课堂成功' })
      closeMask()
      emit('successFun')
    } else {
      ElNotification({ title: '提示', type: 'error', message: res.body?.msg })
    }
  }
}

async function updateClass(obj: any) {
  const res: any = await updateClassroom({
    description: obj.description,
    name: obj.name,
    stageId: stageId.value,
    taskId: taskId.value || '',
    id: obj.id,
    startTime: dateStart.value + ' ' + startTime.value + (startTime.value.length > 5 ? '' : ':00'),
    endTime: dateEnd.value + ' ' + endTime.value + (endTime.value.length > 5 ? '' : ':00'),
  })
  if (res.status === 400 && res.body?.code === 4011) {
    router.push({ path: '/login' })
    return
  }
  if (res.status === 200) {
    ElNotification({ title: '提示', type: 'success', message: '课堂信息修改成功' })
    closeMask()
    emit('successFun')
  } else {
    ElNotification({ title: '提示', type: 'error', message: res.body?.msg })
  }
}

function closeMask() {
  emit('close', 'seestatus')
}

function handleTime(start: string, end: string): string {
  const startindex = start.indexOf(' ')
  const endindex = end.indexOf(' ')
  return (
    start.substr(0, startindex) +
    ' ' +
    start.substr(startindex + 1) +
    '-' +
    end.substr(endindex + 1)
  )
}

function deleteFile(item: any) {
  const idx = uploadFilesLength.value.findIndex((f) => f.id === item.id)
  if (idx !== -1) {
    uploadFilesLength.value.splice(idx, 1)
  }
}

async function getRelatedClassrooms() {
  hasOthering.value = true
  const res: any = await queryClassroomsByCourseId({
    courseId: props.coursedata.cdId,
    status: 63,
  })
  hasOthering.value = false
  if (res.status === 400 && res.body?.code === 4011) {
    router.push({ path: '/login' })
    return
  }
  if (res.status === 200) {
    const list = res.body?.list || []
    list.forEach((item: any) => {
      item.time = handleTime(item.startTime, item.endTime)
    })
    classrooms.value = list
  }
}
</script>

<template>
  <div class="mask-content mask-width1100">
    <h3>查看课堂 <b @click="closeMask">+</b></h3>
    <div class="see-coursebox">
      <div class="course-showbox">
        <h4
          class="overflowdot cursorpointer"
          @click="see(courseshowObj)"
        >{{ courseshowObj.orderNo }}</h4>
        <div class="dis-flex">
          <img class="cinput-icon" :src="iconDesc" />
          <label class="cinput-label">课堂名称:</label>
          <el-input
            v-model="courseshowObj.name"
            style="width: 340px"
            :disabled="courseshowObj.statused != 1"
          />
        </div>
        <template v-if="courseshowObj.spoType == 65 && courseshowObj.courseVersion > 1">
          <div class="dis-flex">
            <img class="cinput-icon" :src="iconDesc" />
            <label class="cinput-label">课堂阶段:</label>
            <el-select
              v-model="stageId"
              v-loading="stageLoading"
              filterable
              style="width: 340px"
              placeholder="请选择课堂阶段"
              :disabled="courseshowObj.statused != 1"
              @change="chooseStage"
            >
              <el-option
                v-for="item in stagelist"
                :key="item.id"
                :label="item.name + '(' + item.startDate.substring(5) + '~' + item.endDate.substring(5) + ')'"
                :value="item.id"
                :disabled="item.spoType == 4 || item.spoType == 32 || item.spoType == 64 || item.spoType == 66"
              />
            </el-select>
          </div>
          <div class="dis-flex">
            <img class="cinput-icon" :src="iconDesc" />
            <label class="cinput-label">课堂任务:</label>
            <el-select
              v-model="taskId"
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
          </div>
        </template>
        <div class="dis-flex">
          <img class="cinput-icon" :src="iconDesc" />
          <label class="cinput-label">时间:</label>
          <div v-if="courseshowObj.statused == 1">
            <p style="text-align: left">
              <el-date-picker
                style="float: left; width: 170px"
                v-model="dateStart"
                type="date"
                :picker-options="pickerOptions1"
                placeholder="开始日期"
                format="YYYY 年 MM 月 DD 日"
                value-format="YYYY-MM-DD"
                @change="changpick"
              />
              <el-date-picker
                v-model="dateEnd"
                type="date"
                :picker-options="pickerOptions2"
                placeholder="结束日期"
                format="YYYY 年 MM 月 DD 日"
                value-format="YYYY-MM-DD"
                style="width: 170px"
                @change="changpick2"
              />
            </p>
            <p>
              <el-time-select
                style="width: 170px; float: left"
                placeholder="起始时间"
                v-model="startTime"
                start="00:00"
                step="00:10"
                end="23:50"
                :min-time="minstartTime"
              />
              <el-time-select
                style="width: 170px"
                placeholder="结束时间"
                v-model="endTime"
                start="00:00"
                step="00:10"
                end="23:50"
                :min-time="minendTime"
              />
            </p>
          </div>
          <span class="cinput-span" v-else>{{ courseshowObj.time }}</span>
        </div>
        <div class="dis-flex" v-if="courseshowObj.beforeNotifyTime">
          <img class="cinput-icon" :src="iconDesc" />
          <label class="cinput-label">提醒:</label>
          <span class="cinput-span">{{ courseshowObj.beforeNotifyTime }}分钟以后</span>
        </div>
        <div class="dis-flex">
          <img class="cinput-icon" :src="iconDesc" />
          <label class="cinput-label">课堂说明:</label>
          <div>
            <textarea
              class="cinput-textarea"
              :disabled="courseshowObj.statused != 1"
              v-model="courseshowObj.description"
            />
            <p class="upload-box" v-if="courseshowObj.statused == 1">
              <button class="default-btn" @click="closeMask">取消</button>
              <button class="defaultlight-btn" @click="updateClass(courseshowObj)">保存</button>
            </p>
          </div>
        </div>
        <div class="dis-flex">
          <img class="cinput-icon" :src="iconCourse" />
          <label class="cinput-label">上传课件</label>
          <div>
            <p class="upload-box">
              <el-upload
                ref="uploadRef"
                :on-preview="handlePreview"
                :action="urls"
                :file-list="fileList"
                :multiple="false"
                :show-file-list="true"
                :on-success="uploadSuccess"
                :auto-upload="false"
                :accept="accept.join(',')"
                :before-upload="beforeUpload"
              >
                <template #trigger>
                  <button class="btnshowtext">选择文件</button>
                </template>
                <p v-if="courseshowObj.isYtk">请确认课件中<span>无公司logo与名称</span>以及<span>讲师个人隐私</span></p>
                <p>课件将自动同步到<span>课堂内</span>并发送给学生</p>
                <p>可上传word,pdf,ppt,mp3,mp4格式，最大支持<span>200M</span></p>
              </el-upload>
              <button class="defaultlight-btn" @click="submitUpload">上传文件</button>
            </p>
            <div style="padding: 10px 0" class="upload-common">
              <ul v-for="item in uploadFilesLength" :key="item.id">
                <li>
                  {{ item.name }}/{{ item.filesize }}
                  <i class="el-icon-delete" @click="deleteFile(item)"></i>
                  <div class="progress">
                    <div class="progress-bar" :style="{ width: item.percent + '%' }"></div>
                  </div>
                  <span>{{ item.percent }}%</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <button
          class="default-btn cancel-course"
          @click="maskShow = true"
          v-if="courseshowObj.statused == 2 || courseshowObj.statused == 1"
        >取消排课</button>
      </div>
      <div class="showcurse-box" v-loading="hasOthering">
        <h3>相关课堂({{ classrooms.length }})</h3>
        <ul v-if="classrooms.length > 0">
          <li v-for="list in classrooms" :key="list.id">
            <h5>
              <span :class="'status' + list.statused">{{ statusText[list.statused] }}</span>
              {{ list.time }}
            </h5>
            <div class="course-content">
              <p>
                <b>{{ list.name }}</b>
                {{ list.description }}
              </p>
              <button
                class="default-btn"
                v-if="list.statused == 4 || list.statused == 2"
                @click="in_classroom(list)"
              >
                进入课堂
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <!-- Cancel confirmation modal -->
    <div class="new-mask" v-if="maskShow">
      <div class="mask-content">
        <b @click="maskShow = false">+</b>
        <img :src="loginTips" class="tips-icon" />
        <h5>提示</h5>
        <p style="padding-left: 20px; padding-right: 20px">确认取消排课?</p>
        <div class="btnbox">
          <button class="default-btn forget-pwd" @click="maskShow = false">取消</button>
          <button class="defaultlight-btn forget-pwd" @click="cancelCourse">确认</button>
        </div>
      </div>
    </div>
    <DownloadApp ref="downloadAppRef" />
    <GoClassIn ref="goClassInRef" />
  </div>
</template>

<style scoped lang="scss">
.mask-width1100 {
  .dis-flex {
    margin-bottom: 10px;
  }
}
.showcurse-box {
  width: 550px;
  padding: 0 30px;
  ul {
    li {
      text-align: left;
    }
  }
}
.see-coursebox {
  display: flex;
  justify-content: center;
  h3 {
    text-align: left;
    padding: 20px 0;
    font-size: 18px;
  }
  b {
    font-size: 14px;
  }
  ul {
    li {
      padding-bottom: 14px;
      div {
        padding: 10px;
      }
    }
  }
}
.upload-box {
  max-width: 340px;
  overflow: hidden;
  text-align: left;
  margin: 10px 0 0;
  .btnshowtext {
    margin-bottom: 8px;
    border: none;
    color: #ff8723;
    outline: none;
    text-decoration: underline;
  }
  p {
    height: 14px;
    font-size: 12px;
    font-weight: 400;
    line-height: 14px;
    margin-bottom: 5px;
    span {
      color: rgba(255, 50, 50, 1);
      font-size: 12px;
    }
  }
  & > button {
    margin-top: 6px;
  }
}
.uplod-status {
  margin: 20px 0 0;
  li {
    padding-bottom: 0 !important;
  }
}
.cancel-course {
  width: 190px;
  line-height: 30px;
  height: 30px;
  border-radius: 33px;
}
</style>
