<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElNotification } from 'element-plus'
import { mkClassScheme } from '@/api/config'
import { creatClass, judgeComeIn, queryUserDetails } from '@/api/modules/classIn'
import { formatTime } from '@/utils/task/Utils'
import { download } from '@/utils/index'
import { getBeiJinTime } from '@/api/modules/examOrder'
import { getZipFilePlus } from '@/api/modules/preExam'
import { downList } from '@/views/help/cfg'
import confirmModal from '@/views/classin/confirmModal.vue'

import step1Img from '@/assets/images/help/step1.png'
import step2Img from '@/assets/images/help/step2.png'
import step3Img from '@/assets/images/help/step3.png'
import step4Img from '@/assets/images/help/step4.png'
import arrowImg from '@/assets/images/help/arrow.png'
import pdfIcon from '@/assets/images/help/pdf.png'
import downIcon from '@/assets/images/help/down.png'

const props = withDefaults(defineProps<{
  type?: string // 1=课堂应用 2=首页提示 3=复试课堂
  teacinfo?: Record<string, any> | null
  classInfo?: Record<string, any>
}>(), {
  type: '1',
  teacinfo: null,
  classInfo: () => ({}),
})

const emit = defineEmits<{
  queryClassRoom: []
  changeComplated: [val: number]
}>()

const form = ref<Record<string, string>>({})
const loading = ref(false)
const classLoding1 = ref(false)
const classLoding2 = ref(false)
const classLoding3 = ref(false)
const isComplated = ref(0)
const downLoading = ref(false)
const beijingTime = ref('')
const reexamineAppoinStartTime = ref('')
const dateStartTimeOption = ref('00:00')
const interviewFile = ref<{ fileName: string; fileUrl: string }>({ fileName: '', fileUrl: '' })

const confirmModalRef = ref<InstanceType<typeof confirmModal>>()

let timer: ReturnType<typeof setInterval> | null = null
let timer2: ReturnType<typeof setInterval> | null = null

const link = {
  url: 'https://classbro-oss.oss-accelerate.aliyuncs.com/staticUpload%2Fresource%2Ftrain%2F%E6%95%99%E5%B8%88%E4%BD%BF%E7%94%A8%E6%89%8B%E5%86%8C(1).pdf',
  size: '3.37M',
  name: '教师使用手册（电脑版）.pdf',
}

const fileList = [
  { fileName: '复试考核要求.pdf', fileUrl: 'https://classbro-oss.oss-accelerate.aliyuncs.com/statice-resource/trainVideos/Classbro%E6%8E%88%E8%AF%BE%E6%8C%87%E5%8D%97.pdf' },
  { fileName: '复试PPT模板.pptx', fileUrl: 'https://classbro-oss.oss-cn-hongkong.aliyuncs.com/statice-resource/1600663017620/1600663017/1_%E5%A4%8D%E8%AF%95PPT%E6%A8%A1%E6%9D%BF.pptx' },
  { fileName: '【文OR商科】复试课件Sample.pptx', fileUrl: 'https://classbro-oss.oss-accelerate.aliyuncs.com/statice-resource/trainVideos/%E5%A4%8D%E8%AF%95%E6%96%87OR%E5%95%86%E7%A7%91sample.pptx' },
  { fileName: '【理科】复试课件Sample.pptx', fileUrl: 'https://classbro-oss.oss-accelerate.aliyuncs.com/statice-resource/trainVideos/%E5%A4%8D%E8%AF%95%E7%90%86%E7%A7%91sample.pptx' },
]

const disabledBtn = computed(() => {
  if (!props.classInfo.formalRoom || !props.classInfo.formalRoom.startTime) return true
  const flag = getTime(props.classInfo.formalRoom.startTime) - getTime(beijingTime.value) > 30 * 60 * 1000
  if (!flag) {
    if (timer2) clearInterval(timer2)
  } else if (!timer2) {
    setBeijingTime()
  }
  return flag
})

const disabledTime = computed(() => Boolean(props.classInfo.formalRoom))

onMounted(() => {
  doGetBeiJinTime()
  if (props.type === '3') doQueryUserDetails()
})

onBeforeUnmount(() => {
  clearTimer()
  if (timer2) clearInterval(timer2)
})

function downLoad(url: string) {
  window.open(url)
}

function disabledDate(time: Date): boolean {
  const dayYMD = new Date(formatTime(time, 'Y-M-D')).getTime()
  const comeTime = reexamineAppoinStartTime.value
    ? new Date(formatTime(reexamineAppoinStartTime.value.replace(/-/g, '/'), 'Y-M-D')).getTime()
    : 0
  const canSelect = comeTime + 14 * 24 * 60 * 60 * 1000
  return dayYMD > canSelect || dayYMD < Date.now()
}

function openLink(linkUrl: string, type?: number) {
  if (type === 1) window.open(linkUrl + '?response-content-type=application/pdf')
  else download(linkUrl, link.name)
}

async function doCreatClass(type: number) {
  const params: Record<string, any> = {
    type: type === 2 ? 2 : 1,
    teacId: props.teacinfo?.id,
  }
  if (type === 2) {
    if (!isComplated.value) { ElNotification({ type: 'warning', message: '请先完成课堂检测环节' }); return }
    if (!form.value.date || !form.value.time) { ElNotification({ type: 'warning', message: '请选择复试日期及时间' }); return }
    params.startTime = form.value.date + ' ' + form.value.time + ':00'
    const end = new Date(params.startTime.replace(/-/g, '/')).getTime() + 30 * 60 * 1000
    params.endTime = formatTime(end, 'Y-M-D h:m:s')
  }

  if (type === 1) classLoding1.value = true
  else if (type === 2) classLoding2.value = true
  else classLoding3.value = true

  const res: any = await creatClass(params)

  if (type === 1) classLoding1.value = false
  else if (type === 2) classLoding2.value = false
  else classLoding3.value = false

  if (res.status === 200) {
    if ([1, 3].includes(type)) {
      try {
        await openCustomScheme('wemeet://')
      } catch {
        ElNotification({ type: 'warning', message: '请先安装腾讯会议客户端，正在跳转到下载页面...' })
        setTimeout(() => { window.open('https://meeting.tencent.com/download/', '_blank') }, 500)
      }
      if (!timer) timeJudge()
    } else {
      emit('queryClassRoom')
    }
  }
}

function openCustomScheme(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let hasBlurred = false
    let timeout: ReturnType<typeof setTimeout> | null = null

    const blurHandler = () => {
      hasBlurred = true
      if (timeout) { clearTimeout(timeout); timeout = null }
      window.removeEventListener('blur', blurHandler)
      resolve()
    }

    window.addEventListener('blur', blurHandler)

    try {
      const a = document.createElement('a')
      a.href = url
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      setTimeout(() => document.body.removeChild(a), 100)
    } catch (e) {
      window.removeEventListener('blur', blurHandler)
      reject(e)
      return
    }

    timeout = setTimeout(() => {
      window.removeEventListener('blur', blurHandler)
      if (!hasBlurred) reject(new Error('协议未注册或应用未安装'))
    }, 2000)
  })
}

async function doJudgeComeIn() {
  const res: any = await judgeComeIn({ teacId: props.teacinfo!.id })
  if (res.status === 200) {
    isComplated.value = res.body || 0
    emit('changeComplated', isComplated.value)
    if (isComplated.value) clearTimer()
  }
}

function timeJudge() {
  timer = setInterval(() => doJudgeComeIn(), 5000)
}

function clearTimer() {
  if (timer) { clearInterval(timer); timer = null }
}

function comeInClass() {
  if (!disabledBtn.value) {
    const url = `${mkClassScheme}?data=${props.classInfo.formalData}`
    window.open(url)
  }
}

async function doGetBeiJinTime() {
  const res: any = await getBeiJinTime()
  if (res.status === 200) {
    beijingTime.value = res.body?.date || ''
  }
}

function getTime(time: string): number {
  return new Date(time.replace(/-/g, '/')).getTime()
}

function setBeijingTime() {
  timer2 = setInterval(() => doGetBeiJinTime(), 1000 * 60 * 5)
}

function initTime(dateTime: string) {
  if (!dateTime) return
  form.value.date = formatTime(dateTime, 'Y-M-D')
  form.value.time = formatTime(dateTime, 'h:m')
}

async function doQueryUserDetails() {
  const res: any = await queryUserDetails({ teacId: props.teacinfo!.id })
  if (res.status === 200) {
    interviewFile.value = { fileName: res.body.reexamineTrialFileName, fileUrl: res.body.reexamineTrialFileUrl }
    reexamineAppoinStartTime.value = res.body.reexamineAppoinStartTime || ''
  }
}

async function doGetZipFilePlus() {
  await doQueryUserDetails()
  const list = [...fileList, interviewFile.value]
  ElNotification({ type: 'success', message: '文件正在打包中...' })
  downLoading.value = true
  const res: any = await getZipFilePlus(list)
  downLoading.value = false
  if (res.status === 200) {
    ElNotification({ type: 'success', message: '文件打包成功' })
    const a = document.createElement('a')
    a.setAttribute('href', res.body.url)
    document.body.appendChild(a)
    a.click()
    a.remove()
  } else {
    ElNotification({ type: 'warning', message: res.body.msg })
  }
}

function showModal(type: string) {
  if (type === 'confirmModal') confirmModalRef.value?.show()
}

function changeDate(val: string) {
  const bjTime = beijingTime.value.replace(/-/g, '/')
  if (val !== formatTime(bjTime, 'Y-M-D')) {
    dateStartTimeOption.value = '00:00'
  } else {
    form.value.time = ''
    const hour = formatTime(bjTime, 'h')
    const minute = +formatTime(bjTime, 'm')
    dateStartTimeOption.value = minute >= 30
      ? `${+hour > 8 ? +hour + 1 : '0' + (+hour + 1)}:00`
      : hour + ':30'
  }
}

defineExpose({ isComplated, initTime })
</script>

<template>
  <div>
    <div :class="{ 'flex-box': type === '3' }">
      <!-- 测试入口帮助中心用的 -->
      <div v-if="type === '1'" class="step">
        <div id="1.1" class="title">1.腾讯会议课堂测试入口</div>
        <div class="step-content">
          <div class="item">
            <span class="star">*</span>腾讯会议课堂:
            <el-button class="btn right" :loading="classLoding1" @click="doCreatClass(1)">启动</el-button>
          </div>
          <div class="font-red"><span class="star">*</span>请讲师们在此处进行模拟上课的操作演练</div>
        </div>
      </div>

      <div class="step">
        <template v-if="type === '3'">
          <img :src="step1Img" alt="" />
          <img :src="arrowImg" alt="" class="arrow" />
        </template>
        <div id="1.2" class="title" :class="{ 'orange-title': type === '2' }">
          <span v-if="['2', '3'].includes(type)">Step1</span>
          <span v-if="type === '1'">2.</span>
          万能讲师客户端下载
        </div>
        <div class="step-content">
          <div class="desc">适用于macOS 10.13及以上， Windows7及以上。</div>
          <div class="down-content">
            <div v-for="item in downList" :key="item.id">
              <img :src="item.img" alt="" />
              <div>{{ item.desc }}</div>
              <div class="down-btn" @click="downLoad(item.guideUrl)">安装指南</div>
              <div class="down-btn" @click="downLoad(item.downLoadLink)"><a>下载</a></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 测试入口 -->
      <div v-if="type !== '1'" class="step">
        <template v-if="type === '3'">
          <img :src="step2Img" alt="" />
          <img :src="arrowImg" alt="" class="arrow2" />
        </template>
        <div id="1.2" class="title" :class="{ 'orange-title': type === '2' }">
          <span v-if="['2', '3'].includes(type)">Step2 </span>腾讯会议课堂测试入口
        </div>
        <div class="step-content">
          <div v-if="['2', '3'].includes(type)" class="font-red desc" :class="{ 'ml-8': type === '2' }">
            *请务必完成课堂测试，若未成功进入课堂将无法{{ type === '2' ? '认证' : '复试' }}
          </div>
          <div class="item" :class="{ 'mt-18': type === '3' }">
            <span class="star">*</span>万能讲师课堂:
            <el-button class="btn type-text-btn right" :loading="classLoding1" @click="doCreatClass(1)">启动</el-button>
          </div>
          <div v-if="['2', '3'].includes(type)" class="item" :class="{ 'mt-18': type === '3' }">
            <span class="star">*</span>课堂检测提示：
            <span class="right" :class="{ 'gray-font': !isComplated, 'orange-font': isComplated }">
              {{ isComplated ? '成功进入课堂' : '暂未进入课堂' }}
            </span>
          </div>
          <div v-if="type === '3'" class="item mt-18">
            复试课件一键下载:
            <el-button class="btn type-text-btn right" :loading="downLoading" @click="doGetZipFilePlus">下载</el-button>
          </div>
        </div>
      </div>

      <div v-if="['2', '3'].includes(type)" class="step">
        <img v-if="type === '3'" :src="step4Img" alt="" />
        <div class="title" :class="{ 'orange-title': type === '2' }">
          <span v-if="['2', '3'].includes(type)">{{ type === '3' ? 'Step4' : 'Step3' }} </span>腾讯会议操作指南
        </div>
        <div class="step-content">
          <div class="file">
            <img :src="pdfIcon" class="pdf" alt="" />
            <div>
              <div class="cousor" @click="openLink(link.url, 1)">{{ link.name }}</div>
              <div class="size">{{ link.size }}</div>
            </div>
            <img :src="downIcon" class="down" alt="" @click="openLink(link.url)" />
          </div>
        </div>
      </div>

      <div v-if="type === '3'" class="step">
        <template>
          <img :src="step3Img" alt="" />
          <img :src="arrowImg" alt="" class="arrow3" />
        </template>
        <div class="title">Step3 选择复试时间</div>
        <div class="first-line">请务必在<span class="font-red">两周内</span>完成复试，以下时间为<span class="font-red">北京时间</span></div>
        <div>
          开课日期
          <el-date-picker
            v-model="form.date"
            style="width: 145px"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            :disabled="disabledTime"
            :disabled-date="disabledDate"
            @focus="doGetBeiJinTime"
            @change="changeDate"
          />
          <el-time-select
            v-model="form.time"
            :disabled="disabledTime"
            style="width: 120px"
            placeholder="选择时间"
            popper-class="time-select"
            :start="dateStartTimeOption"
            step="00:30"
            end="23:30"
          />
        </div>
        <div class="mt10">
          课节时长
          <el-input style="width: 55px; margin: 0 10px" model-value="30" disabled />
          分钟
        </div>
        <el-button v-if="!disabledTime" class="small-btn" :loading="classLoding2" @click="doCreatClass(2)">确定复试</el-button>
      </div>
    </div>

    <div v-if="type === '3'" class="footer-box">
      <el-button class="complate" :loading="classLoding3" @click="doCreatClass(3)">打开腾讯会议(随意使用)</el-button>
      <el-button class="complate" :loading="loading" :disabled="disabledBtn" @click="showModal('confirmModal')">进入复试课堂(正式课堂)</el-button>
    </div>

    <confirmModal ref="confirmModalRef" @come-in-class="comeInClass" />
  </div>
</template>

<style scoped lang="scss">
.step {
  width: 450px;
  position: relative;

  > img {
    height: 60px;
    width: auto;
    display: block;
    margin: 10px auto;
  }

  .arrow,
  .arrow2,
  .arrow3 {
    width: 50px;
    height: auto;
    position: absolute;
    top: 50%;
    right: -60px;
    margin-top: -25px;
    margin: 0;
  }

  .arrow2 {
    right: 50%;
    bottom: -60px;
    top: unset;
    margin-right: -25px;
    transform: rotate(90deg);
  }

  .arrow3 {
    left: -60px;
    right: unset;
    top: 50%;
    transform: rotate(180deg);
  }

  .title {
    font-weight: 700;
    font-size: 15px !important;
    color: #333333;
  }

  .orange-title {
    &::before {
      display: inline-block;
      content: '';
      width: 3px;
      height: 15px;
      background: #ff8d29;
      margin-right: 8px;
      position: relative;
      top: 2px;
    }
  }

  .item {
    position: relative;
    line-height: 35px;

    .right {
      position: absolute;
      right: 0;
      top: 0;
      width: 110px;
      text-align: center;
    }
  }
}

.step-content {
  color: #000000;
  width: 75%;
  margin: 20px auto 25px;
  line-height: 30px;
  position: relative;

  .down-content {
    display: flex;
    width: 310px;
    justify-content: space-between;
    margin-top: 16px;
    padding: 0 13px;

    > div {
      text-align: center;
    }
  }

  img {
    width: 86px;
    height: 81px;
  }

  .down-btn {
    width: 110px;
    height: 28px;
    border-radius: 16px;
    border: 1px solid #ecedec;
    text-align: center;
    line-height: 28px;
    margin-top: 15px;
    cursor: pointer;
    display: block;

    a {
      display: inline-block;
      width: 60px;
      height: 25px;
    }
  }
}

.star {
  color: #ef1515;
  margin-left: -7px;
}

.btn {
  display: inline-block;
  padding: 0 15px;
  border: 1px solid #ecedec;
  border-radius: 15px;
  height: 28px;
  line-height: 28px;
  width: 110px;
  top: 6px !important;
  cursor: pointer;
  background: transparent;

  :deep(span) {
    display: inline-block;
    height: 27px;
    line-height: 27px;
    position: relative;
    top: -1px;
  }
}

.file {
  margin-top: 14px;
  width: 100%;
  height: 57px;
  border-radius: 6px;
  border: 1px solid #ecedec;
  padding: 5px 11px;
  position: relative;
  padding-left: 45px;
  margin: 0 auto;

  > div {
    color: #333333;
    line-height: 28px;
  }

  .pdf {
    width: 24px;
    height: 31px;
    position: absolute;
    left: 10px;
    top: 13px;
  }

  .down {
    width: 12px;
    height: 17px;
    position: absolute;
    right: 10px;
    top: 20px;
    cursor: pointer;
  }

  .size {
    color: #777777;
    font-size: 12px;
    line-height: 12px;
  }
}

.cousor {
  cursor: pointer;
}

.type-text-btn {
  width: 91px;
  height: 25px;
  border-radius: 16px;
  border: 1px solid #b6b6b6;
  background-color: #fff;
  text-align: center;
  line-height: 23px;
  cursor: pointer;
  margin-bottom: 11px;
  font-size: 12px;
  color: #3d3d3d;
  transition: all 0.3s;

  &:hover {
    border-color: #999;
    background-color: #f5f5f5;
  }
}

.gray-font {
  color: #bfbfbf;
}

.orange-font {
  color: #ff8723;
}

.footer-box {
  text-align: center;
  width: 870px;
}

.complate {
  width: 249px;
  height: 42px;
  background: linear-gradient(320deg, #ffd666 0%, #f65f20 100%);
  border-radius: 21px;
  border: none;
  margin: 40px auto 0;

  &:nth-of-type(1) {
    margin-right: 40px;
  }

  :deep(span) {
    color: #fff;
  }
}

:deep(.small-btn.el-button) {
  width: 120px;
  border: 1px solid #ff8723;
  color: #ff8723;
  border-radius: 21px;
  height: 30px;
  padding: 0;
  margin: 10px auto 0;
  display: block;

  span {
    color: #ff8723;
  }
}

.complate.is-disabled {
  background: #ccc;
}

.flex-box {
  display: flex;
  flex-wrap: wrap;

  > div {
    width: 400px;
    background: #f9f9fa;
    margin: 0px 15px 70px 0;
    padding: 15px 35px;
    box-sizing: border-box;
    line-height: 35px;

    &:nth-of-type(2n + 1) {
      margin-right: 70px;
    }

    &:nth-of-type(3),
    &:nth-of-type(4) {
      margin-bottom: 15px;
    }

    .title {
      text-align: center;
    }

    .step-content {
      margin: 20px auto;
      width: 100%;

      .desc {
        text-align: center;
      }
    }
  }
}

.mt10 {
  margin-top: 10px;
}

.font-red {
  color: red;
}

.font-red.desc {
  width: calc(100% + 56px);
  margin-left: -36px;
}

.first-line {
  margin-top: 11px;
}

.ml-8 {
  margin-left: -8px !important;
}

.mt-18 {
  margin-top: 18px !important;
}
</style>
