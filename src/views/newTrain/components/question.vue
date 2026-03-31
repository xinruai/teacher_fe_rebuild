<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getLocal } from '@/utils/auth'
import { insertOrUpdateAnswer, queryAnswerById, queryQuestions } from '@/api/modules/newTrain'

const emit = defineEmits<{
  addstep: [question: Record<string, any>]
}>()

const submitted = ref(false)
const showQuestion = ref(false)
const questions = ref<any[]>([])
const question = ref<Record<string, any>>({})
const userAnswers = ref<any[]>([])
const questionId = ref<number | null>(null)

watch(questions, (newVal) => {
  userAnswers.value = newVal.map((q) => (q.type === 'checkbox' ? [] : ''))
  submitted.value = false
}, { deep: true })

function isCorrect(idx: number) {
  const q = questions.value[idx]
  const userAnswer = userAnswers.value[idx]
  if (q.type === 'radio') return userAnswer === q.correctAnswer
  if (q.type === 'checkbox') {
    const correctAnswers = Array.isArray(q.correctAnswer) ? q.correctAnswer : String(q.correctAnswer || '').split(',')
    return userAnswer.length === correctAnswers.length && userAnswer.every((ans: string) => correctAnswers.includes(ans))
  }
  return false
}

async function handleSubmit() {
  if (userAnswers.value.some((ans) => ans === '' || (Array.isArray(ans) && ans.length === 0))) {
    ElMessage.warning('请完成所有题目后再提交')
    return
  }
  const answers: Record<string, string> = {}
  questions.value.forEach((q, idx) => {
    if (q.type === 'checkbox') {
      answers[q.questionSerial] = Array.isArray(userAnswers.value[idx]) ? userAnswers.value[idx].join(',') : ''
    } else {
      answers[q.questionSerial] = userAnswers.value[idx]
    }
  })
  const teacId = getLocal<any>('teacinfo')?.id
  const { status } = await insertOrUpdateAnswer({
    teacId,
    questionId: questionId.value,
    answers: JSON.stringify(answers),
    answeredNum: questions.value.filter((_, idx) => isCorrect(idx)).length,
  })
  if (status == 200) {
    submitted.value = true
    emit('addstep', question.value)
  }
}

async function showDialog(data: Record<string, any>) {
  question.value = data
  const res = await queryQuestions({ type: question.value.type })
  if (res.status == 200 && res.body?.length) {
    questions.value = JSON.parse(res.body[0].questions)
    questionId.value = res.body[0].id
  }
  showQuestion.value = true
  const teacId = getLocal<any>('teacinfo')?.id
  const { status, body } = await queryAnswerById({ teacId, questionId: questionId.value })
  if (status == 200 && body?.answers) {
    const answersObj = JSON.parse(body.answers)
    userAnswers.value = questions.value.map((q) => {
      const ans = answersObj[q.questionSerial]
      return q.type === 'checkbox' ? (ans ? ans.split(',') : []) : (ans || '')
    })
    submitted.value = true
  }
}

function closeQuestion() {
  showQuestion.value = false
}

defineExpose({ showDialog })
</script>

<template>
  <el-dialog v-model="showQuestion" width="50%" append-to-body @close="closeQuestion">
    <div class="questionnaire-popup">
      <div v-for="(item, idx) in questions" :key="idx" class="question-block">
        <div class="question-title" v-html="item.question"></div>
        <el-radio-group v-if="item.type === 'radio'" v-model="userAnswers[idx]" class="option-group" :disabled="submitted">
          <el-radio v-for="option in item.answerOptions" :key="option.sericalNumber" :label="option.sericalNumber">
            {{ option.sericalNumber }}. {{ option.text }}
          </el-radio>
        </el-radio-group>
        <el-checkbox-group v-else-if="item.type === 'checkbox'" v-model="userAnswers[idx]" class="option-group" :disabled="submitted">
          <el-checkbox v-for="option in item.answerOptions" :key="option.sericalNumber" :label="option.sericalNumber">
            {{ option.sericalNumber }}. {{ option.text }}
          </el-checkbox>
        </el-checkbox-group>
        <div v-if="submitted" class="result-row">
          <span :class="{ correct: isCorrect(idx), wrong: !isCorrect(idx) }">{{ isCorrect(idx) ? '答对了' : '答错了' }}</span>
        </div>
      </div>
      <div class="btn-row" v-if="!submitted">
        <el-button round type="primary" @click="handleSubmit">提交</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.questionnaire-popup { max-height: 50vh; overflow: auto; }
.question-block { margin-bottom: 16px; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; }
.question-title { font-weight: 500; margin-bottom: 8px; }
.option-group { display: flex; flex-direction: column; gap: 8px; }
.correct { color: #67c23a; }
.wrong { color: #f56c6c; }
.btn-row { text-align: center; margin-top: 16px; }
</style>
