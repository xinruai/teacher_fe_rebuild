<script setup lang="ts">
withDefaults(defineProps<{
  currentStep: number
  trainStep: number
  interviewStep: number
  preJobStep: number
  joinStep: number
  processList: Record<string, any>[]
}>(), {
  currentStep: 1,
  trainStep: 1,
  interviewStep: 1,
  preJobStep: 1,
  joinStep: 1,
  processList: () => [],
})
</script>

<template>
  <div class="desc-area">
    <div v-if="currentStep == 1">
      <div class="desc-title">面试说明</div>
      <div class="desc-text">面试流程包含四个步骤：</div>
      <div :class="['desc-dot mt10', interviewStep === 1 ? 'active' : '']">Step1：下载客户端</div>
      <div :class="['desc-dot', interviewStep === 2 ? 'active' : '']">Step2：查阅课堂操作指南</div>
      <div :class="['desc-dot', interviewStep === 3 ? 'active' : '']">Step3：下载试讲资料并测试课堂</div>
      <div :class="['desc-dot', interviewStep === 4 ? 'active' : '']">Step4：选择面试时间并参加</div>
    </div>
    <template v-if="currentStep == 2">
      <div class="desc-title">培训说明</div>
      <div class="desc-text">岗前培训包含以下步骤：</div>
      <div :class="['desc-dot mt10', preJobStep === 1 ? 'active' : '']">Step1：完成模块学习</div>
      <div :class="['desc-dot', preJobStep === 2 ? 'active' : '']">Step2：完成合同签署</div>
    </template>
    <template v-if="currentStep == 3">
      <div class="desc-title">学习说明</div>
      <div class="desc-text">产品学习包含以下步骤：</div>
      <div :class="['desc-dot mt10', trainStep === 1 ? 'active' : '']">Step1：了解产品类型与规则</div>
      <div :class="['desc-dot', trainStep === 2 ? 'active' : '']">Step2：完成核心产品学习</div>
    </template>
    <template v-if="currentStep == 4">
      <div class="desc-title">入职说明</div>
      <div class="desc-text">正式入职包含以下步骤：</div>
      <div :class="['desc-dot mt10', joinStep === 1 ? 'active' : '']">Step1：解锁抢单池</div>
      <div :class="['desc-dot', joinStep === 2 ? 'active' : '']">Step2：加入企业微信</div>
      <div :class="['desc-dot', joinStep === 3 ? 'active' : '']">Step3：BC端口介绍</div>
      <div :class="['desc-dot', joinStep === 4 ? 'active' : '']">Step4：创建讲师档案</div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.desc-area {
  padding: 24px 30px;
  line-height: 24px;
  .desc-title {
    color: #1e1854;
    font-size: 18px;
    font-weight: 500;
  }
  .desc-text {
    color: #1e1854;
    margin-top: 12px;
  }
  .desc-dot {
    line-height: 30px;
    color: #7b849e;
    &.active {
      color: #7459d5;
    }
  }
}
.mt10 {
  margin-top: 10px !important;
}
</style>
