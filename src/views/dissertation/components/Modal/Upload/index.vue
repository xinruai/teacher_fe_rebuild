<script setup lang="ts">
import { ref } from 'vue'
import MaterialUploadModal from '../MaterialUpload.vue'

const innerRef = ref<InstanceType<typeof MaterialUploadModal>>()

function show(params: any) {
  ;(innerRef.value as any)?.show(params)
}

defineExpose({ show })
</script>

<template>
  <MaterialUploadModal ref="innerRef" />
</template>
