<script setup lang="ts">
import { ref, watch } from 'vue'

// TODO: Full migration in Phase 5 (paperchedule views)
const props = withDefaults(defineProps<{
  isShow?: boolean
  current?: any
}>(), {
  isShow: false,
  current: () => ({}),
})

const emit = defineEmits<{
  (e: 'receivOrder'): void
  (e: 'closeModal'): void
  (e: 'playVideo'): void
}>()

const dialogVisible = ref(false)

watch(() => props.isShow, (val) => {
  dialogVisible.value = val
})
</script>

<template>
  <el-dialog v-model="dialogVisible" title="接单" width="600px" :close-on-click-modal="false" @close="emit('closeModal')">
    <div style="padding: 20px; text-align: center;">orderReceivingNow — stub (Phase 5)</div>
    <template #footer>
      <el-button @click="emit('closeModal')">取消</el-button>
      <el-button type="primary" @click="emit('receivOrder')">确定接单</el-button>
    </template>
  </el-dialog>
</template>
