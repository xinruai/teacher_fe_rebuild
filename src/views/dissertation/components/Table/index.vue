<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useDissertationStore } from '@/stores/dissertation'
import Header from './Header.vue'
import Table from './Table.vue'

const dissertationStore = useDissertationStore()
const { tables, stageLoading } = storeToRefs(dissertationStore)
</script>

<template>
  <div class="g-tables" v-loading="stageLoading">
    <Header />
    <Table v-for="stage in (tables as any[])" :key="stage.id" :data="stage" />
  </div>
</template>

<style scoped lang="scss">
.g-tables {
  min-height: 200px;
}
</style>
