<script setup lang="ts">
import { ref, computed, onBeforeUnmount, nextTick, getCurrentInstance } from 'vue'
import MarkdownIt from 'markdown-it'
import {
  reWrittenQuestion,
  getRewrittenResult,
  copyAnswer,
  meet,
  notMeet,
  analyzing,
  screenshot,
} from '@/api/modules/smallQuestionBank'
import { useScrollbarOnHover } from '@/composables/useScrollbarOnHover'
import { ElMessage } from 'element-plus'
import html2canvas from 'html2canvas'

import copyImg from '@/assets/images/small-question-bank/copy.png'
import copySuccessImg from '@/assets/images/small-question-bank/copySuccess.png'
import screenshotImg from '@/assets/images/small-question-bank/screenshot.png'
import refreshImg from '@/assets/images/small-question-bank/refresh.png'
import agreeImg from '@/assets/images/small-question-bank/agree.png'
import agreeingImg from '@/assets/images/small-question-bank/agreeing.png'
import opposeImg from '@/assets/images/small-question-bank/oppose.png'
import opposeingImg from '@/assets/images/small-question-bank/opposeing.png'
import redEnvelopeImg from '@/assets/images/small-question-bank/red-envelope.png'
import baoquanImg from '@/assets/images/small-question-bank/baoquan.png'
import icon1Img from '@/assets/images/small-question-bank/icon1.png'
import icon2Img from '@/assets/images/small-question-bank/icon2.png'
import icon3Img from '@/assets/images/small-question-bank/icon3.png'
import icon5Img from '@/assets/images/small-question-bank/icon5.png'

const props = defineProps<{
  index: number
  data: any
  showClose?: boolean
  feedBackList?: any[]
  feedBackPositiveList?: any[]
  orderType?: number
  taskId?: number
}>()

const emit = defineEmits<{
  enlarge: [data: any, index: number]
  update: [data: any, index: number]
  updateCurrentObject: [data: any]
  close: []
}>()

const { scrollbarClass, handleMouseEnter, handleMouseLeave } = useScrollbarOnHover()

const md = new MarkdownIt({ html: true, linkify: true, typographer: true, breaks: true })

const currentStep = ref(0)
const steps = ['正在分析条件', '正在匹配题库', '正在搜索题目']
const percentage = ref(0)
const stepElapsed = ref(0)
const isResultReturned = ref(false)
const stepDurations = [5, 5, 1000]
const stepPercentPerSecond = 5
const stepStartPercent = [0, 25, 50]
const stepMaxPercent = [25, 50, 95]
let timerInterval: ReturnType<typeof setInterval> | null = null
const loading = ref(false)
const showRefresh = ref(false)
const showAnalysis = ref(false)
const textarea = ref('')
const types = ['全部', '选择题', '开放题', '', '计算题']
const copySuccess = ref(false)
let pollTimerInterval: ReturnType<typeof setInterval> | null = null
const showFeedback = ref(false)
const selectedReasonId = ref<any>(null)
const actionContext = ref('')
let _finishAccelerating = false
let _finishStartTime = 0
let _finishStartPercent = 0
const showPositiveFeedback = ref(false)
const selectedPositiveReasonId = ref<any>(null)
const actionPositiveContext = ref('')
const otherMessage1 = ref('')
const otherMessage2 = ref('')

const topicEl = ref<HTMLElement>()

const otherId = computed(() => {
  const result = (props.feedBackPositiveList || []).filter((item: any) => item.reasonName == '其他')
  return result.length ? result[0].id : ''
})

const otherId1 = computed(() => {
  const result = (props.feedBackList || []).filter((item: any) => item.reasonName == '其他')
  return result.length ? result[0].id : ''
})

const otherId2 = computed(() => {
  const result = (props.feedBackList || []).filter((item: any) => item.reasonName == '其他')
  return result.length ? result[1]?.id : ''
})

function formatMarkdown(data: string) {
  if (!data) return ''
  let replacedString = data.replace(/\\\(/g, '$').replace(/\\\)/g, '$')
  replacedString = replacedString.replace(/(\$\s*\d+)/g, '&#92;$1')
  return md.render(replacedString)
}

function renderMathJax() {
  if ((window as any).MathJax) {
    try {
      ;(window as any).MathJax.typesetPromise?.()
    } catch (error) {
      console.warn('MathJax typeset error:', error)
    }
  }
}

async function onCopy() {
  const params: any = {}
  if (props.data.id) {
    params.questionId = props.data.id
  } else {
    params.taskId = props.taskId
    params.questionNo = props.data.questionNo
  }
  await copyAnswer(params)

  // Copy text to clipboard
  try {
    await navigator.clipboard.writeText(props.data.genQuestion)
  } catch {
    // fallback: do nothing, API call already tracked
  }

  ElMessage.success('复制成功！')
  copySuccess.value = true
  setTimeout(() => {
    copySuccess.value = false
  }, 2000)
}

function onError() {
  ElMessage.error('拷贝失败')
}

function clearTimer() {
  currentStep.value = 0
  stepElapsed.value = 0
  _finishAccelerating = false
  _finishStartTime = 0
  _finishStartPercent = 0
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function startCountdown() {
  clearTimer()
  currentStep.value = 0
  percentage.value = 0
  stepElapsed.value = 0
  _finishAccelerating = false
  isResultReturned.value = false

  timerInterval = setInterval(() => {
    if (_finishAccelerating) {
      const now = Date.now()
      const elapsed = now - _finishStartTime
      const t = Math.min(elapsed / 2000, 1)
      const percent = _finishStartPercent + (100 - _finishStartPercent) * t
      percentage.value = Math.max(0, Math.min(100, Math.round(percent)))
      if (t >= 1) {
        setTimeout(() => {
          loading.value = false
        }, 0)
        clearTimer()
        try { getNewResult() } catch {}
      }
      return
    }

    stepElapsed.value = (stepElapsed.value || 0) + 1

    if (currentStep.value === 0) {
      percentage.value = Math.min(stepStartPercent[0] + stepElapsed.value * stepPercentPerSecond, stepMaxPercent[0])
      if (stepElapsed.value >= stepDurations[0]) {
        currentStep.value = 1
        stepElapsed.value = 0
      }
    } else if (currentStep.value === 1) {
      percentage.value = Math.min(stepStartPercent[1] + stepElapsed.value * stepPercentPerSecond, stepMaxPercent[1])
      if (stepElapsed.value >= stepDurations[1]) {
        currentStep.value = 2
        stepElapsed.value = 0
      }
    } else if (currentStep.value === 2) {
      percentage.value = Math.min(stepStartPercent[2] + stepElapsed.value * stepPercentPerSecond, stepMaxPercent[2])
    }

    if (isResultReturned.value) {
      _finishAccelerating = true
      _finishStartTime = Date.now()
      _finishStartPercent = percentage.value
      try { getNewResult() } catch {}
    }
  }, 1000)
}

function enlarge() {
  emit('enlarge', props.data, props.index)
}

function close() {
  emit('close')
}

function refresh() {
  showRefresh.value = true
  textarea.value = ''
}

async function agree() {
  if (props.data.meetStatus == 1) {
    const params: any = {}
    if (props.data.id) {
      params.questionId = props.data.id
    } else {
      params.taskId = props.taskId
      params.questionNo = props.data.questionNo
    }
    await meet(params)
    props.data.meetStatus = 0
    return
  }
  showPositiveFeedback.value = true
  selectedPositiveReasonId.value = null
  actionPositiveContext.value = ''
  otherMessage1.value = ''
}

async function oppose() {
  if (props.data.meetStatus == 2) {
    const params: any = {}
    if (props.data.id) {
      params.questionId = props.data.id
    } else {
      params.taskId = props.taskId
      params.questionNo = props.data.questionNo
    }
    await notMeet(params)
    props.data.meetStatus = 0
    return
  }
  showFeedback.value = true
  selectedReasonId.value = null
  actionContext.value = ''
  otherMessage1.value = ''
  otherMessage2.value = ''
}

async function analysis() {
  await analyzing({ questionId: props.data.id })
  showAnalysis.value = true
}

function cancelRefresh() {
  showRefresh.value = false
}

async function getNewResult() {
  const res = await getRewrittenResult({ questionIds: props.data.id })
  if (res.status == 200) {
    if (res.body[0].rewrittenStatus == 1) {
      emit('update', res.body[0].newQuestion, props.index)
      emit('updateCurrentObject', res.body[0].newQuestion)
      isResultReturned.value = true
      if (pollTimerInterval) {
        clearInterval(pollTimerInterval)
        pollTimerInterval = null
      }
    } else if (res.body[0].rewrittenStatus == 0) {
      pollTimerInterval = setInterval(() => {
        getNewResult()
      }, 10000)
    }
  }
}

async function submitRefresh() {
  if (!textarea.value) {
    ElMessage.error('请先输入内容')
    return
  }
  const res = await reWrittenQuestion({
    questionId: props.data.id,
    rewrittenPrompt: textarea.value,
  })
  if (res.status == 200) {
    clearTimer()
    if (pollTimerInterval) {
      clearInterval(pollTimerInterval)
      pollTimerInterval = null
    }
    showRefresh.value = false
    loading.value = true
    startCountdown()
    getNewResult()
  }
}

function cancelFeedBack() {
  showFeedback.value = false
}

async function submitFeedBack() {
  const params: any = {
    actionContext: actionContext.value,
    subReasonIds: selectedReasonId.value ? [selectedReasonId.value] : [],
    otherMessage1: selectedReasonId.value == otherId1.value ? otherMessage1.value : '',
    otherMessage2: selectedReasonId.value == otherId2.value ? otherMessage2.value : '',
  }
  if (props.data.id) {
    params.questionId = props.data.id
  } else {
    params.taskId = props.taskId
    params.questionNo = props.data.questionNo
  }
  const res = await notMeet(params)
  if (res.status == 200) {
    props.data.meetStatus = 2
    showFeedback.value = false
    ElMessage.success('感谢反馈，我们会努力改进！')
  }
}

function cancelPositiveFeedBack() {
  showPositiveFeedback.value = false
}

async function submitPositiveFeedBack() {
  const params: any = {
    actionContext: actionPositiveContext.value,
    subReasonIds: selectedPositiveReasonId.value ? [selectedPositiveReasonId.value] : [],
    otherMessage1: selectedPositiveReasonId.value == otherId.value ? otherMessage1.value : '',
  }
  if (props.data.id) {
    params.questionId = props.data.id
  } else {
    params.taskId = props.taskId
    params.questionNo = props.data.questionNo
  }
  const res = await meet(params)
  if (res.status == 200) {
    props.data.meetStatus = 1
    showPositiveFeedback.value = false
    ElMessage.success('感谢您的反馈！')
  }
}

async function captureAnswer() {
  const contentEl = topicEl.value?.querySelector('.item-content') as HTMLElement
  if (!contentEl) {
    ElMessage.error('未找到题目内容')
    return
  }

  const params: any = {}
  if (props.data.id) {
    params.questionId = props.data.id
  } else {
    params.taskId = props.taskId
    params.questionNo = props.data.questionNo
  }
  screenshot(params)

  const originalHeight = contentEl.style.height
  const originalOverflow = contentEl.style.overflow
  contentEl.style.height = 'auto'
  contentEl.style.overflow = 'visible'

  const wrapper = document.createElement('div')
  wrapper.style.padding = '20px'
  wrapper.style.background = '#fff'
  wrapper.style.display = 'inline-block'
  wrapper.style.boxSizing = 'border-box'
  wrapper.style.width = contentEl.offsetWidth + 40 + 'px'

  const style = document.createElement('style')
  style.innerHTML = `
  .table {
    border-collapse: collapse;
    width: 100%;
    margin: 10px 0;
  }
  .table th, .table td {
    border: 1px solid #ddd;
    padding: 8px 12px;
    text-align: left;
  }
  .table th {
    background-color: #f5f5f5;
    font-weight: 600;
  }
  .table tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  .table tr:hover {
    background-color: #f0f0f0;
  }
  `
  wrapper.appendChild(style)

  const clone = contentEl.cloneNode(true) as HTMLElement
  clone.style.height = 'auto'
  clone.style.overflow = 'visible'
  wrapper.appendChild(clone)
  document.body.appendChild(wrapper)

  try {
    const canvas = await html2canvas(wrapper, {
      useCORS: true,
      scale: 2,
      backgroundColor: '#fff',
    })
    document.body.removeChild(wrapper)
    contentEl.style.height = originalHeight
    contentEl.style.overflow = originalOverflow

    const imgData = canvas.toDataURL('image/png')

    if (navigator.clipboard && window.ClipboardItem) {
      const blob = await (await fetch(imgData)).blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      ElMessage.success('截图已完成，可直接粘贴至课件内')
    } else {
      const win = window.open()
      win?.document.write(`<img src="${imgData}" style="max-width:100%"/>`)
      ElMessage.info('请右键图片复制或保存')
    }
  } catch {
    document.body.removeChild(wrapper)
    ElMessage.error('截图失败，请重试')
    contentEl.style.height = originalHeight
    contentEl.style.overflow = originalOverflow
  }
}

function changeSelectedReasonId() {
  otherMessage1.value = ''
  otherMessage2.value = ''
}

onBeforeUnmount(() => {
  clearTimer()
  if (pollTimerInterval) {
    clearInterval(pollTimerInterval)
    pollTimerInterval = null
  }
})
</script>

<template>
  <div class="topic-item" ref="topicEl">
    <div style="display: flex;justify-content: space-between;" v-if="!showClose">
      <el-tooltip effect="dark" :content="data.genQuestionInfo" placement="top">
        <div class="item-ref" v-if="data.genType == 2 || data.genType == 4 || data.genType == 5">
          <span>{{ data.genQuestionInfo }}</span>
        </div>
      </el-tooltip>
    </div>
    <div class="item-head">
      <div class="flex-left">
        <span class="index">{{ index < 10 ? `0${index}` : index }}</span>
        <span class="type">{{ types[data.questionType] }}</span>
        <template v-if="showClose">
          <div class="item-ref icon1" v-if="data.genType == 2 || data.genType == 5" style="margin-left: 8px;">
            <img :src="data.genType == 2 ? icon1Img : icon5Img" alt="">
            <span>{{ data.genQuestionInfo }}</span>
          </div>
          <div class="item-ref icon3" v-if="data.genType == 4" style="margin-left: 8px;">
            <img :src="icon3Img" alt="">
            <span>{{ data.genQuestionInfo }}</span>
          </div>
          <div class="item-ref icon2" v-if="data.genType == 3" style="margin-left: 8px;">
            <img :src="icon2Img" alt="">
            <span>精选试题 · 小班题库</span>
          </div>
        </template>
      </div>
      <div class="flex-right">
        <i class="el-icon-close" v-if="showClose" @click="close"></i>
        <template v-else>
          <el-tooltip effect="dark" content="复制" placement="top">
            <span @click="onCopy">
              <img :src="copySuccess ? copySuccessImg : copyImg" alt="" />
              复制
            </span>
          </el-tooltip>
          <el-tooltip effect="dark" content="截图" placement="top">
            <span @click="captureAnswer"><img :src="screenshotImg" alt="" />截图</span>
          </el-tooltip>
          <el-tooltip effect="dark" content="重写" placement="top">
            <span @click="refresh" v-if="data.id && data.genType == 3"><img :src="refreshImg" alt="" />重写</span>
          </el-tooltip>
        </template>
      </div>
    </div>
    <div
      class="item-content scroll-container"
      :class="scrollbarClass"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <div class="vue-markdown" v-html="formatMarkdown(data.genQuestion)" />
    </div>
    <div class="item-footer">
      <div style="display: flex; align-items: center;">
        <span style="color: #7a7a7a; font-size: 13px;display: flex;">
          反馈用题体验，获得题库测评奖金
          <img :src="redEnvelopeImg" alt="" style="margin-left: 4px; height: 16px; width: 16px;">
        </span>
        <el-tooltip effect="dark" content="符合" placement="top">
          <span @click="agree">
            <img :src="data.meetStatus == 1 ? agreeingImg : agreeImg" alt="" />
          </span>
        </el-tooltip>
        <el-tooltip effect="dark" content="不符合" placement="top">
          <span @click="oppose">
            <img :src="data.meetStatus == 2 ? opposeingImg : opposeImg" alt="" />
          </span>
        </el-tooltip>
      </div>
      <div v-if="showClose" class="right-operation">
        <span @click="onCopy">
          <img :src="copySuccess ? copySuccessImg : copyImg" alt="" />复制
        </span>
        <span @click="refresh" v-if="data.id && data.genType == 3"><img :src="refreshImg" alt="" />重写</span>
      </div>
    </div>
    <div class="loading" v-if="loading">
      <p class="title">正在重新生成</p>
      <el-progress :percentage="percentage" :stroke-width="16" class="custom-progress" />
      <p class="timer">
        {{ currentStep + 1 }} / {{ steps.length }} {{ steps[currentStep] }}
      </p>
    </div>

    <!-- 重新生成弹窗 -->
    <div class="new-mask" v-if="showRefresh">
      <div class="alert-content-refresh">
        <p class="title">
          重新生成
          <i class="el-icon-close" @click="showRefresh = false"></i>
        </p>
        <el-input type="textarea" :rows="4" placeholder="请在此描述您对题目的修改方向或补充说明，也可以直接提供一个题目示例" v-model="textarea" />
        <div class="footer">
          <button class="cancel" @click="cancelRefresh">取消</button>
          <button class="submit" @click="submitRefresh">提交</button>
        </div>
      </div>
    </div>

    <!-- 温馨提示弹窗 -->
    <div class="new-mask" v-if="showAnalysis">
      <div class="alert-content">
        <p class="title">
          温馨提示
          <i class="el-icon-close" @click="showAnalysis = false"></i>
        </p>
        <p class="message">功能开发中，敬请期待~</p>
      </div>
    </div>

    <!-- 不符合反馈 -->
    <div class="new-mask" v-if="showFeedback">
      <div class="alert-content-refresh">
        <p class="title">
          使用体验反馈
          <i class="el-icon-close" @click="showFeedback = false"></i>
        </p>
        <div class="input-container el-textarea">
          <p style="color: #7a7a7a;margin-top: -20px;">
            您的反馈能帮助我们更好地改进产品
            <img :src="baoquanImg" alt="" style="height: 20px; vertical-align: middle;">
          </p>
          <div class="tag-wrap">
            <div class="feedback-group">
              <div class="group-label">题目不可用</div>
              <el-radio-group v-model="selectedReasonId" @change="changeSelectedReasonId">
                <el-radio v-for="(item, index) in (feedBackList || []).slice(0,3)" :value="item.id" :key="index">
                  {{ item.reasonName }}
                  <el-input
                    v-show="item.reasonName == '其他' && selectedReasonId == otherId1"
                    v-model="otherMessage1"
                    placeholder="请填写"
                    maxlength="30"
                    style="width: 200px;"
                    size="small"
                  />
                </el-radio>
              </el-radio-group>
            </div>
            <div class="feedback-group">
              <div class="group-label">题目不匹配</div>
              <el-radio-group v-model="selectedReasonId">
                <el-radio v-for="(item, index) in (feedBackList || []).slice(3,7)" :value="item.id" :key="index+3">
                  {{ item.reasonName }}
                  <el-input
                    v-show="item.reasonName == '其他' && selectedReasonId == otherId2"
                    v-model="otherMessage2"
                    placeholder="请填写"
                    maxlength="30"
                    style="width: 200px;"
                    size="small"
                  />
                </el-radio>
              </el-radio-group>
            </div>
          </div>
          <textarea
            rows="4"
            v-model="actionContext"
            placeholder="请告诉我们您认为题目不符合的原因，您认为更好的题目是什么样的?"
            class="fake-placeholder el-textarea__inner"
            style="min-height: 70px;border: 1px solid #4A53F8;"
          />
        </div>
        <div class="footer">
          <button class="cancel" @click="cancelFeedBack">取消</button>
          <button
            class="submit"
            @click="submitFeedBack"
            :disabled="!selectedReasonId || (selectedReasonId == otherId1 && !otherMessage1) || (selectedReasonId == otherId2 && !otherMessage2)"
          >提交</button>
        </div>
      </div>
    </div>

    <!-- 符合反馈 -->
    <div class="new-mask" v-if="showPositiveFeedback">
      <div class="alert-content-refresh">
        <p class="title">
          使用体验反馈
          <i class="el-icon-close" @click="showPositiveFeedback = false"></i>
        </p>
        <div class="input-container el-textarea">
          <p style="color: #7a7a7a;margin-top: -20px;">感谢您对本题的认可，您准备将本题应用在哪个教学场景中~</p>
          <div class="tag-wrap">
            <el-radio-group v-model="selectedPositiveReasonId" @change="changeSelectedReasonId">
              <el-radio
                :value="item.id"
                v-for="(item, index) in feedBackPositiveList"
                :key="index"
                style="width: 130px;"
              >
                {{ item.reasonName }}
                <el-input
                  v-show="item.reasonName == '其他' && selectedPositiveReasonId == otherId"
                  v-model="otherMessage1"
                  placeholder="请填写"
                  maxlength="30"
                  style="width: 200px;"
                  size="small"
                />
              </el-radio>
            </el-radio-group>
          </div>
          <textarea
            rows="4"
            v-model="actionPositiveContext"
            placeholder="您认为这道题目还有什么可改进的点~"
            class="fake-placeholder el-textarea__inner"
            style="min-height: 70px;border: 1px solid #4A53F8;"
          />
        </div>
        <div class="footer">
          <button class="cancel" @click="cancelPositiveFeedBack">取消</button>
          <button
            class="submit"
            @click="submitPositiveFeedBack"
            :disabled="!selectedPositiveReasonId || (selectedPositiveReasonId == otherId && !otherMessage1)"
          >提交</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.topic-item {
  margin-bottom: 30px;
  position: relative;
  .enlarge {
    display: inline-block;
    width: 26px;
    min-width: 26px;
    height: 26px;
    border-radius: 8px;
    font-size: 13px;
    color: #4a53f8;
    line-height: 26px;
    text-align: center;
    margin-left: 10%;
    cursor: pointer;
    img {
      vertical-align: text-bottom;
      height: 17px;
    }
    &:hover {
      background-color: #e9ebf2;
    }
  }

  .item-head {
    position: relative;
    margin: 0 0 15px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .flex-left {
      display: flex;
      align-items: center;
    }

    .index {
      margin-right: 7px;
    }

    .flex-right {
      display: flex;
      align-items: flex-end;
      .item {
        margin-right: 8px;
        display: flex;
        align-items: center;
        cursor: pointer;
        color: #7A7A7A;
        img {
          width: 20px;
          height: 20px;
          margin-right: 4px;
        }
      }
    }

    .el-icon-close {
      cursor: pointer;
      font-size: 24px;
    }
  }

  .item-content {
    overflow: auto;
    margin-bottom: 9px;
    display: inline-block;

    .vue-markdown {
      font-size: 14px;
      line-height: 1.5;
      color: #333;

      h1, h2, h3, h4, h5, h6 {
        margin: 10px 0 5px 0;
        font-weight: 600;
      }

      p {
        margin: 5px 0;
      }

      .MathJax {
        font-size: 1em;
      }

      .MathJax_Display {
        margin: 10px 0;
      }

      .MathJax_Display > .MathJax {
        text-align: center;
      }
    }

    .table {
      border-collapse: collapse;
      width: 100%;
      margin: 10px 0;

      th, td {
        border: 1px solid #ddd;
        padding: 8px 12px;
        text-align: left;
      }

      th {
        background-color: #f5f5f5;
        font-weight: 600;
      }

      tr:nth-child(even) {
        background-color: #f9f9f9;
      }

      tr:hover {
        background-color: #f0f0f0;
      }
    }
  }

  .item-ref {
    font-size: 12px;
    line-height: 22px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    padding: 2px 8px;
    justify-self: flex-start;
    background-color: #F9FDFF;
    color: #02A7F0;
    img {
      height: 16px;
      margin-right: 6px;
    }
    span {
      color: inherit;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: normal;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      font-size: inherit;
    }
    &.icon1 {
      background-color: #fef4e7;
      color: #f7b55e;
    }
    &.icon2 {
      background-color: #e6f6fe;
      color: #08a9f0;
    }
    &.icon3 {
      background-color: #edfaf4;
      color: #0bb769;
    }
  }

  .item-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .right-operation {
      font-size: 14px;
      color: #7A7A7A;
      img {
        vertical-align: text-top;
        margin-right: 8px;
      }
    }

    span {
      margin-right: 10px;
      cursor: pointer;
      color: inherit;
      img {
        width: 20px;
        height: 20px;
      }
    }
  }

  ol li {
    list-style-type: auto;
  }

  ul li {
    list-style-type: disc;
  }

  .loading {
    position: absolute;
    background: #fff;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    text-align: center;
    padding-top: 54px;

    .title {
      font-size: 15px !important;
      color: #3d3d3d;
      line-height: 26px !important;
      margin-bottom: 3px;
    }

    .custom-progress {
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      .el-progress-bar {
        width: 400px;
      }
      .el-progress-bar__outer {
        background-color: #fff !important;
        border: 2px solid #4a53f8;
      }
      .el-progress-bar__inner {
        background-color: #4a53f8;
      }
      .el-progress__text {
        font-size: 15px !important;
        color: #3D3D3D !important;
        margin-left: 24px;
        width: 40px;
      }
    }

    .timer {
      font-size: 13px;
      color: #3d3d3d;
      line-height: 15px;
      margin-top: 18px;
      margin-bottom: 0;
    }
  }
}

.new-mask {
  .alert-content {
    width: 383px;
    height: 185px;
    background: #ffffff;
    box-shadow: 7px 5px 11px 2px rgba(85, 109, 192, 0.1);
    border-radius: 15px 15px 15px 15px;

    .title {
      font-weight: 500;
      font-size: 22px !important;
      color: #3d3d3d;
      line-height: 26px !important;
      margin: 25px 32px 36px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .el-icon-close {
        font-size: 24px;
        color: #3d3d3d;
        cursor: pointer;
      }
    }

    .message {
      font-weight: 400;
      font-size: 18px;
      color: #3d3d3d;
      line-height: 27px;
      text-align: center;
    }
  }

  .alert-content-refresh {
    width: 902px;
    padding-bottom: 24px;
    background: #ffffff;
    box-shadow: 7px 5px 11px 2px rgba(85, 109, 192, 0.1);
    border-radius: 15px 15px 15px 15px;

    .title {
      font-weight: 500;
      font-size: 22px !important;
      color: #3d3d3d;
      line-height: 26px !important;
      margin: 25px 32px 36px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .el-icon-close {
        font-size: 24px;
        color: #3d3d3d;
        cursor: pointer;
      }
    }

    .el-textarea {
      margin: 0 36px 26px 36px;
      width: calc(100% - 72px);
    }

    .tag-wrap {
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      .group-label {
        color: #7a7a7a;
        margin-bottom: 10px;
      }
      .el-radio-group {
        display: flex;
        gap: 12px;
        align-items: baseline;
        .el-radio {
          width: 120px;
          margin-right: 0;
          &:nth-child(3) {
            width: 190px;
          }
        }
      }
    }

    .footer {
      text-align: right;
      padding: 0 36px;

      button {
        width: 96px;
        height: 38px;
        border-radius: 8px 8px 8px 8px;
        font-size: 15px;
        line-height: 22px;
      }

      .cancel {
        color: #3d3d3d;
      }

      .submit {
        background: #4a53f8;
        color: #fff;
        &:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      }
    }
  }
}
</style>
