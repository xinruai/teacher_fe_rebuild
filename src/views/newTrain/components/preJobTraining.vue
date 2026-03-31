<script setup lang="ts">
import { computed, inject, onBeforeUnmount, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useNewTrainStore } from '@/stores/newTrain'
import { getBindingStatus, teacCompleteMandatoryStep } from '@/api/modules/newTrain'

const props = withDefaults(defineProps<{
  next?: () => void
  teacId: number
}>(), {
  next: () => {},
})

const emit = defineEmits<{
  completeProcess: [status: number, callback: () => void]
}>()

const changeStep = inject<(val: any, index: number) => void>('changeStep')!
const getProcessList = inject<() => any[]>('getProcessList')!
const setPreJobStep = inject<(val: number) => void>('setPreJobStep')!
const getPreJobStep = inject<() => number>('getPreJobStep')!

const newTrainStore = useNewTrainStore()
const { documents } = storeToRefs(newTrainStore)

const dialogVisible = ref(false)
const currentDocIdx = ref<number | null>(null)
const currentPage = ref(0)
const countdown = ref(0)
const isPageReady = ref(false)
const isBind = ref(true)
let timer: number | null = null

const currentDoc = computed(() => (currentDocIdx.value !== null ? documents.value[currentDocIdx.value] : null))
const currentPageObj = computed(() => currentDoc.value?.pages[currentPage.value]?.contents || [])
const currentPageViewed = computed(() => currentDoc.value?.pages[currentPage.value]?.viewed)
const dialogTitle = computed(() => ['1. 薪资模式', '2. 业务流程', '3. 订单服务要求'][currentDocIdx.value || 0] || '培训文档')
const currentProcess = computed(() => getProcessList().find((v) => v.type === 2) || {})

function clearTimer() {
  if (timer) {
    window.clearInterval(timer)
    timer = null
  }
}

function openDoc(idx: number) {
  currentDocIdx.value = idx
  currentPage.value = 0
  dialogVisible.value = true
  startCountdown()
}

function handleClose() {
  dialogVisible.value = false
  currentDocIdx.value = null
  currentPage.value = 0
  clearTimer()
}

function prevPage() {
  if (currentPage.value > 0) {
    currentPage.value -= 1
    startCountdown()
  }
}

async function nextPage() {
  if (!currentDoc.value) return
  if (currentPage.value < currentDoc.value.pages.length - 1 && isPageReady.value) {
    currentPage.value += 1
    startCountdown()
    return
  }
  if (!currentDoc.value.completed) {
    const target = (currentProcess.value.steps || []).find((step: any) => step.type === currentDoc.value?.type)
    if (target?.id) {
      await teacCompleteMandatoryStep({ id: target.id })
    }
    newTrainStore.setDocumentsCompleted({ type: currentDoc.value.type })
  }
  handleClose()
}

function startCountdown() {
  clearTimer()
  if (currentPageViewed.value || currentDoc.value?.completed) {
    countdown.value = 0
    isPageReady.value = true
    return
  }
  countdown.value = 15
  isPageReady.value = false
  timer = window.setInterval(() => {
    if (countdown.value > 0) {
      countdown.value -= 1
      return
    }
    clearTimer()
    if (!currentDoc.value) return
    newTrainStore.setDocumentsViewed({ type: currentDoc.value.type, pageIndex: currentPage.value })
    isPageReady.value = true
  }, 1000)
}

function prevStep() {
  changeStep(getProcessList()[0], 0)
}

function nextStep() {
  setPreJobStep(2)
  loadBindStatus()
}

async function loadBindStatus() {
  const { status, body } = await getBindingStatus({ teacId: props.teacId })
  if (status === 200) isBind.value = Boolean(body)
}

async function completeStep() {
  const target = (currentProcess.value.steps || []).find((step: any) => step.type === 45)
  if (target?.id) {
    await teacCompleteMandatoryStep({ id: target.id })
  }
  emit('completeProcess', 3, props.next || (() => {}))
}

defineExpose({ getPreJobStep })
onBeforeUnmount(clearTimer)
</script>

<template>
  <div class="pre-job-training">
    <template v-if="getPreJobStep() == 1">
      <p class="message">请先完成三个模块学习并确认阅读内容后，再签署兼职协议合同。</p>
      <div class="doc-list">
        <div v-for="(doc, idx) in documents" :key="doc.id" class="doc-item" @click="openDoc(idx)">
          <img class="doc-img" :src="doc.imgUrl" alt="">
          <p class="doc-title">{{ doc.title }}</p>
          <span v-if="doc.completed" class="tag completed">已完成</span>
          <span v-else class="tag not-completed">未完成</span>
        </div>
      </div>
      <div class="step-buttons doc-footer">
        <el-button round @click="prevStep">上一步</el-button>
        <el-button round :disabled="!documents.every((doc) => doc.completed)" @click="nextStep">下一步</el-button>
      </div>
      <el-dialog v-model="dialogVisible" width="980px" :title="dialogTitle" :before-close="handleClose">
        <div v-if="currentDoc">
          <div class="doc-content">
            <div v-for="(item, index) in currentPageObj" :key="index">
              <div v-if="item.type === 'list'" class="list-title" v-html="item.data"></div>
              <div v-else-if="item.type === 'tips'" class="list-tips">{{ item.data }}</div>
              <div v-else-if="item.type === 'list-item'" class="list-item" v-html="item.data"></div>
              <div v-else-if="item.type === 'list-item-type'" class="list-item-type" v-html="item.data"></div>
              <img v-else-if="item.type === 'image'" class="list-image" :src="item.data" :style="{ height: item.height }">
              <div v-else-if="item.type === 'message'" class="list-message">{{ item.data }}</div>
              <div v-else-if="item.type === 'sub-message'" class="sub-message" v-html="item.data"></div>
            </div>
          </div>
          <div class="doc-footer">
            <el-button round v-if="currentPage > 0" @click="prevPage" style="float:left">上一页</el-button>
            <el-button round :disabled="!isPageReady" @click="nextPage" style="float:right">
              {{ currentPage == currentDoc.pages.length - 1 ? '完成' : '下一页' }}
              <span v-if="!currentPageViewed && countdown > 0">({{ countdown }}s)</span>
            </el-button>
          </div>
        </div>
      </el-dialog>
    </template>

    <template v-if="getPreJobStep() == 2">
      <p class="message">关注公众号后点击开始，完成合同签署流程。</p>
      <div class="flex-wrap">
        <img class="qrcode" src="https://classbro-oss.oss-accelerate.aliyuncs.com/statice-resource/trainVideos/qrcode.jpg" alt="">
      </div>
      <div class="step-buttons doc-footer">
        <el-button round @click="setPreJobStep(1)">上一步</el-button>
        <el-button round :disabled="!isBind" @click="completeStep">下一步</el-button>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.message { line-height: 28px; margin-bottom: 16px; }
.doc-list { display: flex; justify-content: space-between; }
.doc-item { border: 2px solid #536bb8; border-radius: 10px; height: 126px; width: 216px; text-align: center; position: relative; cursor: pointer; padding-top: 22px; }
.doc-img { height: 35px; }
.doc-title { font-size: 16px; margin-top: 8px; }
.tag { width: 54px; line-height: 22px; position: absolute; top: 0; left: 0; color: #fff; font-size: 12px; border-radius: 0 0 10px 0; }
.not-completed { background: #f59a23; }
.completed { background: #17d1d6; }
.doc-content { max-height: 480px; overflow: auto; }
.list-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
.list-tips, .list-item, .list-item-type, .sub-message { margin-bottom: 8px; line-height: 24px; }
.list-item-type, .sub-message { margin-left: 20px; color: #666; }
.list-image { max-width: 100%; margin-bottom: 8px; }
.list-message { color: #ff0000; text-align: center; }
.doc-footer { margin-top: 12px; }
.step-buttons { text-align: right; }
.flex-wrap { display: flex; justify-content: center; }
.qrcode { height: 168px; }
</style>
