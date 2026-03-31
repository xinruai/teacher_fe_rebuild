<script setup lang="ts">
import { computed, ref } from 'vue'
import { StageClassesType } from '@/constants/enums'
import { ClassFileType2Val } from '../../cfg/Table'
import MaterialListModal from '../Modal/MaterialList.vue'
import MaterialUploadModal from '../Modal/Upload/index.vue'

const props = defineProps<{
  data: any
  stageType: number
  stageId: string | number
}>()

const materialListRef = ref<InstanceType<typeof MaterialListModal>>()
const materialUploadRef = ref<InstanceType<typeof MaterialUploadModal>>()

const isDissertation = computed(() => props.data.type === StageClassesType.DISSERTATION)

const fileTypes = computed(() => {
  if (!props.data.teacherFilsValue) return []
  return props.data.teacherFilsValue
})

function lookUp() {
  materialListRef.value?.show({
    courseId: props.data.courseId,
    stageClassId: props.data.id,
  })
}

function openUpload(stageClassFileType?: number) {
  materialUploadRef.value?.show({
    stageId: props.stageId,
    stageClassId: props.data.id,
    courseId: props.data.courseId,
    stageClassFileType,
    isDissertation: isDissertation.value,
  })
}
</script>

<template>
  <div class="g-material">
    <template v-if="fileTypes.length > 1">
      <div v-for="ft in fileTypes" :key="ft" class="g-material__item">
        <span class="g-material__label">{{ ClassFileType2Val[ft] || '' }}</span>
        <el-button size="small" link type="primary" @click="openUpload(ft)">上传文件</el-button>
      </div>
    </template>
    <template v-else-if="fileTypes.length === 1">
      <el-button size="small" link type="primary" @click="openUpload(fileTypes[0])">上传文件</el-button>
    </template>
    <template v-else>
      <el-button size="small" link type="primary" @click="openUpload()">上传文件</el-button>
    </template>
    <el-button size="small" link type="primary" @click="lookUp">查看文件</el-button>
    <span v-if="isDissertation" class="g-material__tip">*必论文修改需上传</span>
    <MaterialListModal ref="materialListRef" />
    <MaterialUploadModal ref="materialUploadRef" />
  </div>
</template>

<style scoped lang="scss">
.g-material {
  &__item {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 3px;
  }

  &__label {
    font-size: 12px;
    color: #666;
  }

  &__tip {
    color: #f00;
    font-size: 12px;
    display: block;
  }
}
</style>
