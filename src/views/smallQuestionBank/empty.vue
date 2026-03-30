<script setup lang="ts">
const emit = defineEmits<{
  addNewTask: []
}>()
</script>

<template>
  <div class="empty-wrap">
    <img src="../../assets/images/small-question-bank/empty.png" alt="" />
    <p class="message">未找到相关题目，请重新描述您需要的题目</p>
    <button class="new-task-button" @click="emit('addNewTask')">
      <i class="el-icon-plus"></i>新任务
    </button>
  </div>
</template>

<style lang="scss">
.empty-wrap {
  text-align: center;
  .message {
    font-weight: 400;
    font-size: 15px;
    color: #7a7a7a;
    line-height: 18px;
  }
  .new-task-button {
    width: 162px;
    height: 45px;
    background: #e8eafd;
    border-radius: 87px 87px 87px 87px;
    border: 0px solid #466ae5;
    margin: 0 auto;
    font-size: 16px;
    color: #4a53f8;
    display: flex;
    align-items: center;
    justify-content: center;
    .el-icon-plus {
      color: inherit;
      margin-right: 12px;
    }
  }
}
</style>
