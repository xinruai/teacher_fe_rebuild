<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElNotification } from 'element-plus'
import { classRoomList, finishClassroom } from '@/api/modules/classtable'
import { cancelClassroom, updateOrderClassroom } from '@/api/modules/order'
import { RequestUrl } from '@/api/config'

const router = useRouter()

const onCourseLoading = ref(false)
const tableDataEnd = ref<any[]>([])
const tableDataName = ref('')
const currentPage = ref(0)
const total = ref(0)
const limit = ref(15)
const val = ref(1)
const modal = ref(false)
const courseId = ref('')
const cdId = ref('')
const ruleFormRef = ref<any>()
const ruleForm = reactive({ title: '', course_time: '' as any, description: '' })
const rules = {
  title: [{ required: true, message: '请填写课程标题', trigger: 'blur' }],
  course_time: [{ required: true, message: '请选择排课时间', trigger: 'change' }],
  description: [{ required: true, message: '请填写课程详情', trigger: 'blur' }],
}

const search = () => { val.value = 1; getTableData() }

const getTableData = async () => {
  onCourseLoading.value = true
  try {
    const res: any = await classRoomList({ page: val.value, limit: limit.value, statusedArr: '1;2;4;32', key: tableDataName.value })
    onCourseLoading.value = false
    if (res.status === 200) {
      tableDataEnd.value = res.body?.list || []
      total.value = res.body?.totalCount || 0
      currentPage.value = res.body?.currPage || 0
    }
  } catch (_e) { onCourseLoading.value = false }
}

const apply = (row: any) => {
  modal.value = true; courseId.value = row.id; cdId.value = row.cdId
  ruleForm.title = row.name; ruleForm.description = row.description
  ruleForm.course_time = [row.startTime, row.endTime]
}

const cancel = async (row: any) => {
  try {
    await ElMessageBox.confirm('是否要取消排课?', '提示', { type: 'warning' })
    const res: any = await cancelClassroom({ classroomId: row.id })
    ElNotification({ title: '提示', message: res.body?.msg, type: res.status === 200 ? 'success' : 'warning' })
    getTableData()
  } catch (_e) { /* cancelled */ }
}

const sees = (row: any) => {
  if (row.spoType === 64) {
    window.open(router.resolve({ path: '/bigClassRoom', query: { id: row.cdId } }).href)
  } else {
    const type = row.courseType === 4 ? 'wenya' : 'daobi'
    window.open(router.resolve({ path: '/sellerDetail', query: { id: row.courseId, type } }).href)
  }
}

const in_classroom = (row: any) => {
  const code = window.localStorage.getItem('teactoken') || ''
  let c = String.fromCharCode(code.charCodeAt(0) + code.length)
  for (let i = 1; i < code.length; i++) {
    c += String.fromCharCode(code.charCodeAt(i) + code.charCodeAt(i - 1))
  }
  window.open(RequestUrl + 'static-resource/tkcloud/giveLessons.html?classroomId=' + row.id + '&iden=teac&tk=' + escape(c))
}

const end_classroom = async (row: any) => {
  try {
    await ElMessageBox.confirm('是否要结束课堂?', '提示', { type: 'warning' })
    const res: any = await finishClassroom({ classroomId: row.id })
    ElNotification({ title: '提示', message: res.body?.msg, type: res.status === 200 ? 'success' : 'warning' })
    getTableData()
  } catch (_e) { /* cancelled */ }
}

const submitForm = () => {
  ruleFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      const res: any = await updateOrderClassroom({
        id: courseId.value, name: ruleForm.title, cdId: cdId.value,
        startTime: ruleForm.course_time[0], endTime: ruleForm.course_time[1], description: ruleForm.description,
      })
      ElNotification({ title: '提示', message: res.body?.msg, type: res.status === 200 ? 'success' : 'warning' })
      modal.value = false; getTableData()
    }
  })
}

const handleSizeChange = (v: number) => { limit.value = v; getTableData() }
const handleCurrentChange = (v: number) => { val.value = v; getTableData() }

onMounted(() => { getTableData() })
</script>

<template>
  <div class="onCourse">
    <div v-loading="onCourseLoading">
      <el-input v-model="tableDataName" placeholder="请输入姓名" style="width: 240px" @keyup.enter="search" />
      <el-button type="primary" @click="search">搜索</el-button>
      <el-table :data="tableDataEnd" border style="width: 100%; margin-top: 5px">
        <el-table-column label="订单号">
          <template #default="scope">
            <span style="color: #409eff; cursor: pointer" @click="sees(scope.row)">{{ scope.row.orderNo }}</span>
          </template>
        </el-table-column>
        <el-table-column label="课堂名称" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.name }}</template>
        </el-table-column>
        <el-table-column label="课堂说明" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.description }}</template>
        </el-table-column>
        <el-table-column label="上课时间" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.startTime }} - {{ scope.row.endTime }}</template>
        </el-table-column>
        <el-table-column label="课堂状态" width="160" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.statused === 1" type="success">待确认课堂</el-tag>
            <el-tag v-if="scope.row.statused === 2" type="danger">已确认</el-tag>
            <el-tag v-if="scope.row.statused === 4" type="warning">正在上课</el-tag>
            <el-tag v-if="scope.row.statused === 8" type="info">已结束</el-tag>
            <el-tag v-if="scope.row.statused === 16">已取消</el-tag>
            <el-tag v-if="scope.row.statused === 32">取消排课中</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-dropdown trigger="click">
              <span style="cursor: pointer; color: #409eff">下拉操作<i class="el-icon-arrow-down el-icon--right" /></span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="scope.row.statused === 1" @click="apply(scope.row)">编辑课堂</el-dropdown-item>
                  <el-dropdown-item v-if="[16,2,4,8,32].includes(scope.row.statused)" disabled>编辑课堂</el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.spoType !== 64 && scope.row.statused !== 2" @click="cancel(scope.row)">取消排课</el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.spoType === 64 && scope.row.statused === 2" disabled>取消排课</el-dropdown-item>
                  <el-dropdown-item v-if="[4,2,32].includes(scope.row.statused)" @click="in_classroom(scope.row)">进入课堂</el-dropdown-item>
                  <el-dropdown-item v-if="[8,16,1].includes(scope.row.statused)" disabled>进入课堂</el-dropdown-item>
                  <el-dropdown-item v-if="[8,16,1].includes(scope.row.statused)" disabled>结束课堂</el-dropdown-item>
                  <el-dropdown-item v-if="[4,2,32].includes(scope.row.statused)" @click="end_classroom(scope.row)">结束课堂</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog v-model="modal" width="50%">
        <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="100px">
          <el-form-item label="课程名称" prop="title"><el-input v-model="ruleForm.title" /></el-form-item>
          <el-form-item label="排课时间" prop="course_time">
            <el-date-picker v-model="ruleForm.course_time" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" format="YYYY-MM-DD HH:mm:ss" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
          </el-form-item>
          <el-form-item label="课程描述" prop="description"><el-input v-model="ruleForm.description" /></el-form-item>
        </el-form>
        <template #footer><el-button type="primary" @click="submitForm">确 定</el-button></template>
      </el-dialog>

      <el-pagination style="margin-top: 15px" :current-page="currentPage" :page-sizes="[15,20]" :page-size="limit" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<style scoped>
.onCourse { padding: 10px; margin-top: 50px; }
</style>
