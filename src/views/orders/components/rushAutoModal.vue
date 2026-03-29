<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { titleEnum } from '@/views/orders/cfg'
import { handRushOrder } from '@/api/modules/order'

const router = useRouter()

const isShow = ref(false)
const current = ref<any>({})
const isKnow = ref(false)
const loading = ref(false)

const isNewLastMinuteCramming = computed(() => current.value.examPrepStatus === 2)

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

function show(row: any) {
  isShow.value = true
  current.value = row
}

function closeModal() {
  isShow.value = false
  current.value = {}
  isKnow.value = false
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
  const { courseId } = current.value
  const url = router.resolve({
    path: '/getOrderSchemePage',
    query: { courseId, isNewLastMinuteCramming: String(isNewLastMinuteCramming.value) },
  })
  window.open(url.href)
}

defineExpose({ show, closeModal })
</script>

<template>
  <div>
    <el-dialog
      v-model="isShow"
      title="抢单后禁止吐单！"
      width="760px"
      :close-on-click-modal="false"
      @close="closeModal"
    >
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
      <div class="show-know-tip">
        <p v-if="isNewLastMinuteCramming" class="new-last-minute-cramming">
          此为【保Pass版】考前突击产品，请认真查阅协议
          <i class="el-icon-bottom"></i><i class="el-icon-bottom"></i><i class="el-icon-bottom"></i>
        </p>
        <el-checkbox v-model="isKnow" />
        <span>我同意遵守<span class="scheme-name" @click="goToScheme">{{ titleEnum[current.spoType] }}服务协议<i class="el-icon-top-right"></i></span></span>
      </div>
      <template #footer>
        <div class="footer">
          <el-button type="primary" size="small" @click="confirm" :disabled="!isKnow" :loading="loading">确认抢单</el-button>
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
  .el-dialog__title {
    font-weight: 600;
  }
}
.header-desc {
  color: #979797;
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
  .item {
    line-height: 30px;
    margin-top: 15px;
  }
  .item-text {
    font-weight: 700;
    color: #3d3d3d;
  }
  .item-desc {
    color: #979797;
    font-size: 13px;
    position: relative;
    line-height: 24px;
    padding-left: 20px;
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
.show-know-tip {
  margin-top: 24px;
  padding-left: 18px;
  color: #3d3d3d;
  span {
    color: #3d3d3d;
  }
  .scheme-name {
    color: #487bf3;
    cursor: pointer;
  }
  .el-icon-top-right {
    color: #487bf3;
    position: relative;
    top: 2px;
  }
  .new-last-minute-cramming {
    font-weight: bold;
    color: #da5b54;
    font-size: 16px;
    .el-icon-bottom {
      font-weight: bold;
      color: inherit;
    }
  }
}
:deep(.el-checkbox__input.is-checked .el-checkbox__inner),
:deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
  background-color: #ff8723;
  border-color: #ff8723;
}
:deep(.el-checkbox__inner:hover) {
  border-color: #ff8723;
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
</style>
