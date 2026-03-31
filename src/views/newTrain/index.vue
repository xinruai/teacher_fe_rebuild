<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref } from 'vue'
import { getBeiJinTime } from '@/api/modules/examOrder'
import { getTeacherInfo } from '@/api/modules/persondetail'
import { Storage } from '@/constants/enums'
import { getLocal, setLocal } from '@/utils/auth'
import { setStorage } from '@/utils/task/Utils'
import { getTrainProcess } from '@/api/modules/newTrain'
import top from '@/views/newTrain/components/top.vue'
import stepInfo from '@/views/newTrain/components/stepInfo.vue'
import stepDesc from '@/views/newTrain/components/stepDesc.vue'
import countTime from '@/views/newTrain/components/countTime.vue'

type Process = Record<string, any>

const currentStep = ref(1)
const processList = ref<Process[]>([])
const beijingTime = ref('')
const remainTime = ref(0)
const interviewStep = ref(1)
const preJobStep = ref(1)
const trainStep = ref(1)
const joinStep = ref(1)
const show = ref(false)

const topRef = ref<InstanceType<typeof top> | null>(null)
const stepInfoRef = ref<InstanceType<typeof stepInfo> | null>(null)

const currentProcess = computed(() => processList.value.find((v) => v.type === currentStep.value) || {})
const disabledVideoNext = computed(() => stepInfoRef.value?.disabledVideoNext || false)

provide('currentStep', () => currentStep.value)
provide('changeStep', changeStep)
provide('getProcessList', () => processList.value)
provide('getPreJobStep', () => preJobStep.value)
provide('setPreJobStep', setPreJobStep)
provide('getTrainStep', () => trainStep.value)
provide('setTrainStep', setTrainStep)
provide('getJoinStep', () => joinStep.value)
provide('setJoinStep', setJoinStep)
provide('getTrainProcess', getTrainProcessData)
provide('getMyInfo', getMyInfoData)

function getCurrentStep(val: number) {
  currentStep.value = Number(val)
  initStep()
}

async function getTrainProcessData(callback?: () => void) {
  const teacId = getLocal<any>('teacinfo')?.id
  const res = await getTrainProcess({ teacId })
  if (res.status !== 200) return
  processList.value = [...(res.body?.processes || []), { name: '快来赚钱吧', type: -1 }]
  let index = processList.value.findIndex((v) => ![3, 4].includes(v.status))
  index = index > -1 ? index : 0
  if (index > 3) {
    joinStep.value = 4
  } else {
    const cache = getLocal<number>(`${teacId}-latestSubSteps`)
    if (cache) {
      if (index === 0) interviewStep.value = cache
      if (index === 1) preJobStep.value = cache
      if (index === 2) trainStep.value = cache
      if (index === 3) joinStep.value = cache
    }
  }
  show.value = true
  if (index > 3) index = 3
  changeStep(processList.value[index], index)
  await nextTick()
  callback?.()
}

async function initCountTime() {
  if (currentStep.value !== 2 || !currentProcess.value.limitTime) return
  await getBeiJinTimeData()
  remainTime.value = (
    new Date(String(currentProcess.value.limitTime).replace(/-/g, '/')).getTime() -
    new Date(String(beijingTime.value).replace(/-/g, '/')).getTime()
  ) / 1000
}

async function getBeiJinTimeData() {
  const res = await getBeiJinTime()
  if (res.status === 200) {
    beijingTime.value = res.body?.date || ''
  }
}

function changeStep(val: Process, index: number) {
  topRef.value?.getCurrentStep(val, index)
}

function setInterviewStep(val: number) {
  interviewStep.value = val
}
function setPreJobStep(val: number) {
  preJobStep.value = val
}
function setTrainStep(val: number) {
  trainStep.value = val
}
function setJoinStep(val: number) {
  joinStep.value = val
}

async function initStep() {
  await initCountTime()
  if (currentStep.value === 1) {
    await nextTick()
    stepInfoRef.value?.changQwStep(0)
  }
}

async function getMyInfoData() {
  const res = await getTeacherInfo()
  if (res.status === 200) {
    const info = res.body || {}
    setStorage(Storage.TEACHER_INFO, info)
    localStorage.setItem('childType', String(info.childType || ''))
    localStorage.setItem('minzhaoOrderType', String(info.minzhaoOrderType || ''))
  }
}

function setLatestSubSteps() {
  const current = currentProcess.value || {}
  if ([3, 4].includes(current.status)) return
  let sub = 1
  if (currentStep.value === 1) sub = interviewStep.value || 1
  if (currentStep.value === 2) sub = preJobStep.value || 1
  if (currentStep.value === 3) sub = trainStep.value || 1
  if (currentStep.value === 4) sub = joinStep.value || 1
  const teacId = getLocal<any>('teacinfo')?.id
  if (teacId) setLocal(`${teacId}-latestSubSteps`, sub)
}

onMounted(() => {
  getTrainProcessData()
  getMyInfoData()
  window.addEventListener('beforeunload', setLatestSubSteps)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', setLatestSubSteps)
})
</script>

<template>
  <div class="pager">
    <div class="page-content">
      <top ref="topRef" :process-list="processList" @get-current-step="getCurrentStep" />
      <div class="step-area">
        <div class="step-title">
          <span class="title">{{ currentProcess.name }}{{ currentProcess.type == 5 ? '-解锁专属权限' : '' }}</span>
          <span class="time">{{ currentProcess.status == 3 ? '(已完成)' : currentProcess.status == 4 ? '(跳过)' : '' }}</span>
          <countTime
            class="count-time"
            :remain-time="remainTime"
            v-show="currentProcess.type == 2 && currentProcess.status == 2 && disabledVideoNext"
          />
        </div>
        <div class="step-content" v-if="show">
          <stepInfo
            ref="stepInfoRef"
            class="info"
            :current-step="currentStep"
            :process-list="processList"
            :interview-step="interviewStep"
            @refresh="getTrainProcessData"
            @change-step="changeStep"
            @set-train-step="setTrainStep"
            @set-interview-step="setInterviewStep"
            @set-pre-job-step="setPreJobStep"
          />
          <stepDesc
            class="desc"
            :current-step="currentStep"
            :process-list="processList"
            :train-step="trainStep"
            :interview-step="interviewStep"
            :pre-job-step="preJobStep"
            :join-step="joinStep"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pager {
  background: radial-gradient(#1e1854 4%, #393094 46%, #1f1957 100%);
  overflow-y: auto;
  height: 100vh;
  .page-content {
    width: 1280px;
    margin: 0 auto;
    padding: 40px 40px 0;
  }
}
.step-area {
  background: #fbfbfb;
  border-radius: 25px 25px 0 0;
  padding: 21px 56px 33px;
  margin-top: 30px;
  .step-content {
    width: 100%;
    display: flex;
    justify-content: space-around;
  }
  .step-title {
    margin-bottom: 15px;
    position: relative;
    .title {
      color: #282454;
      font-size: 18px;
      font-weight: 700;
    }
    .time {
      color: #7b849e;
      margin-left: 6px;
    }
    .count-time {
      position: absolute;
      right: 350px;
      top: 0;
      font-weight: 700;
    }
  }
  .info {
    background: #fff;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
    border-radius: 5px;
    flex: 1;
  }
  .desc {
    min-width: 308px;
    width: 308px;
    margin-left: 27px;
    background: #fff;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.08);
    border-radius: 5px;
  }
}
</style>
