<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElNotification } from 'element-plus'

const props = withDefaults(defineProps<{
  loading?: boolean
  current?: any
}>(), {
  loading: false,
  current: () => ({}),
})

const emit = defineEmits<{
  (e: 'receivOrder'): void
}>()

const isShow = ref(false)
const isClick = ref(false)
const url = 'https://docs.qq.com/doc/DU3RmY3FldVdOWmlz'
const orderInfo = ref<any>({})
const assistExamWayList: Record<number, string> = {
  1: 'Login In',
  2: 'Photo Exam',
  3: 'Take Home',
}
const teacherType = localStorage.getItem('teacType')

const assistExamWay = computed(() => {
  return orderInfo.value.studSpecialOrderExam && orderInfo.value.studSpecialOrderExam.assistExamWay
})

function show(row: any) {
  isShow.value = true
  orderInfo.value = row
}

function closeModal() {
  isShow.value = false
  isClick.value = false
}

function receivOrder() {
  if (!isClick.value && assistExamWay.value == 1) {
    ElNotification.warning('请先查看Loom录制软件下载指南')
    return
  }
  emit('receivOrder')
}

function openLink(linkUrl: string) {
  isClick.value = true
  window.open(linkUrl)
}

defineExpose({ show, closeModal })
</script>

<template>
  <div>
    <el-dialog v-model="isShow" width="516px" :close-on-click-modal="false" class="paper-dialog">
      <h3 class="title">Exam&amp;Quiz</h3>
      <div class="desc">
        讲师您好，{{ assistExamWayList[assistExamWay] }} 类型订单需执行以下规范要求：
      </div>
      <div class="content">
        <div>
          1. 考试前期：请认真备考填写［考试信息］
          <p v-if="teacherType == '2'">并及时上传［备考审核表］</p>
          <span>以上需要在考试前完成，否则会影响老师正常结单</span>
        </div>
        <template v-if="assistExamWay == 1">
          <div>2. 考试开始：打开Loom录屏软件，<span>录制考试完整过程</span></div>
          <div>3. 考试结束：<span>提交录制视频链接</span></div>
        </template>
        <template v-else>
          <div>2. 考试开始：考试题目及答案完整保留</div>
          <div>3. 考试结束：<span>提交考试题目及答案文件</span></div>
        </template>
        <div class="desc" style="margin-top: 10px;">违规处罚：</div>
        <div v-if="assistExamWay == 1">
          1.视频内容将由运营团队检查，若您未能提供记录整个考试的有效视频，<span>扣除全部订单收入</span>，且失去售后申诉权限。
        </div>
        <div v-else>
          1. 考试题目及答案将由运营团队检查，若您未能提供记录整个考试的有效内容，<span>扣除全部订单收入</span>,且失去售后申诉权限。
        </div>
        <div>2. 2022.03.08订单执行Reflection机制，订单出现<span>学生投诉、售后判定讲师责任</span>等情况，讲师将面临<span>双倍薪资扣除</span>。</div>
        <template v-if="assistExamWay == 1">
          <div>Loom录制软件下载指南，请务必及时根据指引完成操作</div>
          <div class="link" @click="openLink(url)">{{ url }}</div>
        </template>
        <div class="btn-box">
          <el-button class="default-btn" @click="closeModal">取消</el-button>
          <el-button class="defaultlight-btn" @click="receivOrder" :loading="loading">确定接单</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
div {
  line-height: 30px;
  span {
    color: red;
  }
  p {
    display: inline-block;
    padding: 0;
    margin: 0;
  }
}
.desc {
  font-weight: 700;
}
.content {
  margin-top: 10px;
  padding-left: 20px;
}
.link {
  color: #5287f1;
  cursor: pointer;
}
.btn-box {
  margin: 40px auto 0px;
  text-align: center;
}
.defaultlight-btn,
.default-btn {
  height: 30px;
  width: 150px;
  line-height: 8px;
  :deep(span) {
    color: #fff !important;
  }
}
.default-btn {
  :deep(span) {
    color: #ff8723 !important;
  }
}
.defaultlight-btn.el-button.is-disabled {
  background: #c0c4cc !important;
  border: none;
  color: #222 !important;
  :deep(span) {
    color: #222 !important;
  }
}
</style>
