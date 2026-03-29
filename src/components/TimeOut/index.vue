<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { queryLateClassroom, queryTeacherUrl } from '@/api/modules/classIn'

const visiblePop = ref(false)
let lateTimer: ReturnType<typeof setTimeout> | null = null
const clearTime = ref(false)
const lateInfo = ref<Record<string, any>>({})

onMounted(() => {
  waitResult()
})

onBeforeUnmount(() => {
  clearTime.value = true
  if (lateTimer) {
    clearTimeout(lateTimer)
    lateTimer = null
  }
})

async function waitResult() {
  const code = window.localStorage.getItem('teactoken')
  if (code) await fetchLateClassroom()
  if (clearTime.value) {
    if (lateTimer) clearTimeout(lateTimer)
  } else {
    lateTimer = setTimeout(waitResult, 30000)
  }
}

function fetchLateClassroom() {
  queryLateClassroom({}).then((res: any) => {
    if (res.status === 200) {
      if (res.body) {
        lateInfo.value = res.body.lateClassroom != null ? res.body.lateClassroom : {}
        if (lateInfo.value.roomId) {
          visiblePop.value = true
          clearTime.value = true
        }
        const afterFeedback = res.body.afterClassFeedback
        const feedbackRoomId = afterFeedback && afterFeedback.classroomId
        const feedbackBaseUrl = import.meta.env.VITE_APP_AFTER_CLASS_FEEDBACK
        if (feedbackRoomId && feedbackBaseUrl) {
          window.open(feedbackBaseUrl + '?roomId=' + feedbackRoomId, '_blank')
        }
      } else {
        visiblePop.value = false
      }
    }
  })
}

function toRoom() {
  queryTeacherUrl({
    roomId: lateInfo.value.roomId,
    lateFlag: 1,
  }).then((res: any) => {
    if (res.status === 200) {
      visiblePop.value = false
      try {
        const msgData = JSON.parse(res.body.msg)
        if (msgData.joinUrl) {
          window.open(msgData.joinUrl, '_blank')
        } else {
          window.open(`wnroombox://enterclass/?data=${res.body.msg}`, '_self')
        }
      } catch {
        window.open(`wnroombox://enterclass/?data=${res.body.msg}`, '_self')
      }
    }
  })
}
</script>

<template>
  <div>
    <el-dialog
      v-model="visiblePop"
      :append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      width="30%"
      center
    >
      <template #title>
        <h3 class="late_title"><span>迟到</span>上课</h3>
      </template>
      <div class="text">{{ lateInfo.orderNo }}</div>
      <div class="text" style="margin-top: 20px">
        课堂【{{ lateInfo.classroomName }}】已经<span>迟到{{ lateInfo.lateMin }}分钟</span>，请立即前往上课！
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="button" type="warning" size="small" @click="toRoom">去上课</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.late_title {
  font-size: 20px;
  span {
    font-size: 20px;
    color: red;
  }
}
.text {
  text-align: center;
  font-size: 14px;
  span {
    font-size: 14px;
    color: red;
  }
}
:deep(.dialog-footer) {
  text-align: center;
  .el-button.button {
    background-color: #ff8723;
    span {
      color: #fff;
    }
  }
}
</style>
