<script setup lang="ts">
withDefaults(defineProps<{
  activeStep?: number
  showMessage?: boolean
}>(), {
  activeStep: 1,
  showMessage: true,
})

const steps = ['分析条件', '匹配题库', '搜索题目']

function getStepStatus(index: number, activeStep: number) {
  if (index < activeStep - 1) return 'finish'
  if (index === activeStep - 1) return 'process'
  return 'wait'
}
</script>

<template>
  <div class="loading-wrap">
    <div class="message" v-if="showMessage">
      <img src="../../assets/images/small-question-bank/search.png" alt="">
      正在为您搜素合适的题目
    </div>

    <div class="step-container">
      <div
        class="step-item"
        v-for="(item, index) in steps"
        :key="index"
        :class="[getStepStatus(index, activeStep)]"
      >
        <div class="step-icon">
          <span class="number" v-if="getStepStatus(index, activeStep) === 'wait'">{{ index + 1 }}</span>
          <span v-if="getStepStatus(index, activeStep) === 'process'" class="process">
            <img src="../../assets/images/small-question-bank/blueLoading.gif" alt="">
            <span class="number">{{ index + 1 }}</span>
          </span>
          <i class="el-icon-circle-check" v-if="getStepStatus(index, activeStep) === 'finish'"></i>
        </div>
        <div class="step-title">{{ item }}</div>
        <div class="step-line" v-if="index !== steps.length - 1"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loading-wrap {
  font-weight: 400;
  font-size: 15px;
  color: #3d3d3d;
  line-height: 18px;

  .message {
    margin: 35px auto 67px;
    display: flex;
    align-items: center;
    img {
      margin-right: 6px;
    }
  }

  .step-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 80px 0;

    .step-item {
      display: flex;
      align-items: center;
      position: relative;

      .step-icon {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid #C0C4CC;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fff;

        .process {
          position: relative;
          margin-top: 4px;
          img {
            height: 30px;
          }
          .number {
            position: absolute;
            top: 44%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        }

        .number {
          font-size: 12px;
          color: #C0C4CC;
        }

        i {
          font-size: 14px;
        }
      }

      .step-title {
        margin-left: 8px;
        font-size: 14px;
        color: #303133;
      }

      .step-line {
        width: 100px;
        height: 2px;
        background: #E2E2E2;
        margin: 0 20px;
      }

      &.process {
        .step-icon {
          border: 0;
          .el-icon-loading {
            font-size: 24px;
            color: #409EFF;
          }
        }
      }

      &.finish {
        .step-icon {
          border: 0;
          .el-icon-circle-check {
            font-size: 24px;
            color: #5E57F6;
          }
        }
        .step-line {
          background: #5E57F6;
        }
      }

      &.wait {
        .step-icon {
          border-color: #C0C4CC;
        }
      }
    }
  }
}
</style>
