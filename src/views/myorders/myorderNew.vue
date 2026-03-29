<script setup lang="ts">
import { ref, reactive, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import request from '@/api/request'
import { queryClassroomsByCourseId } from '@/api/modules/order'
import { presenterTime } from '@/api/modules/classtable'
import { getTeacherInfo } from '@/api/modules/persondetail'
import { goToBeiKe, goToPublicDetail, JudgeNewOrder } from '@/utils/common'
import { formatTime } from '@/utils/task/Utils'
import { useDissertationStore } from '@/stores/dissertation'

import uploaderbtn from '@/views/myorders/uploader/index.vue'
import modelbox from '@/views/orders/testorder/modelbox.vue'
import testmsgForm from '@/views/myorders/testmsgForm.vue'
import fillExamContent from '@/views/orders/components/fillExamContent.vue'
import examComplatework from '@/views/orders/components/examComplatework.vue'
import examCheckModelNew from '@/views/myorders/examCheckModelNew.vue'
import playVideo from '@/views/myorders/playVideo.vue'
import uploadFbAndEndClass from '@/views/myorders/components/uploadFbAndEndClass.vue'
import complatedOrder from '@/views/myorders/complatedOrder.vue'
import myOrderNewTip from '@/views/myorders/myOrderNewTip.vue'
import contentnull from '@/views/contentnull.vue'

const router = useRouter()
const dissertationStore = useDissertationStore()

const teacherType = localStorage.getItem('teacType')

// Refs to child components
const complatedOrderRef = ref<InstanceType<typeof complatedOrder>>()
const playVideoRef = ref<InstanceType<typeof playVideo>>()
const examCheckModelNewRef = ref<InstanceType<typeof examCheckModelNew>>()
const fillExamContentRef = ref<InstanceType<typeof fillExamContent>>()
const examComplateworkRef = ref<InstanceType<typeof examComplatework>>()
const uploadFbAndEndClassRef = ref<InstanceType<typeof uploadFbAndEndClass>>()
const myOrderNewTipRef = ref<InstanceType<typeof myOrderNewTip>>()
const ruleFormRef = ref<any>()
const uploaderRef = ref<InstanceType<typeof uploaderbtn>>()

// State
const loadingCourse = ref(false)
const tableDataEnd = ref<any[]>([])
const total = ref(0)
const tableDataName = ref('')
const operationScreening = ref<number | undefined>(undefined)
const currentStatus = ref(1)
const query = reactive({ limit: 20, page: 1 })

const statusList = [
  { label: '进行中', value: 1 },
  { label: '已完成', value: 2 },
]

// Test order dialog
const testOrderObj = reactive<any>({
  show: false,
  title: '备考审核表',
  text1: '订单已开始考试，您已错过备考审核表填写时间，请完成考试后及时联系师资管理处理，否则订单将无法结课',
})
const testMsgObj = reactive<any>({ show: false })
const NowclickObj = ref<any>({})

// End course dialog
const endcourseing = ref(false)
const maskShow = ref(false)
const jiekeobj = reactive({ text: '是否要确认结课?', goon: true })
const applyoverObj = ref<any>({})

// Upload work dialog
const uploadDropBoxDialog = ref(false)
const uploadDropBoxRadio = ref('')
const uploadUseData = ref<any>({})
const specialType = ref<string | number>('')
const specialOrderSonType = ref<string | number>('')
const uploadFilesLength = ref<any[]>([])
const isClassEnd = ref<string | number>('')
const uploadFileData = reactive({
  loading: false,
  stepList: [
    { name: '上传Schedule', label: 'Schedule', id: 'Schedulefiles', url: '/order/uploadSchedule' },
    { name: '上传Outline', label: 'Outline', id: 'Outlinefiles', url: '/order/uploadOutline' },
    { name: '提交批改作业', label: '批改作业', id: 'Remarkfiles', url: '/order/uploadGradeFile' },
    { name: '上传终版作业', label: '终版作业', id: 'Finalhomeworkfiles', url: '/order/uploadFinalFile' },
    { name: 'Reading/Other', label: 'Reading/Other', id: 'Readingfiles', url: '/order/uploadReadFile' },
    { name: '提交作业', label: '提交作业', id: 'SubmitWorks', url: '' },
  ],
})
let commidType = ''

// Gift time dialog
const modal_time = ref(false)
const courseId = ref('')
const classrooms = ref<any[]>([])
const btnstatus = ref(false)
const ruleForm = reactive({ classroom: '', times: '', explain: '' })
const rules = {
  times: [{ required: true, message: '请填写赠送时长', trigger: 'blur' }],
  classroom: [{ required: true, message: '请选择课堂', trigger: 'blur' }],
  explain: [{ required: true, message: '请填写赠送说明', trigger: 'blur' }],
}

// Button status mappings for exam orders
const buttonStatusList: Record<number, string> = {
  0: '备考审核表', 1: '可修改审核表', 2: '通过备考审核表', 3: '可修改审核表',
  4: '过Due未填审核表', 5: '质检上传审核表', 6: '备考审核表', 7: '备考审核表', 8: '备考审核表',
}
const buttonStatusImgList: Record<number, string> = {}
// Load status images dynamically
const statusImgMap: Record<number, string> = { 1: 'waitcheck', 2: 'pass', 3: 'nopass', 5: 'pass', 6: 'qcfree', 7: 'nopass', 8: 'waitcheck' }
for (const [k, v] of Object.entries(statusImgMap)) {
  buttonStatusImgList[Number(k)] = new URL(`../../assets/images/order/${v}.png`, import.meta.url).href
}
const playImgUrl = new URL('../../assets/images/order/play.png', import.meta.url).href
const autopassImgUrl = new URL('../../assets/images/order/autopass.png', import.meta.url).href
const loginTipsImg = new URL('../../assets/images/login-tips.png', import.meta.url).href

// Helper functions
function newPreExam(list: any) {
  return [1].includes(list.spoType) && [2, 3].includes(list.spoVersion)
}
function hasBeike(list: any) {
  return list.hasCoursewarePlatform
}
function hasScheme(list: any) {
  return [0, 1, 26, 65, 67, 71].includes(list.spoType)
}
function canSend(list: any) {
  if (list.statused === 1 || list.borderType) return false
  if (![32, 66, 69].includes(Number(list.spoType))) {
    return (list.statused >= 2 && list.statused <= 8) && (list.spoType != 64) ||
      (list.statused < 2 || list.statused > 8) || (list.spoType == 64)
  }
  return false
}

// Navigation
function see(row: any) {
  if (JudgeNewOrder(row)) {
    goToPublicDetail(row)
  } else if (row.spoType === 64) {
    window.open(router.resolve({ path: '/bigClassRoom', query: { id: row.courseId } }).href)
  } else {
    let type = 'daobi'
    if (row.courseType === 4) type = 'wenyaold'
    if (row.spoType === 69) type = 'wenya'
    window.open(router.resolve({ path: '/sellerDetail', query: { id: row.courseId, type } }).href)
  }
}

function seeOrderScheme(row: any) {
  const url = router.resolve({
    path: '/getOrderSchemePage',
    query: { courseId: row.courseId, isNewLastMinuteCramming: String(row.examPrepStatus == 2) },
  })
  window.open(url.href)
}

function gotopaper(list: any) {
  dissertationStore.gotoDissertation({ courseId: list.courseId, readonly: false })
}

function goToBeiKeWrap(row: any) {
  goToBeiKe(row)
}

// Data fetching
function closeMask() {
  uploadFilesLength.value = []
  modal_time.value = false
  uploadDropBoxDialog.value = false
  maskShow.value = false
  uploadDropBoxRadio.value = ''
  isClassEnd.value = ''
}

async function getTableData() {
  closeMask()
  loadingCourse.value = true
  try {
    const res: any = await request({
      url: '/order/list',
      method: 'get',
      params: { page: query.page, limit: query.limit, statused: 15, operationScreening: operationScreening.value, key: tableDataName.value },
    })
    loadingCourse.value = false
    if (res.status === 200) {
      tableDataEnd.value = res.body?.list || []
      total.value = res.body?.totalCount || 0
    }
  } catch (_e) {
    loadingCourse.value = false
  }
}

function search() {
  if (currentStatus.value == 1) {
    changePage(1, 'page')
  } else {
    complatedOrderRef.value?.search?.()
  }
}

function changePage(event: number, type: 'page' | 'limit') {
  ;(query as any)[type] = event
  getTableData()
}

async function changeStatus(val: number) {
  currentStatus.value = val
  await nextTick()
  tableDataName.value = ''
  search()
}

function sortChange({ order }: any) {
  operationScreening.value = order === 'descending' ? 2 : 1
  search()
}

function tableCellClassName({ column }: any) {
  if (column.property === 'orderType') return 'orderType-column'
  return ''
}

// Play video
function play(list: any) {
  playVideoRef.value?.show(list)
}

// Exam check
function showTestBox(list: any) {
  if (list.buttonStatus == 4) {
    testOrderObj.show = true
    return
  }
  if (list.buttonStatus == 6) return
  NowclickObj.value = list
  testMsgObj.courseId = list.courseId
  testMsgObj.spoType = list.spoType
  testMsgObj.prepareExamStatus = list.prepareExamStatus
  testMsgObj.isTeacherExamCommit = list.isTeacherExamCommit
  testMsgObj.disabled = [2, 5, 6, 7, 8].includes(list.buttonStatus)
  testMsgObj.showUpload = list.studSpecialOrderExam?.assistExamWay == 1
  testMsgObj.id = list.studSpecialOrderExamExt?.id || ''
  if ([1, 2, 3, 5, 7, 8].includes(list.buttonStatus) && list.studSpecialOrderExamExt) {
    testMsgObj.studSpecialOrderExamExt = list.studSpecialOrderExamExt
  }
  examCheckModelNewRef.value?.show(list)
}

function showTestboxFun() {
  testOrderObj.show = false
}

function closeTestMsg(status: boolean) {
  testMsgObj.show = false
  if (status) getTableData()
}

// Submit work
function showSubmitwork(val: any) {
  if ((val.studSpecialOrderExt?.type == 128) || (val.spoType == 69 && val.copywritingCourse?.type == 3)) {
    examComplateworkRef.value?.show(val)
    return
  }
  uploadDropBoxDialog.value = true
  uploadUseData.value = val
  isClassEnd.value = val.isClassEnd
  specialType.value = val.picType
  if (val.picType == 66) {
    specialOrderSonType.value = val.studSpecialOrderExt?.type || ''
  }
  if ([66, 0, 1].includes(Number(val.picType))) {
    uploadDropBoxRadio.value = ''
  }
  uploadFileData.stepList[5].url = ![66, 0, 1, 69].includes(Number(specialType.value))
    ? '/courseware/saveWithOssUrl' : '/order/uploadCoursewareFiles'
}

function setUploadList(obj: any, type: string) {
  if (type !== commidType) uploadFilesLength.value = []
  commidType = type
  uploadFilesLength.value.push(obj)
}

async function submitFile() {
  uploadFileData.loading = true
  try {
    const res: any = await request({
      url: '/teacher/courseware/saveWithOssUrl',
      method: 'post',
      data: JSON.stringify(uploadFilesLength.value),
      headers: { 'Content-Type': 'application/json' },
    })
    uploadFileData.loading = false
    if (res.status === 200) {
      ElNotification({ title: '提示', type: 'success', message: '文件上传成功' })
      setTimeout(() => location.reload(), 1200)
    }
  } catch (_e) {
    uploadFileData.loading = false
  }
}

function deleteFile(item: any) {
  const idx = uploadFilesLength.value.findIndex(f => f.id === item.id)
  if (idx > -1) uploadFilesLength.value.splice(idx, 1)
}

function change_classroom() {
  uploadFilesLength.value = []
}

// End course
function applyover(obj: any) {
  applyoverObj.value = obj
  jiekeobj.text = '是否要确认结课?'
  jiekeobj.goon = true
  if ((obj.studSpecialOrderExt?.type == 128) || (obj.spoType == 69 && obj.copywritingCourse?.type == 3)) {
    if ([0, 4].includes(obj.buttonStatus)) {
      jiekeobj.text = '由于您未提前完成备考审核内容,<br/>请联系师资管理处理'
      jiekeobj.goon = false
    } else if ([1, 8].includes(obj.buttonStatus)) {
      jiekeobj.text = '由于您提交的备考审核内容，正在审核中，<br/>暂不能结课，请耐心等待'
      jiekeobj.goon = false
    } else if ([3, 7].includes(obj.buttonStatus)) {
      jiekeobj.text = '由于您提交的备考审核内容，审核不通过，<br/>暂不能结课，请修改后重新上传'
      jiekeobj.goon = false
    }
  }
  maskShow.value = true
}

async function noapply(row?: any, callback?: () => void) {
  const target = row?.courseId ? row : applyoverObj.value
  if (!jiekeobj.goon) { maskShow.value = false; return }
  endcourseing.value = true
  try {
    const res: any = await request({
      url: '/order/applyFinishCourse/' + target.courseId,
      method: 'post',
      data: { courseId: target.courseId },
    })
    endcourseing.value = false
    if (res.status === 200) {
      ElNotification({ title: '提示', message: '您已提交了结课申请，请等待师资主管审核', type: 'success' })
      closeMask()
      getTableData()
      callback?.()
    } else {
      ElNotification({ title: '错误提示', message: res.body?.msg, type: 'error' })
    }
  } catch (_e) {
    endcourseing.value = false
  }
}

function showModal(type: string, row: any) {
  if (type === 'uploadFbAndEndClass') uploadFbAndEndClassRef.value?.show(row)
}

// Gift time
async function give_time(row: any) {
  if (!canSend(row)) return
  ruleForm.classroom = ''; ruleForm.times = ''; ruleForm.explain = ''
  modal_time.value = true
  courseId.value = row.courseId
  const res: any = await queryClassroomsByCourseId({ courseId: row.courseId, status: 14 })
  if (res.status === 200) classrooms.value = res.body?.list || []
}

function handleGiveTime() {
  ruleFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    btnstatus.value = true
    try {
      const res: any = await presenterTime({ classroomId: ruleForm.classroom, time: Number(ruleForm.times), explain: ruleForm.explain })
      btnstatus.value = false
      if (res.status === 200) {
        ElNotification({ title: '提示', message: res.body?.msg, type: 'success' })
        modal_time.value = false
        getTableData()
      } else {
        ElNotification({ title: '提示', message: res.body?.msg, type: 'warning' })
      }
    } catch (_e) {
      btnstatus.value = false
    }
  })
}

// Tip on mount
async function showTip() {
  const res: any = await getTeacherInfo()
  if (res.status === 200) {
    await nextTick()
    if (res.body?.extTeacUserDetailsExt?.orderListFlag == 1) {
      myOrderNewTipRef.value?.show()
    }
  }
}

onMounted(() => {
  getTableData()
  showTip()
})
</script>

<template>
  <div class="my-order" v-loading="loadingCourse">
    <!-- Search area -->
    <div class="search-box">
      <div class="type-btn">
        <div
          v-for="item in statusList"
          :key="item.value"
          :class="{ active: currentStatus == item.value }"
          @click="changeStatus(item.value)"
        >{{ item.label }}</div>
      </div>
      <div>
        <el-input
          clearable
          size="small"
          class="search-input"
          placeholder="请搜索订单号"
          prefix-icon="Search"
          v-model="tableDataName"
          @keydown.enter="search"
          @change="search"
        />
      </div>
    </div>

    <!-- Active orders -->
    <template v-if="currentStatus == 1">
      <el-table
        :data="tableDataEnd"
        @sort-change="sortChange"
        :cell-class-name="tableCellClassName"
        v-if="tableDataEnd.length"
        height="calc(100vh - 300px)"
      >
        <el-table-column width="30" prop="orderType">
          <template #default="{ row }">
            <span class="b-tag" v-if="row.borderType">B端</span>
          </template>
        </el-table-column>
        <el-table-column label="OrderName" show-overflow-tooltip min-width="200">
          <template #default="{ row }">
            <span @click="see(row)" class="order-no">{{ row.orderNo }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Deal Deadline" width="140" sortable="custom" prop="endCourseTime">
          <template #default="{ row }">
            {{ row.endCourseTime && formatTime(row.endCourseTime.replace(/-/g, '/'), 'Y-M-D h:m') }}
          </template>
        </el-table-column>
        <el-table-column width="100" show-overflow-tooltip prop="planIncome" label="预计收入G" align="right" />
        <el-table-column width="100" show-overflow-tooltip prop="teacG" align="right" label="已收入G" />
        <el-table-column label="订单状态" width="160" show-overflow-tooltip align="center">
          <template #default="{ row }">
            <div class="green-font" v-if="+row.courseStatus < 512">
              进行中
              <span class="few-class-hour" v-if="row.spoType == 26 && (Number(row.allSchooltime) / 60 < row.targetTime)">
                <i class="el-icon-warning-outline" />课时过少
              </span>
            </div>
            <div class="gray-font" v-if="row.courseStatus == 512">
              申请结课中<span v-if="[3, 4].includes(+row.applyFinishSource)">（自动）</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="师资运营" width="100" prop="operName" show-overflow-tooltip />
        <el-table-column label="培训视频" width="80">
          <template #default="{ row }">
            <img
              v-if="[0, 1, 4, 65, 32, 66, 69].includes(+row.spoType)"
              :src="playImgUrl"
              alt=""
              @click="play(row)"
              class="play-img"
            />
          </template>
        </el-table-column>
        <el-table-column label="Action" width="135">
          <template #default="{ row }">
            <template v-if="row.courseStatus < 512">
              <div class="pre-btn" v-if="row.spoType == 67 && row.change == 1 && !row.borderType" @click="gotopaper(row)">毕业论文规划表</div>
              <div v-if="hasBeike(row)" class="pre-btn" @click="goToBeiKeWrap(row)">前往备课中心</div>
              <div
                v-if="(row.studSpecialOrderExt?.type == 128) || (row.spoType == 69 && row.copywritingCourse?.type == 3)"
                class="ordertest-box"
              >
                <div
                  class="pre-btn"
                  :class="{ 'time-out': row.buttonStatus == 4, 'qc-free': row.buttonStatus == 6 }"
                  @click="showTestBox(row)"
                >
                  <template v-if="row.buttonStatus == 6 && row.qcFree != 0 && (row.isExamTime || row.isWeek)">
                    <img v-if="teacherType == '2'" class="auto" :src="autopassImgUrl" alt="" />
                    免提交
                  </template>
                  <template v-else>
                    <img
                      class="status-img"
                      :class="{ free: row.buttonStatus == 6 }"
                      v-if="buttonStatusImgList[row.buttonStatus] && !(row.qcFree != 0 && (row.isExamTime || row.isWeek)) && teacherType == '2'"
                      :src="buttonStatusImgList[row.buttonStatus]"
                      alt=""
                    />
                    {{ buttonStatusList[row.buttonStatus] }}
                  </template>
                </div>
              </div>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="" width="100">
          <template #default="{ row }">
            <template v-if="row.courseStatus < 512">
              <el-dropdown>
                <span class="el-dropdown-link">其他操作<i class="el-icon-arrow-down el-icon--right" /></span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>
                      <div class="oper-btn" v-if="!hasBeike(row)" @click="showSubmitwork(row)">
                        {{ row.spoType == 67 ? '完成文件' : '提交作业' }}
                      </div>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <template v-if="![32, 66, 69].includes(Number(row.spoType))">
                        <div class="oper-btn" v-if="(row.paperStatus == 40 && row.spoType == 65) && row.courseStatus != 512 || ([65].includes(row.spoType) && row.borderType)" @click="applyover(row)">申请结课</div>
                        <div class="oper-btn" v-if="row.spoType == 26 && row.longTermFlag == 1 && row.taskCount > 0 && row.courseStatus != 512" @click="showModal('uploadFbAndEndClass', row)">申请结课</div>
                        <div class="oper-btn" v-else-if="(row.statused > 1 || row.spoType > 1) && row.spoType != 64 && row.statused != 4 && row.spoType != 65 || ([67, 1].includes(row.spoType) && row.borderType)" @click="applyover(row)">申请结课</div>
                      </template>
                      <template v-else>
                        <div class="oper-btn" @click="applyover(row)">申请结课</div>
                      </template>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <div v-if="hasScheme(row)" @click="seeOrderScheme(row)" class="oper-btn">查看协议</div>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <div class="oper-btn" v-if="canSend(row)" @click="give_time(row)">赠送课时</div>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pager"
        v-if="total"
        :current-page="query.page"
        :page-sizes="[10, 20, 50]"
        :page-size="query.limit"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="changePage($event, 'limit')"
        @current-change="changePage($event, 'page')"
      />
    </template>

    <!-- Completed orders -->
    <complatedOrder v-else ref="complatedOrderRef" @seeDetail="see" />

    <!-- Submit work dialog -->
    <div class="new-mask" v-if="uploadDropBoxDialog">
      <div class="mask-content mask-width560" style="width: 620px">
        <h3>提交作业 <b @click="closeMask">+</b></h3>
        <div class="tip" v-if="[16, 30].includes(Number(uploadDropBoxRadio)) && uploadUseData.cwCount">
          当前订单已提交Completed Work，如确定需二次提交，请联系订单师资老师同步此信息，否则存在学生提交错误文件风险！
        </div>
        <!-- Non-special types -->
        <div class="coursewaressssss" v-if="![0, 1, 66, 69, 71, 27].includes(Number(specialType))">
          <div class="dis-flex" style="align-items: center">
            <label class="cinput-label">类型：</label>
            <el-radio-group v-model="uploadDropBoxRadio">
              <el-radio value="11">{{ specialType == 67 && uploadUseData.change == 0 ? '完成文件' : '作业' }}</el-radio>
              <el-radio value="12" :disabled="!uploadUseData.hasPastPaper">Past Paper 答案</el-radio>
            </el-radio-group>
          </div>
          <div class="dis-flex">
            <label class="cinput-label">上传文件：</label>
            <div class="upload-btn-area">
              <uploaderbtn
                ref="uploaderRef"
                :commid="uploadFileData.stepList[5].id"
                :couseobj="uploadUseData"
                @filesAdded="(files: any) => files.forEach((f: any) => setUploadList(f, uploadFileData.stepList[5].id))"
                @fileUploaded="(obj: any) => { /* handled by submitFile */ }"
              />
              <div style="padding: 10px 0" class="upload-common">
                <ul v-for="item in uploadFilesLength" :key="item.id">
                  <li>{{ item.name }}/{{ item.filesize }}
                    <i class="el-icon-delete" @click="deleteFile(item)" />
                    <div class="progress" v-if="item.percent > 0">
                      <div class="progress-bar" :style="{ width: item.percent + '%' }" />
                    </div>
                    <span v-if="item.percent > 0">{{ item.percent }}%</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <!-- Special types -->
        <div class="coursewaressssss" v-else>
          <div class="dis-flex" style="margin-bottom: 20px">
            <label class="cinput-label">类型：</label>
            <el-select v-if="[66, 69, 71, 27].includes(Number(specialType))" v-model="uploadDropBoxRadio" placeholder="请选择" @change="change_classroom" style="width: 340px">
              <el-option label="作业" value="11" v-if="specialOrderSonType == 1" />
              <el-option label="Lecture Note" value="19" v-if="specialOrderSonType == 32" />
              <el-option label="Complete Work" :value="[69].includes(+specialType) ? '30' : '16'" v-if="(specialOrderSonType != 32 && specialOrderSonType != 1) || [69, 71, 27].includes(Number(specialType))" />
              <el-option label="Past-Paper的答案" value="12" v-if="specialOrderSonType == 32" />
            </el-select>
            <el-select v-if="specialType == 0" v-model="uploadDropBoxRadio" placeholder="请选择" @change="change_classroom" style="width: 340px">
              <el-option label="Lecture Note" value="19"><span style="color: red"> (必传) </span>Lecture Note</el-option>
              <el-option label="Complete Work" value="16" v-if="!uploadUseData.hasPastPaper" />
              <el-option label="Past-Paper的答案" value="12" v-else />
            </el-select>
            <el-select v-if="specialType == 1" v-model="uploadDropBoxRadio" placeholder="请选择" @change="change_classroom" style="width: 340px">
              <el-option label="Lecture Note" value="19"><span style="color: red"> (必传) </span>Lecture Note</el-option>
              <el-option label="资料整理" value="18" />
              <el-option label="Past-Paper的答案" value="12" v-if="uploadUseData.hasPastPaper" />
            </el-select>
          </div>
          <div class="dis-flex">
            <label class="cinput-label">上传文件：</label>
            <div>
              <uploaderbtn
                ref="uploaderRef"
                class="btn-left"
                :commid="uploadFileData.stepList[5].id"
                :couseobj="uploadUseData"
                @filesAdded="(files: any) => files.forEach((f: any) => setUploadList(f, uploadFileData.stepList[5].id))"
                @fileUploaded="(obj: any) => { /* handled by submitFile */ }"
              />
              <div style="padding: 10px 0" class="upload-common">
                <ul v-for="item in uploadFilesLength" :key="item.id">
                  <li>{{ item.name }}/{{ item.filesize }}
                    <i class="el-icon-delete" @click="deleteFile(item)" />
                    <div class="progress" v-if="item.percent > 0">
                      <div class="progress-bar" :style="{ width: item.percent + '%' }" />
                    </div>
                    <span v-if="item.percent > 0">{{ item.percent }}%</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="dis-flex">
          <label class="cinput-label">是否同步申请结课：</label>
          <el-radio-group v-model="isClassEnd" class="apply-radio" :disabled="uploadUseData.isClassEnd == 1">
            <el-radio :value="1">是</el-radio>
            <el-radio :value="0">暂不结课</el-radio>
          </el-radio-group>
        </div>
        <div class="btnbox" style="margin-top: 20px">
          <button class="defaultlight-btn btn-width320" :disabled="uploadFileData.loading" @click="submitFile">确定上传</button>
        </div>
      </div>
    </div>

    <!-- End course confirmation -->
    <div class="new-mask" v-if="maskShow">
      <div class="mask-content">
        <b @click="closeMask">+</b>
        <img :src="loginTipsImg" class="tips-icon" />
        <h5 v-html="jiekeobj.text" style="line-height: 32px" />
        <div class="btnbox" v-loading="endcourseing">
          <button class="defaultlight-btn forget-pwd" @click="noapply()">确认</button>
          <button class="default-btn forget-pwd" @click="closeMask">取消</button>
        </div>
      </div>
    </div>

    <!-- Gift time dialog -->
    <div class="new-mask" v-if="modal_time">
      <div class="mask-content mask-width560">
        <h3>赠送时长 <b @click="modal_time = false">+</b></h3>
        <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" class="demo-ruleForm">
          <div class="dis-flex">
            <label class="cinput-label">选择课堂</label>
            <el-form-item prop="classroom">
              <el-select v-model="ruleForm.classroom" style="width: 340px" placeholder="请选择课堂">
                <el-option v-for="item in classrooms" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </div>
          <div class="dis-flex">
            <label class="cinput-label">赠送时长</label>
            <el-form-item prop="times" class="times">
              <el-input v-model="ruleForm.times" type="number">
                <template #append>min</template>
              </el-input>
            </el-form-item>
          </div>
          <div class="dis-flex">
            <label class="cinput-label">赠送说明</label>
            <el-form-item prop="explain">
              <textarea v-model="ruleForm.explain" class="cinput-textarea" />
            </el-form-item>
          </div>
        </el-form>
        <div class="btnbox">
          <button class="defaultlight-btn btn-width320" :disabled="btnstatus" @click="handleGiveTime">确 定</button>
        </div>
      </div>
    </div>

    <!-- Exam order dialogs -->
    <modelbox :datas="testOrderObj" type="2" @closeModal="showTestboxFun" />
    <testmsgForm :datas="testMsgObj" @close="closeTestMsg" v-if="testMsgObj.show" />
    <fillExamContent ref="fillExamContentRef" />
    <examComplatework ref="examComplateworkRef" @refresh="getTableData" />
    <examCheckModelNew ref="examCheckModelNewRef" :testMsgObj="testMsgObj" @refresh="getTableData" />
    <playVideo ref="playVideoRef" />
    <uploadFbAndEndClass ref="uploadFbAndEndClassRef" @finishClass="noapply" :endcoursLoading="endcourseing" />
    <myOrderNewTip ref="myOrderNewTipRef" />
  </div>
</template>

<style scoped>
[v-cloak] { display: none; }
</style>
<style lang="scss" scoped>
.progress {
  margin-top: 2px; width: 100%; height: 14px; margin-bottom: 10px;
  overflow: hidden; background-color: #f5f5f5; border-radius: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}
.progress-bar {
  background-color: rgb(92, 184, 92);
  background-image: linear-gradient(45deg, rgba(255,255,255,0.149) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.149) 50%, rgba(255,255,255,0.149) 75%, transparent 75%, transparent);
  background-size: 40px 40px; box-shadow: rgba(0,0,0,0.149) 0px -1px 0px 0px inset;
  color: #fff; display: block; float: left; font-size: 12px; height: 20px;
  line-height: 20px; text-align: center; transition: width 0.6s ease; width: 100%;
}
.ordertest-box {
  text-align: left;
  p { height: auto !important; width: 220px; margin: 0 auto; font-size: 12px !important; font-weight: 400; line-height: 16px; }
  i { font-style: normal; color: #ff8723; }
  .tip { width: 242px; text-align: center; color: #ff4e4e; font-size: 12px !important; font-weight: 400; line-height: 20px; margin: 6px 0 0 0 !important;
    div { color: #ff4e4e; font-size: 12px !important; transform: scale(0.9); }
  }
}
.btnbox { button:nth-of-type(2) { margin-left: 20px; } }
.btn-left { float: left; margin-bottom: 10px; }
.tip { width: 92%; color: red; font-weight: 700; text-align: center; line-height: 28px; margin: 0 auto 20px; }
.cinput-label { width: 130px; }
.time-out.pre-btn { color: #e14d4d !important; }
.qc-free.pre-btn { color: #ccc !important; }
.will { color: #222; text-align: right; }
.get { color: #ff8723; text-align: right; }
.give { cursor: pointer; }
.times { width: 340px; :deep(.el-input__inner) { width: 273px; } }
.status-img { width: 55px; height: 52px; position: absolute; left: 10px; top: -5px; }
.free { width: 72px; height: 40px; left: 10px; top: 5px; }
.auto { width: 76px; height: 42px; position: absolute; left: 41px; top: -9px; }
.order-no { cursor: pointer; text-decoration: underline; }
:deep(.pre-btn) { color: #60b1ff; cursor: pointer; span { color: #60b1ff; } }
.oper-btn { cursor: pointer; color: #222; }
:deep(.el-dropdown-link) { color: #60b1ff; cursor: pointer; i { color: #60b1ff; } }
.b-tag { color: #db6767; background: #fed6d3; font-size: 12px; padding: 0 3px; border-radius: 3px; }
:deep(th) { .cell { color: #848486 !important; font-weight: 400; } }
.play-img { width: 20px; height: 20px; cursor: pointer; display: block; margin: 0 auto; }
.type-btn {
  display: flex; height: 25px; line-height: 25px; border-radius: 15px;
  border: 1px solid #d3d6d9; width: 140px;
  div { border-radius: 15px; flex: 1; text-align: center; cursor: pointer; }
  .active { color: #60b1ff; background: #eff4ff; }
}
.search-box {
  padding: 15px 0; display: flex; justify-content: space-between;
  .search-input { width: 190px; height: 30px; }
}
:deep(.orderType-column) { .cell { padding: 0; } }
.green-font { color: #2bab1b; }
.gray-font { color: #606266; }
.green-font, .gray-font {
  &::before { content: ''; display: inline-block; width: 4px; height: 4px; margin-right: 5px; background: #2bab1b; border-radius: 50%; position: relative; top: -3px; }
}
.gray-font { &::before { background: #606266; } }
.few-class-hour { color: #D54941; margin-left: 10px; i { color: inherit; } }
:deep(.upload-btn-area) { text-align: left; }
.pager { float: right; margin-top: 20px; }
:deep(.el-table th) { padding: 0 !important; }
.new-mask { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center; }
.mask-content { background: #fff; border-radius: 8px; padding: 20px; position: relative;
  h3 { display: flex; justify-content: space-between; b { cursor: pointer; transform: rotate(45deg); } }
  b { cursor: pointer; position: absolute; right: 15px; top: 10px; transform: rotate(45deg); font-size: 20px; }
}
.mask-width560 { width: 560px; }
.dis-flex { display: flex; align-items: center; margin-bottom: 10px; }
.cinput-textarea { border: 1px solid #dcdfe6; border-radius: 4px; padding: 4px 8px; width: 340px; }
.defaultlight-btn { background: #f4801f; color: #fff; border: none; padding: 8px 20px; border-radius: 4px; cursor: pointer; }
.default-btn { padding: 8px 20px; cursor: pointer; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; }
.btn-width320 { width: 320px; }
.tips-icon { width: 60px; display: block; margin: 10px auto; }
.apply-radio { margin-left: 10px; }
.coursewaressssss { margin: 10px 0; }
.upload-common { ul { list-style: none; padding: 0; li { line-height: 28px; i { cursor: pointer; margin-left: 8px; } } } }
</style>
