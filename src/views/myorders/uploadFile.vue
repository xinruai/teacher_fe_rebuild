<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { getAliOSSUploadSign } from '@/api/modules/paper'
import { BasicUrl } from '@/api/config'
import type { UploadInstance } from 'element-plus'

const props = withDefaults(defineProps<{
  dirs?: string
  text?: string
}>(), {
  dirs: '',
  text: '上传文件',
})

const emit = defineEmits<{
  (e: 'uploadFiles', file: any): void
}>()

const uploader = ref<UploadInstance>()
const uploadOssObj = ref<any>({})
const uploadData = reactive({
  OSSAccessKeyId: '',
  signature: '',
  expire: '',
  host: '',
  dir: '',
  key: '',
  name: '',
  success_action_status: '200',
  policy: '',
})
const currentFile = ref<any>({})
const uploadFile = ref<any[]>([])
const loading = ref(false)
const timeStamp = ref('')

const isCrm = localStorage.getItem('CrmLinkDiss')
const isNewCrm = localStorage.getItem('NewLinkDiss')

const OSS_URL = computed(() => 'https://classbro-oss.oss-accelerate.aliyuncs.com/')

const getOssSign = async () => {
  timeStamp.value = String(Math.floor(Date.now() / 1000))
  const url = `${BasicUrl}/oss/getAliOSSUploadSign?dir=courseware/${timeStamp.value}/`
  const res: any = await getAliOSSUploadSign(url)
  if (res.status === 200) uploadOssObj.value = res.body || {}
}

const handleBefore = async (e: any) => {
  loading.value = true
  await getOssSign()
  uploadData.OSSAccessKeyId = uploadOssObj.value.accessid
  uploadData.signature = uploadOssObj.value.signature
  uploadData.expire = uploadOssObj.value.expire
  uploadData.host = uploadOssObj.value.host
  uploadData.dir = uploadOssObj.value.dir + '/' + e.name
  uploadData.policy = uploadOssObj.value.policy
  uploadData.key = uploadData.dir
  uploadData.name = e.name
  const paths = uploadOssObj.value.dir + '/' + encodeURIComponent(uploadData.name)
  currentFile.value = {
    name: uploadData.name,
    url: OSS_URL.value + paths,
  }
}

const uploadProcess = (event: any, _file: any, _fileList: any) => {
  if (currentFile.value.name) {
    currentFile.value.percentage = Number((event.percent as number).toFixed(2))
  }
  if (event.percent >= 100) {
    loading.value = false
    if (currentFile.value.name) emit('uploadFiles', currentFile.value)
    currentFile.value = {}
  }
}

const cancelUpload = () => {
  uploader.value?.abort()
  currentFile.value = {}
  loading.value = false
}

defineExpose({ cancelUpload })
</script>

<template>
  <div class="upload-box">
    <el-upload
      ref="uploader"
      :disabled="loading"
      class="upload-demo"
      :data="uploadData"
      :action="OSS_URL"
      :before-upload="handleBefore"
      :on-progress="uploadProcess"
      :file-list="uploadFile"
      :show-file-list="false"
    >
      <el-button class="uploader-btn" :loading="loading">{{ text }}</el-button>
    </el-upload>
    <div class="file-box" v-if="(currentFile.percentage ?? 0) > 0">
      <div>{{ currentFile.name }}</div>
      <el-progress
        :text-inside="true"
        :stroke-width="12"
        color="#4292D5"
        stroke-linecap="square"
        :percentage="currentFile.percentage"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.uploader-btn {
  width: 100px;
  height: 30px;
  font-size: 14px;
  font-weight: 500;
  color: #ff8723;
  text-align: center;
  border: 1px solid #ff8723;
  border-radius: 4px;
  font-size: 12px;
  background: #fff;
  :deep(span) {
    color: #ff8723;
    font-size: 12px;
    display: inline-block;
    position: relative;
    top: -4px;
  }
}
.file-box {
  padding: 10px;
  width: 892px;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #e7e7e7;
  margin: 0 auto;
  min-height: 65px;
  > div:nth-of-type(1) {
    margin-bottom: 10px;
  }
}
:deep(.el-icon-loading) {
  color: #ffffff;
}
</style>
