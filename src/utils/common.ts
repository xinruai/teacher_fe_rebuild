import { scheduleWebUrl, coursewareUrl, publicOrderDetailUrl } from '@/api/config'
import { getCodeByToken } from '@/api/modules/preExam'
import type { Router } from 'vue-router'

const urlList: Record<number, string> = {
  0: 'customizedTutoring',
  27: 'paperPolishing',
  26: 'dbCoursePackage',
}

export function goToPreExamSchedule(list: { courseId: string | number }) {
  const url = `${scheduleWebUrl}schedule?token=${localStorage.getItem('teactoken')}&courseId=${list.courseId}&isPermision=1`
  window.open(url)
}

async function generateCode() {
  const res = await getCodeByToken()
  if (res.status == 200) {
    return res.body.msg
  }
}

export async function goToBeiKe(list?: { courseId?: string | number; spoType?: number; orderNo?: string }) {
  const code = await generateCode()
  const url = `${coursewareUrl}myOrder?code=${code}&isPermision=1${list ? `&courseId=${list.courseId}&spoType=${list.spoType}&orderNo=${encodeURIComponent(list.orderNo || '')}` : ''}`
  window.open(url)
}

export async function goToPublicDetail(list: Record<string, any>) {
  const url = `${publicOrderDetailUrl}orderDetails/${urlList[list.spoType]}?systemCode=teacher&courseId=${list.courseId}&token=${localStorage.getItem('teactoken')}`
  window.open(url)
}

export const JudgeNewOrder = (row: Record<string, any>) => {
  return [26, 27].includes(+row.spoType) || ([0].includes(+row.spoType) && [2].includes(row.courseVersion!))
}

export const goToOrderDetail = (row: Record<string, any>, router: Router) => {
  if (JudgeNewOrder(row)) {
    goToPublicDetail(row as any)
  } else if (row.spoType === 64) {
    const resolved = router.resolve({
      path: '/bigClassRoom',
      query: { id: row.courseId, parentId: '' },
    })
    window.open(resolved.href)
  } else {
    let type = 'daobi'
    if (row.courseType === 4) {
      type = 'wenyaold'
    }
    if (row.spoType === 69) {
      type = 'wenya'
    }
    const resolved = router.resolve({
      path: '/sellerDetail',
      query: { id: row.courseId, type },
    })
    window.open(resolved.href)
  }
}
