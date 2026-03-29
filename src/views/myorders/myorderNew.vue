<script setup lang="ts">
// TODO: Full migration in Phase 4.4 (myorders)
withDefaults(defineProps<{
  postTitle?: number
  tableDataNameto?: string
  timechangesort?: number
}>(), {
  postTitle: 0,
  tableDataNameto: '',
  timechangesort: 1,
})

const emit = defineEmits<{
  (e: 'updategetTime'): void
  (e: 'seeOrderScheme', row: any): void
}>()
</script>

<template>
  <div class="myorder-new" style="padding: 40px; text-align: center; color: #999;">
    myorderNew — stub (Phase 4.4)
  </div>
</template>
