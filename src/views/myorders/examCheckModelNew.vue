<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { ElNotification } from 'element-plus'
import testmsgForm from '@/views/myorders/testmsgForm.vue'
import uploadExamCheck from '@/views/myorders/uploadExamCheck.vue'
import examInfo from '@/views/myorders/examInfo.vue'
import yanhuaImg from '@/assets/images/order/yanhua.png'

const props = withDefaults(defineProps<{
  testMsgObj?: any
}>(), {
  testMsgObj: () => ({}),
})

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const isShow = ref(false)
const step = ref(0)
const teacType = localStorage.getItem('teacType')
const current = ref<any>({})
const active = ref(0)
const stepList: Record<number, string> = { 1: '考试信息', 2: '备考审核' }

const testmsgFormRef = ref<InstanceType<typeof testmsgForm>>()
const uploadExamCheckRef = ref<InstanceType<typeof uploadExamCheck>>()
const examInfoRef = ref<InstanceType<typeof examInfo>>()

const btnLoading = computed(() => testmsgFormRef.value?.loading ?? false)

const show = (row: any) => {
  isShow.value = true
  current.value = row
  nextTick(() => {
    testmsgFormRef.value?.init()
    examInfoRef.value?.init()
    uploadExamCheckRef.value?.getExamCheckFile()
  })
  initStep()
}

const initStep = () => {
  if ([0].includes(current.value.buttonStatus)) {
    step.value = 0; active.value = 0
  } else if ([1, 3].includes(current.value.buttonStatus)) {
    step.value = 0; active.value = 1
  } else if ([2, 5, 6, 7, 8].includes(current.value.buttonStatus)) {
    step.value = 0; active.value = 2
  }
}

const handleClose = () => {
  isShow.value = false
  testmsgFormRef.value?.clearForm()
  cancelUpload()
}

const pre = () => { step.value = 0 }

const next = () => {
  const canNext = testmsgFormRef.value?.validForm()
  if (canNext) step.value = 1
  else ElNotification.warning('有必填项未填写')
}

const uploadCheck = () => {
  testmsgFormRef.value?.confirm()
}

const changeStep = (value: number) => {
  if (active.value >= value) step.value = value - 1
}

const cancelUpload = () => {
  uploadExamCheckRef.value?.cancelUpload()
}

const refresh = () => { emit('refresh') }

defineExpose({ show })
</script>

<template>
  <div>
    <el-dialog v-model="isShow" width="1120px" :show-close="false">
      <!-- Marquee notification -->
      <marquee
        v-if="(![0].includes(current.buttonStatus) && teacType == '2') || ([2].includes(current.buttonStatus) && teacType == '1')"
        behavior="scroll"
        direction="left"
        class="marquee"
      >
        <img :src="yanhuaImg" alt="" />
        <span v-if="[1, 8].includes(current.buttonStatus)">备考审核表上传完毕，请等待审核</span>
        <span v-if="[3].includes(current.buttonStatus)">质检审核不通过，请按照质检审核要求重新上传</span>
        <span v-if="[2, 5, 6].includes(current.buttonStatus)">恭喜您！{{ current.lockTeacG }}G已到账，完成考试即可解锁哦！继续加油吧</span>
        <span v-if="[7].includes(current.buttonStatus)">质检审核不通过,该订单已过Deal Dealine,请联系师资管理员处理</span>
      </marquee>

      <!-- Order info -->
      <div class="order-info">
        <div class="order-title">单号 <span>{{ current.orderNo }}</span></div>
        <i class="el-icon-close" @click="handleClose"></i>
        <examInfo ref="examInfoRef" :current="current" />
      </div>

      <div class="bottom-box">
        <!-- Steps (part-time only) -->
        <div class="steps" v-if="teacType == '2'">
          <div v-for="(key, value) in stepList" :key="value" @click="changeStep(Number(value))">
            <i class="el-icon-success" v-if="active >= Number(value)"></i>
            <div class="num" v-else>{{ value }}</div>
            <div class="text" :class="{ active: active >= Number(value) }">{{ key }}</div>
          </div>
        </div>

        <div class="bottom-content">
          <testmsgForm
            v-show="step !== 1"
            :datas="testMsgObj"
            class="test-form"
            ref="testmsgFormRef"
            @close="handleClose"
            @refresh="refresh"
          />
          <uploadExamCheck
            v-show="step === 1"
            ref="uploadExamCheckRef"
            :disabled="[2, 5, 6, 7, 8].includes(current.buttonStatus)"
            :datas="testMsgObj"
          />
        </div>

        <div class="btn-box">
          <el-button v-if="teacType == '1' && !testMsgObj.disabled" class="btn" @click="handleClose">取消</el-button>
          <el-button v-if="teacType == '2' && step !== 0" class="btn" @click="pre" :disabled="step === 0">上一步</el-button>
          <el-button v-if="teacType == '2' && step === 0" class="btn" @click="next">下一步</el-button>
          <el-button v-if="(step === 1 || teacType == '1') && !testMsgObj.disabled" class="submit-btn" @click="uploadCheck" :loading="btnLoading">提交审核</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dialog) {
  background: transparent;
  box-shadow: none;
  margin-top: 1vh !important;
}
:deep(.el-dialog__header) {
  padding: 0;
}
.marquee {
  background: #fff;
  height: 55px;
  line-height: 55px;
  border-radius: 8px;
  img { width: 25px; height: 29px; position: relative; top: 5px; }
  span { font-size: 18px; font-weight: 700; line-height: 23px; }
}
.order-info {
  width: 100%;
  background: #ffffff;
  border-radius: 8px;
  margin-top: 12px;
  padding: 0 32px;
  position: relative;
  .order-title {
    border-bottom: 1px solid #e7e7e7;
    height: 48px; line-height: 48px;
    color: #333333; font-size: 16px;
    span { margin-left: 15px; }
  }
}
.test-form { padding: 10px 32px; background: #fff; }
.el-icon-close {
  position: absolute; top: 10px; right: 30px;
  font-size: 26px; cursor: pointer;
}
.bottom-box {
  margin-top: 12px; border-radius: 8px;
  background: #fff; padding: 18px 0;
  .steps {
    width: 420px; margin: 0 auto;
    :deep(.el-icon-check:before) { color: #33b00d; }
  }
}
.submit-btn, .btn {
  width: 321px; height: 40px; line-height: 40px;
  background: #ffffff; border-radius: 6px;
  border: 1px solid #f4801f; line-height: 8px;
  :deep(span) { color: #f4801f; }
}
.submit-btn {
  background: #f4801f;
  :deep(span) { color: #fff; }
}
.btn-box { width: 100%; margin: 60px auto 0px; text-align: center; }
.steps {
  display: flex; position: relative;
  > div {
    position: relative; text-align: center; cursor: pointer;
    &:nth-of-type(1)::after {
      display: inline-block; position: absolute;
      content: ""; width: 287px; height: 1px;
      border-bottom: 1px dashed #333333;
      left: 40px; top: 10px;
    }
    &:nth-of-type(2) { position: absolute; right: 20px; top: 0; }
    .num {
      width: 24px; height: 24px; border: 1px solid #333333;
      line-height: 24px; color: #333333; border-radius: 50%;
    }
    .text { position: relative; left: -15px; top: 5px; }
    .text.active { color: #33b00d; }
    .el-icon-success {
      font-size: 28px; color: #33b00d;
      position: relative; left: -15px;
    }
  }
}
:deep(.el-button.is-disabled),
.el-button.is-disabled:focus,
.el-button.is-disabled:hover {
  background: #ccc; border: none;
}
.bottom-content {
  min-height: 350px; overflow-y: scroll;
  cursor: pointer; height: calc(100vh - 440px);
}
</style>
