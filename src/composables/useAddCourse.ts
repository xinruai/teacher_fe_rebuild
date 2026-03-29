import { ref, computed } from 'vue'
import { getBeiJinTime as getBeiJinTimeApi } from '@/api/modules/examOrder'
import { checkArrearsOrder as checkArrearsOrderApi } from '@/api/modules/preExam'

export function useAddCourse() {
  const beijingTime = ref<string | Date>(new Date())
  const overList = ref<any[]>([])

  const overTime = computed(() => overList.value.length)

  async function getBeiJinTime() {
    const res: any = await getBeiJinTimeApi()
    if (res.status === 200) {
      beijingTime.value = res.body?.date?.replace(/-/g, '/')
    }
  }

  async function checkArrearsOrder(courseId: string | number) {
    const res: any = await checkArrearsOrderApi({ courseId })
    if (res.status === 200) {
      overList.value = res.body || []
    }
  }

  return { beijingTime, overList, overTime, getBeiJinTime, checkArrearsOrder }
}
