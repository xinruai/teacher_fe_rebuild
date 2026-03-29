<script setup lang="ts">
import { ref, reactive } from 'vue'
import { getComplatedOrder } from '@/api/modules/order'
import moneyDetail from '@/views/account/newHome/moneyDetail.vue'

const props = defineProps<{
  tableDataName?: string
}>()

const emit = defineEmits<{
  (e: 'seeDetail', row: any): void
}>()

const moneyDetailRef = ref<InstanceType<typeof moneyDetail>>()
const tableData = ref<any[]>([])
const total = ref(0)
const query = reactive({ limit: 20, page: 1 })
const loading = ref(false)

const changePage = (event: number, type: 'page' | 'limit') => {
  query[type] = event
  fetchComplatedOrder()
}

const fetchComplatedOrder = async () => {
  const params = {
    page: query.page,
    limit: query.limit,
    statused: 48,
    key: props.tableDataName || '',
  }
  loading.value = true
  const res: any = await getComplatedOrder(params)
  loading.value = false
  if (res.status === 200) {
    tableData.value = res.body?.list || []
    total.value = res.body?.totalCount || 0
  }
}

const tableCellClassName = ({ column }: any) => {
  return column.property === 'orderType' ? 'orderType-column' : ''
}

const search = () => {
  changePage(1, 'page')
}

const showTypeModal = (type: string, row: any) => {
  row = JSON.parse(JSON.stringify(row))
  if (type === 'moneyDetail') row.id = row.courseId
  moneyDetailRef.value?.show({ ...row, type: 2 })
}

defineExpose({ search, getComplatedOrder: fetchComplatedOrder })
</script>

<template>
  <div>
    <el-table
      height="calc(100vh - 300px)"
      :data="tableData"
      v-loading="loading"
      :cell-class-name="tableCellClassName"
    >
      <el-table-column width="30" prop="orderType">
        <template #default="scope">
          <span class="b-tag" v-if="scope.row.borderType">B端</span>
        </template>
      </el-table-column>
      <el-table-column label="Order Number" prop="orderNumber">
        <template #default="scope">
          <span @click="emit('seeDetail', scope.row)" class="order-no">{{ scope.row.orderNo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="已收入G" prop="teacG" width="200" />
      <el-table-column label="Action" width="200">
        <template #default="scope">
          <div class="oper-btn" @click="showTypeModal('moneyDetail', scope.row)">查看收入明细</div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="pager"
      v-if="total"
      :current-page="query.page"
      :page-sizes="[10, 20, 50]"
      :page-size="query.limit"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="changePage($event, 'limit')"
      @current-change="changePage($event, 'page')"
    />
    <moneyDetail ref="moneyDetailRef" />
  </div>
</template>

<style scoped lang="scss">
.oper-btn { color: #60b1ff; cursor: pointer; }
:deep(th) {
  .cell { color: #848486 !important; font-weight: 400; }
}
.order-no { cursor: pointer; text-decoration: underline; }
:deep(.orderType-column) {
  .cell { padding: 0; }
}
.b-tag {
  color: #db6767; background: #fed6d3;
  font-size: 12px; padding: 0px 3px; border-radius: 3px;
}
.pager { float: right; margin-top: 20px; }
</style>
