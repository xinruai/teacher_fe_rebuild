<script setup lang="ts">
import { ref } from 'vue'
import { getExamCheckFile } from '@/api/modules/examOrder'
import uploadFileComp from '@/views/myorders/uploadFile.vue'
import fileListComp from '@/views/myorders/fileList.vue'
import pdfImg from '@/assets/images/order/pdf.png'
import wordImg from '@/assets/images/order/word.png'

const props = withDefaults(defineProps<{
  datas?: any
  disabled?: boolean
}>(), {
  datas: () => ({}),
  disabled: false,
})

const uploadRef = ref<InstanceType<typeof uploadFileComp>>()
const referenceFiles = ref<any[]>([])

const sampleList = [
  { img: pdfImg, name: 'Sample 1', url: 'http://classbro-oss.oss-cn-hongkong.aliyuncs.com/statice-resource/trainVideos/sample1.pdf' },
  { img: wordImg, name: 'Sample 2', url: 'http://classbro-oss.oss-cn-hongkong.aliyuncs.com/statice-resource/trainVideos/sample2.pdf' },
]

const uploadFiles = (file: any) => {
  referenceFiles.value.push(file)
}

const fetchExamCheckFile = async () => {
  const res: any = await getExamCheckFile({ courseId: props.datas.courseId })
  if (res.status === 200) {
    referenceFiles.value = res.body || []
  }
}

const cancelUpload = () => {
  uploadRef.value?.cancelUpload()
  referenceFiles.value = []
}

const openLink = (item: any) => {
  window.open(item.url)
}

const handleDeleteFile = (index: number) => {
  referenceFiles.value.splice(index, 1)
}

defineExpose({ getExamCheckFile: fetchExamCheckFile, cancelUpload, referenceFiles })
</script>

<template>
  <div class="content">
    <uploadFileComp
      v-if="!disabled"
      class="upload-file"
      ref="uploadRef"
      text="上传备考审核表"
      @uploadFiles="uploadFiles"
    />
    <fileListComp
      :fileList="referenceFiles"
      filesName="referenceFiles"
      formName="testForm"
      :disabled="disabled"
      @deleteFile="handleDeleteFile"
    />
    <div class="desc-content">
      <div class="desc-title">备考审核表说明：</div>
      <div>尊敬的各位讲师请仔细阅读以下须知：</div>
      <div class="item">1.备考审核旨在了解各位讲师在准备的订单详细情况，同时也希望发现并解决讲师在备考过程中遇到的问题，请<span>至少在DDL提前24小时上传</span>备考内容。</div>
      <div class="item">2.我们希望您认真完成备考内容，以满足服务质量，请注意提前预留时间并且满是以下备考要求：</div>
      <div>1）请确保您查阅了学生所有的订单内容，如遇到缺少部分订单需求的内容文件，如<span>往期习题或课堂课件</span>等，请及时联系师资人员索要。</div>
      <div>2）备考复习的内容可以是学生<span>pastpaper</span>的完成记录，知识点重难点高亮以及批注，明确学生的订单完成内容。</div>
      <div>3）上传的<span>文件格式不限</span>，且可以上传多份文件来佐证您有很好的准备此次订单内容，我们的师资人员会逐一审核，如遇到不符合备考内容的最低要求，可能会被<span>退回重做</span>甚至<span>取消此次委托。</span></div>
      <div class="item">3.最后当您查阅完整信息之后，<span>发现考试内容难度与预期不符，或遇到其他困难的情况</span>，请及时向我方师资人员提出。</div>
      <div class="sample-desc">我们在下方为您准备了备考审核表的两份sample,仅作内容参考：</div>
      <div class="sample-box">
        <div v-for="(item, index) in sampleList" :key="index" @click="openLink(item)">
          <img :src="item.img" alt="" />
          {{ item.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.content {
  line-height: 30px;
  padding: 10px 30px;
  .desc-title {
    font-size: 16px;
    font-weight: 600;
  }
  div {
    color: #333333;
    span {
      color: #ae1926;
      font-weight: 700;
    }
  }
  .item {
    margin-top: 10px;
  }
}
.sample-desc {
  margin-top: 20px;
}
.sample-box {
  display: flex;
  margin-top: 30px;
  > div {
    width: 134px;
    height: 66px;
    line-height: 66px;
    background: #ffffff;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.21);
    border-radius: 4px;
    margin-right: 20px;
    padding: 10px;
    box-sizing: border-box;
    cursor: pointer;
    img {
      vertical-align: middle;
      position: relative;
      width: 38px;
      height: auto;
      top: -12px;
      margin-right: 5px;
    }
  }
}
:deep(.el-upload) {
  display: block;
}
:deep(.uploader-btn) {
  width: 215px;
  height: 40px;
  background: #f4801f;
  border-radius: 20px;
  margin: 20px auto;
  color: #fff;
  display: block;
  span {
    color: #fff;
    top: 0;
  }
}
.desc-content {
  width: 892px;
  margin: 40px auto;
}
</style>
