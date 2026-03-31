<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { getLocal } from '@/utils/auth'
import { joinStepList } from '@/views/newTrain/cfg'
import { getTeacCanWorkTime, saveTeacCanWorkTime, saveTestInfo, getBindingStatus, getTestInfo } from '@/api/modules/newTrain'
import { setRushOrderNotice } from '@/api/modules/order'
import rushOrderTip from '@/views/newTrain/components/rushOrderTip.vue'
import { useNewTrainStore } from '@/stores/newTrain'
import uploadAvatar from '@/views/newTrain/components/uploadAvatar.vue'
import weekTime from '@/views/newTrain/components/weekTime.vue'
import exampleModal from '@/views/newTrain/components/exampleModal.vue'
import qwTip from '@/views/newTrain/components/qwTip.vue'
import { ElNotification } from 'element-plus'

const props = defineProps<{
  teacId: number
}>()

const emit = defineEmits<{
  completeProcess: [status: number]
}>()

const setJoinStep = inject<(val: number) => void>('setJoinStep')!
const getJoinStep = inject<() => number>('getJoinStep')!
const currentStep = inject<() => number>('currentStep')!
const getProcessList = inject<() => any[]>('getProcessList')!

const joinCurrentStep = ref(1)
const createArchiveStep = ref(1)
const form = reactive<Record<string, any>>({ nickName: '', birthday: '', introduce: '', proficientCourse: '', proficientSoftware: '' })
const weekTimes = ref<Record<string, any>>({})
const countdown = ref(15)
const store = useNewTrainStore()
const thumb = ref('')
const infoId = ref<number | null>(null)
const uploadAvatarRef = ref<InstanceType<typeof uploadAvatar> | null>(null)
const weekTimeRef = ref<InstanceType<typeof weekTime> | null>(null)
const exampleModalRef = ref<InstanceType<typeof exampleModal> | null>(null)
const qwTipRef = ref<InstanceType<typeof qwTip> | null>(null)
let timer: number | null = null

const currentProcess = computed(() => getProcessList().find((v) => v.type == currentStep()) || {})
const showStartRushBtn = computed(() => (currentProcess.value.steps?.find((v: any) => v.type == 47)?.status !== 2))
const isFormValid = computed(() => Boolean(form.nickName && form.birthday && form.introduce))

onMounted(async () => {
  const info = getLocal<any>('teacinfo') || {}
  form.nickName = info.nickName || ''
  form.birthday = info.birthday || ''
  form.introduce = info.introduce || ''
  thumb.value = info.thumb || ''
  const res = await getTeacCanWorkTime({ teacUserId: props.teacId })
  if (res.status === 200) {
    weekTimes.value = res.body?.workTimes || {}
  }
  const testRes = await getTestInfo({ teacId: props.teacId })
  if (testRes.status === 200) {
    form.proficientCourse = testRes.body?.proficientCourse || ''
    form.proficientSoftware = testRes.body?.proficientSoftware || ''
    infoId.value = testRes.body?.id || null
  }
  startStep3Countdown()
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})

function startStep3Countdown() {
  if (getJoinStep() !== 3 || store.officiallyJoinViewed) return
  countdown.value = 15
  if (timer) {
    window.clearInterval(timer)
    timer = null
  }
  timer = window.setInterval(() => {
    if (countdown.value > 0) {
      countdown.value -= 1
      return
    }
    if (timer) window.clearInterval(timer)
    timer = null
    store.setOfficiallyJoinViewed(true)
  }, 1000)
}

async function markSubStepDone(stepNum: number) {
  if (!currentProcess.value.steps?.[getJoinStep() - 1]?.id) {
    setJoinStep(stepNum)
    return
  }
  if (getJoinStep() === 2) {
    const bindRes = await getBindingStatus({ teacId: props.teacId })
    if (bindRes.status === 200 && !bindRes.body) {
      qwTipRef.value?.show()
      return
    }
  }
  await saveTestInfo({ id: currentProcess.value.steps[getJoinStep() - 1].id, teacId: props.teacId })
  setJoinStep(stepNum)
}

async function startRushOrder() {
  if (showStartRushBtn.value) {
    const res = await setRushOrderNotice({ teacId: props.teacId, statused: 1 })
    if (res.status === 200) {
      await markSubStepDone(2)
    }
  } else {
    await markSubStepDone(2)
  }
  joinCurrentStep.value = 1
}

async function nextPage() {
  if (!isFormValid.value) return
  await saveTestInfo({
    id: infoId.value,
    teacId: props.teacId,
    proficientCourse: form.proficientCourse,
    proficientSoftware: form.proficientSoftware,
  })
  createArchiveStep.value = 2
}

function onAvatarUploaded(url: string) {
  thumb.value = url
}

function onSaveTime(data: Record<string, any>) {
  weekTimes.value = data
}

async function saveWeekTimes() {
  await saveTeacCanWorkTime({ teacUserId: props.teacId, workTimes: weekTimes.value || {} })
}

async function joinImmediately() {
  if (!thumb.value) {
    ElNotification.warning('请先上传形象照')
    return
  }
  await saveWeekTimes()
  emit('completeProcess', 3)
  window.location.href = '/certificate?type=1'
}

watch(() => getJoinStep(), (val) => {
  if (val === 3) {
    startStep3Countdown()
  } else if (timer) {
    window.clearInterval(timer)
    timer = null
  }
}, { immediate: true })
</script>

<template>
  <div class="officially-join">
    <template v-if="getJoinStep() == 1">
      <div class="step-title"><b>Step1</b>: 解锁抢单池</div>
      <rushOrderTip />
      <div class="step-buttons">
        <el-button round @click="startRushOrder">{{ showStartRushBtn ? '立即开启' : '下一步' }}</el-button>
      </div>
    </template>

    <template v-if="getJoinStep() == 2">
      <div class="step-title"><b>Step2</b>: 加入企业微信</div>
      <div class="step-text">关注企业微信插件并完成身份验证，确保企业消息处于开启状态。</div>
      <div class="step-desc">
        <span class="current">{{ joinCurrentStep }}</span><span class="total">/{{ joinStepList.length }}</span>
        <span class="step-title">{{ joinStepList[joinCurrentStep - 1].text }}</span>
      </div>
      <el-carousel indicator-position="outside" :loop="false" :autoplay="false" arrow="always" trigger="click" @change="(val:number)=>joinCurrentStep=val+1" height="210px">
        <el-carousel-item v-for="(item, index) in joinStepList" :key="index">
          <el-image class="carousel-img" :src="item.img" :preview-src-list="[item.img]" />
        </el-carousel-item>
      </el-carousel>
      <div class="step-buttons" v-if="joinCurrentStep == joinStepList.length">
        <el-button round @click="setJoinStep(1)">上一步</el-button>
        <el-button round @click="markSubStepDone(3)">下一步</el-button>
      </div>
    </template>

    <template v-if="getJoinStep() == 3">
      <div class="step-title"><b>Step3</b>: BC端口介绍</div>
      <div class="step-text">B端订单请重点注意沟通边界与备课规范，避免敏感信息外露。</div>
      <el-table :data="[
        { port: 'C端', keywords: '/', attention: '可直接在企微群和学生交流课程相关内容' },
        { port: 'B端', keywords: 'WY辅导/B端教辅', attention: '与教辅老师沟通，不讨论公司敏感信息' },
      ]" border size="small">
        <el-table-column prop="port" label="端口" width="80" />
        <el-table-column prop="keywords" label="订单号关键词" width="160" />
        <el-table-column prop="attention" label="特别注意" />
      </el-table>
      <div class="step-buttons">
        <el-button round @click="setJoinStep(2); joinCurrentStep = 1">上一步</el-button>
        <el-button round :disabled="!store.officiallyJoinViewed" @click="markSubStepDone(4)">
          下一步<span v-if="!store.officiallyJoinViewed">（{{ countdown }}秒）</span>
        </el-button>
      </div>
    </template>

    <template v-if="getJoinStep() == 4">
      <div class="step-title"><b>Step4</b>: 创建讲师档案</div>
      <template v-if="createArchiveStep == 1">
        <el-form :model="form" label-width="90px">
          <el-form-item label="英文名">
            <div class="label-wrap">
              <span>英文名</span>
            </div>
            <el-input v-model="form.nickName" />
          </el-form-item>
          <el-form-item label="生日"><el-date-picker v-model="form.birthday" type="date" value-format="YYYY-MM-DD HH:mm:ss" /></el-form-item>
          <el-form-item label="自我介绍">
            <div class="label-wrap">
              <span>自我介绍</span>
              <el-link type="primary" @click="exampleModalRef?.show()">参考示例</el-link>
            </div>
            <el-input v-model="form.introduce" type="textarea" :rows="3" :maxlength="150" show-word-limit />
          </el-form-item>
          <el-form-item label="擅长课程"><el-input v-model="form.proficientCourse" type="textarea" :rows="2" /></el-form-item>
          <el-form-item label="软件技能"><el-input v-model="form.proficientSoftware" type="textarea" :rows="2" /></el-form-item>
        </el-form>
        <div class="step-buttons">
          <el-button round @click="setJoinStep(3)">上一步</el-button>
          <el-button round :disabled="!isFormValid" @click="nextPage">下一步</el-button>
        </div>
      </template>
      <template v-else-if="createArchiveStep == 2">
        <uploadAvatar ref="uploadAvatarRef" @get-thumb="onAvatarUploaded" />
        <div class="step-buttons">
          <el-button round @click="createArchiveStep = 1">上一步</el-button>
          <el-button round :disabled="!thumb" @click="createArchiveStep = 3">下一步</el-button>
        </div>
      </template>
      <template v-else>
        <div class="step-text">填写可工作时间可配合运营团队进行订单委派，请确保信息准确并及时更新。</div>
        <weekTime ref="weekTimeRef" :width="580" :week-times="weekTimes" @save-time="onSaveTime" />
        <div class="step-buttons">
          <el-button round @click="createArchiveStep = 2">上一步</el-button>
          <el-button round @click="joinImmediately">立即入职</el-button>
        </div>
      </template>
    </template>
    <exampleModal ref="exampleModalRef" />
    <qwTip ref="qwTipRef" />
  </div>
</template>

<style scoped lang="scss">
.step-title { font-size: 15px; line-height: 34px; margin-bottom: 8px; }
.step-text { line-height: 26px; margin-bottom: 10px; }
.step-desc .current { color: #17d1d6; font-size: 30px; }
.step-desc .total { color: #7b849e; font-size: 20px; margin-left: 3px; margin-right: 10px; }
.carousel-img { width: 100%; max-width: 620px; height: 180px; object-fit: contain; margin: 0 auto; display: block; }
.step-buttons { text-align: right; margin-top: 14px; }
</style>
