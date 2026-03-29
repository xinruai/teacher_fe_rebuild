<script setup lang="ts">
import { ref } from 'vue'
import WeekTimeCore from './components/WeekTime.vue'

defineProps<{
  locale?: Record<number, string>
}>()

const weekTimesRef = ref<InstanceType<typeof WeekTimeCore> | null>(null)

const weekTimes = ref<Record<number, number[]>>({ 1: [1, 2, 3] })
const disabledWeekTimes = ref<Record<number, number[]>>({
  2: [1, 2, 3],
  4: [15, 16],
})
const weekdaysList = ref<string[]>([])

function weekTimeChange(times: Record<number, number[]>, _weekTimeStr: string) {
  weekTimes.value = times
  weekdaysList.value = weekTimesRef.value?.weekdaysList || []
}

function clear() {
  weekTimesRef.value?.clear()
}

defineExpose({ weekTimes, weekdaysList, clear })
</script>

<template>
  <div>
    <WeekTimeCore
      ref="weekTimesRef"
      :weekTimes="weekTimes"
      :disabledWeekTimes="disabledWeekTimes"
      :locale="locale"
      @change="weekTimeChange"
    />
    <div v-for="(item, index) in weekdaysList" :key="index">{{ item }}</div>
    <div class="btn" @click="clear">清空</div>
  </div>
</template>

<style scoped lang="scss">
.btn {
  height: 30px;
  width: 50px;
  background: #ff8723;
  color: #fff;
  border-radius: 4px;
  line-height: 30px;
  text-align: center;
  margin-top: 10px;
}
:deep(.week-time table td) {
  border-right: none;
  &:nth-of-type(4n) {
    border-right: 1px solid #ccc;
  }
}
</style>
