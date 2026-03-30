<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSmallQuestionBankStore } from '@/stores/smallQuestionBank'
import { useScrollbarOnHover } from '@/composables/useScrollbarOnHover'
import dayjs from 'dayjs'
import {
  createTask,
  getQuestionList,
  getTaskList,
  getTaskInfo,
  getTaskStatus,
  getOrderInfo,
  getNotMeetReasons,
  getMeetReasons,
  getKps,
  viewTask,
  setTrackingPoint,
  updateSecondBatchWatchFlag,
} from '@/api/modules/smallQuestionBank'
import { getTeacherInfo, doFollowExtFlag } from '@/api/modules/persondetail'

import topic from './topic.vue'
import card from './card.vue'
import empty from './empty.vue'
import loadingComp from './loading.vue'
import rank from './rank.vue'

const route = useRoute()
const router = useRouter()
const store = useSmallQuestionBankStore()
const { scrollbarClass, handleMouseEnter, handleMouseLeave } = useScrollbarOnHover()

// Form data
const form = ref({
  source: 1 as number | string,
  courseId: '' as string,
  examKp: '',
  context: '',
  questionType: 0,
})

const showPanel = ref(true)
const currentTaskId = ref<number | string | null>(null)
const answerList = ref<any[]>([])
const status = ref<'start' | 'pending' | 'end'>('start')
const historyList = ref<any[]>([])
const currentObject = ref<any>(null)
const currentIndex = ref(0)
const showEnlarge = ref(false)
const page = ref(1)
const size = ref(20)
const totalPage = ref(0)
const noMore = ref(false)
const startTimerInterval = ref(false)
let statusTimerInterval: ReturnType<typeof setInterval> | null = null
const infiniteId = ref(+new Date())
const orderNo = ref('')
const orderType = ref<number | null>(null)
const courseId = ref('')
const feedBackList = ref<any[]>([])
const feedBackPositiveList = ref<any[]>([])
let setTimeOutTimer: ReturnType<typeof setTimeout> | null = null
const processed = ref(false)
const order_kps = ref<any[]>([])
const files_with_types = ref<any[]>([])
const showKpsDialog = ref(false)
const kpsTab = ref('order')
const selectedFileTypeIdx = ref(0)
const selectedFileIdx = ref(0)
const filesPerRow = 2
const lastClickedKp = ref<any>(null)
const activeStreamTab = ref('')
const showClassBatch2 = ref(false)
const showTips = ref(false)
const coursewareBubbleFlag = ref('')
const hasShownPopover = ref(false)
const ruleFormRef = ref<any>()
const rankRef = ref<InstanceType<typeof rank>>()

// Infinite loading state
const infiniteLoading = ref(false)
const infiniteComplete = ref(false)
const infiniteScrollRef = ref<HTMLElement>()

// Computed
const inProgressLists = computed(() => {
  const lists = historyList.value.filter(item => item.status == 0).map(item => item.id)
  startTimerInterval.value = lists.length > 0
  return lists
})

const currentTaskObject = computed(() => {
  const result = store.tasks.filter(item => item.id == currentTaskId.value)[0]
  if (result && result.showEmpty) {
    status.value = 'end'
    answerList.value = []
    store.restoreTaskTimers()
  }
  return result
})

const currentFiles = computed(() => {
  if (!files_with_types.value.length) return []
  return files_with_types.value[selectedFileTypeIdx.value]?.files || []
})

const currentKps = computed(() => {
  const files = currentFiles.value
  if (!files.length) return []
  return files[selectedFileIdx.value]?.kps || []
})

const groupedFiles = computed(() => {
  const files = currentFiles.value
  const result: any[][] = []
  for (let i = 0; i < files.length; i += filesPerRow) {
    result.push(files.slice(i, i + filesPerRow))
  }
  return result
})

const schoolQuestions2 = computed(() => {
  if (!currentTaskObject.value) return []
  return currentTaskObject.value.typeQuestions.type2 || []
})

const schoolQuestions5 = computed(() => {
  if (!currentTaskObject.value) return []
  return currentTaskObject.value.typeQuestions.type5 || []
})

const globalQuestions = computed(() => {
  if (!currentTaskObject.value) return []
  return currentTaskObject.value.typeQuestions.type4 || []
})

const classQuestionsBatch1 = computed(() => {
  if (!currentTaskObject.value) return []
  return (currentTaskObject.value.typeQuestions.type3 || []).filter((q: any) => q.batchNo === 1)
})

const classQuestionsBatch2 = computed(() => {
  if (!currentTaskObject.value) return []
  return (currentTaskObject.value.typeQuestions.type3 || []).filter((q: any) => q.batchNo === 2)
})

const totalAmount = computed(() => {
  if (!currentTaskObject.value) return 0
  let total = 0
  if (!currentTaskObject.value.type2And5Loading) {
    total += schoolQuestions2.value.length + schoolQuestions5.value.length
  }
  if (!currentTaskObject.value.type4Loading) {
    total += globalQuestions.value.length
  }
  if (!currentTaskObject.value.type3Loading) {
    total += classQuestionsBatch1.value.length
    if (showClassBatch2.value) {
      total += classQuestionsBatch2.value.length
    }
  }
  return total
})

// Watchers
watch(
  () => [schoolQuestions2.value, schoolQuestions5.value, status.value, currentTaskObject.value?.type2And5Loading],
  (newVals) => {
    if (!newVals) return
    const [q2, q5, st, loading] = newVals as [any[], any[], string, boolean]
    if ((q2?.length || 0) + (q5?.length || 0) > 0 && st == 'pending' && loading == false) {
      activeStreamTab.value = 'school'
    }
    if ((q2?.length || 0) + (q5?.length || 0) == 0 && st == 'pending' && loading == false) {
      activeStreamTab.value = 'global'
    }
  },
  { deep: true },
)

watch(
  () => [globalQuestions.value, status.value, currentTaskObject.value?.type4Loading],
  (newVals) => {
    if (!newVals) return
    const [gq, st, loading] = newVals as [any[], string, boolean]
    if ((gq?.length || 0) == 0 && st == 'pending' && loading == false && activeStreamTab.value != 'school') {
      activeStreamTab.value = 'class'
    }
  },
  { deep: true },
)

watch(startTimerInterval, (val) => {
  if (val) {
    updateTaskStatus()
  } else {
    if (statusTimerInterval) {
      clearInterval(statusTimerInterval)
      statusTimerInterval = null
    }
  }
})

watch(historyList, (val) => {
  store.setTasks(val as any)
  store.restoreTaskTimers()
}, { deep: true })

watch(status, (val) => {
  if (val == 'start') {
    rankRef.value?.getData()
  } else {
    showKpsDialog.value = false
  }
})

watch(schoolQuestions2, () => checkShowPopover())
watch(schoolQuestions5, () => checkShowPopover())
watch(globalQuestions, () => checkShowPopover())
watch(classQuestionsBatch1, () => checkShowPopover())

// Methods
async function loadData() {
  if (infiniteComplete.value || infiniteLoading.value) return
  infiniteLoading.value = true
  try {
    const res = await getTaskList({ page: page.value, size: size.value })
    if (res.status == 200) {
      totalPage.value = res.body.pages
      const records = res.body.records.map((item: any) => ({
        ...item,
        totalTime: 120,
        currentStep: 0,
        timer: null,
        showEmpty: false,
        courseId: courseId.value,
        type2And5Loading: true,
        type4Loading: true,
        type3Loading: true,
        typeQuestions: { type2: [], type5: [], type4: [], type3: [] },
      }))
      historyList.value = [...historyList.value, ...records]
      page.value++
    }
    if (totalPage.value < page.value) {
      noMore.value = true
      infiniteComplete.value = true
    }
  } catch {
    // error
  } finally {
    infiniteLoading.value = false
  }
}

function onHistoryScroll(e: Event) {
  const el = e.target as HTMLElement
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) {
    loadData()
  }
}

function togglePanel() {
  showPanel.value = !showPanel.value
}

async function searchResult() {
  activeStreamTab.value = ''
  showClassBatch2.value = false
  const res = await createTask({ ...form.value })

  if (res.status == 200) {
    historyList.value.unshift({
      examKp: form.value.examKp,
      id: res.body.id,
      status: 0,
      totalTime: 120,
      currentStep: 0,
      timer: null,
      showEmpty: false,
      isView: 1,
      courseId: form.value.courseId,
      context: form.value.context,
      questionType: form.value.questionType,
      majorName: res.body.majorName,
      courseName: res.body.courseName,
      courseCode: res.body.courseCode,
      universityName: res.body.universityName,
      type2And5Loading: true,
      type4Loading: true,
      type3Loading: true,
      typeQuestions: { type2: [], type5: [], type4: [], type3: [] },
    })
    currentTaskId.value = res.body.id
    getTaskQuestionList()
  }

  if (lastClickedKp.value && form.value.examKp === lastClickedKp.value.knowledgePoints) {
    sendTrackEvent({ ...lastClickedKp.value, searchFlag: 1 })
  }
}

async function getTaskQuestionList() {
  const res = await getQuestionList({ taskId: currentTaskId.value! })
  if (res.status == 200) {
    status.value = 'end'
    answerList.value = res.body
    if (answerList.value.filter(item => item.genType == 2 || item.genType == 5).length) {
      if (activeStreamTab.value && activeStreamTab.value != '0') return
      activeStreamTab.value = 'school'
    } else if (answerList.value.filter(item => item.genType == 4).length) {
      if (activeStreamTab.value && activeStreamTab.value != '0') return
      activeStreamTab.value = 'global'
    } else if (answerList.value.filter(item => item.genType == 3).length) {
      if (activeStreamTab.value && activeStreamTab.value != '0') return
      activeStreamTab.value = 'class'
    }
    store.stopTaskTimer(currentTaskId.value!)
    historyList.value.forEach(value => {
      if (currentTaskId.value == value.id) {
        value.status = 1
      }
    })
  } else if (res.status == 400) {
    status.value = 'pending'
  }
}

async function showTaskDetails(taskId: number | string) {
  if (currentTaskId.value != taskId) {
    activeStreamTab.value = ''
    showClassBatch2.value = false
  }
  store.setActiveTask(taskId)
  currentTaskId.value = taskId
  const res = await getTaskInfo({ taskId })
  if (res.status == 200) {
    form.value.examKp = res.body.examKp
    form.value.context = res.body.context
    form.value.questionType = res.body.questionType
    orderNo.value = res.body.orderNo
    courseId.value = res.body.courseId
    const res1 = await getOrderInfo({ orderNo: orderNo.value })
    if (res1.status == 200) {
      orderType.value = res1.body.orderType
    }
    currentTaskId.value = res.body.id
    getTaskQuestionList()
    await viewTask({ taskId })
    historyList.value.forEach(value => {
      if (taskId == value.id) {
        value.isView = 1
      }
    })
  }
}

function enlarge(data: any, index: number) {
  showEnlarge.value = true
  currentObject.value = data
  currentIndex.value = index
}

function updateContent(data: any, index: number) {
  answerList.value[index - 1] = data
}

function updateCurrentObject(data: any) {
  currentObject.value = data
}

function addNewTask() {
  ruleFormRef.value?.resetFields()
  status.value = 'start'
  orderNo.value = route.query.orderNo as string || ''
  courseId.value = route.query.courseId as string || ''
  selectedFileTypeIdx.value = 0
  selectedFileIdx.value = 0
  lastClickedKp.value = null
}

function updateTaskStatus() {
  statusTimerInterval = setInterval(async () => {
    const res = await getTaskStatus({ taskIds: inProgressLists.value.join(',') })
    if (res.status == 200) {
      res.body.forEach((item: any) => {
        historyList.value.forEach(value => {
          if (item.id == value.id) {
            value.status = item.status
          }
          if (item.status == 1) {
            const result = historyList.value.filter(v => v.id == item.id)
            if (result.length) {
              result[0].isView = 0
            }
            store.notifyTaskResultReturned(item.id)
          }
        })
        setTimeOutTimer = setTimeout(() => {
          if (currentTaskId.value == item.id && item.status == 1) {
            showTaskDetails(currentTaskId.value)
          }
        }, 3000)
      })
    }
  }, 10000)
}

function goCourseDetails() {
  const type = orderType.value == 69 ? 'wenya' : 'daobi'
  const resolved = router.resolve({
    path: '/sellerDetail',
    query: { id: courseId.value, type },
  })
  window.open(resolved.href)
}

async function sendTrackEvent(params: any) {
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
  await setTrackingPoint({ clickTime: now, ...params })
}

function getFileExtension(filename: string) {
  if (typeof filename !== 'string') return ''
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop()! : ''
}

function selectKp(kp: string, fileName = '', fileType = '') {
  form.value.examKp = ''
  nextTick(() => {
    form.value.examKp = kp
  })
  let trackParams: any = {}
  if (kpsTab.value === 'order') {
    trackParams = { orderId: courseId.value, knowledgePoints: kp, searchFlag: 0 }
  } else if (kpsTab.value === 'file') {
    trackParams = { orderId: courseId.value, coursewareType: fileType, coursewareName: fileName, knowledgePoints: kp, searchFlag: 0 }
  }
  sendTrackEvent(trackParams)
  lastClickedKp.value = { ...trackParams }
}

function selectFileType(idx: number) {
  selectedFileTypeIdx.value = idx
  selectedFileIdx.value = 0
}

function selectFile(fidx: number) {
  selectedFileIdx.value = fidx
}

function checkShowPopover() {
  if (!currentTaskObject.value) return
  if ((schoolQuestions2.value.length + schoolQuestions5.value.length) > 0 && !currentTaskObject.value.type2And5Loading) {
    showPopover()
    if (activeStreamTab.value && activeStreamTab.value != '0') return
    activeStreamTab.value = 'school'
  } else if (globalQuestions.value.length > 0) {
    showPopover()
    if (activeStreamTab.value && activeStreamTab.value != '0') return
    activeStreamTab.value = 'global'
  } else if (classQuestionsBatch1.value.length > 0) {
    showPopover()
    if (activeStreamTab.value && activeStreamTab.value != '0') return
    activeStreamTab.value = 'class'
  }
}

function showPopover() {
  if (hasShownPopover.value) return
  if (coursewareBubbleFlag.value != '2') {
    hasShownPopover.value = true
    showTips.value = true
    doFollowExtFlag({ filed: 'coursewareBubbleFlag' })
    setTimeout(() => {
      showTips.value = false
    }, 3000)
  }
}

function moreTopic() {
  updateSecondBatchWatchFlag({ taskId: currentTaskId.value! })
}

// Lifecycle
onMounted(async () => {
  orderNo.value = route.query.orderNo as string || ''
  form.value.source = route.query.source as string || 1
  form.value.courseId = route.query.courseId as string || ''
  courseId.value = route.query.courseId as string || ''

  const res2 = await getKps({ courseId: form.value.courseId })
  if (res2.status == 200) {
    order_kps.value = res2.body.order_kps || []
    processed.value = order_kps.value.length > 0
    files_with_types.value = res2.body.files_with_types || []
  }

  const res = await getOrderInfo({ courseId: form.value.courseId })
  if (res.status == 200) {
    orderType.value = res.body.orderType
  }

  const res1 = await getNotMeetReasons()
  if (res1.status == 200) {
    feedBackList.value = res1.body
  }

  const res4 = await getMeetReasons()
  if (res4.status == 200) {
    feedBackPositiveList.value = res4.body
  }

  const res3 = await getTeacherInfo()
  if (res3.status == 200) {
    coursewareBubbleFlag.value = res3.body.extTeacUserDetailsExt.coursewareBubbleFlag
  }

  // Load initial history
  loadData()
})

onBeforeUnmount(() => {
  if (statusTimerInterval) {
    clearInterval(statusTimerInterval)
    statusTimerInterval = null
  }
  store.tasks.forEach(task => {
    store.stopTaskTimer(task.id)
  })
  if (setTimeOutTimer) {
    clearTimeout(setTimeOutTimer)
  }
})
</script>

<template>
  <div class="small-question-bank">
    <div class="left-area" v-show="showPanel">
      <div class="logo-wrap">
        <img src="../../assets/images/small-question-bank/logo-pic.png" alt="" style="width: 44px;"/>
        <img src="../../assets/images/small-question-bank/logo-title.png" alt="" style="width: 108px;"/>
        <img src="../../assets/images/small-question-bank/close-beta.png" alt="" class="close-beta" style="width: 46px;"/>
      </div>
      <p class="message">AI算法精准搜题</p>
      <button class="new-task-button" @click="addNewTask">
        <i class="el-icon-plus"></i>新任务
      </button>
      <div class="history-wrap">
        <p class="title">
          <img src="../../assets/images/small-question-bank/history.png" alt="" />历史记录
        </p>
        <div
          class="history-list scroll-container"
          :class="scrollbarClass"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
          @scroll="onHistoryScroll"
        >
          <div
            :class="['list-item', `status-${item.status}`, currentTaskId == item.id ? 'active' : '']"
            v-for="item in historyList"
            :key="item.id"
            @click="showTaskDetails(item.id)"
          >
            <span>{{ item.examKp }}</span>
            <div class="loading-info" v-if="item.status == 0">
              <img src="../../assets/images/small-question-bank/加载.gif" alt="">
            </div>
            <span v-if="item.isView == 0" class="unread">
              <img src="../../assets/images/small-question-bank/viewed.png" alt="">
            </span>
          </div>
          <div v-if="infiniteLoading" style="text-align:center;padding:10px;color:#999;">加载中...</div>
          <div v-if="infiniteComplete && historyList.length" style="text-align:center;padding:10px;color:#999;">没有更多了</div>
          <div v-if="infiniteComplete && !historyList.length" style="text-align:center;padding:10px;color:#999;">暂无数据</div>
        </div>
      </div>
      <span @click="togglePanel" class="pack-up">
        <img src="../../assets/images/small-question-bank/pack-up.png" alt="" />
      </span>
    </div>
    <div class="right-area">
      <div class="expand-wrap" v-show="!showPanel">
        <span @click="togglePanel" class="expand">
          <img src="../../assets/images/small-question-bank/expand.png" alt=""/>
        </span>
        <button class="new-task-button" @click="addNewTask">
          <i class="el-icon-plus"></i>新任务
        </button>
      </div>
      <div :class="['content-wrap', status !== 'start' ? 'content-wrap-not-start' : '']">
        <p class="title">
          万能班长自研AI模型，致力于提高讲师备课效率＆授课质量
        </p>
        <p class="sub-message" @click="goCourseDetails">
          <span class="order-no">订单号：{{ orderNo }}</span>
        </p>
        <!-- 搜索表格 -->
        <el-form label-position="top" label-width="80px" :model="form" v-show="status === 'start'" ref="ruleFormRef">
          <el-form-item label="知识点" prop="examKp">
            <div class="input-container">
              <textarea
                :rows="processed ? 3 : 1"
                v-model="form.examKp"
                placeholder=""
                class="fake-placeholder el-textarea__inner"
                style="min-height: 40px; resize: none;"
              />
              <span class="placeholder-text">
                <span class="gray-text">请使用英文输入具体的题目知识点（示例：</span>
                <span class="highlight-text">"SWOT Theory"</span>
                <span class="gray-text">）</span>
              </span>
              <div v-if="processed" @click="showKpsDialog = true" class="quick-extraction">
                <img src="../../assets/images/small-question-bank/select.png" alt="">
                快速选取
              </div>
            </div>
          </el-form-item>
          <el-form-item label="题目类型" prop="questionType">
            <el-select v-model="form.questionType" placeholder="题目类型" style="width: 100%">
              <el-option label="全部" :value="0" />
              <el-option label="选择题" :value="1" />
              <el-option label="开放题" :value="2" />
              <el-option label="计算题" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="详细描述（选填）" prop="context">
            <el-input v-model="form.context" type="textarea" :rows="3"
              placeholder="请在此描述您对题目的具体需求或补充说明，也可以直接提供一个题目示例" />
          </el-form-item>
          <el-button type="primary" :disabled="!form.examKp" @click="searchResult">搜 索</el-button>
        </el-form>
        <!-- 搜索loading -->
        <div v-show="status === 'pending'">
          <card :data="form" />
          <loadingComp
            v-if="currentTaskObject && currentTaskObject.type2And5Loading"
            :activeStep="currentTaskObject?.activeStep"
          />
          <div class="stream-output" v-else>
            <template v-if="currentTaskObject">
              <div class="tab-wrap">
                <div class="message" v-if="totalAmount > 0">
                  {{ (!currentTaskObject.type2And5Loading && !currentTaskObject.type4Loading && !currentTaskObject.type3Loading) ? '共' : '已'}}为您找到
                  <el-button type="primary" link>{{ totalAmount }}</el-button>
                  道题目
                </div>
                <el-tabs v-model="activeStreamTab">
                  <el-tab-pane
                    :label="`本校历年真题 (${schoolQuestions2.length + schoolQuestions5.length})`"
                    name="school"
                    :disabled="!(schoolQuestions2.length + schoolQuestions5.length)"
                  />
                  <el-tab-pane name="global" :disabled="!currentTaskObject.type4Loading && !globalQuestions.length">
                    <template #label>
                      <template v-if="currentTaskObject.type4Loading">正为您搜索更多名校真题</template>
                      <template v-else>全球名校真题</template>
                      <img v-if="currentTaskObject.type4Loading" src="../../assets/images/small-question-bank/loading.gif" alt="" style="height: 20px; vertical-align: sub;"/>
                      <template v-else>({{ globalQuestions.length }})</template>
                    </template>
                  </el-tab-pane>
                  <el-tab-pane
                    v-if="!currentTaskObject.type4Loading"
                    name="class"
                    :disabled="!classQuestionsBatch1.length && !classQuestionsBatch2.length"
                  >
                    <template #label>
                      <template v-if="currentTaskObject.type3Loading">正为您搜索</template>小班题库
                      <img v-if="currentTaskObject.type3Loading" src="../../assets/images/small-question-bank/loading.gif" alt="" style="height: 20px; vertical-align: sub;"/>
                      <template v-else>({{ showClassBatch2 ? classQuestionsBatch1.length + classQuestionsBatch2.length : classQuestionsBatch1.length }})</template>
                    </template>
                  </el-tab-pane>
                </el-tabs>
              </div>
              <div v-show="activeStreamTab == 'school'" style="padding: 0 10px;">
                <div class="list-wrap" v-if="schoolQuestions2.length">
                  <el-row :gutter="20">
                    <el-col :span="24" v-for="(item, idx) in schoolQuestions2" :key="idx">
                      <topic :index="idx + 1" :data="item" @enlarge="enlarge" @update="updateContent" :feedBackList="feedBackList" :feedBackPositiveList="feedBackPositiveList" :orderType="orderType!" :taskId="currentTaskId as number"/>
                    </el-col>
                  </el-row>
                </div>
                <div class="more-btn" v-if="schoolQuestions2.length && schoolQuestions5.length">更多相关题目</div>
                <div class="list-wrap" v-if="schoolQuestions5.length">
                  <el-row :gutter="20">
                    <el-col :span="24" v-for="(item, idx) in schoolQuestions5" :key="idx">
                      <topic :index="schoolQuestions2.length + idx + 1" :data="item" @enlarge="enlarge" @update="updateContent" :feedBackList="feedBackList" :feedBackPositiveList="feedBackPositiveList" :orderType="orderType!" :taskId="currentTaskId as number"/>
                    </el-col>
                  </el-row>
                </div>
              </div>
              <div v-show="activeStreamTab == 'global'" style="padding: 0 10px;">
                <div v-if="currentTaskObject.type4Loading">
                  <loadingComp :showMessage="false" :activeStep="currentTaskObject?.activeStep"/>
                </div>
                <div class="list-wrap" v-if="globalQuestions.length">
                  <el-row :gutter="20">
                    <el-col :span="24" v-for="(item, idx) in globalQuestions" :key="idx">
                      <topic :index="idx + 1" :data="item" @enlarge="enlarge" @update="updateContent" :feedBackList="feedBackList" :feedBackPositiveList="feedBackPositiveList" :orderType="orderType!" :taskId="currentTaskId as number"/>
                    </el-col>
                  </el-row>
                </div>
              </div>
              <div v-show="activeStreamTab == 'class'" style="padding: 0 10px;">
                <p class="message" style="color: #999; font-size: 12px;">注：当前试题均来自于网络及大模型生成题目</p>
                <div class="list-wrap" v-if="classQuestionsBatch1.length">
                  <el-row :gutter="20">
                    <el-col :span="24" v-for="(item, idx) in classQuestionsBatch1" :key="idx">
                      <topic :index="idx + 1" :data="item" @enlarge="enlarge" @update="updateContent" :feedBackList="feedBackList" :feedBackPositiveList="feedBackPositiveList" :orderType="orderType!" :taskId="currentTaskId as number"/>
                    </el-col>
                    <el-col :span="24" v-if="currentTaskObject.type3Loading && !classQuestionsBatch2.length">
                      <div class="loading-card" style="height: 278px; display: flex; align-items: center; justify-content: center; background: #fafafa; border-radius: 12px;">
                        <div style="text-align: center;">
                          <img src="../../assets/images/small-question-bank/loading.gif" alt="loading" style="height: 32px; margin-bottom: 12px;" />
                          <div style="color: #999;">正在搜索...</div>
                        </div>
                      </div>
                    </el-col>
                  </el-row>
                </div>
                <template v-else>
                  <el-row :gutter="20">
                    <el-col :span="24">
                      <div class="loading-card" style="height: 278px; display: flex; align-items: center; justify-content: center; background: #fafafa; border-radius: 12px;">
                        <div style="text-align: center;">
                          <img src="../../assets/images/small-question-bank/loading.gif" alt="loading" style="height: 32px; margin-bottom: 12px;" />
                          <div style="color: #999;">正在搜索...</div>
                        </div>
                      </div>
                    </el-col>
                  </el-row>
                </template>
                <div v-if="classQuestionsBatch2.length && !showClassBatch2" class="more-btn" @click="showClassBatch2 = true; moreTopic();">
                  更多题目
                </div>
                <div class="list-wrap" v-if="showClassBatch2 && classQuestionsBatch2.length">
                  <el-row :gutter="20">
                    <el-col :span="24" v-for="(item, idx) in classQuestionsBatch2" :key="idx">
                      <topic :index="classQuestionsBatch1.length + idx + 1" :data="item" @enlarge="enlarge" @update="updateContent" :feedBackList="feedBackList" :feedBackPositiveList="feedBackPositiveList" :orderType="orderType!" :taskId="currentTaskId as number"/>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </template>
          </div>
        </div>
        <div v-show="status === 'end'">
          <card :data="form" />
          <empty v-if="answerList.length == 0" @addNewTask="addNewTask" />
          <div class="search-result" v-else>
            <div class="tab-wrap">
              <div class="message">
                共为您找到
                <el-button type="primary" link>{{ showClassBatch2 ? answerList.length : answerList.filter(item => !(item.genType == 3 && item.batchNo == 2)).length }}</el-button>
                道题目
              </div>
              <el-tabs v-model="activeStreamTab">
                <el-tab-pane
                  :label="`本校历年真题 (${answerList.filter(item => item.genType == 2 || item.genType == 5).length})`"
                  name="school"
                  :disabled="!(answerList.filter(item => item.genType == 2 || item.genType == 5).length)"
                />
                <el-tab-pane name="global" :disabled="!answerList.filter(item => item.genType == 4).length">
                  <template #label>
                    全球名校真题 ({{ answerList.filter(item => item.genType == 4).length }})
                  </template>
                </el-tab-pane>
                <el-tab-pane name="class" :disabled="!answerList.filter(item => item.genType == 3).length">
                  <template #label>
                    小班题库 ({{ showClassBatch2 ? answerList.filter(item => item.genType == 3).length : answerList.filter(item => item.genType == 3 && item.batchNo != 2).length }})
                  </template>
                </el-tab-pane>
              </el-tabs>
            </div>
            <div v-show="activeStreamTab == 'school'" style="padding: 0 10px;">
              <div class="list-wrap" v-if="answerList.filter(item => item.genType == 2).length">
                <el-row :gutter="20">
                  <el-col :span="24" v-for="(item, idx) in answerList.filter(item => item.genType == 2)" :key="idx">
                    <topic :index="idx + 1" :data="item" @enlarge="enlarge" @update="updateContent" :feedBackList="feedBackList" :feedBackPositiveList="feedBackPositiveList" :orderType="orderType!" :taskId="currentTaskId as number"/>
                  </el-col>
                </el-row>
              </div>
              <div class="more-btn" v-if="answerList.filter(item => item.genType == 2).length && answerList.filter(item => item.genType == 5).length">
                更多相关题目
              </div>
              <div class="list-wrap" v-if="answerList.filter(item => item.genType == 5).length">
                <el-row :gutter="20">
                  <el-col :span="24" v-for="(item, idx) in answerList.filter(item => item.genType == 5)" :key="idx">
                    <topic :index="answerList.filter(item => item.genType == 2).length + idx + 1" :data="item" @enlarge="enlarge" @update="updateContent" :feedBackList="feedBackList" :feedBackPositiveList="feedBackPositiveList" :orderType="orderType!" :taskId="currentTaskId as number"/>
                  </el-col>
                </el-row>
              </div>
            </div>
            <div v-show="activeStreamTab == 'global'" style="padding: 0 10px;">
              <div class="list-wrap" v-if="answerList.filter(item => item.genType == 4).length">
                <el-row :gutter="20">
                  <el-col :span="24" v-for="(item, idx) in answerList.filter(item => item.genType == 4)" :key="idx">
                    <topic :index="idx + 1" :data="item" @enlarge="enlarge" @update="updateContent" :feedBackList="feedBackList" :feedBackPositiveList="feedBackPositiveList" :orderType="orderType!" :taskId="currentTaskId as number"/>
                  </el-col>
                </el-row>
              </div>
            </div>
            <div v-show="activeStreamTab == 'class'" style="padding: 0 10px;">
              <p class="message" style="color: #999; font-size: 12px;">注：当前试题均来自于网络及大模型生成题目</p>
              <div class="list-wrap" v-if="answerList.filter(item => item.genType == 3 && (item.batchNo == 1 || !item.batchNo)).length">
                <el-row :gutter="20">
                  <el-col :span="24" v-for="(item, idx) in answerList.filter(item => item.genType == 3 && (item.batchNo == 1 || !item.batchNo))" :key="idx">
                    <topic :index="idx + 1" :data="item" @enlarge="enlarge" @update="updateContent" :feedBackList="feedBackList" :feedBackPositiveList="feedBackPositiveList" :orderType="orderType!" :taskId="currentTaskId as number"/>
                  </el-col>
                </el-row>
              </div>
              <div v-if="answerList.filter(item => item.genType == 3 && item.batchNo == 2).length && !showClassBatch2" class="more-btn" @click="showClassBatch2 = true; moreTopic();">
                更多题目
              </div>
              <div class="list-wrap" v-if="showClassBatch2 && answerList.filter(item => item.genType == 3 && item.batchNo == 2).length">
                <el-row :gutter="20">
                  <el-col :span="24" v-for="(item, idx) in answerList.filter(item => item.genType == 3 && item.batchNo == 2)" :key="idx">
                    <topic :index="answerList.filter(item => item.genType == 3 && (item.batchNo == 1 || !item.batchNo)).length + idx + 1" :data="item" @enlarge="enlarge" @update="updateContent" :feedBackList="feedBackList" :feedBackPositiveList="feedBackPositiveList" :orderType="orderType!" :taskId="currentTaskId as number"/>
                  </el-col>
                </el-row>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 单个放大 -->
    <div class="new-mask" v-if="showEnlarge">
      <div class="enlarge-wrap">
        <topic :index="currentIndex" @update="updateCurrentObject" :data="currentObject" :showClose="true" @close="showEnlarge = false" :feedBackList="feedBackList" :feedBackPositiveList="feedBackPositiveList" :orderType="orderType!" :taskId="currentTaskId as number"/>
      </div>
    </div>

    <!-- Force computed to trigger -->
    <div style="display: none;">{{ inProgressLists }}</div>

    <!-- 抽屉打开知识点信息 -->
    <el-drawer
      title="快速选取知识点"
      v-model="showKpsDialog"
      size="420px"
      class="kps-drawer"
      direction="rtl"
      :show-close="true"
      :modal="false"
    >
      <div class="drawer-content">
        <el-tabs v-model="kpsTab" class="kps-tabs">
          <el-tab-pane label="按订单" name="order">
            <p class="message">注：括号内为包含该知识点的课件数</p>
            <div class="order-kps-list">
              <div v-for="(kp, idx) in order_kps" :key="idx" class="kps" @click="selectKp(kp.name)">
                <span class="kps-name">{{ kp.name }}</span>
                <span class="kps-freq">({{ kp.freq }})</span>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="按课件" name="file">
            <div class="file-type-list">
              <div
                v-for="(type, idx) in files_with_types"
                :key="type.file_type"
                :class="['file-type', { active: selectedFileTypeIdx === idx }]"
                @click="selectFileType(idx)"
              >
                {{ type.file_type }} {{ type.files.length }}
              </div>
            </div>
            <p class="message" v-if="currentFiles.every((file: any) => !file.kps || file.kps.length === 0)">
              注：当前类型课件暂未解析知识点
            </p>
            <div class="file-list">
              <template v-for="(row, rowIndex) in groupedFiles" :key="rowIndex">
                <div class="file-row">
                  <div v-for="(file, fidx) in row" :key="file.file_name" class="file-wrapper">
                    <el-tooltip effect="dark" :content="file.file_name" placement="top">
                      <div
                        :class="['file-item', { active: selectedFileIdx === fidx + rowIndex * filesPerRow, disabled: !file.kps || file.kps.length === 0 }]"
                        @click="file.kps && file.kps.length > 0 ? selectFile(fidx + rowIndex * filesPerRow) : null"
                      >
                        <img src="../../assets/images/small-question-bank/pdf.png" alt="" v-if="['pdf'].includes(getFileExtension(file.file_name))">
                        <img src="../../assets/images/small-question-bank/text.png" alt="" v-if="['docx', 'doc', 'txt', 'md'].includes(getFileExtension(file.file_name))">
                        <img src="../../assets/images/small-question-bank/ppt.png" alt="" v-if="['pptx', 'ppt'].includes(getFileExtension(file.file_name))">
                        <img src="../../assets/images/small-question-bank/img.png" alt="" v-if="['jpg', 'jpeg', 'png'].includes(getFileExtension(file.file_name))">
                        <span>{{ file.file_name }}</span>
                      </div>
                    </el-tooltip>
                  </div>
                </div>
                <div
                  class="file-kps-list"
                  v-if="row.some((_: any, idx: number) => idx + rowIndex * filesPerRow === selectedFileIdx)"
                >
                  <div
                    v-for="(kp, kidx) in currentKps"
                    :key="kidx"
                    class="kps"
                    @click="selectKp(kp, groupedFiles[rowIndex][selectedFileIdx % filesPerRow].file_name, files_with_types[selectedFileTypeIdx].file_type)"
                  >
                    {{ kp }}
                  </div>
                </div>
              </template>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>

    <!-- backtop -->
    <el-backtop target=".right-area" :bottom="100">
      <div style="background-color: #fff; text-align: center; height: 34px; width: 34px; border-radius: 8px; display: flex; background: #fff; align-items: center; justify-content: center;">
        <i class="el-icon-top" style="font-size: 22px;"></i>
      </div>
    </el-backtop>
  </div>
</template>

<style lang="scss" scoped>
.small-question-bank {
  display: flex;
  height: 100%;
  .left-area {
    width: 285px;
    background: #f7f7f7;
    padding: 49px 0 49px 19px;
    position: relative;

    .logo-wrap {
      display: flex;
      align-items: center;
      position: relative;

      img {
        margin-right: 10px;
      }

      .close-beta {
        position: absolute;
        left: 170px;
        top: 0;
      }
    }

    .message {
      font-size: 14px;
      color: #999999;
      line-height: 16px;
      margin-left: 70px;
      margin-bottom: 21px;
    }

    .history-wrap {
      margin: 48px 0px 19px;

      .title {
        font-size: 16px !important;
        color: #999999;
        line-height: 19px !important;
        display: flex;
        align-items: center;

        img {
          margin-right: 9px;
        }
      }

      .history-list {
        height: calc(100vh - 306px);
        overflow: auto;

        .list-item {
          padding: 10px 14px;
          font-size: 16px;
          color: #505050;
          line-height: 19px;
          margin-bottom: 4px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;

          span {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .unread {
            max-width: 20px;
          }

          &:hover {
            background-color: #EBECF5;
          }

          &.active {
            background-color: #fff;
          }
          .loading-info {
            display: flex;
            img {
              height: 18px;
              transform: scale(2);
            }
          }
        }
      }
    }

    .pack-up {
      position: absolute;
      right: -10px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
    }
  }

  .right-area {
    flex: 1;
    overflow-y: auto;
    display: flex;
    align-items: flex-start;

    .content-wrap {
      margin: 55px 0px 55px 55px;
      flex: 1;
      min-width: 0;
      &.content-wrap-not-start {
        margin-right: 50px;
      }

      .title {
        font-family: HarmonyOS Sans SC, HarmonyOS Sans SC !important;
        font-weight: 700;
        font-size: 26px !important;
        color: #202425;
        line-height: 30px !important;
        margin-bottom: 21px;
      }

      .sub-message {
        display: flex;
        align-items: center;
        margin-bottom: 43px;

        .order-no {
          word-break: break-word;
          text-decoration: underline;
          cursor: pointer;
        }
      }
    }

    .expand-wrap {
      display: flex;
      align-items: center;
      padding: 37px 0 27px 48px;

      .expand {
        cursor: pointer;
        margin-right: 8px;
        img {
          height: 20px;
        }
      }

      .new-task-button {
        width: 162px;
      }
    }

    .el-form {
      width: 600px;

      :deep(.el-form-item__label) {
        font-weight: 500;
        font-size: 16px;
        color: #3d3d3d;
        line-height: 19px;
        padding-bottom: 14px;
      }

      .el-button {
        background: #4a53f8;
        border-radius: 2px;
        width: 100%;
        color: #fff;
        margin-top: 12px;

        :deep(span) {
          color: inherit;
          font-size: 16px;
        }
      }

      .el-button[disabled] {
        background: #c0ccf6;
      }
    }
  }

  :deep(.el-input__inner),
  :deep(.el-textarea__inner) {
    border-radius: 8px;
    border: 1px solid #999;
    &::placeholder {
      color: #A5ABB5;
    }
  }

  .el-backtop {
    border-radius: 0;
    background: #f7f7f7;
    box-shadow: none;
    width: 50px;
    height: 50px;
  }
}

.new-task-button {
  width: 241px;
  height: 45px;
  background: #e8eafd;
  border-radius: 87px 87px 87px 87px;
  border: 0px solid #466ae5;
  font-size: 16px;
  color: #4a53f8;
  display: flex;
  align-items: center;
  justify-content: center;

  .el-icon-plus {
    color: inherit;
    margin-right: 12px;
  }
}

.enlarge-wrap {
  width: 943px;
  background: #ffffff;
  box-shadow: 7px 5px 11px 2px rgba(85, 109, 192, 0.1);
  border-radius: 15px 15px 15px 15px;
  border: 0px solid #7a7a7a;
  padding: 27px 50px 27px 46px;

  :deep(.item-content) {
    height: 278px;
  }
}

.stream-output,
.search-result {
  .more-btn {
    color: #02A7F0;
    background-color: #F9FDFF;
    text-align: center;
    padding: 10px 0;
    cursor: pointer;
    margin-bottom: 30px;
  }
  .tab-wrap {
    position: relative;
    background: #fff;
    > .message {
      position: absolute;
      right: 0;
      font-size: 13px;
    }
  }
  .el-tabs {
    :deep(.el-tabs__header) {
      .el-tabs__active-bar {
        display: none;
      }
      .el-tabs__nav-wrap::after {
        display: none;
      }
      .el-tabs__item {
        margin-right: 24px;
        border-radius: 8px;
        padding: 0 18px;
        border: 1px solid #C0C4CC;
        font-size: 13px;
        height: 36px;
        line-height: 36px;
        span {
          color: inherit;
        }
        &.is-active,
        &:hover {
          color: #02A7F0;
          border-color: #02A7F0;
          background-color: #F9FDFF;
        }
        &.is-disabled {
          pointer-events: none;
        }
      }
    }
  }
  .message {
    :deep(span) {
      color: inherit;
      font-size: 16px;
    }
  }
}

.kps-drawer {
  width: 450px;
  left: auto;
  :deep(.el-drawer__header) {
    font-weight: bold;
    margin-bottom: 16px;
    span {
      font-size: 16px;
    }
  }
  :deep(.el-drawer__body) {
    padding: 0 24px;
  }
  .kps-tabs {
    .message {
      font-size: 12px;
      color: #999;
    }
  }
  .order-kps-list, .file-kps-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 16px;
  }
  .kps {
    padding: 6px 10px;
    color: #3D3D3D;
    background: #F5F5F5;
    border-radius: 6px;
    cursor: pointer;
  }
  .kps.active {
    background: #409eff;
    color: #fff;
  }
  .kps-freq {
    font-size: 12px;
  }
  .file-type-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 24px;
  }
  .file-type {
    background: #f5f7fa;
    border-radius: 16px;
    padding: 6px 14px;
    cursor: pointer;
    color: #333;
  }
  .file-type.active {
    background: #02a7f0;
    color: #fff;
  }
  .file-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    .file-row {
      display: flex;
      gap: 16px;
    }
  }
  .file-wrapper {
    flex: 1 1 45%;
    min-width: 170px;
    max-width: 48%;
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .file-item {
    border: 1px solid #999999;
    border-radius: 216px;
    display: flex;
    align-items: center;
    padding: 6px 12px;
    cursor: pointer;
    background: #fff;
    width: 100%;
    box-sizing: border-box;
    img {
      margin-right: 4px;
      height: 20px;
      flex-shrink: 0;
    }
    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      max-width: 120px;
      display: inline-block;
      color: inherit;
    }
    &.active {
      background: #f3fbfe;
      color: #03a7f0;
      border-color: #03a7f0;
    }
    &.disabled {
      background: #f2f2f2;
      color: #bbb;
      cursor: not-allowed;
      border-color: #bbb;
    }
  }
  .file-kps-list {
    width: 100%;
    margin-top: 0px;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    border-radius: 12px;
    padding: 8px 0 8px 0;
    box-sizing: border-box;
  }
}
</style>
<style lang="scss">
.input-container {
  position: relative;
  .fake-placeholder {
    position: relative;
    z-index: 2;
    background: transparent;
  }

  .placeholder-text {
    position: absolute;
    left: 15px;
    top: 10px;
    z-index: 2;
    pointer-events: none;
    color: #A5ABB5;
    line-height: normal;
  }

  .gray-text {
    color: #A5ABB5;
  }

  .highlight-text {
    background: #E7F1FF;
    border-radius: 2px 2px 2px 2px;
    color: #1677FF;
  }

  .fake-placeholder:not(:placeholder-shown) + .placeholder-text {
    display: none;
  }

  .quick-extraction {
    position: absolute;
    border: 1px solid #AAAAAA;
    bottom: 8px;
    left: 15px;
    border-radius: 40px;
    display: flex;
    cursor: pointer;
    z-index: 99;
    line-height: 1;
    font-size: 11px;
    padding: 4px 10px;
    color: #9B9BA9;
    align-items: center;
    img {
      height: 14px;
      margin-right: 4px;
    }
  }
}
.scroll-container.hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scroll-container.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
