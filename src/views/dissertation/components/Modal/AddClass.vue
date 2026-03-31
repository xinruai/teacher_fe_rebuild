<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useDissertationStore } from '@/stores/dissertation'
import { StageType2ClassTypeListVal } from '../../cfg/Table'
import { add_class } from '@/api/modules/paper'

const dissertationStore = useDissertationStore()

const visible = ref(false)
const stageType = ref(0)
const courseIdVal = ref<string | number>('')
const classType = ref<number | null>(null)
const className = ref('')
const remark = ref('')
type ClassTypeOption = { classType: number; className?: string; label?: string }
const classTypes = ref<ClassTypeOption[]>([])

const classTypeOptions = computed(() => {
  if (classTypes.value.length > 0) return classTypes.value
  return (StageType2ClassTypeListVal[stageType.value] || []).map((item: any) => ({
    classType: Number(item.classType),
    label: item.label,
  })) as ClassTypeOption[]
})

function show(params: { stageType: number; courseId: string | number; stageData?: any }) {
  stageType.value = params.stageType
  courseIdVal.value = params.courseId
  const fromStage = (params.stageData?.stageClass || params.stageData?.stageClassInstance || []) as Array<any>
  classTypes.value = fromStage.map((item) => ({
    classType: Number(item.classType),
    className: item.className,
    label: item.label,
  }))
  const first = classTypeOptions.value[0]
  classType.value = first?.classType ?? null
  className.value = first?.className || first?.label || ''
  remark.value = ''
  visible.value = true
}

function onClassTypeChange(val: number) {
  const opt = classTypeOptions.value.find((o: any) => o.classType === val)
  if (opt) className.value = opt.className || opt.label || ''
}

async function submit() {
  if (!classType.value) {
    ElMessage.warning('请选择课堂类型')
    return
  }
  if (!className.value.trim()) {
    ElMessage.warning('课堂名称不能为空')
    return
  }
  await add_class({
    courseId: courseIdVal.value,
    stageType: stageType.value,
    classType: classType.value,
    className: className.value,
    remark: remark.value,
  })
  ElMessage.success('加课成功')
  visible.value = false
  dissertationStore.reload()
  dissertationStore.initTitle()
}

defineExpose({ show })
</script>

<template>
  <el-dialog v-model="visible" title="加课" width="600px" :close-on-click-modal="false">
    <el-form label-width="100px">
      <el-form-item label="课堂类型">
        <el-select v-model="classType" placeholder="请选择课堂类型" @change="onClassTypeChange">
          <el-option
            v-for="opt in classTypeOptions"
            :key="opt.classType"
            :label="opt.className || opt.label || ''"
            :value="opt.classType"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="课堂名称">
        <el-input v-model="className" disabled />
      </el-form-item>
      <el-form-item label="课堂说明">
        <el-input v-model="remark" type="textarea" :maxlength="255" :rows="3" placeholder="请输入课堂说明" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submit">确定</el-button>
    </template>
  </el-dialog>
</template>
