<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useDissertationStore } from '@/stores/dissertation'
import { Storage, CrmRouterLinkArgs } from '@/constants/enums'
import { StageType, ClassStatus } from '@/constants/enums'
import Title from './components/Title.vue'
import Stage from './components/Stage/index.vue'
import TableSection from './components/Table/index.vue'
import AdjustClassModal from './components/Modal/AdjustClass.vue'

const route = useRoute()
const dissertationStore = useDissertationStore()
const { tables } = storeToRefs(dissertationStore)
const adjustModalRef = ref<InstanceType<typeof AdjustClassModal>>()

function parseReadonly(raw: unknown, fallback: boolean): boolean {
  if (raw === undefined || raw === null || raw === '') return fallback
  if (typeof raw === 'boolean') return raw
  const value = String(raw).toLowerCase()
  return value === 'true' || value === '1'
}

function isTruthy(raw: unknown): boolean {
  if (raw === undefined || raw === null || raw === '') return false
  if (typeof raw === 'boolean') return raw
  const value = String(raw).toLowerCase()
  return value === 'true' || value === '1'
}

function applyRouteState(): boolean {
  const queryCourseId =
    (route.query.courseId as string | undefined) ||
    (route.query[CrmRouterLinkArgs.COURSE_ID] as string | undefined)
  const cachedCourseId = localStorage.getItem(Storage.COURSE_ID)
  const nextCourseId = queryCourseId ?? (cachedCourseId ? JSON.parse(cachedCourseId) : null)

  if (!nextCourseId) {
    ElMessage.error('缺少课程ID，无法加载毕业论文规划表')
    return false
  }

  dissertationStore.setCourseId(nextCourseId)
  localStorage.setItem(Storage.COURSE_ID, JSON.stringify(nextCourseId))

  const readonlyFromQuery = route.query.readonly
  const nextReadonly = parseReadonly(readonlyFromQuery, dissertationStore.readonly)
  dissertationStore.readonly = nextReadonly
  localStorage.setItem(Storage.READ_ONLY, JSON.stringify(nextReadonly))

  const crmByHashArgs = Boolean(route.query[CrmRouterLinkArgs.TOKEN]) || Boolean(route.query[CrmRouterLinkArgs.PATH])
  const crmByNormalArgs = isTruthy(route.query.crm) || isTruthy(route.query.isCrm)
  const isCrmLink = crmByHashArgs || crmByNormalArgs
  const isNewCrm = isTruthy(route.query.newCrm) || isTruthy(route.query.isNewCrm)
  if (isCrmLink) {
    localStorage.setItem(Storage.CRM_LINK_DISS, '1')
    if (isNewCrm) {
      localStorage.setItem(Storage.NEW_LINK_DISS, '1')
    } else {
      localStorage.removeItem(Storage.NEW_LINK_DISS)
    }
  } else if (route.query.courseId) {
    localStorage.removeItem(Storage.CRM_LINK_DISS)
    localStorage.removeItem(Storage.NEW_LINK_DISS)
  }
  return true
}

async function initPage() {
  if (!applyRouteState()) return
  try {
    await Promise.all([dissertationStore.initTitle(), dissertationStore.reload()])
    // Source parity: show adjust-tip modal when the FIXED_TOPIC stage first class is WAIT.
    const secondStage = (tables.value as any[])?.[1]
    const stageType = Number(secondStage?.stageType)
    const firstClass = (secondStage?.stageClass || secondStage?.stageClassInstance)?.[0]
    const classStatus = Number(firstClass?.statused)
    if (stageType === StageType.FIXED_TOPIC && classStatus === ClassStatus.WAIT) {
      adjustModalRef.value?.show()
    }
  } catch (_error) {
    ElMessage.error('加载毕业论文数据失败，请稍后重试')
  }
}

watch(
  () => route.query,
  () => {
    initPage()
  },
  { immediate: true },
)
</script>

<template>
  <div class="dissertation-page">
    <div class="dissertation-page__inner">
      <Title />
      <Stage />
      <TableSection />
      <AdjustClassModal ref="adjustModalRef" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.dissertation-page {
  min-height: 100%;
  padding: 16px;
  background: #f5f7fa;

  &__inner {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
  }
}
</style>
