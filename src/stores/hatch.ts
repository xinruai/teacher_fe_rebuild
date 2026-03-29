import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { HatchRouterPath as RouterPath } from '@/constants/enums'
import {
  formatSeconds,
  clearCacheInterval,
  cacheIntervalId,
  getFmtCurrentLine,
  getTeacherInfo,
} from '@/utils/task/Utils'

interface ProcessStep {
  loading?: boolean
  visited?: boolean
  processName?: string
  doing?: boolean
  path?: string
  [key: string]: unknown
}

function calcExpires(endTimeStamp: number): number {
  if (endTimeStamp <= Date.now()) return 0
  return dayjs(endTimeStamp).diff(dayjs(), 'minutes')
}

export const useHatchStore = defineStore('hatch', {
  state: () => ({
    fuvfalg: 0,
    countdown: 0 as number | string,
    countTime: '' as string,
    process: {
      one: {} as ProcessStep,
      two: {} as ProcessStep,
      three: {
        loading: false,
        visited: false,
        processName: '定制我的讲师形象',
        doing: false,
        path: RouterPath.ID_FORM,
      } as ProcessStep,
      four: {
        loading: false,
        visited: false,
        processName: '进入系统',
        doing: false,
        path: RouterPath.PERSON_DETAIL,
      } as ProcessStep,
    },
  }),
  actions: {
    startCountdown(minute: number) {
      clearCacheInterval()
      let calcSecond = minute * 60
      const intervalId = setInterval(() => {
        if (calcSecond <= 0) {
          clearInterval(intervalId)
        }
        this.countdown = formatSeconds(calcSecond)
        calcSecond -= 1
      }, 1000)
      cacheIntervalId(intervalId)
    },

    async currentLine() {
      // TODO: Wire up actual hatch API (trainingplan)
      // const { id: teacherId } = getTeacherInfo()
      // const { body } = await trainingplan.getCurryProcessByTeacId({ teacherId })
      // this.fuvfalg = body.fuvFalg
      // const { childProcess } = await getFmtCurrentLine(body)
      // const [one, two, three, four] = childProcess
      // this.process.one = one
      // this.process.two = two
      // this.process.three = three
      // this.process.four = four
      // const { body: endData } = await trainingplan.getProcessStartedTime(teacherId)
      // this.countTime = endData.endTime
    },

    async doAfterStep() {
      // TODO: Wire up actual hatch API
      // const { id: teacherId } = getTeacherInfo()
      // const { body } = await trainingplan.doAfterStep({ teacherId })
    },

    async getIdFormStatus() {
      // TODO: Wire up actual hatch API
      // this.process.three.visited = false
      // const { body, status } = await trainingplan.getMyInfo()
      // if (status === 200) {
      //   if (!body.thumb) {
      //     this.process.three.visited = true
      //     this.process.three.doing = true
      //     return 'step three'
      //   } else {
      //     this.process.three.visited = true
      //     this.process.three.doing = false
      //     this.process.four.visited = true
      //     this.process.four.doing = true
      //     return 'step four'
      //   }
      // }
    },
  },
})
