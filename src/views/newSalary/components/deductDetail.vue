<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { ElDialog, ElTable, ElTableColumn, ElPagination } from 'element-plus'
import { getWeekSalaryDetail } from '@/api/modules/newSalary'
import { typeEnum, childTypeEnum } from '@/views/newSalary/cfg'

const emit = defineEmits<{
  goToDetail: [row: Record<string, any>]
}>()

const route = useRoute()
const isShow = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const current = ref<Record<string, any>>({})
const query = reactive({ limit: 5, page: 1 })

function handlePageChange(val: number, type: 'limit' | 'page') {
  query[type] = val
  fetchWeekSalaryDetail()
}

function show(row: Record<string, any>) {
  isShow.value = true
  current.value = row
  fetchWeekSalaryDetail()
}

function closeModal() {
  isShow.value = false
}

function goToDetail(row: Record<string, any>) {
  emit('goToDetail', row)
}

async function fetchWeekSalaryDetail() {
  const params: Record<string, any> = {
    startTime: current.value.startTime,
    endTime: current.value.endTime,
    teacId: route.query.teacId,
    accountLogId: current.value.id,
  }
  if (current.value.teacPayrollId) params.teacPayrollId = current.value.teacPayrollId
  loading.value = true
  const res = await getWeekSalaryDetail(params)
  loading.value = false
  if (res.status == 200) {
    tableData.value = res.body.list || []
    total.value = res.body.totalCount || 0
  }
}

defineExpose({ show })
</script>

<template>
  <el-dialog
    v-model="isShow"
    width="900px"
    title="扣除明细"
    :close-on-click-modal="false"
    @close="closeModal"
    append-to-body
  >
    <div class="tip">
      <span style="font-weight: 700;">共扣除<span class="total">{{ current.deductOtherWeekGb }}G</span></span>
      <i class="el-icon-warning"></i>
      <span style="color: #939393;"> 总扣除对应的工资单扣除记录</span>
    </div>
    <div v-for="item in 2" :key="item">
      <div v-if="item === 1" class="table-title">本周扣除</div>
      <div v-if="item === 2" class="table-title">其他周扣除</div>
      <el-table
        :data="item === 1 ? [current] : tableData"
        v-loading="item === 1 ? false : loading"
        border
        :header-cell-style="{ background: '#F4F4F5' }"
      >
        <el-table-column
          v-if="item === 1"
          label="订单号"
          :show-overflow-tooltip="true"
        >
          <template #default="{ row }">
            <span class="link" @click="goToDetail(row)">{{ row.orderNo }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="item === 2"
          label="工资单"
          prop="description"
        >
          <template #default="{ row }">
            <span v-html="row.description"></span>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            {{ typeEnum[row.type] }}
          </template>
        </el-table-column>
        <el-table-column label="节点" width="120">
          <template #default="{ row }">
            {{ childTypeEnum[row.childType] }}
          </template>
        </el-table-column>
        <el-table-column label="GB" width="120">
          <template #default="{ row }">
            <span :class="{ 'green-font': row.gb > 0, 'red-font': row.gb < 0 }">{{ row.gb }}</span>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="item === 1 && current.decuctLastWeek" class="red-font wait">
        结余至下周待扣除{{ current.decuctLastWeek }}
      </div>
    </div>
    <el-pagination
      v-if="tableData.length"
      class="bottom-page"
      small
      style="margin: 15px 10px 0 0; text-align: right;"
      :page-sizes="[5]"
      :current-page="query.page"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handlePageChange($event, 'limit')"
      @current-change="handlePageChange($event, 'page')"
    />
  </el-dialog>
</template>

<style scoped lang="scss">
.link {
  color: #3662ec;
  cursor: pointer;
}
.tip {
  i {
    color: #ed5a5c;
    margin-left: 5px;
  }
}
.total {
  color: red;
  font-weight: 700;
}
.table-title {
  font-weight: 700;
  margin: 10px 0;
}
.wait {
  text-align: right;
  height: 40px;
  line-height: 40px;
  font-weight: 700;
  border: 1px solid #ebeef5;
  border-top: none;
  padding-right: 20px;
}
.green-font {
  color: #67c23a;
}
.red-font {
  color: #f56c6c;
}
:deep(.el-table td),
:deep(.el-table th) {
  padding: 8px 0;
}
</style>
