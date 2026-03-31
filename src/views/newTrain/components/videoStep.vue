<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import UQRCode from 'uqrcodejs'
import videoplay from '@/views/newTrain/components/videoplay.vue'
import { webBaseUrl } from '@/api/config'

const props = defineProps<{
  teacherInfo: Record<string, any>
}>()

const emit = defineEmits<{
  refresh: []
}>()

const videoplayRef = ref<InstanceType<typeof videoplay> | null>(null)
const qrcodeCanvasRef = ref<HTMLCanvasElement | null>(null)

const videoUrl = 'https://classbro-oss.oss-accelerate.aliyuncs.com/statice-resource/trainVideos/%E8%AE%B2%E5%B8%88%E8%87%AA%E6%88%91%E4%BB%8B%E7%BB%8D%E5%BD%95%E5%88%B6%E8%AF%B4%E6%98%8E.mp4'
const posterUrl = 'https://classbro-oss.oss-accelerate.aliyuncs.com/statice-resource/trainVideos/make-introduce-poster.png'

const uploadLink = computed(() => {
  const base = webBaseUrl || `${window.location.origin}/`
  const normalized = base.endsWith('/') ? base : `${base}/`
  return `${normalized}wxteacchannel/uploadIntroduce`
})

function playVideo() {
  videoplayRef.value?.open({ url: videoUrl })
}

function drawCode() {
  if (!qrcodeCanvasRef.value) return
  const qr = new UQRCode()
  qr.data = uploadLink.value
  qr.size = 126
  qr.make()
  const canvasContext = qrcodeCanvasRef.value.getContext('2d')
  if (!canvasContext) return
  qr.canvasContext = canvasContext
  qr.drawCanvas()
}

onMounted(async () => {
  await nextTick()
  drawCode()
})
</script>

<template>
  <div>
    <div class="step-desc">参考以下步骤，录制一段精彩的个人介绍视频吧！</div>
    <div class="video-step">
      <div class="item-01">
        <div class="item-icon">APP</div>
        <div>01 下载《说得相机》</div>
      </div>
      <div class="arrow">→</div>
      <div class="video-item">
        <img class="video-bg" :src="posterUrl" alt="制作说明">
        <button class="play-btn" type="button" @click="playVideo">▶</button>
        <div class="desc">02 观看制作说明</div>
      </div>
      <div class="arrow">→</div>
      <div class="item">
        <canvas ref="qrcodeCanvasRef" class="qrcode" width="126" height="126"></canvas>
        <div class="desc-03">
          03 微信扫码上传视频
          <div>
            （
            <span v-if="props.teacherInfo?.introduceVideo" class="blue-font">已上传</span>
            <span v-else class="red-font">未上传</span>
            ）<span class="refresh-btn" @click="emit('refresh')">刷新</span>
          </div>
        </div>
      </div>
    </div>
    <videoplay ref="videoplayRef" :show-progress="true" />
  </div>
</template>

<style scoped lang="scss">
.step-desc {
  color: #333;
  margin: 20px 0 30px;
}
.video-step {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  .item,
  .item-01 {
    width: 130px;
    text-align: center;
    div {
      color: #333;
      font-size: 12px;
    }
  }
  .item-icon {
    width: 126px;
    height: 126px;
    border-radius: 10px;
    margin-bottom: 15px;
    line-height: 126px;
    color: #fff;
    font-size: 24px;
    background: linear-gradient(135deg, #17d1d6, #3c86ff);
    font-weight: 700;
  }
  .qrcode {
    margin-bottom: 15px;
  }
  .arrow {
    color: #fd9535;
    font-size: 24px;
    line-height: 126px;
    width: 24px;
    text-align: center;
  }
  .video-item {
    position: relative;
    width: 224px;
    color: #333;
    font-size: 12px;
    text-align: center;
    .desc {
      margin-top: 15px;
    }
    .video-bg {
      width: 224px;
      height: 126px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      object-fit: cover;
      border-radius: 4px;
    }
    .play-btn {
      position: absolute;
      left: 50%;
      top: 50%;
      margin-left: -23px;
      margin-top: -40px;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      border: none;
      background: rgba(0, 0, 0, 0.55);
      color: #fff;
      font-size: 20px;
      cursor: pointer;
    }
  }
}
.desc-03 {
  div,
  span {
    font-size: 12px;
    margin-top: 3px;
  }
}
.red-font {
  color: #ed0421;
}
.blue-font {
  color: #17d1d6;
}
.refresh-btn {
  color: #3662ec;
  cursor: pointer;
  margin-left: 4px;
}
</style>
