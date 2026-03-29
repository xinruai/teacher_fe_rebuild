import { defineStore } from 'pinia'
import { algorithmUrl } from '@/api/config'

interface QuestionTask {
  id: number | string
  courseId?: string | number
  examKp?: string
  context?: string
  questionType?: number
  majorName?: string
  courseName?: string
  courseCode?: string
  universityName?: string
  status: number
  timer: ReturnType<typeof setInterval> | null
  stepElapsed: number
  activeStep: number
  isResultReturned: boolean
  showEmpty: boolean
  showResult: boolean
  isStreaming: boolean
  reader: ReadableStreamDefaultReader | null
  typeQuestions: {
    type2: unknown[]
    type5: unknown[]
    type4: unknown[]
    type3: unknown[]
  }
  streamingData: string
  buffer: string
  type2And5Loading: boolean
  type4Loading: boolean
  type3Loading: boolean
  [key: string]: unknown
}

export const useSmallQuestionBankStore = defineStore('smallQuestionBank', {
  state: () => ({
    tasks: [] as QuestionTask[],
    activeTaskId: null as string | number | null,
    streamParams: null as Record<string, unknown> | null,
  }),
  actions: {
    setTasks(tasks: QuestionTask[]) {
      this.tasks = tasks
    },
    setActiveTask(id: string | number | null) {
      this.activeTaskId = id
    },
    startTaskTimer(taskId: string | number) {
      const task = this.tasks.find((t) => t.id === taskId)
      if (!task || task.timer) return

      if (typeof task.stepElapsed !== 'number') task.stepElapsed = 0
      if (typeof task.activeStep !== 'number') task.activeStep = 1

      task.timer = setInterval(() => {
        task.stepElapsed = (task.stepElapsed || 0) + 1
        if (task.stepElapsed <= 5) {
          task.activeStep = 1
        } else if (task.stepElapsed > 5 && task.stepElapsed <= 10) {
          task.activeStep = 2
        } else {
          task.activeStep = 3
        }
      }, 1000)
    },
    stopTaskTimer(taskId: string | number) {
      const task = this.tasks.find((t) => t.id === taskId)
      if (task && task.timer) {
        clearInterval(task.timer)
        task.timer = null
      }
      if (task) {
        task.isStreaming = false
        if (task.reader) {
          task.reader.cancel()
          task.reader = null
        }
      }
    },
    setTaskTime(payload: {
      taskId: string | number
      activeStep: number
      stepElapsed: number
    }) {
      const task = this.tasks.find((t) => t.id === payload.taskId)
      if (task) {
        task.activeStep = payload.activeStep
        task.stepElapsed = payload.stepElapsed
      }
    },
    setTaskResultReturned(taskId: string | number) {
      const task = this.tasks.find((t) => t.id === taskId)
      if (task) task.isResultReturned = true
    },
    resetTaskProgress(taskId: string | number) {
      const task = this.tasks.find((t) => t.id === taskId)
      if (task) {
        task.activeStep = 1
        task.stepElapsed = 0
        task.isResultReturned = false
        task.showEmpty = false
        task.showResult = false
      }
    },
    setStreamParams(params: Record<string, unknown> | null) {
      this.streamParams = params
    },

    restoreTaskTimers() {
      this.tasks.forEach((task) => {
        if (task.status === 1) return
        task.showEmpty = false
        if (task.status === 0 && !task.timer) {
          const stepElapsed = typeof task.stepElapsed === 'number' ? task.stepElapsed : 0
          const activeStep = typeof task.activeStep === 'number' ? task.activeStep : 1
          this.setTaskTime({ taskId: task.id, activeStep, stepElapsed })
          this.startTaskTimer(task.id)
          this.setStreamParams({
            task_id: task.id,
            course_id: task.courseId,
            exam_kp: task.examKp,
            context: task.context || '',
            question_type: task.questionType,
            major_name: task.majorName,
            course_name: task.courseName,
            course_code: task.courseCode,
            university_name: task.universityName,
          })
          this.startStream(task)
        }
      })
    },

    notifyTaskResultReturned(taskId: string | number) {
      this.setTaskResultReturned(taskId)
    },

    async startStream(task: QuestionTask) {
      task.typeQuestions = { type2: [], type5: [], type4: [], type3: [] }
      task.streamingData = ''
      task.buffer = ''
      task.isStreaming = false
      task.reader = null
      task.type2And5Loading = true
      task.type4Loading = true
      task.type3Loading = true

      const response = await fetch(`${algorithmUrl}/api/question/generate-blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.streamParams),
      })

      if (!response.ok) throw new Error('请求失败')

      task.reader = response.body!.getReader()
      const decoder = new TextDecoder()

      const parseJsonLine = (line: string) => {
        try {
          let jsonStr = line
          if (line.startsWith('data: ')) jsonStr = line.substring(6)
          jsonStr = jsonStr.trim()
          if (jsonStr === '' || jsonStr === ': heartbeat') return

          const data = JSON.parse(jsonStr)
          if (data.status === 'progress' && data.questions?.length > 0) {
            data.questions.forEach((question: any) => {
              switch (question.genType) {
                case 2: task.typeQuestions.type2.push(question); break
                case 5: task.typeQuestions.type5.push(question); break
                case 4: task.typeQuestions.type4.push(question); break
                case 3: task.typeQuestions.type3.push(question); break
              }
            })
          }
          if (data.status === 'finish') {
            if (data.genType === 5) task.type2And5Loading = false
            if (data.genType === 4) task.type4Loading = false
            if (data.genType === 3) task.type3Loading = false
          }
        } catch (error) {
          console.warn('解析 JSON 失败:', line, error)
        }
      }

      const processChunk = (chunk: string) => {
        task.buffer += chunk
        const lines = task.buffer.split('\n')
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim()
          if (line) parseJsonLine(line)
        }
        task.buffer = lines[lines.length - 1]
      }

      while (true) {
        const { done, value } = await task.reader.read()
        if (done) {
          task.isStreaming = false
          if (task.buffer.trim()) parseJsonLine(task.buffer.trim())
          break
        }
        processChunk(decoder.decode(value, { stream: true }))
      }
    },
  },
})
