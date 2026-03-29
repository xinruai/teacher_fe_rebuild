<script setup lang="ts">
interface ModelData {
  show: boolean
  title?: string
  text1?: string
  text2?: string
  textWeight?: string
  imgSrc?: string
}

const props = withDefaults(defineProps<{
  datas: ModelData
  type?: string
  current?: any
}>(), {
  type: '1',
  current: () => ({}),
})

const emit = defineEmits<{
  (e: 'closeModal'): void
  (e: 'receivOrder'): void
  (e: 'update:datas', value: ModelData): void
}>()

function closeModal() {
  emit('closeModal')
}

function receivOrder() {
  emit('receivOrder')
}
</script>

<template>
  <el-dialog
    class="test-boxs paper-dialog"
    center
    width="560px"
    v-model="datas.show"
  >
    <h3 class="title">{{ datas.title }}</h3>
    <p v-if="datas.text1">
      {{ datas.text1 }}
      <b v-if="datas.textWeight">【{{ datas.textWeight }}】</b>
    </p>
    <p v-if="datas.text2" v-html="datas.text2" class="two-box"></p>
    <img :src="datas.imgSrc" alt="" v-if="datas.imgSrc" />
    <template #footer>
      <div class="footer-btn">
        <template v-if="type == '1'">
          <span class="cancle-btn" @click="closeModal">我再看看</span>
          <span class="confirm-btn" @click="receivOrder">确定接单</span>
        </template>
        <template v-if="type == '2'">
          <span class="cancle-btn" @click="closeModal">我知道了</span>
        </template>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.paper-dialog {
  h3.title {
    line-height: 58px !important;
    font-size: 18px !important;
    padding-bottom: 0;
  }
}
.test-boxs {
  p {
    margin: 20px auto;
    font-size: 14px;
    font-weight: 400;
    color: #222222;
    width: 440px;
    line-height: 24px;
  }
  img {
    display: block;
    margin: 0 auto;
  }
}
:deep(.el-dialog__body) {
  padding: 0px;
}
</style>
