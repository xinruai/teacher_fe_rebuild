<script setup lang="ts">
import { ref } from 'vue'
import { ElDialog, ElPopover } from 'element-plus'
import { updateTeacherFaceVerify } from '@/api/modules/newSalary'
import qrcodeImg from '@/assets/images/qrcode.png'
import pictureImg from '@/assets/images/picture.png'
import mingpianImg from '@/assets/images/mingpian.jpeg'

const isShow = ref(false)
const btnloading = ref(false)

function show() {
  isShow.value = true
}

async function know() {
  await updateTeacherFaceVerify()
  isShow.value = false
}

defineExpose({ show })
</script>

<template>
  <el-dialog
    v-model="isShow"
    width="803px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <div class="update-box">
      <div class="title-text">人脸<span>识别</span>验证</div>
      <div class="content-area">
        <div class="top-area">
          <div class="line-one">纳税核验</div>
          <div class="update-item">
            <div>
              根据国家税务部门规定，需通过人脸核验后纳税，否则将无法发放薪资，请根据以下步骤操作~
            </div>
          </div>
        </div>
        <div>
          <div class="how">如何操作？</div>
          <div class="bottom-container">
            <div class="bottom-item">
              <div>
                1、【微信】扫码进入认证小程序<br />
                <span style="font-size: 12px; visibility: hidden;">部分需识别&完成签约后生效</span>
              </div>
              <img :src="qrcodeImg" alt="" />
            </div>
            <div class="bottom-item">
              <div>
                2、登录完成人脸识别 <br />
                <span style="font-size: 12px; color: #999;">部分需识别&完成签约后生效</span>
              </div>
              <img :src="pictureImg" alt="" />
            </div>
          </div>
        </div>
        <div style="margin-top: 20px;">
          <div><i class="el-icon-warning-outline" style="color: #ed5a5c;"></i> 注意</div>
          <div>-部分需录入<span class="red-text">提现银行卡</span>手机号、身份证和银行卡等信息（<span class="red-text">有误将无法正常发放</span>）</div>
          <div>-信息在哪里查看？<span style="color: #999;">公众号【小班带你飞-我的账户-银行卡】。</span></div>
          <div>-信息无法上传或无法加载？
            <span style="color: #999;">请在【联系产品经理ZMJ处理】。</span>
            <el-popover placement="right" title="" :width="400" trigger="hover">
              <img :src="mingpianImg" alt="" style="width: 376px;">
              <template #reference>
                <span style="color: #60b1ff; cursor: pointer; text-decoration: underline;">二维码名片</span>
              </template>
            </el-popover>
          </div>
        </div>
      </div>
    </div>
    <div class="footer" v-loading="btnloading">
      <div class="next" @click="know()">我已完成</div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
:deep(.el-dialog__header) {
  display: none;
}
:deep(.el-dialog__body) {
  padding: 0;
}
.update-box {
  line-height: 25px;
  background: url("@/assets/images/help/bg-header.png") no-repeat;
  background-size: 100%;
  margin: 0;
  padding: 40px 35px 20px 35px;
  .line-one {
    font-size: 20px;
    margin-bottom: 20px;
    font-weight: 500;
    color: #3d3d3d;
  }
  div {
    color: #444444;
  }
  .title-text {
    font-size: 34px;
    color: #ffffff;
    text-align: center;
    font-weight: 600;
    span {
      display: inline-block;
      border-bottom: 3px solid #ffdc50;
      font-size: 34px;
      color: #ffffff;
      font-weight: 600;
      padding-bottom: 8px;
    }
  }
  .update-item {
    div {
      font-size: 15px;
      line-height: 30px;
      span {
        font-size: 15px;
      }
    }
  }
  .content-area {
    margin-top: 80px;
    .top-area {
      margin: 10px 0;
    }
  }
}
.red-text {
  color: #ff8440;
}
.link-text {
  color: #487bf3;
  text-decoration: underline;
  cursor: pointer;
}
:deep(.footer) {
  text-align: center;
  position: relative;
  padding-bottom: 16px;
  margin-top: 10px;
  .next {
    display: inline-block;
    width: 200px;
    height: 29px;
    line-height: 27px;
    border-radius: 30px;
    padding: 0;
    font-family: Source Han Sans, Source Han Sans;
    font-weight: 400;
    font-size: 16px;
    color: #fff;
    text-align: center;
    font-style: normal;
    text-transform: none;
    cursor: pointer;
    background: linear-gradient(270deg, #FF9654 0%, #FFA660 53%, #FFD26A 100%);
    border-radius: 30px 30px 30px 30px;
  }
}
.how {
  font-size: 16px;
  font-weight: 500;
  margin: 30px 0 10px 30px;
  color: #444;
}
.bottom-container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  > div {
    background: #fff6ed;
    padding: 8px 15px;
    text-align: center;
    border-radius: 8px;
    flex: 1;
    img {
      margin: 10px 0;
    }
  }
}
</style>
