<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElNotification } from 'element-plus'
import { putClassroom, queryClassroomsByCourseId } from '@/api/modules/order'
import { classRoomList, presenterTime } from '@/api/modules/classtable'
import { OrderStatus } from '@/utils/orderdetialVEnum'
import request from '@/api/request'

const router = useRouter()

const loadingCourse = ref(false)
const tableDataEnd = ref<any[]>([])
const tableDataName = ref('')
const currentPage = ref(0)
const total = ref(0)
const limit = ref(15)
const val = ref(1)
const courseId = ref('')

// Schedule course dialog
const modal = ref(false)
const btnstatus = ref(false)
const ruleFormRef = ref<any>()
const ruleForm = reactive({
  title: '', value1: '', value2: '', description: '',
  classroom: '', times: '', explain: '',
})
const rules = {
  title: [{ required: true, message: '请填写课程标题', trigger: 'blur' }],
  value1: [{ required: true, message: '请选择排课时间', trigger: 'change' }],
  value2: [{ required: true, message: '请选择排课时间', trigger: 'change' }],
  description: [{ required: true, message: '请填写课程详情', trigger: 'blur' }],
  times: [{ required: true, message: '请填写赠送时长', trigger: 'blur' }],
  classroom: [{ required: true, message: '请选择课堂', trigger: 'blur' }],
  explain: [{ required: true, message: '请填写赠送说明', trigger: 'blur' }],
}

// Gift time dialog
const modal_time = ref(false)
const classrooms = ref<any[]>([])

const search = () => { val.value = 1; getTableData() }

const getTableData = async () => {
  loadingCourse.value = true
  try {
    const res: any = await request({ url: '/order/list', method: 'get', params: { page: val.value, limit: limit.value, statused: 15, key: tableDataName.value } })
    loadingCourse.value = false
    if (res.status === 200) {
      tableDataEnd.value = res.body?.list || []
      total.value = res.body?.totalCount || 0
      currentPage.value = res.body?.currPage || 0
    }
  } catch (_e) { loadingCourse.value = false }
}

const see = (row: any) => {
  if (row.spoType === 64) {
    window.open(router.resolve({ path: '/bigClassRoom', query: { id: row.courseId } }).href)
  } else {
    const type = row.courseType === 4 ? 'wenya' : 'daobi'
    window.open(router.resolve({ path: '/sellerDetail', query: { id: row.courseId, type } }).href)
  }
}

const apply = (row: any) => {
  modal.value = true
  ruleForm.title = ''; ruleForm.value1 = ''; ruleForm.value2 = ''; ruleForm.description = ''
  courseId.value = row.courseId
}

const submitForm = () => {
  ruleFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    if (ruleForm.value1 >= ruleForm.value2) {
      ElNotification({ title: '提示', message: '开始时间不能大于结束时间', type: 'warning' })
      return
    }
    const diff = (new Date(ruleForm.value2).getTime() - new Date(ruleForm.value1).getTime()) / (1000 * 60)
    if (diff < 30) {
      ElNotification({ title: '提示', message: '时间相差必须30分钟', type: 'warning' })
      return
    }
    btnstatus.value = true
    const res: any = await putClassroom({
      cdId: courseId.value, name: ruleForm.title,
      startTime: ruleForm.value1 + ':00', endTime: ruleForm.value2 + ':00',
      description: ruleForm.description, roomType: 1,
    })
    btnstatus.value = false
    if (res.status === 200) {
      ElNotification({ title: '提示', message: res.body?.msg, type: 'success' })
      modal.value = false
    } else {
      ElNotification({ title: '提示', message: res.body?.msg, type: 'warning' })
    }
  })
}

const give_time = async (row: any) => {
  ruleForm.classroom = ''; ruleForm.times = ''; ruleForm.explain = ''
  modal_time.value = true; courseId.value = row.courseId
  const res: any = await queryClassroomsByCourseId({ courseId: row.courseId, status: 14 })
  if (res.status === 200) classrooms.value = res.body?.list || []
}

const submitForm1 = () => {
  ruleFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    btnstatus.value = true
    const res: any = await presenterTime({ classroomId: ruleForm.classroom, time: Number(ruleForm.times), explain: ruleForm.explain })
    btnstatus.value = false
    if (res.status === 200) {
      ElNotification({ title: '提示', message: res.body?.msg, type: 'success' })
      modal.value = false; modal_time.value = false
    } else {
      ElNotification({ title: '提示', message: res.body?.msg, type: 'warning' })
    }
  })
}

const noapply = async (row: any) => {
  try {
    await ElMessageBox.confirm('是否要确认结课?', '提示', { type: 'warning' })
    const res: any = await request({ url: '/order/applyFinishCourse', method: 'post', data: { courseId: row.courseId } })
    if (res.status === 200) {
      ElNotification({ title: '提示', message: '您已提交了结课申请，请等待师资主管审核', type: 'success' })
      getTableData()
    } else {
      ElNotification({ title: '提示', message: res.body?.msg, type: 'warning' })
    }
  } catch (_e) { /* cancelled */ }
}

const uploadDropbox = (row: any) => {
  // Original uses plupload+jQuery for file upload. In Vue 3, we redirect to detail page.
  see(row)
}

const handleSizeChange = (v: number) => { limit.value = v; getTableData() }
const handleCurrentChange = (v: number) => { val.value = v; getTableData() }

onMounted(() => { getTableData() })
</script>

<template>
  <div class="myCourse">
    <div v-loading="loadingCourse">
      <el-input v-model="tableDataName" placeholder="请输入姓名" style="width: 240px" @keyup.enter="search" />
      <el-button type="primary" @click="search">搜索</el-button>
      <el-table :data="tableDataEnd" border style="width: 100%; margin-top: 5px">
        <el-table-column label="订单号" align="center">
          <template #default="scope">
            <span style="color: #409eff; cursor: pointer" @click="see(scope.row)">{{ scope.row.orderNo }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总上课时长(min)" align="center" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.allSchooltime }}</template>
        </el-table-column>
        <el-table-column label="总赠送时长(min)" align="center" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.allPresenterTime }}</template>
        </el-table-column>
        <el-table-column label="订单状态" show-overflow-tooltip align="center">
          <template #default="scope">
            <el-tag>{{ OrderStatus[scope.row.courseStatus] || '未知状态' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="400">
          <template #default="scope">
            <el-button v-if="scope.row.statused <= 2 && (scope.row.spoType === 0 || scope.row.spoType === 1)" size="small" @click="apply(scope.row)">排课</el-button>
            <el-button v-if="(scope.row.statused >= 1 || scope.row.spoType > 1) && scope.row.spoType !== 64 && scope.row.statused !== 4" size="small" @click="noapply(scope.row)">申请结课</el-button>
            <el-button v-if="(scope.row.statused < 1 && scope.row.spoType <= 1) || scope.row.spoType === 64 || scope.row.statused === 4" size="small" disabled>申请结课</el-button>
            <el-button v-if="scope.row.statused >= 2 && scope.row.statused <= 8 && scope.row.spoType !== 64" size="small" @click="give_time(scope.row)">赠送时长</el-button>
            <el-button v-if="scope.row.statused < 2 || scope.row.statused > 8 || scope.row.spoType === 64" size="small" disabled>赠送时长</el-button>
            <el-button size="small" @click="uploadDropbox(scope.row)">提交作业</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Schedule course dialog -->
      <el-dialog v-model="modal" width="50%">
        <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="100px">
          <el-form-item label="课堂名称" prop="title"><el-input v-model="ruleForm.title" /></el-form-item>
          <el-form-item label="开始时间" prop="value1">
            <el-date-picker v-model="ruleForm.value1" type="datetime" value-format="YYYY-MM-DD HH:mm" placeholder="开始日期" />
          </el-form-item>
          <el-form-item label="结束时间" prop="value2">
            <el-date-picker v-model="ruleForm.value2" type="datetime" value-format="YYYY-MM-DD HH:mm" placeholder="结束日期" />
          </el-form-item>
          <el-form-item label="课堂描述" prop="description"><el-input v-model="ruleForm.description" /></el-form-item>
        </el-form>
        <template #footer><el-button type="primary" :loading="btnstatus" @click="submitForm">确 定</el-button></template>
      </el-dialog>

      <!-- Gift time dialog -->
      <el-dialog v-model="modal_time" width="50%">
        <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="100px">
          <el-form-item label="选择课堂" prop="classroom">
            <el-select v-model="ruleForm.classroom" placeholder="请选择课堂">
              <el-option v-for="item in classrooms" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="赠送时长" prop="times">
            <el-input v-model="ruleForm.times" type="number" style="width: 220px; margin-right: 10px" />
            <span>MIN</span>
          </el-form-item>
          <el-form-item label="赠送说明" prop="explain"><el-input v-model="ruleForm.explain" /></el-form-item>
        </el-form>
        <template #footer><el-button type="primary" :loading="btnstatus" @click="submitForm1">确 定</el-button></template>
      </el-dialog>

      <el-pagination style="margin-top: 15px" :current-page="currentPage" :page-sizes="[15, 20]" :page-size="limit" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<style scoped>
.myCourse { padding: 10px; margin-top: 50px; }
</style>
