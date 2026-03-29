<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { classRoomList, presenterTime } from '@/api/modules/classtable'
import { getMyInfo } from '@/api/modules/user'
import contentnull from '@/views/contentnull.vue'

const router = useRouter()

const ruleForm = reactive<any>({
  classroom: '',
  classroomName: '',
  description: '',
  times: '',
  explain: '',
  teacherType: localStorage.getItem('teacType'),
})
const ruleFormRef = ref<any>()
const btnstatus = ref(false)
const maskShow = ref(false)
const tableDataEnd = ref<any[]>([])
const currentPage = ref(0)
const total = ref(0)
const limit = ref(15)
const courseId = ref('')
const val = ref(1)
const finishedCourseLoading = ref(false)
const time = ref('')
const user = ref<any>({})
const tableDataNamet = ref('')

const search = () => {
  val.value = 1
  getTableData()
}

const getUser = async () => {
  try {
    const res: any = await getMyInfo()
    if (res.status === 200) {
      user.value = res.body || {}
      time.value = String(Number(user.value.presenterTimeLimit) - Number(user.value.presenterTimeConsume))
    }
  } catch (_e) { /* ignore */ }
}

const closeMask = () => { maskShow.value = false }

const gitetimeFun = (row: any) => {
  courseId.value = row.cdId
  ruleForm.classroom = row.id
  ruleForm.classroomName = row.name
  ruleForm.times = ''
  ruleForm.explain = ''
  maskShow.value = true
}

const seeCouse = (row: any) => {
  if (row.spoType === 64) {
    const route = router.resolve({ path: '/bigClassRoom', query: { id: row.cdId } })
    window.open(route.href)
  } else {
    const type = row.courseType === 4 ? 'wenya' : 'daobi'
    const route = router.resolve({ path: '/sellerDetail', query: { id: row.cdId, type } })
    window.open(route.href)
  }
}

const submitForm1 = () => {
  ruleFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      btnstatus.value = true
      try {
        const res: any = await presenterTime({
          classroomId: ruleForm.classroom,
          time: ruleForm.times,
          explain: ruleForm.explain,
        })
        btnstatus.value = false
        if (res.status === 200) {
          ElNotification({ title: '提示', message: res.body?.msg, type: 'success' })
          closeMask()
          getTableData()
          getUser()
        } else if (res.status === 400) {
          ElNotification({ title: '提示', message: res.body?.msg, type: 'warning' })
        }
      } catch (_e) {
        btnstatus.value = false
      }
    }
  })
}

const getTableData = async () => {
  finishedCourseLoading.value = true
  try {
    const res: any = await classRoomList({
      page: val.value,
      limit: limit.value,
      statusedArr: '8;16',
      desc: 1,
      key: tableDataNamet.value,
    })
    finishedCourseLoading.value = false
    if (res.status === 200) {
      tableDataEnd.value = res.body?.list || []
      total.value = res.body?.totalCount || 0
      currentPage.value = res.body?.currPage || 0
    }
  } catch (_e) {
    finishedCourseLoading.value = false
  }
}

const handleSizeChange = (v: number) => { limit.value = v; getTableData() }
const handleCurrentChange = (v: number) => { val.value = v; getTableData() }

onMounted(() => {
  getTableData()
  getUser()
})
</script>

<template>
  <div class="finishedCourse content-box">
    <span class="lighttext-box">本月可赠送时长{{ time }}/{{ user.presenterTimeLimit }}分钟</span>
    <div class="search-box">
      <el-input size="small" placeholder="请输入关键词搜索" prefix-icon="Search" v-model="tableDataNamet" @keyup.enter="search" />
      <button class="defaultlight-btn" @click="search">搜索</button>
    </div>
    <div v-loading="finishedCourseLoading">
      <el-table
        stripe
        border
        v-if="tableDataEnd.length > 0"
        :header-cell-style="{ height: '36px', color: '#999999', fontWeight: '400', background: '#F3F3F3' }"
        :row-style="{ height: '36px' }"
        :cell-style="{ padding: '5px 0' }"
        :data="tableDataEnd"
        class="table"
        height="calc(100vh - 200px)"
      >
        <el-table-column label="订单号" width="300" align="left" show-overflow-tooltip>
          <template #default="scope">
            <span class="cursorpointer" @click="seeCouse(scope.row)">{{ scope.row.orderNo }}</span>
          </template>
        </el-table-column>
        <el-table-column label="课堂说明" align="center" width="150" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.description }}</template>
        </el-table-column>
        <el-table-column label="课堂名称" align="center" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.name }}</template>
        </el-table-column>
        <el-table-column label="上课时间" align="center" width="200" show-overflow-tooltip>
          <template #default="scope">
            <div class="time-box">
              <div><span>Start：</span>{{ scope.row.startTime }}</div>
              <div><span>End：</span>{{ scope.row.endTime }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="上课时长(min)" align="center" width="115" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.schooltime }}</template>
        </el-table-column>
        <el-table-column label="所获G币" align="center" width="85" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.teacG }}</template>
        </el-table-column>
        <el-table-column label="所获OTG币" v-if="ruleForm.teacherType != '2'" align="center" width="100" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.teacOtg }}</template>
        </el-table-column>
        <el-table-column label="好评G" align="center" width="85" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.praiseGb || '--' }}</template>
        </el-table-column>
        <el-table-column label="赠送时长" width="150" align="center" show-overflow-tooltip>
          <template #default="scope">
            <span class="finshedgive-boxs" v-if="scope.row.spoType != 66 && scope.row.spoType != 32 && scope.row.spoType != 64">
              <button class="default-btn" style="width: 60px" @click="gitetimeFun(scope.row)">赠送</button>
              <el-tag size="small" v-if="scope.row.presenterTime > 0">{{ scope.row.presenterTime }}min</el-tag>
            </span>
            <span v-else>--</span>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="margin-top: 15px; float: right"
        v-if="tableDataEnd.length > 0"
        :current-page="currentPage"
        :page-sizes="[15, 20]"
        :page-size="limit"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
      <contentnull v-if="!tableDataEnd.length" :statuscode="tableDataNamet ? 3 : 2" />
    </div>

    <div class="new-mask" v-if="maskShow">
      <div class="mask-content mask-width560">
        <h3>赠送时长 <b @click="closeMask">+</b></h3>
        <el-form ref="ruleFormRef" :model="ruleForm" class="demo-ruleForm">
          <div class="dis-flex">
            <label class="cinput-label">选择课堂</label>
            <el-form-item prop="classroomName">
              <el-input v-model="ruleForm.classroomName" disabled style="width: 340px !important; height: 36px" />
            </el-form-item>
          </div>
          <div class="dis-flex">
            <label class="cinput-label">赠送时长</label>
            <el-form-item prop="times" class="commnon-por">
              <input v-model="ruleForm.times" type="number" class="cinput-textarea" style="width: 340px !important; height: 36px" />
              <span class="common-danwei">min</span>
            </el-form-item>
          </div>
          <div class="dis-flex">
            <label class="cinput-label">赠送说明</label>
            <el-form-item prop="explain">
              <textarea v-model="ruleForm.explain" class="cinput-textarea" />
            </el-form-item>
          </div>
        </el-form>
        <div class="btnbox">
          <button class="defaultlight-btn btn-width320" :disabled="btnstatus" @click="submitForm1">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.finishedCourse { .el-tag { border-radius: 6px !important; } }
.finshedgive-boxs { display: block; width: 100%; button { float: left; } }
.time-box { line-height: 20px; text-align: left; > div span { display: inline-block; width: 35px; } }
.content-box { width: 1280px; margin: 0 auto; padding: 50px 0; position: relative; }
.search-box { position: absolute; right: 0; top: 40px; .el-input { width: 200px; } }
.table { width: 100%; margin-top: 10px; }
.cursorpointer { cursor: pointer; color: #409eff; }
.new-mask { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center; }
.mask-content { background: #fff; border-radius: 8px; padding: 20px; h3 { display: flex; justify-content: space-between; b { cursor: pointer; transform: rotate(45deg); } } }
.dis-flex { display: flex; align-items: center; margin-bottom: 10px; }
.cinput-label { width: 80px; text-align: right; margin-right: 10px; }
.cinput-textarea { border: 1px solid #dcdfe6; border-radius: 4px; padding: 4px 8px; }
.commnon-por { position: relative; }
.common-danwei { margin-left: 5px; }
.btnbox { text-align: center; margin-top: 20px; }
.defaultlight-btn { background: #f4801f; color: #fff; border: none; padding: 8px 20px; border-radius: 4px; cursor: pointer; }
</style>
