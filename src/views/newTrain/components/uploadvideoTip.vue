<script setup lang="ts">
import { ref } from 'vue'
import uploadIntroduce from '@/views/newSalary/components/uploadIntroduce.vue'

const props = withDefaults(defineProps<{
  type?: string
}>(), {
  type: '1',
})

const emit = defineEmits<{
  unlock: [done: () => void]
}>()

const isShow = ref(false)
const loading = ref(false)
const uploadIntroduceRef = ref<InstanceType<typeof uploadIntroduce> | null>(null)

function show() {
  isShow.value = true
}

function closeModal() {
  isShow.value = false
}

function showUploadIntroduce() {
  if (props.type === '2') {
    uploadIntroduceRef.value?.show()
  }
  closeModal()
}

function unlockSuccess() {
  loading.value = false
  closeModal()
}

function unlock() {
  loading.value = true
  emit('unlock', unlockSuccess)
}

defineExpose({ show, closeModal })
</script>

<template>
  <div>
    <el-dialog
      v-model="isShow"
      title="温馨提示"
      :width="props.type === '1' ? '406px' : '360px'"
      center
      :before-close="closeModal"
      append-to-body
    >
      <div class="content" v-if="props.type === '1'">
        您还未上传个人介绍视频，若目前暂无时间录制，可先跳过。
      </div>
      <div class="content" v-else>
        你还未上传个人介绍视频，故暂时无法提现。请前往上传视频。
      </div>
      <template #footer>
        <div class="btn-box">
          <el-button
            class="oper-btn"
            :class="{ 'orange-btn': props.type === '2' }"
            @click="showUploadIntroduce"
          >
            去上传视频
          </el-button>
          <el-button
            v-if="props.type === '1'"
            class="oper-btn"
            :loading="loading"
            @click="unlock"
          >
            直接解锁
          </el-button>
        </div>
      </template>
    </el-dialog>
    <uploadIntroduce ref="uploadIntroduceRef" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dialog) {
  border-radius: 15px;
  .el-dialog__header {
    text-align: left;
    color: #333;
    font-size: 16px;
    font-weight: 700;
  }
  .content {
    line-height: 30px;
  }
}
:deep(.el-dialog__close) {
  font-size: 18px;
}
:deep(.oper-btn) {
  margin-top: 20px;
  background: #17d1d6;
  border: none;
  height: 36px;
  font-size: 14px;
  border-radius: 30px;
  padding: 0 34px;
  span {
    color: #fff;
    font-weight: 700;
  }
}
.orange-btn {
  background: #fd9535;
  margin-top: 0;
}
.btn-box {
  display: flex;
  justify-content: space-evenly;
}
</style>
