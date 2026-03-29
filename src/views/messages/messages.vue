<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/api/request'

const tableDataName = ref('')
const tableDataEnd = ref<any[]>([])
const currentPage = ref(0)
const total = ref(0)
const limit = ref(6)
const val = ref(1)
const messageLoading = ref(false)

function search() {
  val.value = 1
  getTableData()
}

async function getTableData() {
  messageLoading.value = true
  try {
    const r: any = await request({
      url: '/notify/list',
      method: 'get',
      params: {
        page: val.value,
        limit: limit.value,
        statused: 1,
        key: tableDataName.value,
      },
    })
    tableDataEnd.value = r.body.list
    total.value = r.body.totalCount
    currentPage.value = r.body.currPage
  } finally {
    messageLoading.value = false
  }
}

function handleSizeChange(size: number) {
  limit.value = size
  getTableData()
}

function handleCurrentChange(page: number) {
  val.value = page
  getTableData()
}

onMounted(() => {
  getTableData()
})
</script>

<template>
  <div class="message">
    <div v-loading="messageLoading">
      <el-input v-model="tableDataName" placeholder="请输入姓名" style="width: 240px" />
      <el-button type="primary" @click="search">搜索</el-button>
      <el-table :data="tableDataEnd" border style="width: 100%; margin-top: 5px">
        <el-table-column label="id" width="50">
          <template #default="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="消息标题" align="center">
          <template #default="scope">
            <span>{{ scope.row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column label="消息描述" align="center">
          <template #default="scope">
            <span>{{ scope.row.description }}</span>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 15px"
        :current-page="currentPage"
        :page-sizes="[15, 20]"
        :page-size="limit"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<style scoped>
.message {
  padding: 10px;
  margin-top: 50px;
}
</style>
