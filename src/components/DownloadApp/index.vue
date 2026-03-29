<script setup lang="ts">
import { ref } from 'vue'
import { winUrl, macUrl } from '@/api/config'

const isB = ref(false)
const dialogVisible = ref(false)
const link = 'https://docs.qq.com/doc/DU0pRcnJRTHZRWEhx'
const secretKey = ref('')
const teacherJoinUrl = ref('')

function show(key: string, joinUrl: string, isBEnd = false) {
  dialogVisible.value = true
  secretKey.value = key
  teacherJoinUrl.value = joinUrl
  isB.value = isBEnd
}

function closeDialog() {
  dialogVisible.value = false
}

function gotoClass() {
  window.open(`${(window as any).electronUrl}${secretKey.value}`)
}

function downloadApp(type: string) {
  if (type === 'win') {
    window.open(winUrl)
  } else if (type === 'mac') {
    window.open(macUrl)
  }
}

function openLink(url: string) {
  window.open(url)
}

function gotoWebClass() {
  window.open(teacherJoinUrl.value)
}

function confirm() {
  isB.value = false
}

defineExpose({ show })
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :width="isB ? '400px' : '900px'"
    :before-close="closeDialog"
    :close-on-click-modal="false"
    append-to-body
    class="paper-dialog"
    :class="{ isB: isB }"
  >
    <!-- b端课堂提示 -->
    <template v-if="isB">
      <h3 class="title">提示</h3>
      <div class="tip">注意:此课堂属于B端渠道客户</div>
      <div class="confirm-btn" @click="confirm">确定</div>
    </template>
    <template v-else>
      <h3 class="title">{{ secretKey ? '课堂提醒' : '课堂软件下载' }}</h3>
      <div class="container-main" :style="{ padding: !secretKey ? '0' : '' }">
        <div class="download-container top" v-if="secretKey">
          <div class="item">
            <img class="elc" src="@/assets/images/home/elc.png" alt="" />
            <el-button class="defaultlight-btn into-web-btn" @click="gotoClass">
              进入应用上课
            </el-button>
          </div>
          <div class="item">
            <img src="@/assets/images/download/web.png" alt="" class="elc" />
            <el-button class="defaultlight-btn into-web-btn" @click="gotoWebClass">
              <img src="@/assets/images/download/jianyi.png" alt="" />
              进入网页上课
            </el-button>
          </div>
        </div>
        <div v-if="secretKey" class="not-down">请先下载"Classbro Room"应用</div>
        <div class="type-title">Windows系统下载</div>
        <div class="win-box">
          <img class="winstep" src="@/assets/images/home/winstep.png" alt="" />
          <div class="win-content">
            <div class="step-content">
              <div>Step 1 下载安装包</div>
              <img src="@/assets/images/home/win.png" alt="" />
              <el-button class="defaultlight-btn" @click="downloadApp('win')">Windows系统下载</el-button>
            </div>
            <div class="step-content" style="margin-left: 30px">
              <div class="step-title">Step 2 安装完成后点击 "进入应用上课"</div>
              <el-button
                v-if="secretKey"
                class="defaultlight-btn"
                style="margin-left: 15px"
                @click="gotoClass"
              >进入应用上课</el-button>
            </div>
          </div>
        </div>
        <div class="type-title">Mac系统下载</div>
        <div class="win-box">
          <img class="macstep" src="@/assets/images/home/macstep.png" alt="" />
          <div class="win-content">
            <div class="step-content">
              <div class="step-title">Step 1 下载安装包</div>
              <img src="@/assets/images/home/mac.png" alt="" />
              <el-button class="defaultlight-btn" @click="downloadApp('mac')">Mac系统下载</el-button>
            </div>
            <div class="step-content" style="margin-left: 40px">
              <div class="step-title" style="width: 180px">Step 2 安装完成后打开应用</div>
            </div>
            <div class="step-content" style="margin-left: 40px">
              <div class="step-title" style="width: 205px">
                Step 3 <span>请根据以下文档指引操作</span>
              </div>
              <div class="tipdesc">
                <div>Mac系统安装完系统后请根据</div>
                <div>文档指引操作：</div>
                <div class="link" @click="openLink(link)">{{ link }}</div>
              </div>
            </div>
            <div class="step-content" style="margin-left: 60px">
              <div class="step-title">Step 4 安装完成后点击 "进入应用上课"</div>
              <el-button
                v-if="secretKey"
                class="defaultlight-btn"
                style="margin-left: 15px"
                @click="gotoClass"
              >进入应用上课</el-button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
:deep(.el-dialog) {
  border-radius: 20px;
}
:deep(.el-dialog__body) {
  padding: 20px;
}
.tip {
  color: red;
  font-size: 16px;
  text-align: center;
  font-family: Source Han Sans CN;
  line-height: 27px;
}

.container-main {
  padding: 0 10px;
}
.download-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .item {
    margin: 20px 0 38px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }
}

.defaultlight-btn {
  width: 113px !important;
  height: 27px;
  margin-top: 15px;
  display: block;
  background: #fff !important;
  color: #2c70ff !important;
  border: 1px solid #2c70ff;
  border-radius: 4px;
  padding: 0;
  position: relative;
  :deep(span) {
    color: #2c70ff !important;
    font-size: 12px;
    font-family: Source Han Sans CN;
    font-weight: 400;
    line-height: 24px;
    img {
      position: absolute;
      width: 66px !important;
      height: auto !important;
      top: -34px;
      left: -17px;
    }
  }
}
.top {
  justify-content: space-around !important;
}

.elc {
  width: 146px;
  height: 89px;
}
.type-title {
  margin: 30px 0 0 20px;
  font-size: 16px;
  font-weight: bold;
  line-height: 27px;
  color: #444444;
}
.step-title {
  width: 145px;
  font-size: 14px;
  font-weight: 400;
  line-height: 24px;
  color: #333333;
  span {
    color: #ff3232;
  }
}
.tipdesc {
  div {
    color: #ff3232;
    font-size: 12px;
    margin-left: 20px;
  }
}
.step-content {
  line-height: 25px;
  img {
    margin-top: 15px;
    width: 103px;
    height: 55px;
  }
}

.winstep {
  width: 272px;
  height: 30px;
  margin-top: 10px;
}
.macstep {
  width: 728px;
  height: 30px;
  margin-top: 10px;
}
.win-box {
  margin-left: 60px;
}
.win-content {
  display: flex;
  margin-left: -40px;
  > div {
    width: 200px;
  }
}
.link {
  color: #2c70ff !important;
  cursor: pointer;
  font-size: 12px;
}
.not-down {
  font-size: 16px;
  text-align: center;
  color: red;
}
:deep(.el-dialog) {
  margin-top: 5vh !important;
}
.isB :deep(.el-dialog) {
  margin-top: 20vh !important;
}
.into-web-btn {
  width: 130px !important;
  height: 34px;
  margin: 41px 0 0 0;
  :deep(span) {
    font-size: 16px !important;
  }
}
.confirm-btn {
  margin: 50px auto 0;
  width: 120px;
  height: 30px;
  line-height: 30px;
  color: #fff;
  background: linear-gradient(143deg, rgba(255, 8, 120, 1) 0%, rgba(255, 161, 19, 1) 100%);
  border-radius: 17px;
  text-align: center;
  cursor: pointer;
}
</style>
