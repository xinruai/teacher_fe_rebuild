<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  text?: string
  placement?: string
  effect?: string
  lineClamp?: number
}>()

const emit = defineEmits<{
  click: []
}>()

const isShowTooltip = ref(false)

function visibilityChange(event: MouseEvent) {
  const el = event.target as HTMLElement
  if (el.scrollHeight > el.clientHeight) {
    isShowTooltip.value = true
  } else {
    isShowTooltip.value = false
  }
}

function onClick() {
  emit('click')
}
</script>

<template>
  <el-tooltip
    :content="text"
    :placement="(placement as any) || 'top'"
    :effect="(effect as any) || 'dark'"
    :disabled="!isShowTooltip"
  >
    <div
      class="text-hidden"
      :style="{ '-webkit-line-clamp': lineClamp || 1 }"
      @mouseenter="visibilityChange"
      @click="onClick"
    >{{ text }}</div>
  </el-tooltip>
</template>

<style lang="scss" scoped>
.text-hidden {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}
</style>
