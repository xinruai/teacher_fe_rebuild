<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDissertationStore } from '@/stores/dissertation'
import { HeaderStatused } from '@/constants/enums'
import GradeModal from './Modal/Grade.vue'
import { ref } from 'vue'

const dissertationStore = useDissertationStore()
const { titleData, progressOver, readonly: isReadonly } = storeToRefs(dissertationStore)

const gradeModalRef = ref<InstanceType<typeof GradeModal>>()

const schedule = computed(() => (titleData.value as any).schedule || 0)
const dealDeadline = computed(() => (titleData.value as any).dealDeadline || '')
const statused = computed(() => +(titleData.value as any).statused || 0)

const canGrade = computed(() => statused.value >= HeaderStatused.DONE && !isReadonly.value)

function openGrade() {
  gradeModalRef.value?.show()
}
</script>

<template>
  <div class="g-title">
    <div class="g-title__left">
      <span class="g-title__label">毕业论文规划表</span>
      <span v-if="dealDeadline" class="g-title__deadline">
        Deal Deadline: {{ dealDeadline }}
      </span>
    </div>
    <div class="g-title__right">
      <div class="g-title__progress">
        <div class="g-title__progress-bar">
          <div class="g-title__progress-inner" :style="{ width: schedule + '%' }">
            <span class="g-title__progress-text">{{ schedule }}%</span>
          </div>
        </div>
      </div>
      <el-button
        v-if="!isReadonly"
        class="g-title__grade-btn"
        :disabled="!canGrade"
        size="small"
        @click="openGrade"
      >
        论文评级
      </el-button>
      <span v-if="!canGrade && !isReadonly && !progressOver" class="g-title__grade-tip">
        *论文辅导完成后可评级
      </span>
    </div>
    <GradeModal ref="gradeModalRef" />
  </div>
</template>

<style scoped lang="scss">
.g-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;

  &__left {
    display: flex;
    align-items: center;
  }

  &__label {
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }

  &__deadline {
    margin-left: 20px;
    color: #999;
    font-size: 14px;
  }

  &__right {
    display: flex;
    align-items: center;
  }

  &__progress {
    width: 200px;
    margin-right: 15px;
  }

  &__progress-bar {
    height: 20px;
    background: #e7e7e7;
    border-radius: 10px;
    overflow: hidden;
  }

  &__progress-inner {
    height: 100%;
    background: linear-gradient(143deg, rgba(233, 44, 129, 1), rgba(255, 161, 19, 1));
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 30px;
    transition: width 0.3s;
  }

  &__progress-text {
    color: #fff;
    font-size: 12px;
    padding-right: 5px;
  }

  &__grade-btn {
    background: linear-gradient(143deg, rgba(233, 44, 129, 1), rgba(255, 161, 19, 1));
    color: #fff;
    border: none;
    &:hover { opacity: 0.9; }
    &.is-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__grade-tip {
    color: #f00;
    font-size: 12px;
    margin-left: 10px;
  }
}
</style>
