<script setup lang="ts">
import { ref } from 'vue'
import { getOrderTypeIntroduceVideo } from '@/api/modules/order'

const videoArr = ref([
  { name: '定制辅导', url: '', orderType: [0] },
  { name: '论文大礼包', url: '', orderType: [4, 65] },
  { name: '考前突击', url: '', orderType: [1] },
  { name: '特殊订单', url: '', orderType: [69, 32, 66] },
])
const isShow = ref(false)
const videourl = ref('')
const myvideo = ref<HTMLVideoElement>()

const show = async (order: any) => {
  try {
    const res: any = await getOrderTypeIntroduceVideo()
    if (res.status === 200) {
      if (Array.isArray(res.body)) {
        res.body.forEach((item: any) => {
          videoArr.value.forEach(video => {
            if (video.orderType && video.orderType.includes(Number(item.type))) {
              video.url = item.videoUrl
            }
          })
        })
      }
      const videoObj = videoArr.value.find(v => v.orderType && v.orderType.includes(Number(order.spoType)))
      if (videoObj) {
        videourl.value = videoObj.url
        isShow.value = true
      }
    }
  } catch (_e) { /* ignore */ }
}

const handleClose = () => {
  isShow.value = false
}

defineExpose({ show })
</script>

<template>
  <div>
    <el-dialog
      v-model="isShow"
      width="630px"
      class="paper-dialog"
      :before-close="handleClose"
    >
      <video
        v-if="isShow"
        autoplay
        ref="myvideo"
        style="width: 100%"
        controlslist="nodownload"
        :controls="true"
        :src="videourl"
      ></video>
    </el-dialog>
  </div>
</template>
