<script setup lang="ts">
import { ref } from 'vue'
import { ElNotification } from 'element-plus'
import { getAliOSSUploadSign } from '@/api/modules/persondetail'
import { uploadToOss } from '@/api/modules/newTrain'

const emit = defineEmits<{
  getThumb: [url: string]
}>()

const thumb = ref('')

async function uploadFile(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (!['jpg', 'jpeg', 'png', 'bmp'].includes(ext)) {
    ElNotification.error('仅支持JPG、PNG和BMP格式')
    return false
  }
  if (file.size / 1024 / 1024 > 20) {
    ElNotification.error('最大20MB')
    return false
  }
  const image = new Image()
  const reader = new FileReader()
  const url = await new Promise<string>((resolve) => {
    reader.onload = (e) => resolve(String(e.target?.result || ''))
    reader.readAsDataURL(file)
  })
  image.src = url
  await new Promise<void>((resolve) => {
    image.onload = () => resolve()
  })
  if (image.width < 250 || image.height < 250) {
    ElNotification.error('图片宽和高必须至少250像素')
    return false
  }

  const signRes = await getAliOSSUploadSign({ dir: 'teacher/avatar' })
  if (signRes.status !== 200) return false
  const { accessid, signature, dir, policy, host } = signRes.body || {}
  const timeStamp = `${Date.now()}`
  const key = `${dir}/${timeStamp}/${file.name}`
  const data = new FormData()
  data.append('OSSAccessKeyId', accessid)
  data.append('signature', signature)
  data.append('host', host)
  data.append('success_action_status', '200')
  data.append('dir', dir)
  data.append('policy', policy)
  data.append('key', key)
  data.append('file', file)
  await uploadToOss(data)
  const finalUrl = `${host}/${key}`
  thumb.value = finalUrl
  emit('getThumb', finalUrl)
  ElNotification.success('上传成功')
  return false
}
</script>

<template>
  <div class="detail-area">
    <div class="img-rules">
      <img :src="thumb || 'https://classbro-oss.oss-accelerate.aliyuncs.com/statice-resource/trainVideos/upload-position.png'" class="avatar">
      <div>
        <div class="item-title"><span class="star">*</span>讲师照片</div>
        <div class="item-desc">至少为250x250像素，仅支持 JPG/PNG/BMP，最大20MB</div>
      </div>
    </div>
    <el-upload class="avatar-uploader" :auto-upload="false" :show-file-list="false" :on-change="(f:any)=>uploadFile(f.raw)">
      <div class="btn-text">选择照片</div>
    </el-upload>
  </div>
</template>

<style scoped lang="scss">
.img-rules { display: flex; margin-top: 20px; align-items: center; gap: 16px; }
.avatar { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; }
.item-title { font-size: 16px; font-weight: 700; margin: 8px 0 12px; color: #333; }
.star { color: #ed0421; margin-right: 6px; }
.item-desc { color: #7f7f7f; line-height: 25px; }
.avatar-uploader { width: 356px; height: 32px; background: #fff; border-radius: 20px; border: 1px solid #f2561f; margin-top: 20px; }
.btn-text { text-align: center; line-height: 32px; color: #f2561f; width: 356px; }
</style>
