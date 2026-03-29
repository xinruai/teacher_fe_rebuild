<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElNotification } from 'element-plus'
import { orderUpdateExam, orderUpdateExam1 } from '@/api/modules/examOrder'
import { getAliOSSUploadSign } from '@/api/modules/paper'
import { BasicUrl } from '@/api/config'

const props = defineProps<{
  datas: any
}>()

const emit = defineEmits<{
  (e: 'close', status?: boolean): void
  (e: 'refresh'): void
}>()

const testForms = ref<any>()
const loading = ref(false)
const teacherType = localStorage.getItem('teacType')

const ossData = ref<any>({})

const testForm = reactive<any>({
  examTopicCount: '',
  examScope: '',
  examScopeStart: '',
  examScopeEnd: '',
  examAnswerFileFormat: [],
  examItemTypes: [],
  examDifficulties: '',
  examDifficultiesArr: [{ content: '' }, { content: '' }, { content: '' }],
  specialRequirementsFlag: '',
  specialRequirements: '',
  examExtFileList: [],
  examAnswerFileOhter: '',
  examItemTypesOhter: '',
})

const examAnswerFileArr = [
  { name: 'WORD', type: 1 },
  { name: 'PDF', type: 2 },
  { name: '手写', type: 3 },
  { name: '其他', type: 4 },
]

const examItemTypes = reactive([
  { name: 'Mutiple choice', type: 1, total: '' },
  { name: 'TRUE OR FALSE', type: 2, total: '' },
  { name: 'ill-in-the-blank填空', type: 3, total: '' },
  { name: 'Essay类写作', type: 4, total: '' },
  { name: 'Programming/code', type: 5, total: '' },
  { name: 'Numberical question/Calculations(计算题)', type: 6, total: '' },
  { name: 'short answer question', type: 7, total: '' },
  { name: 'Unknown', type: 8, total: '' },
])

const validateScope = (_rule: any, value: any, callback: any) => {
  if (!value && value !== 0) {
    callback(new Error('请选择考试范围'))
  } else if (value === 0) {
    if (!testForm.examScopeStart || !testForm.examScopeEnd) {
      callback(new Error('考试范围Week/Chapter开始/结束为必填'))
    } else callback()
  } else callback()
}

const validateDifficultiesArr = (_rule: any, _value: any, callback: any) => {
  if (testForm.examDifficultiesArr?.length) {
    const can = testForm.examDifficultiesArr.find((v: any) => v.content)
    can ? callback() : callback(new Error('请填写考试重难点知识'))
  } else callback()
}

const validaterArr = (_rule: any, value: any, callback: any) => {
  !value?.length ? callback(new Error('请上传登录学生系统查看的截图')) : callback()
}

const rules = {
  examTopicCount: [{ required: true, message: '请输入考试题目数量', trigger: 'blur' }],
  examScope: [{ required: true, validator: validateScope, trigger: 'change' }],
  examAnswerFileFormat: [{ required: true, message: '请选择考试答案要求的文件格式', trigger: 'change' }],
  examItemTypes: [{ required: true, message: '请选择考试题型', trigger: 'change' }],
  examDifficulties: [{ required: true, message: '请输入考试重难知识点', trigger: 'blur' }],
  examDifficultiesArr: [{ required: true, validator: validateDifficultiesArr, trigger: 'blur' }],
  specialRequirementsFlag: [{ required: true, message: '请选择是否遇到问题or特殊要求', trigger: 'change' }],
  specialRequirements: [{ required: true, message: '请输入考试题目数量', trigger: 'blur' }],
  examExtFileList: [{ required: true, validator: validaterArr, trigger: 'change' }],
  examAnswerFileOhter: [{ required: true, message: '请输入考试答案要求的文件的其他格式', trigger: 'blur' }],
  examItemTypesOhter: [{ required: true, message: '请输入其他考试题型', trigger: 'blur' }],
}

const showOther = computed(() => {
  const index = testForm.examAnswerFileFormat?.findIndex((item: number) => item === 4) ?? -1
  if (props.datas?.studSpecialOrderExamExt?.examAnswerFileFormat && index > -1) {
    props.datas.studSpecialOrderExamExt.examAnswerFileFormat.forEach((items: any) => {
      if (items.type === 4) testForm.examAnswerFileOhter = items.name
    })
  }
  return index > -1
})

const showOtherExamType = computed(() => {
  const index = testForm.examItemTypes?.findIndex((item: number) => item === 8) ?? -1
  if (props.datas?.studSpecialOrderExamExt?.examItemTypes && index > -1) {
    const types = JSON.parse(props.datas.studSpecialOrderExamExt.examItemTypes)
    types.forEach((items: any) => {
      if (items.type === 8) testForm.examItemTypesOhter = items.total
    })
  }
  return index > -1
})

const init = () => {
  if (props.datas?.id) {
    const examAnswerFileFormat = JSON.parse(JSON.stringify(props.datas.studSpecialOrderExamExt.examAnswerFileFormat))
    const parsedTypes = JSON.parse(props.datas.studSpecialOrderExamExt.examItemTypes)
    let examDifficultiesArr = props.datas.studSpecialOrderExamExt.examDifficultiesArr && JSON.parse(props.datas.studSpecialOrderExamExt.examDifficultiesArr)

    const typesArr: number[] = []
    parsedTypes.forEach((exam: any) => typesArr.push(exam.type))

    examItemTypes.forEach(item => {
      parsedTypes.forEach((exam: any) => {
        if (exam.type === item.type) item.total = exam.total
      })
    })

    const examAnswerFileFormatArr: number[] = []
    examAnswerFileFormat.forEach((item: any) => {
      const idx = examAnswerFileArr.findIndex(items => items.type === item.type)
      examAnswerFileFormatArr.push(examAnswerFileArr[idx].type)
    })

    Object.assign(testForm, JSON.parse(JSON.stringify(props.datas.studSpecialOrderExamExt)))
    testForm.examAnswerFileFormat = examAnswerFileFormatArr
    if (examDifficultiesArr?.[0]?.content) {
      testForm.examDifficultiesArr = examDifficultiesArr
    } else {
      testForm.examDifficultiesArr = [{ content: '' }, { content: '' }, { content: '' }]
    }
    testForm.examItemTypes = typesArr
  } else {
    examItemTypes.forEach(item => { item.total = '' })
  }
}

const clearForm = () => {
  testForms.value?.resetFields()
  Object.assign(testForm, {
    examTopicCount: '', examScope: '', examScopeStart: '', examScopeEnd: '',
    examAnswerFileFormat: [], examItemTypes: [], examDifficulties: '',
    examDifficultiesArr: [{ content: '' }, { content: '' }, { content: '' }],
    specialRequirementsFlag: '', specialRequirements: '', examExtFileList: [],
    examAnswerFileOhter: '', examItemTypesOhter: '',
  })
}

const validForm = () => {
  let canSubmit = false
  testForms.value?.validate((valid: boolean) => { canSubmit = valid })
  return canSubmit
}

const confirm = async () => {
  if (!validForm()) {
    ElNotification.warning('有必填项未填写')
    return
  }
  testForm.courseId = props.datas.courseId
  testForm.id = props.datas.id
  const datas = JSON.parse(JSON.stringify(testForm))

  const finalItemTypes: any[] = []
  datas.examItemTypes.forEach((exam: number) => {
    const obj = examItemTypes.find(t => t.type === exam)
    if (obj) {
      const objPush = JSON.parse(JSON.stringify(obj))
      if (obj.type === 8) objPush.total = testForm.examItemTypesOhter
      finalItemTypes.push(objPush)
    }
  })

  const finalFileFormat: any[] = []
  datas.examAnswerFileFormat.forEach((arr: number) => {
    const obj = examAnswerFileArr.find(o => o.type === arr)
    if (obj) {
      if (obj.type === 4) obj.name = testForm.examAnswerFileOhter
      finalFileFormat.push(obj)
    }
  })

  datas.examDifficultiesArr = JSON.stringify(datas.examDifficultiesArr)
  datas.examItemTypes = JSON.stringify(finalItemTypes)
  datas.examAnswerFileFormat = finalFileFormat

  if (teacherType === '2') {
    // referenceFiles from uploadExamCheck would be passed via parent
    // The original accesses $parent.$parent.$refs.uploadExamCheck.referenceFiles
    // In Vue 3, parent will call confirm and handle this
  }

  loading.value = true
  let res: any = {}
  if (props.datas.spoType === 69) {
    res = await orderUpdateExam1(datas)
  } else {
    res = await orderUpdateExam(datas)
  }
  if (res.status === 200) {
    loading.value = false
    close(true)
    ElNotification.success(res.body?.msg || '操作成功')
  } else if (![500, -1].includes(res.status)) {
    loading.value = false
    ElNotification.error(res.body?.msg || '请求失败')
  }
}

const close = (status?: boolean) => {
  clearForm()
  emit('close', status)
  emit('refresh')
}

const deleteImg = (index: number) => {
  testForm.examExtFileList.splice(index, 1)
}

const initOssSign = async (name: string) => {
  const url = `${BasicUrl}/oss/getAliOSSUploadSign?dir=courseware/`
  const res: any = await getAliOSSUploadSign(url)
  if (res.status === 200) {
    const { accessid, signature, dir, policy, host } = res.body
    ossData.value = {
      name,
      key: dir + name,
      dir,
      signature,
      success_action_status: 200,
      OSSAccessKeyId: accessid,
      policy,
      host,
    }
  }
}

const beforeAvatarUpload = async (file: any) => {
  const { name, size } = file
  const index = name.lastIndexOf('.')
  if (index === -1) { ElNotification.error('图片格式错误'); return false }
  const ext = name.substr(index + 1)
  if (!['jpg', 'jpeg', 'png', 'JPG', 'JPEG', 'PNG'].includes(ext)) {
    ElNotification.error('上传头像图片只能是 JPG 或 PNG 格式!')
    return false
  }
  if (size > 2 << 20) {
    ElNotification.error('上传头像图片大小不能超过 2MB!')
    return false
  }
  await initOssSign(name)
}

const handleAvatarSuccess = () => {
  const { host, dir, name } = ossData.value
  testForm.examExtFileList.push({
    loginScreenshotFileName: name,
    loginScreenshotFileUrl: host + '/' + dir + encodeURIComponent(name),
  })
}

defineExpose({ init, clearForm, validForm, confirm, loading })
</script>

<template>
  <el-form :model="testForm" class="testForm-wrap" ref="testForms" :rules="rules">
    <el-form-item prop="examTopicCount" label="考试题目数量(e.g:30道选择题、10道判断题、Unknown)">
      <el-input placeholder="30道选择题、10道判断题" size="small" v-model="testForm.examTopicCount" :disabled="datas.disabled" />
    </el-form-item>

    <el-form-item label="考试范围" prop="examScope">
      <el-radio-group v-model="testForm.examScope" style="width: 100%" :disabled="datas.disabled">
        <el-radio :value="1">所有章节/内容</el-radio>
        <el-radio :value="0">
          Week/Chapter
          <template v-if="testForm.examScope === 0">
            <div class="examScope-other-box">
              <input v-model="testForm.examScopeStart" type="number" />
              <span>-</span>
              Week/Chapter
              <input v-model="testForm.examScopeEnd" type="number" />
            </div>
          </template>
        </el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="考试答案要求的文件格式" prop="examAnswerFileFormat" :class="{ 'no-mar-b': showOther }">
      <el-checkbox-group v-model="testForm.examAnswerFileFormat" style="width: 100%" :disabled="datas.disabled">
        <el-checkbox v-for="(answer, index) in examAnswerFileArr" :key="index" :value="answer.type" :label="answer.type">{{ answer.name }}</el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item prop="examAnswerFileOhter" v-if="showOther">
      <el-input placeholder="请输入其他考试答案文件格式" size="small" v-model="testForm.examAnswerFileOhter" :disabled="datas.disabled" />
    </el-form-item>

    <el-form-item label="考试题型（可多选）" prop="examItemTypes" v-if="datas.spoType == 69" :class="{ 'no-mar-b': testForm.examItemTypes.includes(8) }">
      <el-checkbox-group v-model="testForm.examItemTypes" style="width: 100%" :disabled="datas.disabled">
        <el-checkbox v-for="(exam, index) in examItemTypes" :key="index" :value="exam.type" :label="exam.type">
          {{ exam.name }}
          <template v-if="exam.type !== 8">
            <div class="examScope-other-box">
              <input v-model="examItemTypes[index].total" size="small" style="margin-right: 10px; width: 50px" type="number" :disabled="!testForm.examItemTypes.includes(exam.type)" />题
            </div>
          </template>
        </el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item prop="examItemTypesOhter" v-if="showOtherExamType">
      <el-input v-model="testForm.examItemTypesOhter" placeholder="请输入其他考试题型" size="small" :disabled="datas.disabled" />
    </el-form-item>

    <el-form-item prop="examDifficulties" label="考试重难知识点(e.g:假设检验、微分方程、M&M理论)" v-if="(testForm.examScope === 0 && datas.spoType == 69) || datas.spoType == 66">
      <el-input v-model="testForm.examDifficulties" type="textarea" placeholder="假设检验、微分方程、M&M理论" size="small" :disabled="datas.disabled" />
    </el-form-item>

    <el-form-item prop="examDifficultiesArr" label="考试重难知识点(e.g:假设检验、微分方程、M&M理论)" v-if="testForm.examScope === 1 && datas.spoType == 69">
      <p v-for="(theory, index) in testForm.examDifficultiesArr" :key="index" style="display: flex; width: 100%">
        <label>Theory name：</label>
        <el-input v-model="testForm.examDifficultiesArr[index].content" style="width: 300px" placeholder="假设检验、微分方程、M&M理论" size="small" :disabled="datas.disabled" />
      </p>
      <p v-if="!datas.disabled" class="btn-box">
        <span class="buttons-addtheory" @click="testForm.examDifficultiesArr.push({ content: '' })">新增</span>
      </p>
    </el-form-item>

    <el-form-item label="是否遇到问题or特殊要求" prop="specialRequirementsFlag">
      <el-radio-group v-model="testForm.specialRequirementsFlag" style="width: 100%" :disabled="datas.disabled">
        <el-radio :value="1">是</el-radio>
        <el-radio :value="0">否</el-radio>
      </el-radio-group>
      <template v-if="testForm.specialRequirementsFlag === 1">
        <el-input placeholder="请输入遇到问题or特殊要求" size="small" v-model="testForm.specialRequirements" :disabled="datas.disabled" />
      </template>
    </el-form-item>

    <el-form-item label="请上传登录学生系统查看的截图" prop="examExtFileList" v-if="datas.showUpload">
      <el-upload
        action="https://classbro-oss.oss-accelerate.aliyuncs.com/"
        v-if="!datas.disabled"
        :data="ossData"
        :multiple="false"
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload"
      >
        <div class="default-btn" id="allupload">上传图片</div>
      </el-upload>
      <div v-for="(imgs, index) in testForm.examExtFileList" :key="index" class="show-img-style">
        <img :src="imgs.loginScreenshotFileUrl" alt="" />
        <i v-if="!datas.disabled" class="el-icon-circle-close position-delete" @click="deleteImg(index)"></i>
      </div>
    </el-form-item>
  </el-form>
</template>

<style>
.testForm-wrap .el-radio__input.is-disabled.is-checked .el-radio__inner::after { background: #ff814a; }
.testForm-wrap .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after { border-color: #fff; }
.testForm-wrap .el-checkbox__input.is-checked + .el-checkbox__label,
.testForm-wrap .el-radio__input.is-checked + .el-radio__label { color: #222; }
.testForm-wrap .el-form-item__label { line-height: 24px; color: #666; width: 100%; text-align: left; }
.no-mar-b.el-form-item { margin-bottom: 0 !important; }
</style>

<style lang="scss" scoped>
.examScope-other-box {
  float: right;
  display: flex;
  align-items: center;
  color: black;
  margin-top: -10px;
  input {
    width: 35px; height: 34px; line-height: 34px;
    margin: 0 0 0 8px; text-align: center;
    border-radius: 6px; border: 1px solid #e7e7e7;
  }
  span { margin: 0 22px; }
}
.show-img-style {
  width: 104px; height: 104px; display: inline-block;
  margin-right: 10px; border-radius: 4px; position: relative; overflow: hidden;
  &:hover .position-delete { display: block; }
  img { display: block; width: 100%; height: 100%; }
  .position-delete { display: none; position: absolute; top: 10px; right: 4px; }
}
.testForm-wrap { padding: 0 20px; }
.buttons-addtheory {
  display: inline-block; width: 50px; margin-right: 120px;
  height: 24px; line-height: 24px; border-radius: 33px;
  text-align: center; font-size: 14px; cursor: pointer; color: #fff;
  background: linear-gradient(143deg, #ff0878 0%, #ffa113 100%);
}
.btn-box { margin-left: 98px; margin-bottom: 0; }
</style>
