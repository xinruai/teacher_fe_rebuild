<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDissertationStore } from '@/stores/dissertation'
import { ClassStatus, StageClassesType, AddClasses } from '@/constants/enums'
import { delete_class } from '@/api/modules/paper'
import ArrangeClassModal from '../Modal/ArrangeClass.vue'

const props = defineProps<{
  data: any
  stageId: string | number
}>()

const dissertationStore = useDissertationStore()
const { progressOver, readonly: isReadonly, courseId } = storeToRefs(dissertationStore)

const arrangeModalRef = ref<InstanceType<typeof ArrangeClassModal>>()

const isWait = computed(() => props.data.statused === ClassStatus.WAIT)
const isBegin = computed(() => props.data.statused === ClassStatus.BEGIN)
const isTodo = computed(() => props.data.statused === ClassStatus.TODO)
const isDone = computed(() => props.data.statused === ClassStatus.DONE)

const canDelete = computed(() => {
  return (props.data.type === StageClassesType.SELECTABLE || props.data.paperStageAdd === AddClasses.YES) && !isDone.value
})

function arrange(mode: 'add' | 'edit') {
  arrangeModalRef.value?.show({
    mode,
    stageId: props.stageId,
    classId: props.data.id,
    classroomId: props.data.classroomId,
    name: props.data.className,
    courseId: courseId.value,
  })
}

async function handleDelete() {
  await ElMessageBox.confirm('确定删除该课堂?', '提示', { type: 'warning' })
  await delete_class({
    courseId: courseId.value as number,
    stageClassId: props.data.id,
  })
  ElMessage.success('删除成功')
  dissertationStore.reload()
  dissertationStore.initTitle()
}
</script>

<template>
  <div class="g-arrange">
    <template v-if="!isReadonly && !progressOver">
      <el-button v-if="isWait" size="small" type="primary" @click="arrange('add')">排课</el-button>
      <el-button v-else-if="isBegin" size="small" @click="arrange('edit')">修改时间</el-button>
      <el-button v-else-if="isTodo" size="small" disabled>排课</el-button>
      <el-button v-if="canDelete" size="small" type="danger" link @click="handleDelete">删除</el-button>
    </template>
    <span v-if="isWait && !isReadonly" class="g-arrange__tip">*待排课</span>
    <ArrangeClassModal ref="arrangeModalRef" />
  </div>
</template>

<style scoped lang="scss">
.g-arrange {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;

  &__tip {
    color: #f00;
    font-size: 12px;
  }
}
</style>
