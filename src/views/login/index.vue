<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { setLocal, setCookie } from '@/utils/auth'
import { HatchRouterPath as RouterPath } from '@/constants/enums'
import { getTimeZone } from '@/utils/task/Utils'
import { postTimeZone } from '@/api/modules/persondetail'
import { loginByMobile } from '@/api/modules/user'

import loginLogo from '@/assets/images/login-logo.png'
import loginLeftImg from '@/assets/images/login-left-img1.png'
import webNameImg from '@/assets/images/web-name.png'
import loginTipsImg from '@/assets/images/login-tips.png'

const route = useRoute()
const router = useRouter()

const maskShow = ref(false)
const loading = ref(false)
const loginForm = ref({
  username: '',
  password: '',
})
const redirect = ref<string | undefined>(undefined)
const teacUser = ref<Record<string, any>>({})

watch(
  () => route.query,
  (query) => {
    redirect.value = (query?.redirect as string) || undefined
  },
  { immediate: true },
)

function openMask() {
  maskShow.value = true
}

function closeMask() {
  maskShow.value = false
}

async function handleLogin() {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElNotification({
      title: '错误提示',
      message: '账号或者密码不能为空',
      type: 'error',
    })
    return
  }

  localStorage.setItem('notokenstatus', '1')
  loading.value = true

  try {
    const r = await loginByMobile(loginForm.value.username, loginForm.value.password)

    if (r.data.status === 200) {
      const body = r.data.body
      teacUser.value = body.teacUser || {}

      setLocal('teacinfo', JSON.stringify(body.teacUser))
      localStorage.setItem('teacType', body.teacUser.type)
      localStorage.setItem('childType', body.teacUser.childType)
      localStorage.setItem('minzhaoOrderType', body.teacUser.minzhaoOrderType)
      setLocal('teactoken', body.token)
      setCookie('teactoken', body.token)
      window.localStorage.setItem('teactoken', body.token)
      window.localStorage.setItem('notokenstatus', '0')
      window.localStorage.setItem('eliminatecode', body.train.code)

      const train = body.train || {}

      doPostTimeZone()

      loading.value = false

      localStorage.setItem('interviewStatus', body.interviewStatus)

      // 复试中的跳复试指引页
      if ([14, 15].includes(body.interviewStatus)) {
        router.push({ path: '/trainingplan' })
        return
      }

      // 领了入职证书去首页
      if (teacUser.value.paperThumbStatus > 0) {
        router.push({ path: '/account/persondetail' })
        return
      }

      // 判断讲师培训状态
      if ([0, 1].includes(+train.code)) {
        router.push({ path: RouterPath.REDIRECT, query: { code: train.code } })
      } else {
        router.push({ path: '/account/persondetail' })
      }
    } else {
      loading.value = false
      ElNotification({
        title: '错误提示',
        message: r.data.body.msg,
        type: 'error',
      })
    }
  } catch {
    loading.value = false
  }
}

function doPostTimeZone() {
  postTimeZone({
    id: teacUser.value.id,
    coordinate: getTimeZone(),
  })
}
</script>

<template>
  <div class="login-container">
    <img :src="loginLogo" alt="" class="login-logo" />
    <div class="login-box">
      <div class="login-img">
        <img :src="loginLeftImg" alt="" class="left-img" />
      </div>
      <div class="login-content">
        <div class="form-wrap">
          <div class="title-container">
            <img :src="webNameImg" class="web-name" />
          </div>
          <div class="input-box">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入您的账号"
              name="username"
              type="text"
              tabindex="1"
            />
          </div>
          <div class="input-box">
            <el-input
              v-model="loginForm.password"
              placeholder="请输入密码"
              name="password"
              type="password"
              tabindex="1"
              @keyup.enter="handleLogin"
            />
          </div>
          <div class="forget-password" @click="openMask">忘记密码</div>
          <el-button class="defaultlight-btn" :loading="loading" @click="handleLogin">
            登 录
          </el-button>
        </div>
      </div>
    </div>

    <div v-if="maskShow" class="new-mask">
      <div class="mask-content">
        <b @click="closeMask">+</b>
        <img :src="loginTipsImg" class="tips-icon" />
        <h5>忘记密码?</h5>
        <p>
          请在【小班带你飞】小程序，咨询客服<br />
          为你解决问题
        </p>
        <button class="defaultlight-btn forget-pwd" @click="closeMask">我知道了</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$bg: #ffffff;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  height: 100%;
  width: 100%;
  padding: 80px 0;
  background: $bg
    url('https://classbro-oss.oss-accelerate.aliyuncs.com/static%2Fimg%2Flogin-bg-new.png')
    no-repeat center center;
  background-size: cover;
  overflow: auto;
  position: relative;

  .login-logo {
    position: absolute;
    left: 40px;
    top: 30px;
    width: 205px;
  }

  .login-box {
    width: 1150px;
    display: flex;
    height: 504px;
    margin: auto auto;
    overflow: hidden;
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -575px;
    margin-top: -252px;
  }

  .login-img {
    width: 480px;
    height: 100%;
    min-width: 375px;
    position: relative;

    .left-img {
      width: 480px;
      top: 138px;
      left: 0px;
      position: absolute;
    }
  }

  .login-content {
    width: 418px;
    padding: 0 30px;
    display: flex;
    align-content: center;
    align-items: center;
    margin: 0 auto;
    background: #fff;
    border-radius: 20px;
    margin-left: 222px;

    .title-container {
      padding: 0 0 40px;
      border: none;

      .title {
        display: flex;
        margin: 0 0 26px 0;
        align-content: center;
        align-items: center;
        justify-content: center;
        font-size: 36px !important;
        color: #f35623;
        font-weight: bold;

        span {
          display: inline-block;
          width: 48px;
          height: 48px;
          margin-right: 7px;

          img {
            width: 100%;
            height: 100%;
            display: block;
          }
        }
      }

      p {
        margin: 0;
        line-height: 22px;
        text-align: center;
        font-size: 18px;
        font-weight: 400;
        color: rgba(243, 86, 35, 1);
      }
    }
  }

  .form-wrap {
    position: relative;
    max-width: 100%;
    margin: 0 auto;
    overflow: hidden;

    .input-box {
      width: 100%;
      padding: 0 0 40px;
      overflow: hidden;

      label {
        display: block;
        margin-bottom: 10px;
        font-size: 14px;
        font-weight: 400;
        color: rgba(102, 102, 102, 1);
        line-height: 18px;
      }
    }

    button {
      width: 325px;
      height: 54px;
      margin-top: 40px;
      font-size: 16px;
      font-weight: 400;
      border: none;
      border-radius: 33px;
      background: linear-gradient(143deg, #ff8340 0%, #ffd26a 100%) !important;
    }

    .forget-password {
      height: 16px;
      text-align: right;
      font-size: 14px;
      margin-top: -20px;
      font-weight: 400;
      color: #ff8340;
      line-height: 16px;
      cursor: pointer;
    }
  }
}

.defaultlight-btn {
  line-height: 18px;

  :deep(span) {
    color: #fff;
    font-size: 16px;
  }
}

.web-name {
  width: 288px;
  display: block;
  margin: 0 auto;
}

:deep(.el-input__inner) {
  border: none;
  border-bottom: 1px solid #ccc;
  border-radius: 0;
}

:deep(input::placeholder) {
  font-size: 16px;
}
</style>
