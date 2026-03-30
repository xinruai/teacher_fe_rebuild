<script setup lang="ts">
defineProps<{
  data: {
    examKp: string
    questionType: number
    context?: string
  }
}>()

const types = ['全部', '选择题', '开放题', '', '计算题']
</script>

<template>
  <div class="card-wrap">
    <div class="card-info">
      <div class="info-item">
        {{ data.examKp }}
      </div>
      <div style="display: flex; width: 100%;">
        <div class="info-item">
          <div class="label">题型：</div>
          <div class="value">{{ types[data.questionType] }}</div>
        </div>
        <el-divider direction="vertical" />
        <div class="info-item" style="flex: 1;">
          <div class="label">详细描述：</div>
          <div class="value">{{ data.context || '无' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.card-wrap {
  display: flex;
  justify-content: end;
  padding: 10px 0 20px 0;
  background-color: #fff;

  .card-info {
    width: 100%;
    height: 90px;
    background: no-repeat center / cover;
    border: 1px solid #fff;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 0 20px;
    background: linear-gradient(192.30948deg, #ffffff -12%, rgba(255, 255, 255, 0) 27%), linear-gradient(180deg, #e8f1ff 0%, #fafcff 100%);
    position: relative;
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 96px;
      height: 90px;
      background-image: url("../../assets/images/small-question-bank/chapter-bg-left.png");
      background-size: 96px 90px;
      background-repeat: no-repeat;
    }
    &::after {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 220px;
      height: 90px;
      background-image: url("../../assets/images/small-question-bank/chapter-bg-right.png");
      background-size: 220px 90px;
      background-repeat: no-repeat;
    }
  }

  .info-item {
    display: flex;
    font-size: 15px;
    line-height: 26px;

    .label {
      white-space: nowrap;
    }
    .value {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
    }

    .label,
    .value {
      color: #999;
      font-size: 12px;
      z-index: 1;
    }
  }

  .el-divider {
    margin: 0 30px;
    margin-top: 6px;
  }
}
</style>
