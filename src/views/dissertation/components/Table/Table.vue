<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDissertationStore } from '@/stores/dissertation'
import { StageStatus } from '@/constants/enums'
import { StageType2Val } from '../../cfg/Table'
import RightRow from './RightRow.vue'
import AddClassModal from '../Modal/AddClass.vue'

const props = defineProps<{ data: any }>()

const dissertationStore = useDissertationStore()
const { progressOver, readonly: isReadonly } = storeToRefs(dissertationStore)

const expanded = ref(true)
const addClassRef = ref<InstanceType<typeof AddClassModal>>()
const stageClasses = computed(() => props.data.stageClass || props.data.stageClassInstance || [])

const canAdd = computed(() => {
  return !progressOver.value && props.data.statused !== StageStatus.TODO && !isReadonly.value
})

function toggleExpand() {
  expanded.value = !expanded.value
}

function openAddClass() {
  addClassRef.value?.show({
    stageType: props.data.stageType,
    courseId: props.data.courseId,
    stageData: props.data,
  })
}
</script>

<template>
  <div class="g-table-section">
    <div class="g-table-section__left" @click="toggleExpand">
      <i :class="expanded ? 'el-icon-arrow-down' : 'el-icon-arrow-right'" class="g-table-section__icon" />
      <span class="g-table-section__phase">{{ StageType2Val[data.stageType] }}</span>
      <el-button v-if="canAdd" size="small" type="primary" link @click.stop="openAddClass">
        + 加课
      </el-button>
    </div>
    <div v-show="expanded" class="g-table-section__right">
      <RightRow
        v-for="cls in stageClasses"
        :key="cls.id"
        :data="cls"
        :stage-type="data.stageType"
        :stage-id="data.id"
      />
    </div>
    <AddClassModal ref="addClassRef" />
  </div>
</template>

<style scoped lang="scss">
.g-table-section {
  border-bottom: 1px solid #e7e7e7;

  &__left {
    display: flex;
    align-items: center;
    padding: 10px 5px;
    cursor: pointer;
    width: 10%;
    float: left;
  }

  &__icon {
    margin-right: 5px;
    color: #999;
  }

  &__phase {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    margin-right: 10px;
  }

  &__right {
    margin-left: 10%;
  }

  &::after {
    content: '';
    display: table;
    clear: both;
  }
}
</style>
