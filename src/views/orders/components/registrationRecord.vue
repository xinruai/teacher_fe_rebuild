<script setup lang="ts">
import { ref } from 'vue'
import dayjs from 'dayjs'
import { queryEnrollmentOrders } from '@/api/modules/order'
import { getLocal } from '@/utils/auth'

const isShow = ref(false)
const tableData = ref<any[]>([])

async function show() {
  isShow.value = true
  const res = await queryEnrollmentOrders({
    teacId: getLocal('teacinfo').id,
  })
  if (res.status == 200) {
    tableData.value = res.body || []
  }
}

function formatTime(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

defineExpose({ show })
</script>

<template>
  <div>
    <el-dialog v-model="isShow" title="报名记录" width="840px" :close-on-click-modal="false">
      <template #header>
        <div class="dialog-title">
          <p>报名记录</p>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="orderNo" :show-overflow-tooltip="true" label="" />
        <el-table-column prop="createTime" label="" width="180">
          <template #default="scope">
            <span style="color: #adb3bc;">
              <i class="el-icon-time" style="color: #adb3bc; margin-right: 4px;"></i>
              {{ formatTime(scope.row.createTime) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="statusName" label="" width="120">
          <template #default="scope">
            <span style="color: #508ff6;" v-if="scope.row.statusName == '报名审核中'">{{ scope.row.statusName }}</span>
            <span style="color: #adb3bc;" v-else>
              {{ scope.row.statusName }}
              <el-tooltip class="item" effect="dark" :content="scope.row.remark" placement="top">
                <i class="el-icon-warning-outline" style="color: #adb3bc; transform: rotate(180deg);"></i>
              </el-tooltip>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.dialog-title {
  p:first-child {
    font-weight: 700;
    font-size: 18px;
    margin-bottom: 4px;
    text-align: center;
  }
}
:deep(.el-dialog) {
  border-radius: 10px;
  .el-dialog__header {
    padding: 30px 70px 0px;
  }
  .el-dialog__body {
    padding: 0px 70px 40px 70px;
  }
}
</style>
