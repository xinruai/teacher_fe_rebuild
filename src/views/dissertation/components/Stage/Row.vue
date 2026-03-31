<script setup lang="ts">
import { computed } from 'vue'
import { StageType2Val, OrderImg } from '../../cfg/Stage'
import { StageType2Val as PhaseVal } from '../../cfg/Table'
import { getChars } from '@/utils/Dissertation'
import Summary from './Summary.vue'

const props = defineProps<{
  data?: any
  header?: boolean
}>()

const showTooltip = computed(() => {
  if (!props.data) return false
  return getChars(props.data.contain) > 30
})
</script>

<template>
  <div class="g-row" :class="{ 'g-row--header': header }">
    <div class="g-row__col g-row__order">
      <template v-if="header">
        <span class="g-row__required">*</span>阶段顺序
      </template>
      <template v-else>
        <img v-if="OrderImg[data.statused]" :src="OrderImg[data.statused]" class="g-row__order-img" />
        <span>{{ StageType2Val[data.sort - 1] }}</span>
      </template>
    </div>
    <div class="g-row__col g-row__phase">
      <template v-if="header">阶段</template>
      <template v-else>{{ PhaseVal[data.stageType] }}</template>
    </div>
    <div class="g-row__col g-row__contain">
      <template v-if="header">包含课程</template>
      <template v-else>
        <el-tooltip v-if="showTooltip" :content="data.contain" placement="top">
          <span class="g-row__ellipsis">{{ data.contain }}</span>
        </el-tooltip>
        <span v-else>{{ data.contain }}</span>
      </template>
    </div>
    <div class="g-row__col g-row__already">
      <template v-if="header">已完成课时</template>
      <template v-else>{{ data.classTime || 0 }}mins</template>
    </div>
    <div class="g-row__col g-row__summary">
      <template v-if="header">阶段小结</template>
      <template v-else>
        <Summary :data="data" />
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.g-row {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e7e7e7;

  &--header {
    font-weight: bold;
    color: #333;
    background: #fafafa;
  }

  &__col {
    font-size: 14px;
    color: #666;
    padding: 0 5px;
  }

  &__order {
    width: 15%;
    display: flex;
    align-items: center;
  }

  &__order-img {
    width: 24px;
    height: 24px;
    margin-right: 5px;
  }

  &__phase { width: 15%; }
  &__contain { width: 30%; }
  &__already { width: 10%; }
  &__summary { width: 30%; }

  &__required {
    color: #f00;
    margin-right: 3px;
  }

  &__ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
  }
}
</style>
