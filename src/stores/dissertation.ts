import { defineStore } from 'pinia'
import { isNil } from 'lodash-es'
import {
  paper_stage,
  paper_teacherRate,
  crmStageTable,
  crmTeacherRate,
} from '@/api/modules/paper'
import {
  DissertationRouterPath,
  Storage,
  HeaderStatused,
  paperRouterPath,
} from '@/constants/enums'
import router from '@/router'

function cacheIdAndStatus({ courseId, readonly }: { courseId: string | number; readonly: boolean }) {
  localStorage.removeItem(Storage.COURSE_ID)
  localStorage.removeItem(Storage.READ_ONLY)
  localStorage.setItem(Storage.COURSE_ID, JSON.stringify(courseId))
  localStorage.setItem(Storage.READ_ONLY, JSON.stringify(readonly))
}

function getReadonly(): boolean {
  return JSON.parse(localStorage.getItem(Storage.READ_ONLY) || 'false')
}

function getCourseId(): string | number | null {
  const val = localStorage.getItem(Storage.COURSE_ID)
  return val ? JSON.parse(val) : null
}

export const useDissertationStore = defineStore('dissertation', {
  state: () => ({
    disabled: false,
    tables: [] as unknown[],
    stages: [] as unknown[],
    titleData: {} as Record<string, unknown>,
    rate: null as number | null,
    stageLoading: false,
    progressOver: false,
    courseId: getCourseId(),
    readonly: getReadonly(),
  }),
  actions: {
    setDisabled(bool: boolean) {
      this.disabled = bool
    },
    setCourseId(id: string | number) {
      this.courseId = id
    },
    async reload() {
      this.stageLoading = true
      try {
        const isCrm = localStorage.getItem(Storage.CRM_LINK_DISS)
        let res: any
        if (isCrm) {
          res = await crmStageTable({ courseId: this.courseId as number })
        } else {
          res = await paper_stage({ id: this.courseId as number })
        }
        if (res.status === 200) {
          this.tables = res.body
          this.stages = res.body.map((item: any) => ({
            ...item,
            contain: item.stageClass?.map((stage: any) => stage.className).join('、') || '',
          }))
        }
      } finally {
        this.stageLoading = false
      }
    },
    async initTitle() {
      const isCrm = localStorage.getItem(Storage.CRM_LINK_DISS)
      let res: any
      if (isCrm) {
        res = await crmTeacherRate({ courseId: this.courseId as number })
      } else {
        res = await paper_teacherRate({ courseId: this.courseId as number })
      }
      if (res.status === 200) {
        const { OVER, ERR_OVER } = HeaderStatused
        const { schedule, dealDeadline, officialDeadline, statused, rate } = res.body
        this.titleData = {
          schedule: Math.round(+schedule * 100),
          dealDeadline,
          officialDeadline,
          statused,
          rate,
        }
        this.progressOver = [OVER, ERR_OVER].includes(+statused)
        this.rate = rate
      }
    },
    async gotoDissertation(data: { courseId: string | number; readonly: boolean }) {
      const { courseId, readonly } = data
      if (isNil(courseId) || isNil(readonly)) throw new Error('courseId or readonly is Nil')
      cacheIdAndStatus({ courseId, readonly })
      const resolved = router.resolve({
        path: DissertationRouterPath.HOME,
        query: { courseId: String(courseId) },
      })
      localStorage.setItem('7', JSON.stringify(courseId))
      window.open(resolved.href, '_blank')
    },
    async crmGotoDissertation(data: { courseId: string | number }) {
      const { courseId } = data
      if (isNil(courseId)) throw new Error('courseId is Nil')
      cacheIdAndStatus({ courseId, readonly: true })
      router.push(DissertationRouterPath.HOME)
    },
    async crmGotoPaperRouterPath(data: {
      courseId: string | number
      isPermision?: boolean
      flag?: boolean
    }) {
      const { courseId, isPermision, flag } = data
      if (isNil(courseId)) throw new Error('courseId is Nil')
      cacheIdAndStatus({ courseId, readonly: false })
      const query = { courseId: String(courseId), isPermision: String(isPermision) }
      if (flag) {
        const resolved = router.resolve({ path: paperRouterPath.HOME, query })
        window.open(resolved.href, '_blank')
      } else {
        router.push({ path: paperRouterPath.HOME, query })
      }
    },
  },
})
