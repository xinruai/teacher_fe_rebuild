<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElNotification } from 'element-plus'
import { getFileList } from '@/api/modules/newTrain'
import { getZipFilePlus } from '@/api/modules/preExam'
import { judgeComeIn } from '@/api/modules/classIn'

const props = withDefaults(defineProps<{
  teacId?: number | string
  isComplatedProp?: number
}>(), {
  teacId: 0,
  isComplatedProp: 0,
})
const emit = defineEmits<{
  changeComplated: [status: number]
}>()

const interviewFile = ref<Array<{ fileName: string; fileUrl: string }>>([])
const interviewFile1 = ref<any[]>([])
const imageDialogVisible = ref(false)
const isComplated = ref(Number(props.isComplatedProp || 0))
let timer: number | null = null
watch(() => props.isComplatedProp, (val) => {
  isComplated.value = Number(val || 0)
}, { immediate: true })
const fileList = ref([
  {
    fileName: '文社科模版',
    message: '备课模板（供格式参考）',
    type: 'ppt',
    fileUrl: 'https://classbro-oss.oss-accelerate.aliyuncs.com/statice-resource/trainVideos/%E6%96%87%E7%A4%BE%E7%A7%91%E9%9D%A2%E8%AF%95%E5%A4%87%E8%AF%BE%E6%A8%A1%E7%89%88.pptx',
  },
  {
    fileName: '理工&商科模版',
    message: '备课模板（供格式参考）',
    type: 'ppt',
    fileUrl: 'https://classbro-oss.oss-accelerate.aliyuncs.com/statice-resource/trainVideos/%E7%90%86%E5%B7%A5%26%E5%95%86%E7%A7%91%E9%9D%A2%E8%AF%95%E5%A4%87%E8%AF%BE%E6%A8%A1%E7%89%88.pptx',
  },
])

const detailsFiles = computed(() => [...fileList.value, ...interviewFile1.value])

function openHelp() {
  imageDialogVisible.value = true
}

function openCustomScheme(url: string) {
  return new Promise<void>((resolve, reject) => {
    let hasBlurred = false
    const blurHandler = () => {
      hasBlurred = true
      window.removeEventListener('blur', blurHandler)
      resolve()
    }
    window.addEventListener('blur', blurHandler)
    const link = document.createElement('a')
    link.href = url
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    setTimeout(() => link.remove(), 100)
    setTimeout(() => {
      window.removeEventListener('blur', blurHandler)
      if (!hasBlurred) reject(new Error('protocol not registered'))
    }, 2000)
  })
}

async function creatClass() {
  try {
    await openCustomScheme('wemeet://')
    if (!timer) {
      timer = window.setInterval(checkComeIn, 5000)
    }
  } catch {
    ElNotification.warning('请先安装腾讯会议客户端，正在跳转到下载页面...')
    setTimeout(() => window.open('https://meeting.tencent.com/download/', '_blank'), 500)
  }
}

async function fetchFileList() {
  const res = await getFileList({ teacId: props.teacId })
  if (res.status !== 200) return
  if (res.body?.length) {
    interviewFile1.value = [{ fileName: '面试课件', message: '按要求制作课件并讲解', type: 'zip' }]
  }
  interviewFile.value = (res.body || []).map((item: any) => ({
    fileName: item.reexamineTrialFileName,
    fileUrl: item.reexamineTrialFileUrl,
  }))
}

function downloadFile(data: any) {
  if (data.type === 'ppt') {
    const a = document.createElement('a')
    a.setAttribute('href', data.fileUrl)
    document.body.appendChild(a)
    a.click()
    a.remove()
    return
  }
  packZip()
}

async function packZip() {
  ElNotification.success('文件正在打包中...')
  const { body, status } = await getZipFilePlus(interviewFile.value as any)
  if (status !== 200) return
  ElNotification.success('文件打包成功')
  const a = document.createElement('a')
  a.setAttribute('href', body.url)
  document.body.appendChild(a)
  a.click()
  a.remove()
}

async function checkComeIn() {
  const res = await judgeComeIn({ teacId: props.teacId as number })
  if (res.status !== 200) return
  isComplated.value = Number(res.body || 0)
  emit('changeComplated', isComplated.value)
  if (isComplated.value && timer) {
    window.clearInterval(timer)
    timer = null
  }
}

onMounted(fetchFileList)
onBeforeUnmount(() => {
  if (timer) {
    window.clearInterval(timer)
    timer = null
  }
})
</script>

<template>
  <div class="step">
    <div class="title">Step3 腾讯会议创建测试</div>
    <div class="desc">*请务必完成课堂测试，若未成功进入课堂将无法复试</div>
    <div class="item"><span class="star">*</span> 手动创建快速会议 <span class="help" @click="openHelp">如何操作</span></div>
    <el-button class="type-text-btn" @click="creatClass">启动</el-button>
    <div class="status-line">课堂检测：<span :class="{ done: isComplated, todo: !isComplated }">{{ isComplated ? '成功进入课堂' : '暂未进入课堂' }}</span></div>

    <div class="file-wrap">
      <div v-for="(item, index) in detailsFiles" :key="index" class="file" @click="downloadFile(item)">
        <div class="file-title">{{ item.fileName }}</div>
        <div class="file-message">{{ item.message }}</div>
      </div>
    </div>

    <el-dialog v-model="imageDialogVisible" width="900px" title="如何操作" append-to-body>
      <div class="image-dialog-content">
        <img src="https://classbro-oss.oss-accelerate.aliyuncs.com/statice-resource/trainVideos/enter.gif" alt="操作指南">
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.step { width: 540px; margin: 0 auto; }
.title { text-align: center; font-size: 14px; font-weight: 700; margin-bottom: 16px; }
.desc { color: #ff0000; margin-bottom: 16px; font-size: 12px; }
.item { margin-bottom: 10px; font-size: 13px; }
.star { color: #ff0000; }
.help { color: #5da4f1; cursor: pointer; margin-left: 8px; }
.type-text-btn { border-radius: 14px; margin-bottom: 20px; }
.status-line { margin: 8px 0 16px; font-size: 12px; }
.done { color: #f2561f; }
.todo { color: #b6b6b6; }
.file-wrap { display: flex; gap: 12px; }
.file { flex: 1; border: 1px solid #ddd; border-radius: 10px; padding: 12px; cursor: pointer; }
.file-title { font-size: 14px; margin-bottom: 4px; }
.file-message { font-size: 11px; color: #9b9b9b; }
.image-dialog-content img { width: 100%; }
</style>
