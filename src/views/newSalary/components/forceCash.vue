<script setup lang="ts">
import { ref } from 'vue'
import { ElDialog, ElButton } from 'element-plus'

defineProps<{
  loading: boolean
}>()

const emit = defineEmits<{
  cashWithdrawal: [callback: () => void]
}>()

const isShow = ref(false)

function show() {
  isShow.value = true
}

function closeModal() {
  isShow.value = false
}

function confirm() {
  emit('cashWithdrawal', closeModal)
}

defineExpose({ show })
</script>

<template>
  <div>
    <el-dialog
      append-to-body
      v-model="isShow"
      title="强制提现"
      :before-close="closeModal"
      width="320px"
    >
      <div class="content">此操作将绕过所有关于不可提现的系统规则帮助讲师提现当前工资单，是否确认？</div>
      <div class="footer">
        <el-button size="small" plain @click="closeModal">取消</el-button>
        <el-button type="primary" :loading="loading" @click="confirm" size="small">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dialog) {
  border-radius: 15px;
}
.content {
  line-height: 30px;
}
.footer {
  margin-top: 30px;
  text-align: center;
  :deep(.el-button--primary) {
    background: #fd9535;
    border: none;
    span {
      color: #fff;
    }
  }
  :deep(.el-button.is-plain) {
    border-color: #fd9535;
    span {
      color: #fd9535;
    }
  }
}
</style>
