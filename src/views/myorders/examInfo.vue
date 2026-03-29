<script setup lang="ts">
import { ref, reactive } from 'vue'
import { getExamDetail, getBeiJinTime } from '@/api/modules/examOrder'

const props = withDefaults(defineProps<{
  current?: any
}>(), {
  current: () => ({}),
})

const loading = ref(false)
const examDetail = ref<any>({})
const beijingTime = ref('')
const testFormShow = ref<any>({})
const countTime = ref<any>({})

const assistExamWayObj: Record<number, string> = {
  1: 'Require Login',
  2: 'Photo Exam',
  3: 'Take Home',
}
const wenyaExamTypeObj: Record<number, string> = {
  2: 'Resit',
  3: 'Mid-term',
  4: 'Final_exam',
  5: 'Others',
}
const examStyle: Record<number, string> = {
  1: 'Limited Time',
  2: 'Open Time',
}
const labels = { days: '天', hours: '时', minutes: '分', seconds: '秒' }

const getTime = (time: string) => new Date(time.replace(/-/g, '/')).getTime()

const fetchBeiJinTime = async () => {
  const res: any = await getBeiJinTime()
  if (res.status === 200) {
    beijingTime.value = res.body?.date || ''
  }
}

const fetchExamDetail = async () => {
  loading.value = true
  const res: any = await getExamDetail({ courseId: props.current.courseId })
  loading.value = false
  if (res.status === 200) {
    examDetail.value = res.body || {}
  }
}

const initLabel = () => {
  const { assistExamWay, examStyle: es, examLimitTimeLevel } = examDetail.value
  let StartFrom = false, ToexamCloseTime = false, OfficialOpenFrom = false,
    TorealExamEndTime = false, RealDeadline = false, ExamDuration = false

  if (assistExamWay == 1 && es == 1 && examLimitTimeLevel == 1) {
    StartFrom = true; TorealExamEndTime = true; ExamDuration = true
  }
  if (assistExamWay == 1 && es == 1 && examLimitTimeLevel == 2) {
    OfficialOpenFrom = true; ToexamCloseTime = true; ExamDuration = true; RealDeadline = true
  }
  if (assistExamWay == 1 && es == 2) {
    OfficialOpenFrom = true; RealDeadline = true
  }
  if (assistExamWay == 2 && es == 1 && examLimitTimeLevel == 1) {
    StartFrom = true; TorealExamEndTime = true; ExamDuration = true
  }
  if ((assistExamWay == 2 && es == 1 && examLimitTimeLevel == 2) || (assistExamWay == 2 && es == 2)) {
    TorealExamEndTime = true; StartFrom = true; ExamDuration = true
  }
  if (assistExamWay == 3) {
    OfficialOpenFrom = true; RealDeadline = true
  }
  testFormShow.value = { StartFrom, ToexamCloseTime, OfficialOpenFrom, TorealExamEndTime, ExamDuration, RealDeadline }
}

const initTime = async () => {
  let endTime = props.current.endCourseTime
  if (props.current.studSpecialOrderExt?.type == 128) {
    endTime = props.current.realExamStartTime || props.current.teacherLatestCommitTime
  }
  await fetchBeiJinTime()
  if (props.current.realExamStartTime) {
    const show = getTime(endTime) - getTime(beijingTime.value) > 0
    countTime.value = { time: endTime, show, text: '考试已开始' }
  } else {
    const show = getTime(endTime) - getTime(beijingTime.value) > 0
    countTime.value = { time: endTime, show, text: '超时' }
  }
}

const init = async () => {
  await fetchExamDetail()
  initLabel()
  await initTime()
}

const openLink = (url: string) => window.open(url)

const formatCountdown = (time: string) => {
  if (!time) return ''
  const diff = getTime(time) - Date.now()
  if (diff <= 0) return ''
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return `${d}天 ${h}时 ${m}分 ${s}秒`
}

defineExpose({ init })
</script>

<template>
  <div class="info-box" v-loading="loading">
    <div><span>Exam Type</span><span>{{ wenyaExamTypeObj[examDetail.examType] }}</span></div>
    <div><span>Exam Form</span><span>{{ assistExamWayObj[examDetail.assistExamWay] }}</span></div>
    <div><span>Exam Link</span><span class="link" @click="openLink(examDetail.examUrl)">{{ examDetail.examUrl }}</span></div>
    <div><span>Exam Style</span><span>{{ examStyle[examDetail.examStyle] }}</span></div>
    <div v-if="testFormShow.OfficialOpenFrom"><span>Offcial Open From</span><span>{{ examDetail.examOpenTime }}</span></div>
    <div v-if="testFormShow.StartFrom"><span>Start From</span><span>{{ examDetail.realExamStartTime }}</span></div>
    <div v-if="testFormShow.ToexamCloseTime"><span>To</span><span>{{ examDetail.examCloseTime }}</span></div>
    <div v-if="testFormShow.ExamDuration"><span>Exam Duration</span><span>{{ examDetail.examLimitTime }}</span></div>
    <div v-if="testFormShow.TorealExamEndTime"><span>To</span><span>{{ examDetail.realExamEndTime }}</span></div>
    <div v-if="testFormShow.RealDeadline"><span>Deal Deadline</span><span>{{ examDetail.examTime }}</span></div>
    <div>
      <span>考试倒计时</span>
      <span v-if="countTime.show" class="countdown-text">{{ formatCountdown(countTime.time) }}</span>
      <span v-else style="color: #ff5843">{{ countTime.text }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.info-box {
  display: flex;
  flex-wrap: wrap;
  padding: 10px 0;
  > div {
    width: 50%;
    line-height: 30px;
    > span {
      font-size: 14px;
      display: inline-block;
      &:nth-of-type(1) {
        width: 150px;
      }
      &:nth-of-type(2) {
        font-size: 13px;
      }
    }
  }
}
.countdown-text {
  color: #ff5843;
  font-weight: 700;
}
.link {
  color: #0091ff;
  cursor: pointer;
}
</style>
