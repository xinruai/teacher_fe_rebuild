<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  processList: Record<string, any>[]
}>(), {
  processList: () => [],
})

const emit = defineEmits<{
  getCurrentStep: [type: number]
}>()

const currentStep = ref(1)

function canClick(item: Record<string, any>, index: number) {
  const list = props.processList.filter((v) => v.status !== 4)
  return [2, 3].includes(item.status) || (index > 0 && list[index - 1]?.status === 3 && item.status !== 4)
}

function getCurrentStep(item: Record<string, any>, index: number) {
  if (index === 4 || item.status === 4 || !canClick(item, index)) return
  currentStep.value = item.type
  emit('getCurrentStep', item.type)
}

defineExpose({ getCurrentStep })
</script>

<template>
  <div>
    <div class="train-title">讲师培训流程</div>
    <div class="step-bar">
      <div
        class="step"
        v-for="(item, index) in processList"
        :class="{ actived: item.type == currentStep, canClick: canClick(item, index) }"
        :key="item.type"
        @click="getCurrentStep(item, index)"
      >
        <div class="step-desc">
          <div class="name">
            <span v-if="index < 4">0{{ index + 1 }}</span>
            <span v-else>💰</span>
            {{ item.name }}
          </div>
          <span class="time">{{ item.status == 3 ? '(已完成)' : item.status == 4 ? '(跳过)' : '' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.train-title {
  height: 64px;
  border-radius: 14px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 700;
  background: linear-gradient(90deg, #3341c2, #5d75ff);
}
.step-bar {
  display: flex;
  margin-top: 30px;
  .step {
    width: 240px;
    height: 70px;
    border-radius: 10px 10px 0 0;
    margin-right: 6px;
    background: rgba(255, 255, 255, 0.18);
  }
  .step-desc {
    text-align: center;
    padding: 10px;
    line-height: 20px;
    height: 70px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    .name,
    .name span {
      font-size: 18px;
      color: rgba(255, 255, 255, 0.7);
      line-height: 28px;
    }
    .time {
      line-height: 24px;
      color: rgba(255, 255, 255, 0.7);
    }
  }
  .step.actived,
  .step.canClick {
    cursor: pointer;
    .name,
    .time {
      color: #fff;
    }
  }
  .step.actived {
    background: rgba(245, 154, 35, 0.55);
  }
}
</style>
