<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElNotification } from 'element-plus'
import { getLocal, setLocal } from '@/utils/auth'
import { completeProcess } from '@/api/modules/newTrain'
import { queryClassRoom } from '@/api/modules/classIn'
import Step0 from '@/views/newTrain/components/step0.vue'
import Step1 from '@/views/newTrain/components/step1.vue'
import Step2 from '@/views/newTrain/components/step2.vue'
import Step3 from '@/views/newTrain/components/step3.vue'
import PreJobTraining from '@/views/newTrain/components/preJobTraining.vue'
import ProductLearning from '@/views/newTrain/components/productLearning.vue'
import OfficiallyJoin from '@/views/newTrain/components/officiallyJoin.vue'
import { qwStepList } from '@/views/newTrain/cfg'

const props = withDefaults(defineProps<{
  currentStep: number
  interviewStep: number
  processList: Record<string, any>[]
}>(), {
  currentStep: 1,
  interviewStep: 1,
  processList: () => [],
})

const emit = defineEmits<{
  setInterviewStep: [step: number]
  setTrainStep: [step: number]
  setPreJobStep: [step: number]
  refresh: [callback?: () => void]
  changeStep: [val: any, index: number]
}>()

const qwCurrentStep = ref(1)
const classInfo = ref<Record<string, any>>({})
const isComplatedProp = ref(0)
const hiddenCarousel = ref(false)
const showInterviewResult = ref(false)
const carouselRef = ref<any>(null)
const teacId = ref(getLocal<any>('teacinfo')?.id || 0)
const teacNickName = ref(getLocal<any>('teacinfo')?.nickName || '')

const qwTextList = [
  '面试将通过【腾讯会议】进行，是公司统一使用的授课平台，若出现安装问题及时联系渠道老师。',
  '仔细查看课堂功能指南，熟练运用工具会让课堂效果更加精彩。',
  '使用模拟课堂提前测试设备，确保可正常使用功能。',
  '确认试讲时间后请按时参加，若预约时间有变动至少提前24H沟通。',
]

const currentProcess = computed(() => props.processList.find((v) => v.type == props.currentStep) || {})
const disabledVideoNext = computed(() => false)

onMounted(queryClassRoomData)

function changQwStep(val: number, oldValue?: number) {
  if (val === 3 && !isComplatedProp.value) {
    ElNotification.warning('请先完成课堂测试，成功进入课堂后再进入下一步')
    if (oldValue !== undefined) {
      carouselRef.value?.setActiveItem(oldValue)
      qwCurrentStep.value = oldValue + 1
    }
    return
  }
  qwCurrentStep.value = val + 1
  if (oldValue !== undefined) {
    emit('setInterviewStep', qwCurrentStep.value)
  }
  if (val === 3) queryClassRoomData()
}

function next() {
  const list = props.processList.filter((v) => v.status != 4)
  const index = list.findIndex((v) => v.type == currentProcess.value.type)
  emit('changeStep', list[index + 1], index + 1)
}

async function completeProcessData(status: number, callback?: () => void) {
  if (currentProcess.value.status == 3) return callback?.()
  const res = await completeProcess({ id: currentProcess.value.id, status })
  if (res.status === 200) {
    setLocal(`${teacId.value}-latestSubSteps`, 1)
    emit('refresh', callback)
  }
}

async function queryClassRoomData() {
  const res = await queryClassRoom({ teacId: teacId.value })
  if (res.status === 200) {
    classInfo.value = res.body || {}
    isComplatedProp.value = classInfo.value.testStatus || 0
  }
}

function setHiddenCarousel(bool: boolean) {
  hiddenCarousel.value = bool
}

function setShowInterviewResult(bool: boolean) {
  showInterviewResult.value = bool
}

function handleChangeComplated(status: number) {
  isComplatedProp.value = Number(status || 0)
}

defineExpose({ changQwStep, disabledVideoNext })
</script>

<template>
  <div :class="['info-area', { 'hidden-carousel': hiddenCarousel, 'show-interview-result': showInterviewResult }]">
    <template v-if="currentStep == 1">
      <div class="step-text">{{ qwTextList[qwCurrentStep - 1] }}</div>
      <div class="step-desc">
        <div>
          <span class="current">{{ qwCurrentStep }}</span><span class="total">/{{ qwStepList.length }}</span>
          <span class="step-title">{{ qwStepList[qwCurrentStep - 1].text }}</span>
        </div>
        <el-carousel ref="carouselRef" indicator-position="outside" :loop="false" :autoplay="false" arrow="always" trigger="click" @change="changQwStep" :initial-index="interviewStep - 1">
          <el-carousel-item v-for="(_, index) in qwStepList" :key="index">
            <Step0 v-if="index == 0" />
            <Step1 v-if="index == 1" />
            <Step2 v-if="index == 2" :teac-id="teacId" :is-complated-prop="isComplatedProp" @change-complated="handleChangeComplated" />
            <Step3
              v-if="index == 3"
              :teac-id="teacId"
              :teac-nick-name="teacNickName"
              :class-info="classInfo"
              @query-class-room="queryClassRoomData"
              @set-hidden-carousel="setHiddenCarousel"
              @set-show-interview-result="setShowInterviewResult"
              @complete-process="completeProcessData"
              :next="next"
            />
          </el-carousel-item>
        </el-carousel>
      </div>
    </template>
    <template v-if="currentStep == 2">
      <PreJobTraining :teac-id="teacId" @complete-process="completeProcessData" :next="next" />
    </template>
    <template v-if="currentStep == 3">
      <ProductLearning @complete-process="completeProcessData" :next="next" />
    </template>
    <template v-if="currentStep == 4">
      <OfficiallyJoin :teac-id="teacId" @complete-process="completeProcessData" />
    </template>
  </div>
</template>

<style scoped lang="scss">
.info-area {
  padding: 20px 24px;
  position: relative;
  min-height: 436px;
  height: calc(100vh - 345px);
}
.current { color: #17d1d6; font-size: 30px; }
.total { color: #7b849e; font-size: 20px; margin-left: 4px; }
.step-desc { margin-top: 26px; }
:deep(.el-carousel__container .el-carousel__item) {
  display: flex;
  align-items: center;
  justify-content: center;
}
.hidden-carousel :deep(.el-carousel__indicators),
.hidden-carousel :deep(.el-carousel__arrow) { display: none; }
.hidden-carousel .step-desc > div:first-child { display: none; }
.show-interview-result .step-text { display: none; }
</style>
