<script setup lang="ts">
const sampleList = [
  {
    name: 'sample1',
    url: 'http://classbro-oss.oss-cn-hongkong.aliyuncs.com/statice-resource/trainVideos/sample1.pdf',
  },
  {
    name: 'sample2',
    url: 'http://classbro-oss.oss-cn-hongkong.aliyuncs.com/statice-resource/trainVideos/sample2.pdf',
  },
]

function seeFile(item: { name: string; url: string }) {
  const previewExts = ['.txt', '.pdf', '.jpg', '.png', '.jpeg']
  const canPreview = previewExts.some(ext => item.name.indexOf(ext) > -1 || item.url.indexOf(ext) > -1)
  if (canPreview) {
    window.open(item.url)
  } else {
    window.open(item.url, '_self')
  }
}
</script>

<template>
  <div class="help">
    <el-popover placement="top" :width="480" trigger="hover">
      <h3 class="text-title">备考审核表说明</h3>
      <div class="text-content">
        <div class="f700 start">尊敬的各位讲师请仔细阅读以下须知:</div>
        <div class="item">
          <div>1. 备考审核旨在了解各位讲师在准备的订单详细情况，同时也希望发现并解决讲师在备考过程中遇到的问题，请至少在DDL提前<span class="red-f7">24小时</span>上传备考内容。</div>
        </div>
        <div class="item">
          <div>2. 我们希望您认真完成备考内容，以满足服务质量，请注意提前预留时间并且满足以下备考要求：</div>
          <div class="child">1）请确保您查阅了学生所有的订单内容，如遇到缺少部分订单需求的内容文件，如<span class="red-f7">往期习题或课堂课件</span>等，请及时联系师资人员索要。</div>
          <div class="child">2）备考复习的内容可以是学生<span class="red-f7">pastpaper</span>的完成记录，知识点重难点高亮以及批注，明确学生的订单完成内容。</div>
          <div class="child">3）上传的文件<span class="red-f7">格式不限</span>，且可以上传多份文件来佐证您有很好的准备此次订单内容，我们的师资人员会逐一审核，如遇到不符合备考内容的最低要求，可能会被<span class="red-f7">退回重做</span>甚至<span class="red-f7">取消此次委托</span>。</div>
        </div>
        <div class="item">
          <div>3. 最后当您查阅完整信息之后，<span class="red-f7">发现考试内容难度与预期不符，或遇到其他困难的情况</span>，请及时向我方师资人员提出。</div>
        </div>
        <div class="desc">
          <div>我们在下方为您准备了备考审核表的两份sample，<span class="f700">仅作内容参考。</span></div>
          <div class="f700">请各位讲师仔细阅读，祝各位生活顺利。</div>
          <div class="sample">
            <div class="file" v-for="(sample, index) in sampleList" :key="index" @click="seeFile(sample)">{{ sample.name }}</div>
          </div>
        </div>
      </div>
      <template #reference>
        <img src="@/assets/images/paper/wenhao.png" />
      </template>
    </el-popover>
  </div>
</template>

<style lang="scss" scoped>
.text-title {
  text-align: center;
  line-height: 40px;
  font-weight: 700;
  font-size: 16px;
  border-bottom: 1px solid #ccc;
}
.text-content {
  padding: 15px 10px;
}
.item {
  line-height: 26px;
  margin-top: 5px;
  &:nth-of-type(1) {
    margin-top: 15px;
  }
  .child {
    text-indent: 15px;
  }
}
img {
  height: 16px;
  width: 16px;
  cursor: pointer;
}
.red-f7 {
  color: red;
  font-weight: 700;
}
.f700 {
  font-weight: 700;
}
.desc {
  margin-top: 20px;
  line-height: 26px;
  .sample {
    line-height: 20px;
    font-weight: 400;
  }
}
.file {
  &::before {
    display: inline-block;
    content: '';
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #3496fb;
    margin: 0px 8px 0 0;
    position: relative;
    top: -3px;
  }
  cursor: pointer;
  color: #3496fb;
  margin-right: 20px;
}
</style>
