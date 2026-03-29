<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ElDialog, ElInput, ElButton, ElTable, ElTableColumn,
  ElPagination, ElForm, ElFormItem, ElCheckbox, ElNotification,
} from 'element-plus'
import { getAppealList, postAppeal } from '@/api/modules/newSalary'
import { goToOrderDetail } from '@/utils/common'
import { childTypeEnum } from '@/views/newSalary/cfg'
import { getLocal } from '@/utils/auth'
import uploadFile from '@/views/account/newHome/uploadFile.vue'
import fileListComp from '@/views/account/newHome/fileList.vue'

const route = useRoute()
const router = useRouter()

const isShow = ref(false)
const form = ref<Record<string, any>>({})
const tableData = ref<any[]>([])
const total = ref(0)
const query = reactive({ page: 1, limit: 5 })
const loading = ref(false)
const btnLoading = ref(false)
const fileList = ref<Array<{ name: string; url: string }>>([])
const singleTable = ref<InstanceType<typeof ElTable>>()
const formRef = ref<InstanceType<typeof ElForm>>()

const appealStatusedEnum: Record<number, string> = {
  0: '未申请',
  1: '已申请',
  2: '已返还',
  3: '已驳回',
}

function show() {
  isShow.value = true
  fileList.value = []
  getList()
}

function closeModal() {
  isShow.value = false
  btnLoading.value = false
  loading.value = false
  form.value = {}
}

function search() {
  query.page = 1
  getList()
}

function uploadFiles(file: { name: string; url: string }) {
  fileList.value.push(file)
}

async function getList() {
  loading.value = true
  const params: Record<string, any> = {
    teacId: route.query.teacId || (getLocal('teacinfo') as any)?.id,
    ...query,
  }
  if (form.value.orderNo) params.orderNo = form.value.orderNo
  const res = await getAppealList(params)
  loading.value = false
  if (res.status == 200) {
    tableData.value = (res.body.list || []).map((v: any) => ({ ...v, checked: false }))
    total.value = res.body.totalCount || 0
    singleTable.value?.doLayout()
  }
}

function confirm() {
  formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      const select = tableData.value.find(v => v.checked)
      if (!select) {
        ElNotification.warning('请先选择要申诉的数据')
        return
      }
      const params: Record<string, any> = {
        ids: [select.id],
        appealDescription: form.value.appealDescription,
      }
      if (fileList.value.length) {
        params.fileJson = fileList.value.map(v => ({
          fileName: v.name,
          fileUrl: v.url,
        }))
      }
      btnLoading.value = true
      const res = await postAppeal(params)
      btnLoading.value = false
      if (res.status == 200) {
        ElNotification.success('提交申请成功')
        closeModal()
      }
    }
  })
}

function handlePageChange(val: number, type: 'page' | 'limit') {
  query[type] = val
  getList()
}

function changeSelect(_row: any, index: number) {
  tableData.value.forEach((v, i) => {
    if (index !== i) v.checked = false
  })
}

function goToDetail(row: Record<string, any>) {
  goToOrderDetail(row, router)
}

defineExpose({ show })
</script>

<template>
  <el-dialog
    v-model="isShow"
    width="1043px"
    title="申诉"
    :close-on-click-modal="false"
    @close="closeModal"
    append-to-body
  >
    <div class="tip"><i class="el-icon-warning"></i>请勾选需要申诉的考勤扣除后填写原因说明（每次仅可申诉一条）</div>
    <el-input
      v-model="form.orderNo"
      clearable
      style="width: 230px"
      placeholder="订单号搜索"
      size="small"
    />
    <el-button type="primary" size="small" @click="search">搜索</el-button>
    <el-table
      ref="singleTable"
      :data="tableData"
      v-loading="loading"
      border
      :header-cell-style="{ background: '#F4F4F5' }"
    >
      <el-table-column width="40">
        <template #default="{ row, $index }">
          <el-checkbox
            v-model="tableData[$index].checked"
            @change="changeSelect(row, $index)"
            :disabled="![0].includes(row.appealStatused)"
          />
        </template>
      </el-table-column>
      <el-table-column label="订单号" width="300" :show-overflow-tooltip="true">
        <template #default="{ row }">
          <span class="link" @click="goToDetail(row)">{{ row.orderNo }}</span>
        </template>
      </el-table-column>
      <el-table-column property="createTime" label="发生时间" width="160" />
      <el-table-column label="状态">
        <template #default="{ row }">
          {{ appealStatusedEnum[row.appealStatused] }}
        </template>
      </el-table-column>
      <el-table-column property="roomName" label="课堂名称" :show-overflow-tooltip="true" />
      <el-table-column label="节点" :show-overflow-tooltip="true">
        <template #default="{ row }">
          {{ childTypeEnum[row.childType] }}
        </template>
      </el-table-column>
      <el-table-column label="GB" width="100px">
        <template #default="{ row }">
          <span :class="{ 'green-font': row.money > 0, 'red-font': row.money < 0 }">{{ row.money }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="tableData.length"
      class="bottom-page"
      small
      style="margin: 15px 10px 0 0; text-align: right;"
      :current-page="query.page"
      :page-size="5"
      layout="total, prev, pager, next"
      :total="total"
      @current-change="handlePageChange($event, 'page')"
    />
    <el-form
      ref="formRef"
      :model="form"
      label-width="80px"
      label-position="top"
    >
      <el-form-item
        label="原因说明"
        prop="appealDescription"
        :rules="{ required: true, message: '请填写原因说明', trigger: 'blur' }"
      >
        <el-input type="textarea" :rows="2" v-model="form.appealDescription" />
      </el-form-item>
      <uploadFile class="upload-box" @uploadFiles="uploadFiles">
        <template #uploadBtn>
          <div class="add-file">+添加附件</div>
        </template>
      </uploadFile>
      <fileListComp :fileList="fileList" />
      <div class="footer">
        <el-button @click="closeModal" type="primary" plain class="w120">取消</el-button>
        <el-button type="primary" @click="confirm" class="w120" :loading="btnLoading">确认</el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<style scoped lang="scss">
.el-table {
  margin-top: 10px;
}
.tip {
  color: #939393;
  margin-bottom: 10px;
  i {
    color: #ed5a5c;
    margin-right: 3px;
  }
}
:deep(.el-dialog__header) {
  padding: 20px !important;
}
:deep(.el-dialog__body) {
  height: 570px !important;
  overflow: auto;
  padding-bottom: 60px !important;
}
:deep(.el-dialog__title) {
  font-weight: 700;
}
:deep(.el-button) {
  padding: 8px 15px;
  span {
    color: #fff;
  }
}
.w120 {
  width: 120px;
}
:deep(.el-button--primary) {
  background: #fd9535;
  border: none;
  span {
    color: #fff;
  }
}
:deep(.el-button--primary.is-plain) {
  background: transparent;
  border: 1px solid #fd9535;
  span {
    color: #fd9535;
  }
}
:deep(.footer) {
  position: absolute;
  bottom: 0px;
  text-align: right;
  width: 100%;
  left: 0;
  padding: 8px;
  background: #fff;
  .el-button {
    border-radius: 15px;
  }
}
:deep(.el-table td),
:deep(.el-table th) {
  padding: 8px 0;
}
:deep(.el-form-item) {
  margin-bottom: 15px;
}
:deep(.el-form-item__label) {
  padding-bottom: 0;
}
.link {
  color: #3662ec;
  cursor: pointer;
}
.green-font {
  color: #67c23a;
}
.red-font {
  color: #f56c6c;
}
.add-file {
  color: #fd9535;
}
:deep(.file-area) {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-left: 13px;
  .item {
    width: 49%;
    display: flex;
    .file-name {
      color: #3662ec;
      overflow: hidden;
      display: inline-block;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    img {
      display: none;
    }
    .delete-icon {
      color: #3662ec;
      position: relative;
      top: 4px;
      margin-left: 5px;
    }
  }
}
</style>
