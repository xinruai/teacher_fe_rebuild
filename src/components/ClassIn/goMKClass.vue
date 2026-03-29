<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { getMKClassInLink, getMKClassInLinkByCode, queryCourseByRoomId } from '@/api/modules/classIn'

const props = defineProps<{
  teacId?: string | number
}>()

const router = useRouter()

const isShow = ref(false)
const time = ref(5)
let timer: ReturnType<typeof setInterval> | null = null
const classRoomId = ref<string | number>('')
const step = ref(2)
const titleList: Record<number, string> = {
  1: '授课提醒',
  2: '没有打开万能讲师',
}

async function show(roomId: string | number, type = 1) {
  classRoomId.value = roomId
  if (type === 1) await fetchCourseByRoomId()
  if (step.value === 2) {
    showClass(roomId, type)
  } else {
    isShow.value = true
  }
}

async function showClass(_roomId?: string | number, type = 1) {
  step.value = 2
  await fetchMKClassInLink(type)
}

function goToDownLoad() {
  router.push('/account/mkApp')
}

function closeModal() {
  isShow.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function startTimer() {
  isShow.value = true
  time.value = 5
  timer = setInterval(() => {
    time.value--
    if (time.value <= 0) {
      closeModal()
    }
  }, 1000)
}

async function fetchMKClassInLink(type: number) {
  const res: any =
    type === 2
      ? await getMKClassInLinkByCode({ code: String(classRoomId.value), teacId: props.teacId })
      : await getMKClassInLink({ roomId: classRoomId.value })
  if (res.status === 200) {
    try {
      const msgData = JSON.parse(res.body.msg)
      if (msgData.joinUrl) {
        window.open(msgData.joinUrl, '_blank')
      } else {
        window.open(`wnroombox://enterclass/?data=${res.body.msg}`, '_self')
        startTimer()
      }
    } catch {
      window.open(`wnroombox://enterclass/?data=${res.body.msg}`, '_self')
      startTimer()
    }
  }
}

async function fetchCourseByRoomId() {
  const res: any = await queryCourseByRoomId({ roomId: classRoomId.value })
  if (res.status === 200) {
    step.value = res.body?.isYtk ? 1 : 2
  }
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

defineExpose({ show })
</script>

<template>
  <el-dialog
    v-model="isShow"
    width="320px"
    :title="titleList[step]"
    :close-on-click-modal="false"
    append-to-body
    @close="closeModal"
  >
    <!-- 押题课需要展示提示 -->
    <div v-if="step === 1" class="tip">
      授课中请勿提及<span>公司信息</span>与<span>个人隐私</span>
      <el-button class="cancle-btn btn small-btn" @click="closeModal">取消</el-button>
      <el-button class="btn small-btn" @click="showClass(classRoomId)">确定</el-button>
    </div>
    <template v-else>
      <div>等待5s若未打开万能讲师,请前去往下载</div>
      <el-button class="btn" @click="goToDownLoad">前往下载（{{ time }}s）</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
:deep(.el-dialog) {
  border-radius: 10px;
}

:deep(.el-dialog__header) {
  padding: 20px 0;
  text-align: center;
  border-bottom: 1px solid #d5d5d5;
  font-weight: 700;
  font-size: 20px;
}

:deep(.el-dialog__body) {
  padding: 22px 30px;
  text-align: center;
}

.btn {
  cursor: pointer;
  width: 221px;
  height: 32px;
  background: linear-gradient(143deg, #ff0878 0%, #ffa113 100%);
  border-radius: 33px;
  margin-top: 40px;
  position: relative;

  :deep(span) {
    color: #fff;
    display: inline-block;
    height: 33px;
    line-height: 33px;
    position: absolute;
    width: 221px;
    text-align: center;
    top: 0;
    left: 0;
  }
}

.cancle-btn {
  background: none;
  border: 1px solid #ff8f32;
  height: 30px;

  :deep(span) {
    color: #ff8f32;
    height: 30px;
    line-height: 30px;
  }
}

.small-btn {
  width: 100px;

  :deep(span) {
    width: 100px;
    font-size: 14px;
  }
}
</style>
