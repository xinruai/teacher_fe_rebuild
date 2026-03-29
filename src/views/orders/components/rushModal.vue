<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElNotification } from 'element-plus'
import { updateRegNotify } from '@/api/modules/order'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const isShow = ref(false)
const buttonLoading = ref(false)
const current = ref<any>({})

const regNotifyFlag = computed({
  get: () => userStore.regNotifyFlag,
  set: (value: number) => {
    userStore.changeRegNotifyFlag(value)
  },
})

const emit = defineEmits<{
  (e: 'confirmRegistration', row: any): void
}>()

function show(row: any) {
  isShow.value = true
  current.value = row
}

function confirmRegistration() {
  buttonLoading.value = true
  emit('confirmRegistration', current.value)
}

async function changeNotice(value: number) {
  const res = await updateRegNotify({ regNotifyFlag: value })
  if (res.status == 200) {
    userStore.changeRegNotifyFlag(value)
    ElNotification.success('操作成功')
  } else {
    ElNotification.success('操作失败')
  }
}

function closeModal() {
  isShow.value = false
  current.value = {}
  buttonLoading.value = false
}

defineExpose({ show, closeModal })
</script>

<template>
  <div>
    <el-dialog
      v-model="isShow"
      title="报名须知"
      width="674px"
      :close-on-click-modal="false"
    >
      <template #header>
        <div class="dialog-title">
          <p>报名须知</p>
          <p>订单需进行审核。请讲师耐心等待，若匹配成功运营将与你取得联系</p>
        </div>
      </template>
      <div class="content">
        <ul>
          <li>
            客户指定讲师订单
            <p>等待是否可以协调</p>
          </li>
          <li>
            特殊服务要求订单
            <p>审核是否满足对应的服务要求</p>
          </li>
          <li>
            长周期辅导产品
            <p>在接单前进行培训</p>
          </li>
        </ul>
      </div>
      <div class="content">
        <p style="font-weight: bold;">如何知晓报名结果？</p>
        <div class="item">
          <div class="label">1. 预计审核完成时间</div>
          <div class="colon">：</div>
          <div class="value">12H</div>
        </div>
        <div class="item">
          <div class="label">2. 在哪查看当前进度</div>
          <div class="colon">：</div>
          <div class="value">抢单池[报名记录]</div>
        </div>
        <div class="item">
          <div class="label">3. 如何加速匹配</div>
          <div class="colon">：</div>
          <div class="value">主动联系运营</div>
        </div>
        <div class="item">
          <div class="label">4. 如何实时了解进度</div>
          <div class="colon">：</div>
          <div class="value">
            开启[小班带你飞]实时通知
            <el-switch v-model="regNotifyFlag" :active-value="1" :inactive-value="0" @change="changeNotice" />
          </div>
        </div>
      </div>
      <div class="footer">
        <el-button type="primary" @click="confirmRegistration" :loading="buttonLoading">确认报名</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.content {
  color: #333333;
  margin-top: 24px;
  ul {
    text-align: left;
    p {
      color: #979797;
      margin-top: 4px;
    }
  }
  li {
    list-style: decimal;
  }
  .item {
    display: flex;
    border-bottom: 1px solid #aaa;
    padding: 4px 0;
    margin-left: 8px;
    .label {
      width: 140px;
    }
    .colon {
      width: 60px;
      text-align: center;
    }
    .el-switch {
      margin-left: 20px;
    }
  }
}
.footer {
  margin-top: 42px;
  text-align: center;
}
.dialog-title {
  p:first-child {
    font-weight: 700;
    font-size: 18px;
    margin-bottom: 4px;
  }
  p:last-child {
    font-weight: 400;
    color: #979797;
    margin-bottom: 0;
    span {
      color: #ff8723;
    }
  }
}
:deep(.el-dialog) {
  border-radius: 10px;
  .el-dialog__header {
    padding: 30px 70px 0px;
  }
  .el-dialog__body {
    padding: 0px 70px 40px 70px;
  }
  .el-button--primary {
    background: #ff8723 !important;
    border: none;
    span {
      color: #fff;
    }
  }
}
</style>
