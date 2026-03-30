<script setup lang="ts">
import { ref, computed } from 'vue'
import { getLocal } from '@/utils/auth'

const dialogVisible = ref(false)

const name = computed(() => getLocal('teacinfo')?.nickName ?? '')

function showDialog() {
  dialogVisible.value = true
}

defineExpose({ showDialog })
</script>

<template>
  <el-dialog
    title=""
    v-model="dialogVisible"
    custom-class="tips-dialog"
    :show-close="false"
    :center="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="content">
      <p class="title">
        <img src="../../assets/images/small-question-bank/lihua.png" alt="" />
        欢迎体验 小班题库！
      </p>
      <p class="message">
        亲爱的 <span style="color: #4A53F8;">{{ name }}</span>，诚邀您作为首批特选讲师，体验【小班题库】内测版！<br />
        输入考点，一键精准寻找题目，让备课效率翻倍！您的每次使用，都在为题库进化加速！
        <img src="../../assets/images/small-question-bank/rocket.png" alt="" />
      </p>
    </div>
    <div class="section">
      <div class="block">
        <div class="button">
          <img src="../../assets/images/small-question-bank/img1.png" alt="" />
          题量丰富
        </div>
        <p class="message">一次检索可返回多道满足要求的题目</p>
        <div class="img-block">
          <img src="../../assets/images/small-question-bank/img3.png" alt="">
        </div>
      </div>
      <div class="block">
        <div class="button">
          <img src="../../assets/images/small-question-bank/img2.png" alt="" />
          任务并行
        </div>
        <p class="message">可同时对多个知识点进行题目搜索</p>
        <div class="img-block">
          <img src="../../assets/images/small-question-bank/img4.png" alt="">
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <button @click="dialogVisible = false">立即体验</button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss">
.tips-dialog {
  width: 838px;
  border-radius: 12px;
  overflow: hidden;
  .el-dialog__header {
    display: none;
  }
  .el-dialog__body {
    padding: 0;
  }
  .el-dialog__footer {
    padding: 30px 20px 37px 20px;
    button {
      width: 101px;
      height: 32px;
      background: #4a53f8;
      border-radius: 5px 5px 5px 5px;
      font-weight: 500;
      font-size: 13px;
      color: #ffffff;
      line-height: 27px;
    }
  }
  .content {
    padding: 31px 45px 16px 45px;
    background: linear-gradient(
      180deg,
      #d8ddfb 0%,
      rgba(255, 255, 255, 0) 100%
    );
    .title {
      font-weight: 700;
      font-size: 27px !important;
      color: #202425;
      line-height: 31px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 23px;
      img {
        margin-right: 8px;
      }
    }
    .message {
      font-size: 17px;
      color: #3d3d3d;
      line-height: 34px;
    }
  }
  .section {
    display: flex;
    justify-content: space-evenly;
    .block {
      text-align: center;
    }
    .button {
      width: 128px;
      height: 35px;
      background: #c5cdff;
      border-radius: 50px 50px 50px 50px;
      font-weight: 600;
      font-size: 13px;
      color: #2a3047;
      line-height: 27px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      img {
        margin-right: 12px;
      }
    }
    .message {
      margin: 9px 0;
      font-weight: 400;
      font-size: 12px;
      color: #505050;
      line-height: 25px;
    }
    .img-block {
      width: 245px;
      height: 150px;
      background: #ffffff;
      box-shadow: 6px 4px 10px 2px rgba(85, 109, 192, 0.05);
      border-radius: 7px 7px 7px 7px;
      img {
        width: 100%;
      }
    }
  }
}
</style>
