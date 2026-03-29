import { ref } from 'vue'
import { findClassroomInfo as findClassroomInfoApi } from '@/api/modules/classtable'

export function useClassroom() {
  // Template ref to goMKClass component — consumer must bind: ref="goClassInRef"
  const goClassInRef = ref<InstanceType<any> | null>(null)

  async function goInClassNew(_secretKey: string, _url: string, row: Record<string, any>) {
    goClassIn(row)
  }

  async function findClassroomInfo(row: Record<string, any>) {
    return await findClassroomInfoApi(row)
  }

  async function goClassIn(row: Record<string, any>, type = 1) {
    goClassInRef.value?.show(row.id, type)
  }

  return { goClassInRef, goInClassNew, findClassroomInfo, goClassIn }
}
