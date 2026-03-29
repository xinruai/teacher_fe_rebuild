<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { getClassInLink } from '@/api/modules/classIn'

const router = useRouter()

const isShow = ref(false)
const time = ref(5)
let timer: ReturnType<typeof setInterval> | null = null
const url = ref('classin://www.eeo.cn/enterclass')
const classRoomId = ref<string | number>('')

async function show(roomId: string | number) {
  isShow.value = true
  time.value = 5
  classRoomId.value = roomId
  await fetchClassInLink()
  window.open(url.value, '_self')
  timer = setInterval(() => {
    time.value--
    if (time.value <= 0) {
      closeModal()
    }
  }, 1000)
}

function goToDownLoad() {
  router.push('/account/helpCenter')
}

function closeModal() {
  isShow.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

async function fetchClassInLink() {
  const res: any = await getClassInLink({ roomId: classRoomId.value })
  if (res.status === 200) {
    url.value = res.body?.msg || 'classin://www.eeo.cn/enterclass'
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
    title="没有打开Classin？"
    :close-on-click-modal="false"
    append-to-body
    @close="closeModal"
  >
    <div>等待5s若未打开Classin,请前去往下载</div>
    <el-button class="btn" @click="goToDownLoad">前往下载（{{ time }}s）</el-button>
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
</style>
