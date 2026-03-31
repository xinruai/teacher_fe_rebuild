<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import { ClassStatus2Val } from '../../cfg/Table'
import { StageClassesType } from '@/constants/enums'
import Material from './Material.vue'
import ArrangeClass from './ArrangeClass.vue'

const props = defineProps<{
  data: any
  stageType: number
  stageId: string | number
}>()

const fmtDate = computed(() => {
  if (!props.data.classStartTime) return '--'
  return dayjs(props.data.classStartTime).format('YYYY-MM-DD HH:mm')
})

const fmtMins = computed(() => {
  if (!props.data.classTime) return '--'
  return props.data.classTime + 'mins'
})

const isDissertation = computed(() => props.data.type === StageClassesType.DISSERTATION)
</script>

<template>
  <div class="g-right-row">
    <div class="g-right-row__col g-right-row__name">
      {{ data.className }}
    </div>
    <div class="g-right-row__col g-right-row__type" :class="{ 'is-dissertation': isDissertation }">
      {{ isDissertation ? '必论文修改' : data.type === StageClassesType.MUST ? '必修' : '选修' }}
    </div>
    <div class="g-right-row__col g-right-row__remark">
      <el-tooltip v-if="data.remark" :content="data.remark" placement="top">
        <span class="ellipsis">{{ data.remark }}</span>
      </el-tooltip>
      <span v-else>--</span>
    </div>
    <div class="g-right-row__col g-right-row__time">{{ fmtDate }}</div>
    <div class="g-right-row__col g-right-row__explain">
      {{ ClassStatus2Val[data.statused] || '--' }}
    </div>
    <div class="g-right-row__col g-right-row__class-remark">
      <el-tooltip v-if="data.classroomRemark" :content="data.classroomRemark" placement="top">
        <span class="ellipsis">{{ data.classroomRemark }}</span>
      </el-tooltip>
      <span v-else>--</span>
    </div>
    <div class="g-right-row__col g-right-row__mins">{{ fmtMins }}</div>
    <div class="g-right-row__col g-right-row__material">
      <Material :data="data" :stage-type="stageType" :stage-id="stageId" />
    </div>
    <div class="g-right-row__col g-right-row__arrange">
      <ArrangeClass :data="data" :stage-id="stageId" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.g-right-row {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e7e7e7;

  &__col {
    padding: 0 5px;
    font-size: 13px;
    color: #666;
    text-align: center;
  }

  &__name { width: 11%; }
  &__type {
    width: 8%;
    &.is-dissertation { color: #f00; font-weight: bold; }
  }
  &__remark { width: 20%; }
  &__time { width: 12%; }
  &__explain { width: 7%; }
  &__class-remark { width: 10%; }
  &__mins { width: 8%; }
  &__material { width: 10%; }
  &__arrange { width: 8%; }

  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
  }
}
</style>
