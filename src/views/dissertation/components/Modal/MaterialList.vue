<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { delete_id, queryfile_stageclass } from '@/api/modules/paper'
import { ClassFileType2Val } from '../../cfg/Table'
import { useDissertationStore } from '@/stores/dissertation'

interface QueryParams {
  courseId: string | number
  stageClassId: string | number
}

interface MaterialFile {
  id?: string | number
  fileId?: string | number
  name?: string
  fileName?: string
  url?: string
  fileUrl?: string
  createAt?: string
  createTime?: string
  remark?: string
  stageClassFileType?: number
}

const dissertationStore = useDissertationStore()
const visible = ref(false)
const loading = ref(false)
const params = ref<QueryParams | null>(null)
const fileList = ref<MaterialFile[]>([])
const deletedCount = ref(0)

const groupedEntries = computed(() => {
  const grouped = fileList.value.reduce<Record<number, MaterialFile[]>>((acc, cur) => {
    const type = Number(cur.stageClassFileType || 0)
    if (!acc[type]) acc[type] = []
    acc[type].push(cur)
    return acc
  }, {})
  return Object.entries(grouped).sort((a, b) => Number(a[0]) - Number(b[0]))
})

function getFileId(file: MaterialFile): string | number | undefined {
  return file.id ?? file.fileId
}

function getFileName(file: MaterialFile): string {
  return file.name || file.fileName || '--'
}

function getFileUrl(file: MaterialFile): string {
  return file.url || file.fileUrl || ''
}

function getCreateTime(file: MaterialFile): string {
  const value = file.createAt || file.createTime
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '--'
}

async function fetchList() {
  if (!params.value) return
  loading.value = true
  try {
    const res: any = await queryfile_stageclass({
      courseId: params.value.courseId,
      stageClassId: params.value.stageClassId,
    })
    if (res.status === 200) {
      fileList.value = Array.isArray(res.body) ? res.body : (res.body?.list || [])
    } else {
      fileList.value = []
    }
  } finally {
    loading.value = false
  }
}

function preview(file: MaterialFile) {
  const url = getFileUrl(file)
  if (!url) {
    ElMessage.warning('文件地址为空，无法预览')
    return
  }
  window.open(url)
}

async function remove(file: MaterialFile) {
  const id = getFileId(file)
  if (!id) {
    ElMessage.warning('文件ID缺失，无法删除')
    return
  }
  try {
    await ElMessageBox.confirm('确认删除该文件？', '提示', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  const res: any = await delete_id(id)
  if (res.status === 200) {
    deletedCount.value += 1
    ElMessage.success('删除成功')
    fetchList()
  }
}

function close() {
  visible.value = false
  if (deletedCount.value > 0) {
    dissertationStore.reload()
  }
}

async function show(nextParams: QueryParams) {
  deletedCount.value = 0
  params.value = nextParams
  visible.value = true
  await fetchList()
}

defineExpose({ show })
</script>

<template>
  <el-dialog
    v-model="visible"
    title="文件材料列表"
    width="760px"
    :close-on-click-modal="false"
    @close="close"
  >
    <div v-loading="loading">
      <div v-if="groupedEntries.length === 0" class="empty-text">暂无文件</div>
      <div v-for="[typeKey, files] in groupedEntries" :key="typeKey" class="group-block">
        <div class="group-title">{{ ClassFileType2Val[Number(typeKey)] || '其他' }}文件</div>
        <el-table :data="files" border>
          <el-table-column label="文件名" min-width="220">
            <template #default="{ row }">
              <el-button type="primary" link @click="preview(row)">{{ getFileName(row) }}</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="180" />
          <el-table-column label="上传时间" min-width="180">
            <template #default="{ row }">{{ getCreateTime(row) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="90" align="center">
            <template #default="{ row }">
              <el-button type="danger" link @click="remove(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.group-block + .group-block {
  margin-top: 14px;
}

.group-title {
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
}

.empty-text {
  color: #909399;
  text-align: center;
  padding: 24px 0;
}
</style>
