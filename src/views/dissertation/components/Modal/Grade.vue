<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { useDissertationStore } from '@/stores/dissertation'
import { paper_rate } from '@/api/modules/paper'

import imgA from '@/assets/images/dissertation/modal/A.png'
import imgB from '@/assets/images/dissertation/modal/B.png'
import imgC from '@/assets/images/dissertation/modal/C.png'
import imgD from '@/assets/images/dissertation/modal/D.png'

const dissertationStore = useDissertationStore()
const { rate: dissertationRate, courseId } = storeToRefs(dissertationStore)

const visible = ref(false)
const selectedRate = ref<number | null>(null)

const grades = [
  { value: 1, label: 'A', desc: '优秀 (100-75分)', img: imgA },
  { value: 2, label: 'B', desc: '良好 (55-74分)', img: imgB },
  { value: 3, label: 'C', desc: '一般 (45-54分)', warning: '挂科风险', img: imgC },
  { value: 4, label: 'D', desc: '必挂 (<45分)', img: imgD },
]

const isDisabled = computed(() => dissertationRate.value !== null && dissertationRate.value !== 0)

function show() {
  selectedRate.value = dissertationRate.value
  visible.value = true
}

async function submit() {
  if (!selectedRate.value) {
    ElMessage.warning('请选择评级')
    return
  }
  await paper_rate({ courseId: courseId.value as number, rate: selectedRate.value })
  ElMessage.success('评级成功')
  visible.value = false
  dissertationStore.initTitle()
}

defineExpose({ show })
</script>

<template>
  <el-dialog v-model="visible" title="论文评级" width="600px" :close-on-click-modal="false">
    <div class="grade-list">
      <div
        v-for="g in grades"
        :key="g.value"
        class="grade-item"
        :class="{ active: selectedRate === g.value, disabled: isDisabled }"
        @click="!isDisabled && (selectedRate = g.value)"
      >
        <img :src="g.img" class="grade-img" :class="{ grayscale: selectedRate !== g.value }" />
        <div class="grade-info">
          <span class="grade-label">{{ g.label }}</span>
          <span class="grade-desc">{{ g.desc }}</span>
          <span v-if="g.warning" class="grade-warning">{{ g.warning }}</span>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :disabled="isDisabled" @click="submit">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.grade-list {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
}

.grade-item {
  text-align: center;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s;

  &.active {
    background: #fff3e0;
    box-shadow: 0 2px 8px rgba(255, 135, 35, 0.3);
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.grade-img {
  width: 60px;
  height: 60px;
  transition: filter 0.3s;

  &.grayscale {
    filter: grayscale(100%);
  }
}

.grade-info {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
}

.grade-label {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.grade-desc {
  font-size: 12px;
  color: #999;
}

.grade-warning {
  font-size: 12px;
  color: #f00;
  margin-top: 3px;
}
</style>
