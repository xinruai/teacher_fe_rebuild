<script setup lang="ts">
import { ref } from 'vue'
import { ElDialog, ElTable, ElTableColumn, ElButton } from 'element-plus'
import appealList from '@/views/newSalary/components/appealList.vue'

const isShow = ref(false)
const appealListRef = ref<InstanceType<typeof appealList>>()

const columnList = [
  { label: '考勤', width: '100px', prop: 'type' },
  { label: '扣除金额(次)', width: '150px', prop: 'money' },
  { label: '规则', prop: 'rule' },
]

const tableData = [
  { type: '迟到', money: '10G', rule: '进入课堂时间晚于系统排课时间1分钟及以上' },
  { type: '改约', money: '20G', rule: '擅自更改已经与学生约定好的上课时间' },
  { type: '旷课', money: '50G', rule: '讲师未出席课程或缺席课程15分钟以上' },
]

function show() {
  isShow.value = true
}

function closeModal() {
  isShow.value = false
}

function appeal() {
  appealListRef.value?.show()
}

defineExpose({ show })
</script>

<template>
  <div>
    <el-dialog
      v-model="isShow"
      width="866px"
      :close-on-click-modal="false"
      @close="closeModal"
      append-to-body
    >
      <div class="item-title">提现&打款时间</div>
      <div class="item-content">
        <div class="rules rules-detail">提现时间为每周一00:00~23:59；每周二23:59后已提现工资单将被封账，新产生收入和扣除将被记录在下周工资单内</div>
        <div class="rules rules-detail">工资单成功提现后，打款时间为【每周三】</div>
      </div>
      <div class="item-title">工资单可提现标准</div>
      <div class="item-content">
        <div>
          <div class="rules">每周工资单的需满足以下条件才可以提现</div>
          <div class="rules-detail">以周为单位完整提取</div>
          <div class="rules-detail">需要按照时间顺序提现</div>
          <div class="rules-detail">提现之后账户余额>=50G</div>
        </div>
      </div>
      <div class="item-title">
        考勤扣除
        <el-button @click="appeal" type="danger" size="small">申诉</el-button>
      </div>
      <div class="item-content">
        <div>
          <div class="rules">以下情况将会对讲师进行薪资扣除，若有异议可点击上方按钮进行【申诉】</div>
          <el-table
            :header-cell-style="{ color: '#A7A7A7', fontSize: '12px', fontWeight: '400', background: '#F3F3F3' }"
            :data="tableData"
            border
          >
            <el-table-column
              v-for="(item, index) in columnList"
              :key="index"
              :label="item.label"
              :prop="item.prop"
              :width="item.width"
            />
          </el-table>
        </div>
      </div>
    </el-dialog>
    <appealList ref="appealListRef" />
  </div>
</template>

<style scoped lang="scss">
.item-title {
  font-weight: 700;
  margin: 20px 0 10px;
  font-size: 18px;
}
.item-content {
  line-height: 25px;
  .rules-detail {
    color: #4b4b4b;
    line-height: 25px;
    position: relative;
    padding-left: 12px;
    font-weight: 400;
    &::before {
      width: 3px;
      height: 3px;
      display: inline-block;
      content: "";
      border-radius: 50%;
      background: #4b4b4b;
      position: absolute;
      left: 2px;
      top: 10px;
    }
  }
  .rules {
    color: #3d3d3d;
    font-weight: 700;
  }
}
:deep(.el-dialog) {
  border-radius: 15px;
}
:deep(.el-dialog__header) {
  padding: 0;
}
:deep(.el-dialog__close) {
  font-size: 18px;
  color: #606266;
}
:deep(.el-dialog__title) {
  font-weight: 700;
}
:deep(.el-dialog__body) {
  height: 545px;
  overflow: auto;
  padding: 0px 20px 20px;
}
.orange-font {
  color: #fd9535;
}
:deep(.el-button) {
  span {
    color: #fff;
  }
}
.el-table {
  margin-top: 10px;
}
:deep(th),
:deep(td) {
  text-align: center;
}
:deep(.el-table td),
:deep(.el-table th) {
  padding: 9px 0;
}
:deep(th .cell) {
  color: #a7a7a7;
}
</style>
