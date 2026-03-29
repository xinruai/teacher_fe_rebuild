<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { handRushOrder } from '@/api/modules/order'

const router = useRouter()

const isShow = ref(false)
const current = ref<any>({})
const loading = ref(false)
const active = ref(1)

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

function show(row: any) {
  isShow.value = true
  current.value = row
  active.value = 1
}

function closeModal() {
  isShow.value = false
  current.value = {}
}

async function confirm() {
  loading.value = true
  const res = await handRushOrder({
    courseId: current.value.courseId,
    isAutoReceiveOrder: current.value.isAutoReceiveOrder,
  })
  loading.value = false
  if (res.status == 200) {
    ElNotification.success('抢单成功')
    closeModal()
    emit('refresh')
  }
}

function goToScheme() {
  active.value = 2
  const { courseId } = current.value
  const url = router.resolve({
    path: '/getOrderSchemePage',
    query: { courseId },
  })
  window.open(url.href)
}

defineExpose({ show, closeModal })
</script>

<template>
  <div>
    <el-dialog
      v-model="isShow"
      title="抢单须知"
      width="760px"
      :close-on-click-modal="false"
      @close="closeModal"
    >
      <div class="header-desc">为保证讲师明确重要产品的薪资模式和服务规则，务必确定了解服务协议后抢单</div>
      <div class="package-classes">
        <el-steps direction="vertical" :active="active">
          <el-step title="Step1：" />
          <el-step title="Step2：" />
        </el-steps>
        <div class="package-classes-content">
          <div class="header-title">抢单后禁止吐单！</div>
          <div class="header-desc">为了避免处罚，讲师在抢单前，请务必确认以下内容</div>
          <div class="warn-info">
            <span><i class="el-icon-warning"></i> 若抢单后又吐单</span>
            <div class="has-dot">公司将按该订单的预计收入<span>扣除账户内薪资</span></div>
            <div class="has-dot">讲师<span>抢单池权限</span>将被调整，抢单<span>优先级下降</span></div>
          </div>
          <div class="content">
            <div class="item">
              <div class="item-text">1. 个人能力匹配</div>
              <div class="item-desc">仔细阅读订单材料与需求，确保自身可胜任该辅导内容</div>
            </div>
            <div class="item">
              <div class="item-text">2. 满足时间要求</div>
              <div class="item-desc">关注订单首课时间及学生所在时区，确认时间安排无冲突</div>
            </div>
          </div>
          <div class="header-title">
            包课辅导订单服务协议
            <el-button type="primary" link @click="goToScheme">查看 <i class="el-icon-arrow-right"></i></el-button>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="footer">
          <el-button type="primary" size="small" @click="confirm" :disabled="active == 1" :loading="loading">确认抢单</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dialog) {
  border-radius: 10px;
}
:deep(.el-dialog__header) {
  padding: 30px 70px 0px;
  text-align: center;
  .el-dialog__title {
    font-weight: 600;
  }
}
.header-title {
  font-weight: 700;
  font-size: 32px;
  color: #3d3d3d;
  line-height: 45px;
  display: flex;
  justify-content: space-between;
  .el-button {
    :deep(span),
    :deep(i) {
      color: inherit;
    }
  }
}
.header-desc {
  font-weight: 400;
  font-size: 16px;
  color: #979797;
  line-height: 23px;
}
.warn-info {
  background-color: #fff0ed;
  padding: 12px;
  border-radius: 12px;
  margin-top: 16px;
  span {
    color: #da5b54;
    i {
      color: inherit;
    }
  }
  .has-dot {
    padding-left: 36px;
    margin-top: 8px;
    position: relative;
    &::before {
      content: '';
      width: 4px;
      height: 4px;
      display: inline-block;
      position: absolute;
      left: 20px;
      top: 6px;
      border-radius: 50%;
      background-color: #333;
    }
  }
}
:deep(.el-dialog__body) {
  padding: 10px 70px;
}
.content {
  color: #3d3d3d;
  padding-left: 18px;
  margin-top: 30px;
  margin-bottom: 70px;
  .item {
    line-height: 30px;
    margin-top: 15px;
  }
  .item-text {
    font-weight: 500;
    font-size: 18px;
    color: #3d3d3d;
    line-height: 25px;
  }
  .item-desc {
    font-weight: 500;
    font-size: 16px;
    color: #979797;
    line-height: 25px;
  }
}
:deep(.el-button--primary) {
  background: #ff8723 !important;
  border: none;
  width: 80px;
  display: block;
  float: right;
  margin-top: 40px;
  span {
    color: #fff;
  }
}
:deep(.footer) {
  .el-button {
    float: unset;
    margin: 0 auto;
    border-radius: 20px;
    width: auto;
    margin-top: 40px;
  }
  .is-disabled {
    background: rgba(255, 135, 35, 0.5) !important;
  }
}
.package-classes {
  display: flex;
  margin-top: 24px;
  .el-steps {
    height: auto;
    min-width: 110px;
    :deep(.el-step__head) {
      margin-top: 12px;
      .el-step__line {
        bottom: -12px;
        left: 6px;
        top: 28px;
        background: #e4e7ed;
      }
      .el-step__icon {
        height: 14px;
        width: 14px;
        border-radius: 50%;
        border: 1px solid #979dac;
        .el-step__icon-inner {
          font-size: 0;
        }
      }
      &.is-finish {
        border-color: #ff8440;
        .el-step__icon {
          background: #ff8440;
          border-color: #ff8440;
        }
      }
    }
    :deep(.el-step__title) {
      font-weight: 700;
      font-size: 32px;
      color: #979797;
      line-height: 45px;
    }
  }
  .package-classes-content {
    flex: 1;
  }
}
</style>
