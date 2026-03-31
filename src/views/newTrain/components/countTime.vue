<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  remainTime?: number
}>(), {
  remainTime: 0,
})

const emit = defineEmits<{
  countDowmEnd: [done: boolean]
}>()

const hour = ref(0)
const minute = ref(0)
const second = ref(0)
let timer: number | null = null

function formatNum(num: number) {
  return num < 10 ? `0${num}` : `${num}`
}

const hourString = computed(() => formatNum(hour.value))
const minuteString = computed(() => formatNum(minute.value))
const secondString = computed(() => formatNum(second.value))

function clearTimer() {
  if (timer) {
    window.clearInterval(timer)
    timer = null
  }
}

function countDowm() {
  clearTimer()
  timer = window.setInterval(() => {
    if (hour.value === 0) {
      if (minute.value !== 0 && second.value === 0) {
        second.value = 59
        minute.value -= 1
      } else if (minute.value === 0 && second.value === 0) {
        emit('countDowmEnd', true)
        clearTimer()
      } else {
        second.value -= 1
      }
    } else if (minute.value !== 0 && second.value === 0) {
      second.value = 59
      minute.value -= 1
    } else if (minute.value === 0 && second.value === 0) {
      hour.value -= 1
      minute.value = 59
      second.value = 59
    } else {
      second.value -= 1
    }
  }, 1000)
}

function init() {
  if ((props.remainTime || 0) <= 0) return
  hour.value = Math.floor((props.remainTime || 0) / 3600)
  minute.value = Math.floor(((props.remainTime || 0) / 60) % 60)
  second.value = Math.floor((props.remainTime || 0) % 60)
  countDowm()
}

watch(() => props.remainTime, init, { immediate: true })
onBeforeUnmount(clearTimer)

defineExpose({ init })
</script>

<template>
  <div class="time-count-box">
    <span class="time-item">{{ hourString }}</span>
    <span class="dot">:</span>
    <span class="time-item">{{ minuteString }}</span>
    <span class="dot">:</span>
    <span class="time-item">{{ secondString }}</span>
  </div>
</template>

<style scoped lang="scss">
.time-item {
  width: 32px;
  height: 26px;
  background: linear-gradient(180deg, #fd863d 0%, #fbc74d 100%);
  border-radius: 3px;
  font-size: 18px;
  line-height: 26px;
  color: #fff;
  text-align: center;
  display: inline-block;
}
.dot {
  color: #fd863d;
  font-size: 16px;
}
</style>
