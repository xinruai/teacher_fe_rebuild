<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { queryClassRoom } from '@/api/modules/classIn'
import { getLocal } from '@/utils/auth'
import MkMoticeStep from '@/views/classin/mkMoticeStep.vue'

const mkMoticeStepRef = ref<InstanceType<typeof MkMoticeStep>>()
const classInfo = ref<Record<string, any>>({})

const teacinfo = computed(() => getLocal<Record<string, any>>('teacinfo'))

async function doQueryClassRoom() {
  const res: any = await queryClassRoom({ teacId: teacinfo.value!.id })
  if (res.status === 200) {
    classInfo.value = res.body || {}
    nextTick(() => {
      if (mkMoticeStepRef.value) {
        mkMoticeStepRef.value.isComplated = classInfo.value.testStatus || 0
        if (classInfo.value.formalRoom) {
          mkMoticeStepRef.value.initTime(classInfo.value.formalRoom.startTime)
        }
      }
    })
  }
}

onMounted(() => {
  doQueryClassRoom()
})
</script>

<template>
  <div class="page-container">
    <div class="left">
      <div class="first">授课应用相关</div>
      <div class="second">step1 腾讯会议客户端下载</div>
      <div class="second">step2 腾讯会议课堂测试入口</div>
      <div class="second">step3 选择复试时间</div>
      <div class="second">step4 腾讯会议课堂操作指南</div>
    </div>
    <div class="right">
      <MkMoticeStep
        ref="mkMoticeStepRef"
        :teacinfo="teacinfo"
        :class-info="classInfo"
        type="3"
        @query-class-room="doQueryClassRoom"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-container {
  width: 1200px;
  height: 100%;
  margin: 0 auto;
  line-height: 30px;
  display: flex;
  overflow-y: auto;

  > div {
    padding: 20px 0px;
  }

  .left {
    width: 310px;
    border-right: 1px solid #e7e7e7;
    height: 100%;
    padding-left: 10px;

    .first {
      color: #333333;
      font-weight: 700;
      font-size: 16px;
    }

    .second {
      font-size: 14px;
      margin: 10px 0 0 35px;
    }

    .second.active {
      color: #25a1ff;
    }
  }

  .right {
    width: 1200px;
    padding-left: 40px;

    > div {
      padding-bottom: 30px;
    }
  }
}
</style>
