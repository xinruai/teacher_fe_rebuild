<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import salaryRules from '@/views/newSalary/components/salaryRules.vue'

const route = useRoute()
const salaryRulesRef = ref<InstanceType<typeof salaryRules>>()

const isNewCrm = computed(() => route.query.isNewCrm === 'true')

function showModal() {
  salaryRulesRef.value?.show()
}
</script>

<template>
  <div>
    <div class="item-title">薪资规则说明</div>
    <div class="rules-content">
      <div class="rule-item">提现开放时间为每周一00:00至23:59。每周二23:59后，已提现的工资单将进行封账处理，此后产生的新收入及扣除将计入下一周期；</div>
      <div class="rule-item">工资单提现成功后，将于每周三统一安排打款；</div>
      <div class="rule-item">
        根据国家税收法规，讲师需依法对其收入缴纳个人所得税。
        <div v-if="!isNewCrm" @click="showModal" class="see-more">查看更多<i class="el-icon-d-arrow-right"></i></div>
      </div>
    </div>
    <salaryRules ref="salaryRulesRef" />
  </div>
</template>

<style scoped lang="scss">
.rules-content {
  position: relative;
  height: 100px;
  background: #f4f4f4;
  border-radius: 8px;
  padding: 0px 20px;
  line-height: 20px;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  .rule-item {
    position: relative;
    padding-left: 10px;
    margin-bottom: 5px;
    span {
      color: #fd9535;
    }
    &::before {
      display: inline-block;
      content: "";
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #303133;
      position: absolute;
      left: 0;
      top: 8px;
    }
    &:nth-child(3) {
      margin-bottom: 0;
    }
  }
}
.see-more {
  position: absolute;
  right: 0;
  bottom: 0;
  color: #fd9535;
  cursor: pointer;
  i {
    color: #fd9535;
  }
}
</style>
