<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import draggable from 'vuedraggable'
import { useDissertationStore } from '@/stores/dissertation'
import { StageStatus, StageType } from '@/constants/enums'
import { stage_sort } from '@/api/modules/paper'
import Row from './Row.vue'

const dissertationStore = useDissertationStore()
const { stages, readonly: isReadonly, disabled: draggableDisabled } = storeToRefs(dissertationStore)

const stageList = computed({
  get: () => stages.value as any[],
  set: (val) => { dissertationStore.stages = val },
})

function onMoveCallback(evt: any) {
  const dragEl = evt.draggedContext.element
  const relEl = evt.relatedContext.element
  if (dragEl.statused !== StageStatus.TODO || relEl.statused !== StageStatus.TODO) return false
  if (dragEl.stageType === StageType.EXAMINE || relEl.stageType === StageType.EXAMINE) return false
  return true
}

async function moveEnd(evt: any) {
  if (evt.oldIndex === evt.newIndex) return
  const item = stageList.value[evt.newIndex]
  await stage_sort({
    stageId: item.id,
    oldSort: evt.oldIndex + 1,
    newSort: evt.newIndex + 1,
  })
  dissertationStore.reload()
}
</script>

<template>
  <div class="g-stage">
    <Row header />
    <draggable
      v-model="stageList"
      item-key="id"
      :animation="200"
      ghost-class="ghost"
      handle=".drag-handle"
      :disabled="isReadonly || draggableDisabled"
      :move="onMoveCallback"
      @end="moveEnd"
    >
      <template #item="{ element }">
        <Row :data="element" />
      </template>
    </draggable>
  </div>
</template>

<style scoped lang="scss">
.g-stage {
  margin-bottom: 20px;
}
.ghost {
  opacity: 0.5;
  background: #f5f5f5;
}
</style>
