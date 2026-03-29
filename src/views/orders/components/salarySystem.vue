<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getHighScore } from '@/api/modules/persondetail'

const tableData = ref<any[]>([])
const url = 'https://classbro-oss.oss-accelerate.aliyuncs.com/statice-resource%2Fresource%2F%E5%85%A8%E6%96%B0%E8%96%AA%E8%B5%84%E8%A7%86%E9%A2%91new.mp4'

function getScore(value: string, index: number) {
  const parsed = JSON.parse(value)
  return parsed[index] || 0
}

async function getList() {
  const res = await getHighScore()
  if (res.status == 200) {
    tableData.value = (res && res.body) || []
  }
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div>
    <div class="item-title">薪资模式组成视频</div>
    <img src="@/assets/images/home/videoTop.png" alt="" class="video-top" />
    <video
      poster="@/assets/images/home/newposter.png"
      id="welcomevideo"
      class="video-style"
      controlsList="nodownload"
      disablePictureInPicture
      oncontextmenu="return false;"
      :controls="true"
      :src="url"
    ></video>
    <div class="item-title">
      高分标准线<span class="orange-text">订单出分达到高分标准线则会根据相应比例收到奖励</span>
    </div>

    <el-table
      :data="tableData"
      :header-cell-style="{
        background: '#E5E5E5',
        color: '#333333',
        height: '40px',
        padding: 0,
      }"
      :row-style="{ height: '40px', padding: 0 }"
      :cell-style="{ padding: 0 }"
      stripe
    >
      <el-table-column prop="countryName" label="国家" />
      <el-table-column prop="highScore" label="高分一档">
        <template #default="scope">
          <span v-if="scope.row.highScore && scope.row.highScore.length">
            {{ getScore(scope.row.highScore, 0) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="highScore" label="奖励订单预计收入（GB）">
        <template #default>
          <span>10%</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped lang="scss">
.video-style {
  width: 100%;
  display: block;
  margin: -20px auto 15px;
}
.video-top {
  width: 1280px;
  height: 88px;
}
.item-title {
  color: #333333;
  font-size: 18px;
  font-weight: 700;
  margin: 20px 0;
}
.orange-text {
  color: #f15c2c;
  margin-left: 10px;
  font-weight: 400;
}
:deep(.el-table) {
  margin-bottom: 20px;
  td,
  th {
    padding-left: 20px !important;
  }
}
:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: #e5e5e5;
}
</style>
