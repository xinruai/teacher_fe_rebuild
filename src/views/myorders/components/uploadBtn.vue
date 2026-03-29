<script setup lang="ts">
import { ref, reactive } from 'vue'
import { getAliOSSUploadSign } from '@/api/modules/persondetail'
import { ElNotification } from 'element-plus'
import uploadIcon from '@/assets/images/order/upload/upload.png'

const props = withDefaults(defineProps<{
  fileList?: any[]
  groupId?: number | null
  uploadImmediately?: boolean
}>(), {
  fileList: () => [],
  groupId: null,
  uploadImmediately: false,
})

const emit = defineEmits<{
  (e: 'pushFile', file: any): void
  (e: 'uploadTaskfeedBack', file: any): void
}>()

const OSS_URL = 'https://classbro-oss.oss-accelerate.aliyuncs.com/'
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
const uploadFileList = ref<any[]>([])

const getOssSign = async () => {
  const res: any = await getAliOSSUploadSign({ dir: 'courseware' })
  if (res.status === 200) {
    uploadOssObj.value = res.body || {}
  }
}

const handleBefore = async (e: any) => {
  await getOssSign()
  uploadData.OSSAccessKeyId = uploadOssObj.value.accessid
  uploadData.signature = uploadOssObj.value.signature
  uploadData.expire = uploadOssObj.value.expire
  uploadData.host = uploadOssObj.value.host
  uploadData.dir = uploadOssObj.value.dir + '/' + e.name
  uploadData.policy = uploadOssObj.value.policy
  uploadData.key = uploadData.dir
  uploadData.name = e.name
  if (!uploadOssObj.value.host || !uploadOssObj.value.dir) {
    ElNotification.warning('该文件上传路径获取失败,请重新上传')
    return false
  }
  const paths = uploadOssObj.value.dir + '/' + encodeURIComponent(uploadData.name)
  const fileInfo = {
    percentage: 0,
    size: e.size,
    name: uploadData.name,
    url: OSS_URL + paths,
    canuplad: true,
    description: '',
  }
  emit('pushFile', fileInfo)
}

const uploadProcess = (event: any, file: any, _fileList: any) => {
  const index = props.fileList?.findIndex(item => item.name === file.name && item.canuplad)
  if (props.fileList && props.fileList[index]) {
    props.fileList[index].percentage = Number((event.percent as number).toFixed(0))
  }
  if (Number((event.percent as number).toFixed(0)) === 100) {
    if (props.fileList[index]) props.fileList[index].canuplad = false
    emit('uploadTaskfeedBack', props.fileList[index])
  }
}
</script>

<template>
  <el-upload
    :data="uploadData"
    :action="uploadData.host"
    :before-upload="handleBefore"
    :on-progress="uploadProcess"
    :multiple="true"
    :file-list="uploadFileList"
    :show-file-list="false"
  >
    <img :src="uploadIcon" alt="" />
  </el-upload>
</template>

<style lang="scss" scoped>
img {
  width: 28px;
  height: auto;
}
div {
  display: contents !important;
}
:deep(.el-upload) {
  display: contents !important;
}
</style>
