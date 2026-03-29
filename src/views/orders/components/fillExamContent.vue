<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'
import { ElNotification } from 'element-plus'
import type { FormInstance } from 'element-plus'
import uploadFile from './uploadFile.vue'
import fileList from './fileList.vue'
import { submitOrderInfo, getExamInfo } from '@/api/modules/examOrder'

const isShow = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()
const form = reactive<Record<string, any>>({
  subject: [],
  answer: [],
})
const orderInfo = ref<any>({})
const upload1 = ref<InstanceType<typeof uploadFile>>()
const upload2 = ref<InstanceType<typeof uploadFile>>()

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

function closeModal() {
  upload1.value?.cancelUpload()
  upload2.value?.cancelUpload()
  isShow.value = false
  loading.value = false
  form.subject = []
  form.answer = []
}

async function fetchExamInfo() {
  const res = await getExamInfo({ courseId: orderInfo.value.courseId })
  if (res.status == 200) {
    const body = res.body || {}
    Object.assign(form, body)
    if (!form.answer) form.answer = []
    if (!form.subject) form.subject = []
  }
}

function submit() {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      const params: Record<string, any> = {
        courseId: orderInfo.value.courseId,
      }
      if (assistExamWay.value == 1) {
        params.loomLink = form.loomLink
      } else {
        params.subject = form.subject
        params.answer = form.answer
      }
      loading.value = true
      const res = await submitOrderInfo(params)
      loading.value = false
      if (res.status == 200) {
        ElNotification.success('操作成功')
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
      <h3 class="title">提交考试内容</h3>
      <el-form ref="formRef" :model="form" label-width="140px">
        <el-form-item
          v-if="assistExamWay == 1"
          label="Loom Link"
          label-width="100px"
          prop="loomLink"
          :rules="[{ required: true, validator: linkVlidator, trigger: 'blur' }]"
        >
          <el-input v-model="form.loomLink" :disabled="disabled" type="url" />
        </el-form-item>
        <template v-else>
          <el-form-item label="Exam Questions" prop="subject" :rules="[{ required: true, validator: subjectVlidator, trigger: 'change' }]">
            <uploadFile v-if="!disabled" style="display: inline-block" ref="upload1" @uploadFiles="uploadFiles" />
            <fileList :fileList="form.subject" :disabled="disabled" filesName="subject" @delete="(i: number) => form.subject.splice(i, 1)" />
          </el-form-item>
          <el-form-item label="Yours Answers" prop="answer" :rules="[{ required: true, validator: answerVlidator, trigger: 'change' }]">
            <uploadFile v-if="!disabled" style="display: inline-block" ref="upload2" @uploadFiles="uploadFiles2" />
            <fileList :fileList="form.answer" :disabled="disabled" filesName="answer" @delete="(i: number) => form.answer.splice(i, 1)" />
          </el-form-item>
        </template>
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
</style>
