<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useNewTrainStore } from '@/stores/newTrain'
import { teacCompleteMandatoryStep } from '@/api/modules/newTrain'
import videoItem from '@/views/newTrain/components/videoItem.vue'
import videoplay from '@/views/newTrain/components/videoplay.vue'
import question from '@/views/newTrain/components/question.vue'

const props = withDefaults(defineProps<{
  next?: () => void
}>(), {
  next: () => {},
})

const emit = defineEmits<{
  completeProcess: [status: number, callback: () => void]
}>()

const changeStep = inject<(val: any, index: number) => void>('changeStep')!
const getProcessList = inject<() => any[]>('getProcessList')!
const setTrainStep = inject<(val: number) => void>('setTrainStep')!
const getTrainStep = inject<() => number>('getTrainStep')!
const currentStep = inject<() => number>('currentStep')!
const getTrainProcess = inject<() => void>('getTrainProcess')!

const newTrainStore = useNewTrainStore()
const { productLearningViewed } = storeToRefs(newTrainStore)
const countdown = ref(10)
const videoplayRef = ref<InstanceType<typeof videoplay> | null>(null)
const questionRef = ref<InstanceType<typeof question> | null>(null)
let timer: number | null = null

const currentProcess = computed(() => getProcessList().find((v) => v.type == currentStep()) || {})
const disabledBtn = computed(() => {
  const steps = (currentProcess.value.steps || []).filter((step: any) => [35, 36, 37, 38, 39, 40].includes(step.type))
  return !steps.every((step: any) => step.status === 2 || step.status === 4)
})

onMounted(() => {
  if (currentProcess.value.status == 3) {
    newTrainStore.setProductLearningViewed(true)
    return
  }
  if (!productLearningViewed.value && countdown.value > 0) {
    timer = window.setInterval(() => {
      if (countdown.value > 0) {
        countdown.value -= 1
      } else {
        if (timer) window.clearInterval(timer)
        timer = null
        newTrainStore.setProductLearningViewed(true)
      }
    }, 1000)
  }
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})

function showVideoFun(video: any) {
  videoplayRef.value?.open(video)
}

async function addstep(video: any) {
  const target = (currentProcess.value.steps || []).find((step: any) => step.id === video.id)
  if (target?.status === 2) return
  const { status } = await teacCompleteMandatoryStep({ id: video.id })
  if (status == 200) getTrainProcess()
}

function showQuestionFun(data: any) {
  questionRef.value?.showDialog(data)
}

function nextPage() {
  newTrainStore.setProductLearningViewed(true)
  setTrainStep(2)
}

function nextStep() {
  emit('completeProcess', 3, props.next || (() => {}))
}
</script>

<template>
  <div class="product-learning">
    <template v-if="getTrainStep() == 1">
      <p class="message">
        产品分为课时制、项目制和特殊产品。请先完成基础图谱学习，再进入视频和测验学习环节。
      </p>
      <div class="product-map">
        <div class="product-item">课时制：定制辅导 / 考前突击</div>
        <div class="product-item">项目制：论文大礼包 / 作业辅导 / 毕业大论文 / 包课</div>
        <div class="product-item">特殊产品：试听课 / 毕论引流 / 选课指导</div>
      </div>
      <div class="step-buttons">
        <el-button round @click="changeStep(getProcessList()[1], 1)">上一步</el-button>
        <el-button round :disabled="!productLearningViewed" @click="nextPage">
          下一步<span v-if="!productLearningViewed">（{{ countdown }}秒）</span>
        </el-button>
      </div>
    </template>

    <template v-if="getTrainStep() == 2">
      <p class="message">请完成以下核心产品学习内容（视频/答题）后进入下一步。</p>
      <videoItem
        :video-list="currentProcess.steps?.filter((v: any) => [35, 36, 37, 38, 39, 40].includes(v.type) && v.status !== 4) || []"
        @show-video-fun="showVideoFun"
        @show-question-fun="showQuestionFun"
      />
      <div class="step-buttons">
        <el-button round @click="setTrainStep(1)">上一步</el-button>
        <el-button round :disabled="disabledBtn" @click="nextStep">下一步</el-button>
      </div>
    </template>
    <videoplay ref="videoplayRef" @addstep="addstep" />
    <question ref="questionRef" @addstep="addstep" />
  </div>
</template>

<style scoped lang="scss">
.product-learning { height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
.message { line-height: 26px; margin-bottom: 12px; }
.product-map { border: 1px solid #dbe4ff; border-radius: 8px; padding: 12px; }
.product-item { line-height: 30px; border-bottom: 1px dashed #ebf0ff; }
.product-item:last-child { border-bottom: none; }
.step-buttons { text-align: right; margin-top: 14px; }
</style>
