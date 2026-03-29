<script setup lang="ts">
import { ref, reactive } from 'vue'
import uploadBtn from '@/views/myorders/components/uploadBtn.vue'
import uploadfile from '@/views/myorders/components/uploadfile.vue'
import deletFeedBack from '@/views/myorders/components/deletFeedBack.vue'
import { getTaskList, uploadTaskfeedBack, deleteTaskfeedBack, createOrUpdateTaskFeedback } from '@/api/modules/order'

const props = withDefaults(defineProps<{
  endcoursLoading?: boolean
}>(), {
  endcoursLoading: false,
})

const emit = defineEmits<{
  (e: 'finishClass', current: any, close: () => void): void
}>()

const isShow = ref(false)
const loading = ref(false)
const form = reactive<any>({ assignmentList: [] })
const current = ref<any>({})
const serviceIncome = ref(0)
const formRef = ref<any>()
const deletFeedBackRef = ref<InstanceType<typeof deletFeedBack>>()

const scoreValidate = (_rule: any, value: any, callback: any) => {
  const pattern = /^\d+\.?\d{0,2}$/
  if (!value) callback(new Error('请输入分数'))
  else if (value < 0) callback(new Error('只可以输入>=0的数字'))
  else if (!pattern.test(value)) callback(new Error('只能输入数字且小数点后最多只能输入两位'))
  else callback()
}

const show = (row: any) => {
  isShow.value = true
  current.value = row
  fetchTaskList()
}

const dialogBeforeClose = () => { isShow.value = false }

const pushFile = (file: any, index: number) => {
  if (!form.assignmentList[index].feedbackFiles) form.assignmentList[index].feedbackFiles = []
  form.assignmentList[index].feedbackFiles.push(file)
}

const fetchTaskList = async () => {
  loading.value = true
  const res: any = await getTaskList({ courseId: current.value.courseId })
  loading.value = false
  if (res.status === 200) {
    form.assignmentList = res.body?.tasks || []
    serviceIncome.value = res.body?.serviceIncome || 0
  }
}

const handleUploadTaskfeedBack = async (file: any, item: any) => {
  const params = { taskId: item.id, name: file.name, url: file.url }
  const res: any = await uploadTaskfeedBack(params)
  if (res.status === 200) fetchTaskList()
}

const confirmFn = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (valid) emit('finishClass', current.value, dialogBeforeClose)
  })
}

const deleteFile = (item: any) => {
  deletFeedBackRef.value?.show(item)
}

const confirmDelete = async (item: any) => {
  const res: any = await deleteTaskfeedBack({ id: item.id })
  if (res.status === 200) {
    deletFeedBackRef.value?.closeModal()
    fetchTaskList()
  }
}

const changeFeedback = async (index: number, type: number) => {
  const { noScoreFlag, score } = form.assignmentList[index]
  if ((noScoreFlag === 0 && type === 1) || (score && type === 2)) {
    const params: any = {
      taskId: form.assignmentList[index].id,
      score: form.assignmentList[index].score,
      noScoreFlag: form.assignmentList[index].noScoreFlag,
    }
    if (noScoreFlag === 0) delete params.score
    const res: any = await createOrUpdateTaskFeedback(params)
    if (res.status === 200) fetchTaskList()
  }
}

defineExpose({ show })
</script>

<template>
  <el-dialog v-model="isShow" width="380px" :before-close="dialogBeforeClose">
    <template #header>
      <div class="title-area">
        <div class="title-text">申请结课</div>
        <div class="header-tip">
          请上传学生考核项成绩以获得<span class="red-font" v-if="serviceIncome > 0">{{ serviceIncome }}G</span>服务薪资
        </div>
      </div>
    </template>
    <div class="assignment-feedback-dialog">
      <div class="tip"><i class="el-icon-warning"></i>服务薪资将在所有反馈审核通过后发放</div>
      <div class="feedback-content-item" v-loading="loading">
        <div class="value">
          <el-form :model="form" ref="formRef" label-position="top">
            <div v-for="(item, index) in form.assignmentList" :key="index" class="feedback-item">
              <div class="assignment-name">assignment:{{ index + 1 }}</div>
              <el-form-item
                label="反馈"
                class="feedback-label"
                :prop="`assignmentList.${index}.noScoreFlag`"
                :rules="[{ required: index === form.assignmentList.length - 1 ? false : true, message: '请选择反馈类型', trigger: 'blur' }]"
              >
                <el-radio-group v-model="form.assignmentList[index].noScoreFlag" @change="changeFeedback(index, 1)">
                  <el-radio :value="0">无分数</el-radio>
                  <el-radio :value="1">分数（百分制）</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                class="score"
                v-if="form.assignmentList[index].noScoreFlag === 1"
                :prop="`assignmentList.${index}.score`"
                :rules="[{ required: index === form.assignmentList.length - 1 ? false : true, message: '请输入分数', trigger: 'blur' }, { validator: scoreValidate, trigger: 'blur' }]"
              >
                <el-input v-model="form.assignmentList[index].score" size="small" @blur="changeFeedback(index, 2)">
                  <template #append>%</template>
                </el-input>
              </el-form-item>
              <el-form-item class="file-item" :key="index" :prop="`assignmentList.${index}.feedbackFiles`">
                <template #label>
                  <div class="label-area">
                    <div><span class="label">截图</span></div>
                    <uploadBtn
                      :fileList="form.assignmentList[index].feedbackFiles"
                      @pushFile="pushFile($event, index)"
                      :uploadImmediately="true"
                      @uploadTaskfeedBack="handleUploadTaskfeedBack($event, item)"
                    />
                  </div>
                </template>
                <div class="check-tip" v-if="index === form.assignmentList.length - 1">(非必传)最终反馈可能延后，讲师可先[申请结课]后由教辅上传</div>
                <uploadfile
                  :form="form.assignmentList[index]"
                  groupName="feedbackFiles"
                  v-if="form.assignmentList[index].feedbackFiles?.length > 0"
                  :showRequiredInput="false"
                  :showComplateProgress="false"
                  :deleteImmediately="true"
                  @deleteFile="deleteFile"
                />
              </el-form-item>
            </div>
          </el-form>
        </div>
      </div>
    </div>
    <div class="submit-btn-group">
      <el-button type="primary" plain size="small" @click="dialogBeforeClose">取消</el-button>
      <el-button :loading="endcoursLoading" type="primary" size="small" @click="confirmFn">申请结课</el-button>
    </div>
    <deletFeedBack ref="deletFeedBackRef" @deleteFile="confirmDelete" />
  </el-dialog>
</template>

<style lang="scss" scoped>
.title-area {
  border-bottom: 1px solid #d8d8d8;
  padding-bottom: 10px;
  .title-text { font-size: 16px; font-weight: 700; }
  .header-tip { color: #979797; margin-top: 10px; }
}
.assignment-feedback-dialog {
  width: 100%; height: 432px; overflow: auto;
  padding: 12px 20px 46px;
  .feedback-content-item {
    width: 100%; display: flex; align-items: flex-start;
    justify-content: space-between; margin-top: 12px;
    .label { margin-right: 10px; }
    .value {
      flex: 1;
      .file-item {
        width: 100%; border-bottom: 1px solid #d8d8d8;
        margin-bottom: 12px;
        &:last-child { margin-bottom: 0; }
        .label-area {
          width: 100%; display: flex; align-items: center;
        }
      }
    }
  }
  .tip {
    i { color: #e6a23c; margin-right: 2px; }
  }
}
:deep(.submit-btn-group) {
  text-align: center;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.12);
  padding: 5px 0;
  .el-button {
    background: #507aef;
    span { color: #fff; }
    &.is-plain {
      background: #fff; border-color: #507aef;
      span { color: #507aef; }
    }
  }
}
:deep(.el-dialog__body) { padding: 0 !important; position: relative; }
.check-tip { font-size: 12px; margin-top: -20px; }
:deep(.upload-file-list) { border: none; }
:deep(.el-form-item__label) { display: flex; padding: 0; }
:deep(.feedback-item) {
  position: relative;
  .feedback-label {
    display: flex; margin-bottom: 0;
    .el-form-item__label { color: #222222; }
    .el-form-item__error { top: 72%; left: 12px; }
  }
  .el-radio-group { margin-left: 10px; }
  .score {
    position: absolute; width: 80px; left: 265px; top: 24px;
    .el-input-group__append, .el-input-group__prepend { padding: 0 8px; }
  }
}
.assignment-name { margin-top: 10px; font-weight: 700; }
:deep(.el-radio__input.is-checked + .el-radio__label) { color: #507aef; }
:deep(.el-radio__input.is-checked .el-radio__inner) { border-color: #507aef; background: #507aef; }
:deep(.score) {
  .el-input__inner {
    padding: 0 3px;
    &:focus { border-color: #507aef !important; }
  }
  .el-form-item__error { top: 72%; left: unset; right: 0; width: 228px; text-align: right; }
}
.red-font { color: #f7424b; }
</style>
