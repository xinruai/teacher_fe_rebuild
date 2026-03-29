<script setup lang="ts">
/**
 * Replaces the original plupload+jQuery uploader with el-upload + OSS.
 * Exposes the same interface expected by parent components (myCourse, myorderNew).
 */
import { ref, reactive } from 'vue'
import { ElNotification, ElMessage } from 'element-plus'
import { getAliOSSUploadSign } from '@/api/modules/paper'
import { BasicUrl } from '@/api/config'
import request from '@/api/request'

const props = defineProps<{
  commid: string
  couseobj: any
}>()

const emit = defineEmits<{
  (e: 'filesAdded', files: any[]): void
  (e: 'fileUploaded', obj: any): void
  (e: 'uploadError', err: any): void
  (e: 'uploadProgress', file: any): void
}>()

const uploadOssObj = ref<any>({})
const timeStamp = ref('')
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
const uploadFileList = ref<any[]>([])

const OSS_URL = 'https://classbro-oss.oss-accelerate.aliyuncs.com/'

const getOssSign = async () => {
  timeStamp.value = String(Math.floor(Date.now() / 1000))
  const useData = props.couseobj
  let url = ''
  if ((useData && useData.scTypeed === 4) || useData?.spoType === 69) {
    url = `${BasicUrl}/oss/getAliOSSUploadSignWyard?dir=courseware/${timeStamp.value}/`
  } else {
    url = `${BasicUrl}/oss/getAliOSSUploadSign?dir=courseware/${timeStamp.value}/`
  }
  const res: any = await getAliOSSUploadSign(url)
  if (res.status === 200) {
    uploadOssObj.value = res.body || {}
  }
}

const handleBefore = async (e: any) => {
  await getOssSign()
  if (!uploadOssObj.value.host || !uploadOssObj.value.dir) {
    ElNotification.warning('文件上传路径获取失败,请重新上传')
    return false
  }
  uploadData.OSSAccessKeyId = uploadOssObj.value.accessid
  uploadData.signature = uploadOssObj.value.signature
  uploadData.expire = uploadOssObj.value.expire
  uploadData.host = uploadOssObj.value.host
  uploadData.dir = uploadOssObj.value.dir + e.name
  uploadData.policy = uploadOssObj.value.policy
  uploadData.key = uploadData.dir
  uploadData.name = e.name

  const fileInfo = {
    id: e.uid || Date.now(),
    name: e.name,
    filesize: (e.size / 1024).toFixed(1) + 'KB',
    percent: 0,
    progressshow: false,
    size: e.size,
  }
  emit('filesAdded', [fileInfo])
}

const uploadProcess = (event: any, file: any) => {
  emit('uploadProgress', { name: file.name, percent: Math.round(event.percent) })
}

const handleSuccess = (_response: any, file: any) => {
  const encodedName = encodeURIComponent(file.name)
  const obj = {
    cdId: props.couseobj?.courseId,
    groupId: 0,
    name: file.name,
    url: uploadOssObj.value.host + '/' + uploadOssObj.value.dir + encodedName,
  }
  emit('fileUploaded', obj)
}

const handleError = (err: any) => {
  ElNotification({ title: '提示', type: 'error', message: '文件上传失败，请刷新重试' })
  emit('uploadError', err)
}

const submitFiles = async (fileObjs: any[], url: string, extraData?: any) => {
  try {
    const paramsData = extraData ? { list: fileObjs, ...extraData } : JSON.stringify(fileObjs)
    const res: any = await request({
      url,
      method: 'post',
      data: typeof paramsData === 'string' ? paramsData : JSON.stringify(paramsData),
      headers: { 'Content-Type': 'application/json' },
    })
    if (res.status === 200) {
      ElMessage.success('文件上传成功')
      return true
    } else {
      ElMessage.error(res.body?.msg || '上传失败')
      return false
    }
  } catch (e: any) {
    ElMessage.error(e?.data?.body?.msg || '上传失败')
    return false
  }
}

defineExpose({ submitFiles })
</script>

<template>
  <el-upload
    class="uploader-wrapper"
    :data="uploadData"
    :action="uploadData.host || 'https://classbro-oss.oss-accelerate.aliyuncs.com/'"
    :before-upload="handleBefore"
    :on-progress="uploadProcess"
    :on-success="handleSuccess"
    :on-error="handleError"
    :file-list="uploadFileList"
    :show-file-list="false"
    :multiple="true"
  >
    <button class="default-btn" type="button">选择文件</button>
  </el-upload>
</template>

<style scoped>
.default-btn {
  padding: 4px 12px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
}
</style>
