<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDissertationStore } from '@/stores/dissertation'
import { StageStatus } from '@/constants/enums'
import { paper_feedback } from '@/api/modules/paper'
import { ElMessage } from 'element-plus'
import { getChars } from '@/utils/Dissertation'

const props = defineProps<{ data: any }>()

const dissertationStore = useDissertationStore()
const { readonly: isReadonly, disabled } = storeToRefs(dissertationStore)

const isEdit = ref(false)
const editValue = ref('')

const isTodo = computed(() => props.data.statused === StageStatus.TODO)
const showTooltip = computed(() => getChars(props.data.summary) > 20)

function startEdit() {
  editValue.value = props.data.summary || ''
  isEdit.value = true
  dissertationStore.setDisabled(true)
}

function cancelEdit() {
  isEdit.value = false
  dissertationStore.setDisabled(false)
}

async function submitFeedback() {
  if (!editValue.value.trim()) {
    ElMessage.warning('请输入反馈内容')
    return
  }
  await paper_feedback({
    stageId: props.data.id,
    feedbackValue: editValue.value,
  })
  ElMessage.success('反馈成功')
  isEdit.value = false
  dissertationStore.setDisabled(false)
  dissertationStore.reload()
}
</script>

<template>
  <div class="g-summary">
    <template v-if="isEdit">
      <el-input
        v-model="editValue"
        type="textarea"
        :maxlength="255"
        :rows="2"
        placeholder="请输入阶段小结"
      />
      <div class="g-summary__btns">
        <el-button size="small" @click="cancelEdit">取消</el-button>
        <el-button size="small" type="primary" @click="submitFeedback">提交</el-button>
      </div>
    </template>
    <template v-else>
      <div class="g-summary__text">
        <el-tooltip v-if="showTooltip" :content="data.summary" placement="top">
          <span class="g-summary__ellipsis">{{ data.summary || '--' }}</span>
        </el-tooltip>
        <span v-else>{{ data.summary || '--' }}</span>
      </div>
      <el-button
        v-if="!isReadonly && !isTodo"
        size="small"
        :disabled="disabled"
        @click="startEdit"
      >
        {{ data.summary ? '修改' : '反馈' }}
      </el-button>
    </template>
    <i v-if="!isReadonly && !isTodo" class="drag-handle el-icon-rank" />
  </div>
</template>

<style scoped lang="scss">
.g-summary {
  display: flex;
  align-items: center;
  gap: 8px;

  &__text {
    flex: 1;
    min-width: 0;
  }

  &__ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
  }

  &__btns {
    display: flex;
    gap: 5px;
    margin-top: 5px;
  }

  .drag-handle {
    cursor: move;
    color: #999;
    margin-left: 5px;
  }
}
</style>
