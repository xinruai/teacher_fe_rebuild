<script setup lang="ts">
import { nextTick, ref } from 'vue'

const props = withDefaults(defineProps<{
  showProgress?: boolean
}>(), {
  showProgress: false,
})

const emit = defineEmits<{
  addstep: [video: Record<string, any>]
}>()

const showvideo = ref(false)
const video = ref<Record<string, any>>({})
const myvideoRef = ref<HTMLVideoElement | null>(null)

async function open(payload: Record<string, any>) {
  showvideo.value = true
  video.value = payload || {}
  await nextTick()
  bindVideoEvents(payload)
}

function bindVideoEvents(payload: Record<string, any>) {
  if (!myvideoRef.value) return
  myvideoRef.value.onended = () => {
    closevideo()
    emit('addstep', payload)
  }
}

function closevideo() {
  if (myvideoRef.value) {
    myvideoRef.value.pause()
    myvideoRef.value.currentTime = 0
  }
  showvideo.value = false
  video.value = {}
}

defineExpose({ open, closevideo })
</script>

<template>
  <el-dialog
    v-model="showvideo"
    width="50%"
    :close-on-click-modal="false"
    append-to-body
    @close="closevideo"
  >
    <video
      ref="myvideoRef"
      autoplay
      style="width: 100%; object-fit: fill;"
      :src="video.url"
      controls
      controlslist="nodownload"
      :class="{ 'not-show-progress': !props.showProgress }"
    />
  </el-dialog>
</template>

<style scoped lang="scss">
video.not-show-progress::-webkit-media-controls-timeline {
  display: none;
}
</style>
