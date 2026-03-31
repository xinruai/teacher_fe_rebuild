<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElNotification } from 'element-plus'

const detectStatus = ref(false)

function openCustomScheme(url: string) {
  return new Promise<void>((resolve, reject) => {
    let hasBlurred = false
    const blurHandler = () => {
      hasBlurred = true
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
      setTimeout(() => link.remove(), 100)
    } catch (error) {
      window.removeEventListener('blur', blurHandler)
      reject(error)
      return
    }
    setTimeout(() => {
      window.removeEventListener('blur', blurHandler)
      if (!hasBlurred) reject(new Error('protocol not registered'))
    }, 2000)
  })
}

async function checkTencentMeeting() {
  try {
    await openCustomScheme('wemeet://')
    detectStatus.value = true
  } catch {
    detectStatus.value = false
  }
}

async function handleLaunch() {
  try {
    await openCustomScheme('wemeet://')
    detectStatus.value = true
  } catch {
    ElNotification.warning('请先安装腾讯会议客户端，正在跳转到下载页面...')
    setTimeout(() => window.open('https://meeting.tencent.com/download/', '_blank'), 500)
  }
}

function handleDownload() {
  window.open('https://meeting.tencent.com/download/', '_blank')
}

onMounted(checkTencentMeeting)
</script>

<template>
  <div class="step">
    <div class="title">Step1 腾讯会议客户端下载检测</div>
    <div class="step-content">
      <div class="detect-result">
        检测结果：
        <span :class="{ success: detectStatus, error: !detectStatus }">{{ detectStatus ? '成功' : '未成功' }}</span>,
        <span :class="{ success: detectStatus, error: !detectStatus }">
          {{ detectStatus ? '可以开启下一步' : '暂时无法开启下一步' }}
        </span>
      </div>
      <div class="launch-btn" @click="handleLaunch">启动腾讯会议</div>
      <div class="download-tip">暂未安装? <span class="download-link" @click="handleDownload">下载腾讯会议</span></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.success { color: #f3561f; }
.error { color: #b6b6b6; }
.step { width: 440px; margin: 0 auto; }
.title { font-weight: 700; font-size: 14px; color: #3d3d3d; text-align: center; margin-bottom: 24px; }
.step-content { text-align: center; }
.detect-result { margin-bottom: 16px; }
.launch-btn {
  width: 140px; margin: 0 auto 10px; border-radius: 16px; border: 1px solid #b6b6b6; line-height: 32px; cursor: pointer;
}
.download-link { color: #409eff; cursor: pointer; }
</style>
