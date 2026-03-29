<script setup lang="ts">
import { ref } from 'vue'
import totalMoney from '@/views/newSalary/components/totalMoney.vue'
import salaryRulesDesc from '@/views/newSalary/components/salaryRulesDesc.vue'
import salaryList from '@/views/newSalary/components/salaryList.vue'
import tableContent from '@/views/newSalary/components/tableContent.vue'

const totalMoneyRef = ref<InstanceType<typeof totalMoney>>()
const salaryListRef = ref<InstanceType<typeof salaryList>>()
const tableContentRef = ref<InstanceType<typeof tableContent>>()

let refreshData: Record<string, any> = {}

function getStatus(val: number, row: any = '') {
  salaryListRef.value?.init(val, row)
}

function selectSalary(val: Record<string, any>) {
  tableContentRef.value?.init(val)
  tableContentRef.value?.getType(salaryListRef.value?.query.type === '1' ? 1 : 2)
}

function getRefreshData(data: Record<string, any>) {
  refreshData = data
}

function refresh() {
  totalMoneyRef.value?.init(refreshData)
}
</script>

<template>
  <div class="new-salary">
    <div class="page-content">
      <div class="top-area">
        <totalMoney ref="totalMoneyRef" @getStatus="getStatus" />
        <salaryRulesDesc />
      </div>
      <div class="content-area">
        <salaryList
          class="salary-list"
          ref="salaryListRef"
          @selectSalary="selectSalary"
        />
        <tableContent
          class="table-content"
          ref="tableContentRef"
          @getRefreshData="getRefreshData"
          @refresh="refresh"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.new-salary {
  padding: 20px 30px;
  width: 100vw;
  height: 100%;
  overflow: auto;
  .page-content {
    min-width: 1220px;
    width: 100%;
  }
  :deep(.item-title) {
    font-weight: 700;
    margin: 10px 0;
    color: #3d3d3d;
    font-size: 20px;
  }
  .area-item {
    font-weight: 700;
  }
}
.top-area {
  display: flex;
  border-bottom: 1px solid #d8d8d8;
  padding-bottom: 24px;
  justify-content: space-between;
  > div {
    flex: 1;
  }
}
.content-area {
  display: flex;
  .salary-list {
    padding-top: 10px;
    width: 260px;
    box-shadow: 8px 0 10px -10px rgba(0, 0, 0, 0.5);
    :deep(.item-title) {
      margin-bottom: 20px;
    }
  }
  .table-content {
    width: calc(100% - 260px);
    padding: 20px 0px 20px 30px;
    background: #fbfbfb;
  }
}
</style>
