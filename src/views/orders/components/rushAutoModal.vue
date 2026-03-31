<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { titleEnum } from '@/views/orders/cfg'
import { handRushOrder, isImportantOrder as isImportantOrderApi } from '@/api/modules/order'

const router = useRouter()

const isShow = ref(false)
const current = ref<any>({})
const isKnow = ref(false)
const loading = ref(false)
const isImportant = ref(false)

const isNewLastMinuteCramming = computed(() => current.value.examPrepStatus === 2)

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

async function show(row: any) {
  isShow.value = true
  current.value = row
  isImportant.value = false
  const res = await isImportantOrderApi({ courseId: row.courseId })
  if (res.status == 200) {
    isImportant.value = res.body
  }
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
      <div class="warn-info" v-if="isImportant">
        <div>
          <i class="el-icon-warning"></i>
          以下请确认无误后再抢单，若抢单后吐单，讲师抢单池权限将被调整，
          <span>抢单优先级下降</span>。<br/>
          如有任何疑问，请联系订单运营
        </div>
      </div>
      <div class="warn-info" v-else>
        <span><i class="el-icon-warning"></i> 若抢单后又吐单</span>
        <div class="has-dot">公司将按该订单的预计收入<span>扣除账户内薪资</span></div>
        <div class="has-dot">讲师<span>抢单池权限</span>将被调整，抢单<span>优先级下降</span></div>
      </div>
      <div v-if="isImportant">
        <div class="content">
          <div class="item">
            <div class="item-text">1. 高薪资订单</div>
            <div class="item-desc">该订单每千字服务薪资由30G上调至40G，对应订单pass线将调整成60分。</div>
          </div>
          <div class="item">
            <div class="item-text">2. 需进行终稿QC和修改</div>
            <div class="item-desc">为帮助讲师顺利获得薪资，讲师需至少提前DDL2天，提交论文终稿进行自动QC，根据QC意见进行修改。</div>
            <div style="font-weight: bold;">
              <span style="color: #da5b54;">QC入口：</span>讲师空间-备课中心-订单论文规划表
            </div>
          </div>
        </div>
      </div>
      <div class="content" v-else>
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
        <template v-if="!isImportant">
          <p>如有任何疑问，请随时联系订单运营沟通确认。充分了解需求后再抢单，保障良好的授课体验。</p>
          <p v-if="isNewLastMinuteCramming" class="new-last-minute-cramming">
            此为【保Pass版】考前突击产品，请认真查阅协议
            <i class="el-icon-bottom"></i><i class="el-icon-bottom"></i><i class="el-icon-bottom"></i>
          </p>
        </template>
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
  line-height: 22px;
  color: #333;
  .el-icon-warning {
    color: #da5b54;
  }
  span {
    color: #da5b54;
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
