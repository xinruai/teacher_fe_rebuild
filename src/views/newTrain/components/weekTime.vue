<script setup lang="ts">
import WeekTimeGrid from '@/components/WeekTime/components/WeekTime.vue'
import { weekTimeColorConfig } from '@/views/newTrain/cfg'

withDefaults(defineProps<{
  width?: number
  weekTimes?: Record<number, number[]>
}>(), {
  width: 580,
  weekTimes: () => ({}),
})

const emit = defineEmits<{
  saveTime: [weekTimes: Record<number, number[]>]
}>()

function weekTimeChange(weekTimes: Record<number, number[]>) {
  emit('saveTime', weekTimes)
}
</script>

<template>
  <div class="week-time-area">
    <div class="time-content">
      <WeekTimeGrid :week-times="weekTimes" :width="width" @change="weekTimeChange" />
    </div>
    <div class="time-color">
      <div v-for="(item, index) in weekTimeColorConfig" :key="index">
        <span :style="{ background: item.bgColor }" class="legend"></span>{{ item.label }}
      </div>
      <span class="time-desc">GMT+08:00 中国标准时间 - 北京</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.time-content { background: rgba(139, 189, 220, 0.05); border-radius: 8px; padding: 6px 0; display: flex; justify-content: center; }
.time-color { display: flex; margin-top: 8px; align-items: center; flex-wrap: wrap; gap: 12px; }
.legend { display: inline-block; width: 14px; height: 14px; border: 1px solid #0091ff; margin-right: 6px; position: relative; top: 2px; }
.time-desc { color: #333; font-weight: 700; font-size: 13px; margin-left: 20px; }
</style>
