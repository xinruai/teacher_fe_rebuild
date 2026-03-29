<script setup lang="ts">
// TODO: Phase 5 — full migration from classbro-teacher-web-vue/src/views/account/newHome/moneyDetail.vue
import { ref } from 'vue'

const isShow = ref(false)

const show = (_row: Record<string, any>) => {
  isShow.value = true
}

defineExpose({ show })
</script>

<template>
  <el-dialog v-model="isShow" title="收入明细" width="600px">
    <div style="text-align: center; padding: 40px; color: #999;">
      moneyDetail — Phase 5
    </div>
  </el-dialog>
</template>
