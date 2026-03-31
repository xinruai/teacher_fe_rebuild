<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import UploadFile from '@/views/orders/components/uploadFile.vue'
import { stage_over, sysfile_uploadList } from '@/api/modules/paper'
import { ClassUploadFileType } from '@/constants/enums'
import { getTeacherInfo } from '@/utils/task/Utils'
import { useDissertationStore } from '@/stores/dissertation'

interface UploadParams {
  stageId: string | number
  stageClassId: string | number
  courseId: string | number
  stageClassFileType?: number
  isDissertation?: boolean
}

interface UploadRow {
  index: number
  enable: boolean
  url?: string
  name?: string
  remark?: string
}

const visible = ref(false)
const loading = ref(false)
const params = ref<UploadParams | null>(null)
const rows = ref<UploadRow[]>([])
const dissertationStore = useDissertationStore()

function addRow() {
  rows.value.push({
    index: Date.now() + rows.value.length,
    enable: false,
    remark: '',
  })
}

function close() {
  visible.value = false
  rows.value = []
}

function onUploaded(rowIndex: number, file: { name: string; url: string }) {
  const target = rows.value[rowIndex]
  if (!target) return
  target.name = file.name
  target.url = file.url
  target.enable = true
}

async function submit() {
  if (!params.value) return
  const validRows = rows.value.filter((row) => row.enable && row.url && row.name)
  if (validRows.length === 0) {
    ElMessage.warning('请上传文件')
    return
  }
  const noRemark = validRows.some((row) => !row.remark?.trim())
  if (noRemark) {
    ElMessage.warning('文件描述不能为空')
    return
  }

  const teacher = getTeacherInfo() as { id?: string | number }
  const payload = validRows.map((row) => ({
    url: row.url!,
    name: row.name!,
    remark: row.remark!,
    type: params.value!.isDissertation ? ClassUploadFileType.MUST_MATERIAL : ClassUploadFileType.TEACHER_MATERIAL,
    teacherId: teacher.id,
    courseId: params.value!.courseId,
    stageId: params.value!.stageId,
    stageClassId: params.value!.stageClassId,
    stageClassFileType: params.value!.stageClassFileType,
  }))

  loading.value = true
  try {
    const res: any = params.value.isDissertation
      ? await stage_over(payload as any)
      : await sysfile_uploadList(payload as any)
    if (res.status === 200) {
      ElMessage.success('上传成功')
      close()
      await dissertationStore.reload()
      await dissertationStore.initTitle()
    }
  } finally {
    loading.value = false
  }
}

function show(nextParams: UploadParams) {
  params.value = nextParams
  rows.value = []
  visible.value = true
}

defineExpose({ show })
</script>

<template>
  <el-dialog
    v-model="visible"
    title="上传文件材料"
    width="760px"
    :close-on-click-modal="false"
    @close="close"
  >
    <div v-loading="loading" class="upload-form">
      <div class="toolbar">
        <el-button type="primary" plain @click="addRow">新增文件</el-button>
      </div>
      <div v-if="rows.length === 0" class="empty-tip">请先新增文件并上传。</div>
      <div v-for="(row, index) in rows" :key="row.index" class="upload-row">
        <UploadFile text="选择文件" @upload-files="(file) => onUploaded(index, file)" />
        <el-input
          v-model="row.remark"
          type="textarea"
          :rows="2"
          placeholder="请输入文件描述"
          class="remark-input"
        />
        <div class="file-name">{{ row.name || '未上传文件' }}</div>
      </div>
    </div>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" :loading="loading" @click="submit">确定上传</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.upload-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
}

.empty-tip {
  color: #909399;
}

.upload-row {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
}

.remark-input {
  margin-top: 8px;
}

.file-name {
  margin-top: 8px;
  color: #606266;
  font-size: 12px;
}
</style>
