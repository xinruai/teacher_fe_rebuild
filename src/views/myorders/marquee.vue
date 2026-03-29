<script setup lang="ts">
import { ref, onMounted } from 'vue'
import yanhuaImg from '@/assets/images/order/yanhua.png'

const props = withDefaults(defineProps<{
  src?: string
}>(), {
  src: yanhuaImg,
})

const text = ref(' 恭喜您！20G已到账，完成考试即可解锁哦')
const textLeft = ref('')
const textTransition = ref('')
const wrapper = ref<HTMLElement>()
const textEl = ref<HTMLElement>()

const marquee = () => {
  if (!wrapper.value || !textEl.value) return
  const wrapperWidth = wrapper.value.clientWidth
  const textWidth = textEl.value.clientWidth
  const transTime = textWidth / 50
  const againTime = transTime * 1000 + 1000

  textLeft.value = wrapperWidth + 'px'

  setTimeout(() => {
    textRoll()
  }, 0)

  function textRoll() {
    textTransition.value = 'left ' + transTime + 's linear'
    textLeft.value = -textWidth + 'px'
    setTimeout(() => {
      textTransition.value = 'none'
      textLeft.value = wrapperWidth + 'px'
      setTimeout(() => {
        textRoll()
      }, 0)
    }, againTime)
  }
}

onMounted(() => {
  marquee()
})
</script>

<template>
  <div class="mobile-marquee">
    <img :src="props.src" alt="" />
    <div class="mobile-marquee-wrapper" ref="wrapper">
      <div
        class="mobile-marquee-text"
        ref="textEl"
        :style="{ left: textLeft, transition: textTransition }"
      >
        {{ text }}
      </div>
    </div>
  </div>
</template>

<style>
.mobile-marquee {
  display: flex;
  align-items: center;
  height: 40px;
  margin: 0 16px;
}
.mobile-marquee-wrapper {
  flex: 1;
  height: 40px;
  overflow: hidden;
  position: relative;
}
.mobile-marquee img {
  width: 14px;
  height: 12px;
  margin-right: 7px;
}
.mobile-marquee-text {
  color: #333;
  white-space: nowrap;
  line-height: 40px;
  position: absolute;
}
</style>
