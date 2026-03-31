<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ElMessageBox, ElNotification } from 'element-plus'
import { formatTime } from '@/utils/task/Utils'
import { getBeiJinTime } from '@/api/modules/examOrder'
import { creatClass } from '@/api/modules/classIn'
import { getInterviewResult, getInterviewResultDetail, getTeacSurveyData } from '@/api/modules/newTrain'

const props = withDefaults(defineProps<{
  teacId?: number
  teacNickName?: string
  classInfo?: Record<string, any>
  next?: () => void
}>(), {
  teacId: 0,
  teacNickName: '讲师',
  classInfo: () => ({}),
  next: () => {},
})

const emit = defineEmits<{
  queryClassRoom: []
  setHiddenCarousel: [bool: boolean]
  setShowInterviewResult: [bool: boolean]
  completeProcess: [status: number, callback: () => void]
}>()

const form = reactive<{ date?: string; time?: string }>({})
const step = ref(1)
const beijingTime = ref('')
const interviewResult = ref<number | null>(null)
const surveyVersion = ref<number | null>(null)
const feedBacks = ref<any[]>([])
const suggestion = ref('')
const imageDialogVisible = ref(false)
let timer3: number | null = null
let beijingTimer: number | null = null

watch(step, (val) => {
  emit('setHiddenCarousel', val !== 1)
  emit('setShowInterviewResult', val === 3)
})

watch(interviewResult, async (val) => {
  if (val !== 1) return
  const res = await getInterviewResultDetail({ teacId: props.teacId })
  if (res.status === 200) {
    surveyVersion.value = res.body?.teacUserDetails?.surveyVersion
  }
})

onMounted(() => {
  getBeiJinTimeData()
  pollInterviewResult()
  timer3 = window.setInterval(pollInterviewResult, 5000)
  beijingTimer = window.setInterval(getBeiJinTimeData, 5 * 60 * 1000)
})

onBeforeUnmount(() => {
  if (timer3) window.clearInterval(timer3)
  if (beijingTimer) window.clearInterval(beijingTimer)
})

async function getBeiJinTimeData() {
  const res = await getBeiJinTime()
  if (res.status === 200) {
    beijingTime.value = res.body?.date || ''
  }
}

async function pollInterviewResult() {
  const res = await getInterviewResult({ teacId: props.teacId })
  if (res.status !== 200 || !res.body) return
  interviewResult.value = res.body.status
  if (interviewResult.value === 1) {
    if (timer3) window.clearInterval(timer3)
    const feedbackRes = await getTeacSurveyData({ teacId: props.teacId })
    if (feedbackRes.status === 200) {
      feedBacks.value = feedbackRes.body?.feedBacks || []
      suggestion.value = feedbackRes.body?.suggestion || '您的表现十分优秀'
    }
  }
}

async function createFormalClass() {
  if (!form.date || !form.time) {
    ElNotification.warning('请选择面试日期和时间')
    return
  }
  const startTime = `${form.date} ${form.time}:00`
  const end = new Date(startTime.replace(/-/g, '/')).getTime() + 30 * 60 * 1000
  const res = await creatClass({
    type: 2,
    teacId: props.teacId,
    startTime,
    endTime: formatTime(end, 'Y-M-D h:m:s'),
  })
  if (res.status === 200) {
    ElNotification.success('面试课堂创建成功')
    emit('queryClassRoom')
    step.value = 2
  }
}

async function openInterviewClass() {
  if (disabledEnterInterviewClass.value) return
  const url = props.classInfo?.joinUrl
  if (url) {
    try {
      await ElMessageBox.confirm('即将进入正式面试课堂，请确认已准备就绪。', '确认进入', {
        confirmButtonText: '进入',
        cancelButtonText: '取消',
        type: 'warning',
      })
      window.open(url)
    } catch {
      // user cancelled
    }
  } else {
    ElNotification.warning('课堂链接暂未生成，请稍后重试')
  }
}

async function nextStep() {
  await emit('completeProcess', 3, props.next || (() => {}))
  emit('setHiddenCarousel', false)
  emit('setShowInterviewResult', false)
}

const disabledTime = computed(() => Boolean(props.classInfo?.formalRoom))
const remainMs = computed(() => {
  const start = props.classInfo?.formalRoom?.startTime
  if (!start || !beijingTime.value) return 0
  const s = new Date(String(start).replace(/-/g, '/')).getTime()
  const b = new Date(String(beijingTime.value).replace(/-/g, '/')).getTime()
  return s - b
})
const disabledEnterInterviewClass = computed(() => remainMs.value > 30 * 60 * 1000)
const remainText = computed(() => {
  const diff = Math.max(remainMs.value, 0)
  const m = Math.floor(diff / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return `${m}分${s}秒`
})
</script>

<template>
  <div class="step">
    <template v-if="step == 1">
      <div class="title">Step4 选择面试时间</div>
      <div class="step-content">
        <div class="first-line">请务必在两周内完成复试，以下时间为北京时间</div>
        <div class="line">
          开课日期
          <el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" :disabled="disabledTime" />
          <el-time-select v-model="form.time" :disabled="disabledTime" start="00:00" step="00:30" end="23:30" />
        </div>
        <el-button class="small-btn" v-if="!disabledTime" @click="createFormalClass">确定面试</el-button>
      </div>
      <div style="text-align:right" v-if="disabledTime">
        <el-button round @click="step = 2">下一步</el-button>
      </div>
    </template>

    <template v-if="step == 2">
      <div class="countdown">
        <template v-if="disabledEnterInterviewClass">距离可进入正式课堂还有 {{ remainText }}</template>
        <template v-else>{{ interviewResult == 1 ? '面试结果已更新，可进入下一步' : '等待面试结果更新中...' }}</template>
      </div>
      <div class="footer-box">
        <el-button class="complate" :disabled="disabledEnterInterviewClass" @click="openInterviewClass">进入面试课堂</el-button>
        <el-button class="complate" :disabled="interviewResult != 1" @click="step = 3">下一步</el-button>
      </div>
      <div class="help-text" @click="imageDialogVisible = true">手动创建【快速会议】-如何操作</div>
    </template>

    <template v-if="step == 3">
      <div class="interview-feedback">
        <p>亲爱的 <b>{{ teacNickName }}</b>，恭喜通过面试环节考核，以下为面试反馈：</p>
        <template v-if="feedBacks.length">
          <div v-for="(item, index) in feedBacks" :key="index" style="margin-bottom: 10px;">
            <div><b>{{ item.title }}</b></div>
            <div v-for="(value, idx) in item.inputValues || []" :key="idx">{{ Number(idx) + 1 }}. {{ value }}</div>
          </div>
        </template>
        <div v-else>{{ suggestion || '您的表现十分优秀' }}</div>
      </div>
      <div class="step-buttons">
        <el-button round @click="step = 2">上一步</el-button>
        <el-button round @click="nextStep">下一步</el-button>
      </div>
    </template>

    <el-dialog v-model="imageDialogVisible" width="900px" title="如何操作" append-to-body>
      <img style="width:100%" src="https://classbro-oss.oss-accelerate.aliyuncs.com/statice-resource/trainVideos/enter.gif" alt="如何操作">
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.step { min-width: 540px; margin: 0 auto; }
.title { text-align: center; font-size: 14px; font-weight: 700; margin-bottom: 16px; }
.step-content { width: 85%; margin: 0 auto; font-size: 13px; }
.first-line { margin-bottom: 10px; }
.line { display: flex; gap: 10px; align-items: center; }
.small-btn { margin-top: 14px; }
.countdown { text-align: center; margin: 30px 0; }
.footer-box { display: flex; justify-content: center; gap: 16px; }
.help-text { text-align: center; color: #409eff; cursor: pointer; margin-top: 12px; }
.step-buttons { position: absolute; right: 24px; bottom: 0; }
</style>
