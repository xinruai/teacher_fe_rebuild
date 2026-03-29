<script setup lang="ts">
import { ref } from 'vue'
import { checkOrderFinishedRemind } from '@/api/modules/order'
import schemeConent from '@/views/getOrderSchemePage/components/schemeConent.vue'

const props = withDefaults(defineProps<{
  loading?: boolean
  row?: any
}>(), {
  loading: false,
  row: () => ({}),
})

const emit = defineEmits<{
  (e: 'receivOrder'): void
}>()

const isShow = ref(false)
const showKnowTip = ref(false)
const isKnow = ref(false)
const seeType = ref(1)
const current = ref<any>({})

async function show(item?: any) {
  isShow.value = true
  if (item && item.seeType == 2) {
    current.value = item.current
    seeType.value = item.seeType
    return
  }
  seeType.value = 1
  current.value = props.row
  if ([67, 71].includes(+current.value.spoType)) {
    await doCheckOrderFinishedRemind()
  }
}

function closeModal() {
  isShow.value = false
  showKnowTip.value = false
  isKnow.value = false
}

function receivOrder() {
  emit('receivOrder')
}

async function doCheckOrderFinishedRemind() {
  const res = await checkOrderFinishedRemind({ courseId: current.value.courseId })
  if (res.status == 200) {
    showKnowTip.value = !res.body.isCheck
  }
}

defineExpose({ show, closeModal })
</script>

<template>
  <el-dialog
    v-model="isShow"
    width="1050px"
    :close-on-click-modal="false"
    class="paper-dialog"
    @close="closeModal"
  >
    <schemeConent :courseId="current.courseId" :isNewLastMinuteCramming1="current.examPrepStatus === 2" v-if="isShow" />
    <div class="show-know-tip" v-if="showKnowTip && seeType == 1">
      <el-checkbox v-model="isKnow" />
      <span>我知晓收到出分反馈后发放服务收入</span>
    </div>
    <div class="btn-box" v-if="seeType == 1">
      <el-button class="default-btn" :loading="loading" @click="receivOrder" :disabled="showKnowTip && !isKnow">已知晓，同意接单</el-button>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
:deep(.el-dialog__body) {
  padding: 0px 45px 30px;
}
.paper-dialog h3.title {
  border-bottom: none;
  font-size: 25px !important;
}
.default-btn {
  height: 30px;
  width: 170px;
  line-height: 8px;
  :deep(span) {
    color: #ff8723 !important;
  }
  &:hover {
    background: #fff;
    border-color: #ff8723;
  }
}
.btn-box {
  text-align: center;
  margin-top: 30px;
}
.show-know-tip {
  span {
    color: #222222;
    margin-left: 5px;
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
.default-btn.is-disabled {
  :deep(span) {
    color: #c0c4cc !important;
  }
  &:hover {
    background: #fff;
    border-color: #ebeef5;
  }
}
:deep(.scheme-title) {
  margin: 0;
}
</style>
