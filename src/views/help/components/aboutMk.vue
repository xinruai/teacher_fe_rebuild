<template>
   <div>
    <div
      id="1"
      class="first-item"
    >授课应用相关</div>
    <div
      class="title"
      id='1.1'
    >1.腾讯会议课堂测试入口</div>
    <div class="step-content">
      <div class="item"><span class="star">*</span>腾讯会议课堂:<el-button
          class="btn"
          @click="creatClassHandler(1)"
          :loading="classLoading"
        >启动</el-button></div>
      <div class="font-red"><span class="star">*</span>请讲师们在此处进行模拟上课的操作演练</div>
    </div>
    <div
      class="title"
      id="1.2"
    >2.腾讯会议客户端下载</div>
    <div class="down-content">
        <img src="@/assets/images/download/txhy-icon.png" alt="" class="app-icon">
        <div class="right-content">
          <el-button class="launch-btn" @click="handleDownload">前往下载</el-button>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElNotification } from 'element-plus'
import { creatClass } from '@/api/modules/classIn'

interface TeacInfo {
  id: number | string
  [key: string]: unknown
}

const props = defineProps<{
  teacinfo: TeacInfo | null
}>()

const emit = defineEmits<{
  (e: 'queryClassRoom'): void
}>()

const classLoading = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

function handleDownload() {
  window.open('https://meeting.tencent.com/download/', '_blank')
}

function openCustomScheme(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let hasBlurred = false
    let blurTimer: ReturnType<typeof setTimeout> | null = null

    const blurHandler = () => {
      hasBlurred = true
      if (blurTimer) {
        clearTimeout(blurTimer)
        blurTimer = null
      }
      window.removeEventListener('blur', blurHandler)
      resolve()
    }

    window.addEventListener('blur', blurHandler)

    try {
      const link = document.createElement('a')
      link.href = url
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      setTimeout(() => {
        document.body.removeChild(link)
      }, 100)
    } catch (e) {
      window.removeEventListener('blur', blurHandler)
      reject(e)
      return
    }

    blurTimer = setTimeout(() => {
      window.removeEventListener('blur', blurHandler)
      if (!hasBlurred) {
        reject(new Error('协议未注册或应用未安装'))
      }
    }, 2000)
  })
}

// 进入测试课堂
async function creatClassHandler(type: number) {
  if (!props.teacinfo) return
  const params = {
    type, //1测试课堂
    teacId: props.teacinfo.id,
  }
  classLoading.value = true
  const res = await creatClass(params)
  classLoading.value = false
  if (res.status == 200) {
    if ([1, 3].includes(Number(type))) {
      try {
        await openCustomScheme('wemeet://')
      } catch (error) {
        console.log(error, '===')
        ElNotification({
          type: 'warning',
          message: '请先安装腾讯会议客户端，正在跳转到下载页面...',
        })
        setTimeout(() => {
          window.open('https://meeting.tencent.com/download/', '_blank')
        }, 500)
      }

      if (timer) return
      // timeJudge logic placeholder if needed
    } else {
      emit('queryClassRoom')
    }
  }
}
</script>

<style scoped lang="scss">
.title {
  font-weight: 700;
  font-size: 15px !important;
  color: #333333;
}
.step-content {
  color: #000000;
  width: 75%;
  margin: 20px auto 25px;
  line-height: 30px;
  position: relative;
  .down-content {
    display: flex;
    width: 310px;
    justify-content: space-between;
    margin-top: 16px;
    padding: 0 13px;
    > div {
      text-align: center;
    }
  }
  img {
    width: 86px;
    height: 81px;
  }
  .down-btn {
    width: 110px;
    height: 28px;
    border-radius: 16px;
    border: 1px solid #ecedec;
    text-align: center;
    line-height: 28px;
    margin-top: 15px;
    cursor: pointer;
    display: block;
    a {
      display: inline-block;
      width: 60px;
      height: 25px;
    }
    &.small {
      width: 60px;
      margin: 10px auto 0;
      height: 25px;
      line-height: 24px;
    }
  }
}
.btn {
  display: inline-block;
  padding: 0 15px;
  border: 1px solid #ecedec;
  border-radius: 15px;
  height: 28px;
  line-height: 28px;
  width: 110px;
  top: 6px !important;
  cursor: pointer;
  margin-left: 115px;
  background: transparent;
  &:hover {
    background: #transparent;
  }
  :deep(span) {
    display: inline-block;
    height: 27px;
    line-height: 27px;
    position: relative;
    top: -1px;
  }
}
.first-item {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
}
.font-red {
  color: red;
}
.star {
  color: #ef1515;
  margin-left: -7px;
}


  .down-content {
    display: flex;
    align-items: center;
    gap: 20px;
    color: #000000;
    width: 75%;
    margin: 20px auto 25px;
    line-height: 30px;
    position: relative;

    .app-icon {
      width: 53px;
      height: 48px;
      flex-shrink: 0;
    }

    .right-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;

    }

    .detect-result {
      font-size: 12px;
      color: #3D3D3D;
      margin-bottom: 11px;
      text-align: center;
    }

    .launch-btn {
    display: inline-block;
    padding: 0 15px;
    border: 1px solid #ecedec;
    border-radius: 15px;
    height: 28px;
    line-height: 28px;
    width: 110px;
    top: 6px !important;
    cursor: pointer;
    margin-left: 130px;
    background: transparent;

    }

    .download-tip {
      font-size: 12px;
      color: #3D3D3D;
      text-align: center;

      .download-link {
        color: #409EFF;
        cursor: pointer;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

</style>
