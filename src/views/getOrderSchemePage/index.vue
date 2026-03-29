<script setup lang="ts">
import { useRoute } from 'vue-router'
import SchemeConent from './components/schemeConent.vue'

const route = useRoute()

const courseId = (route.query.courseId as string) || ''
const isNewLastMinuteCramming = route.query.isNewLastMinuteCramming === 'true'
</script>

<template>
  <div class="pager">
    <div class="pager-content">
      <SchemeConent
        :course-id="courseId"
        :is-new-last-minute-cramming="isNewLastMinuteCramming"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.pager {
  height: 100%;
}

.pager-content {
  width: 1000px;
  margin: 40px auto;
  height: 100%;
  overflow: auto;
  padding-bottom: 40px;
}
</style>
