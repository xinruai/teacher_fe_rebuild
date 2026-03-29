<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'
import { ElNotification } from 'element-plus'
import type { FormInstance } from 'element-plus'
import uploadFile from './uploadFile.vue'
import fileList from './fileList.vue'
import { submitOrderInfo, getExamInfo } from '@/api/modules/examOrder'

const isShow = ref(false)
const loading = ref(false)
const contentloading = ref(false)
const formRef = ref<FormInstance>()
const form = reactive<Record<string, any>>({
  subject: [],
  answer: [],
  coursewareCVOS: [],
})
const orderInfo = ref<any>({})
const disabledClassEnd = ref(false)
const upload1 = ref<InstanceType<typeof uploadFile>>()
const upload2 = ref<InstanceType<typeof uploadFile>>()
const upload3 = ref<InstanceType<typeof uploadFile>>()

const assistExamWayList: Record<number, string> = {
  1: 'Require Login',
  2: 'Photo Exam',
  3: 'Take Home',
}

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const disabled = computed(() => false)

const assistExamWay = computed(() => {
  return orderInfo.value.studSpecialOrderExam && orderInfo.value.studSpecialOrderExam.assistExamWay
})

const linkVlidator = (_rule: any, value: string, callback: any) => {
  if (!value) return callback(new Error('请输入链接'))
  if (value.match(/^https:\/\/www\.loom\.com\/share.*$/)) return callback()
  return callback(new Error('请输入正确的链接'))
}
const subjectVlidator = (_rule: any, _value: any, callback: any) => {
  if (!form.subject.length) return callback(new Error('请上传Exam Questions'))
  return callback()
}
const answerVlidator = (_rule: any, _value: any, callback: any) => {
  if (!form.answer.length) return callback(new Error('请上传Yours Answers'))
  return callback()
}
const completeVlidator = (_rule: any, _value: any, callback: any) => {
  if (!form.coursewareCVOS.length) return callback(new Error('请上传Complete Work'))
  return callback()
}
const classEndVlidator = (_rule: any, _value: any, callback: any) => {
  if (!form.isClassEnd && form.isClassEnd !== 0) return callback(new Error('请选择是否同步申请结课'))
  return callback()
}

async function show(order: any) {
  isShow.value = true
  await nextTick()
  formRef.value?.clearValidate()
  orderInfo.value = order
  await fetchExamInfo()
}

function uploadFiles(file: any) {
  form.subject.push(file)
  formRef.value?.validate()
}
function uploadFiles2(file: any) {
  form.answer.push(file)
  formRef.value?.validate()
}
function uploadFiles3(file: any) {
  file.groupId = orderInfo.value.picType == 69 ? 30 : 16
  file.cdId = orderInfo.value.courseId
  form.coursewareCVOS.push(file)
}

function closeModal() {
  upload1.value?.cancelUpload()
  upload2.value?.cancelUpload()
  upload3.value?.cancelUpload()
  isShow.value = false
  loading.value = false
  form.subject = []
  form.answer = []
  form.coursewareCVOS = []
}

async function fetchExamInfo() {
  contentloading.value = true
  const res = await getExamInfo({ courseId: orderInfo.value.courseId })
  contentloading.value = false
  if (res.status == 200) {
    const body = res.body || {}
    Object.assign(form, body)
    if (!form.answer) form.answer = []
    if (!form.subject) form.subject = []
    form.coursewareCVOS = []
    disabledClassEnd.value = form.isClassEnd == 1
    if (!form.isClassEnd) form.isClassEnd = 2
  }
}

function submit() {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      const params: Record<string, any> = {
        courseId: orderInfo.value.courseId,
        isClassEnd: form.isClassEnd || 0,
      }
      if (assistExamWay.value == 1) {
        params.loomLink = form.loomLink
      } else {
        params.subject = form.subject
        params.answer = form.answer
      }
      if ([1, 3].includes(assistExamWay.value)) {
        params.coursewareCVOS = form.coursewareCVOS
      }
      if (disabledClassEnd.value) {
        params.isClassEnd = 0
      }
      loading.value = true
      const res = await submitOrderInfo(params)
      loading.value = false
      if (res.status == 200) {
        ElNotification.success('操作成功')
        emit('refresh')
        closeModal()
      }
    }
  })
}

defineExpose({ show, closeModal })
</script>

<template>
  <div>
    <el-dialog v-model="isShow" width="516px" :close-on-click-modal="false" class="paper-dialog">
      <h3 class="title">提交作业</h3>
      <div class="tip" v-if="[1, 3].includes(assistExamWay) && orderInfo.cwCount">
        当前订单已提交Completed Work，如确定需二次提交，请联系订单师资老师同步此信息，否则存在学生提交错误文件风险！
      </div>
      <el-form ref="formRef" :model="form" label-width="140px" label-position="left" v-loading="contentloading">
        <el-form-item label="Exam Form">
          {{ assistExamWayList[assistExamWay] }}
        </el-form-item>
        <el-form-item
          v-if="assistExamWay == 1"
          label="Loom Link"
          prop="loomLink"
          :rules="[{ required: true, validator: linkVlidator, trigger: 'blur' }]"
        >
          <el-input v-model="form.loomLink" :disabled="disabled" type="url" />
        </el-form-item>
        <template v-if="assistExamWay == 2">
          <el-form-item label="Exam Questions" prop="subject" :rules="[{ required: true, validator: subjectVlidator, trigger: 'change' }]">
            <uploadFile v-if="!disabled" style="display: inline-block" ref="upload1" @uploadFiles="uploadFiles" />
            <fileList :fileList="form.subject" :disabled="disabled" filesName="subject" @delete="(i: number) => form.subject.splice(i, 1)" />
          </el-form-item>
          <el-form-item label="Yours Answers" prop="answer" :rules="[{ required: true, validator: answerVlidator, trigger: 'change' }]">
            <uploadFile v-if="!disabled" style="display: inline-block" ref="upload2" @uploadFiles="uploadFiles2" />
            <fileList :fileList="form.answer" :disabled="disabled" filesName="answer" @delete="(i: number) => form.answer.splice(i, 1)" />
          </el-form-item>
        </template>
        <el-form-item
          v-if="[1, 3].includes(assistExamWay)"
          label="Complete Work"
          prop="coursewareCVOS"
          :rules="[{ required: true, validator: completeVlidator, trigger: 'change' }]"
        >
          <uploadFile v-if="!disabled" style="display: inline-block" ref="upload3" @uploadFiles="uploadFiles3" />
          <fileList :fileList="form.coursewareCVOS" :disabled="disabled" filesName="coursewareCVOS" @delete="(i: number) => form.coursewareCVOS.splice(i, 1)" />
        </el-form-item>
        <el-form-item label="是否同步申请结课" prop="isClassEnd" :rules="[{ required: true, validator: classEndVlidator, trigger: 'change' }]">
          <el-radio-group v-model="form.isClassEnd" :disabled="disabledClassEnd">
            <el-radio :value="1">是</el-radio>
            <el-radio :value="2">暂不结课</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div class="footer-btn">
        <el-button class="cancle-btn" @click="closeModal" size="small">取消</el-button>
        <el-button v-if="!disabled" class="confirm-btn" @click="submit" size="small" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.footer-btn {
  margin-top: 20px;
}
.tip {
  width: 92%;
  color: red;
  font-weight: 700;
  text-align: center;
  line-height: 28px;
  margin: 0 auto 20px;
}
</style>
