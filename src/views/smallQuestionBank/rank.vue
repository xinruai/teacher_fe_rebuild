<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getNewRankingList } from '@/api/modules/smallQuestionBank'
import { getTeacherInfo, doFollowExtFlag } from '@/api/modules/persondetail'
import { getLocal } from '@/utils/auth'
import rankOld from './rankOld.vue'

import medal1Url from '@/assets/images/small-question-bank/medal-1.png'
import medal2Url from '@/assets/images/small-question-bank/medal-2.png'
import medal3Url from '@/assets/images/small-question-bank/medal-3.png'
import iconmaleUrl from '@/assets/images/iconmale.png'
import redEnvelopeUrl from '@/assets/images/small-question-bank/red-envelope.png'

defineProps<{
  status: string
}>()

const rankList = ref<any[]>([])
const showDialog = ref(false)
const personalRanking = ref(-1)
const personalThumb = ref('')
const personalEvaluateCount = ref(0)
const nickName = ref(getLocal('teacinfo')?.nickName ?? '')

const rankOldRef = ref<InstanceType<typeof rankOld>>()

const medalIcons = [medal1Url, medal2Url, medal3Url]

function medalIcon(index: number) {
  return medalIcons[index] ?? ''
}

function cellStyle({ columnIndex, rowIndex }: { column: any; row: any; columnIndex: number; rowIndex: number }) {
  if (columnIndex === 4 && rowIndex < 3) {
    return { color: '#333', fontWeight: 700 }
  }
  return {}
}

async function getData() {
  const res = await getNewRankingList()
  if (res.status == 200) {
    personalRanking.value = res.body.personalRanking
    personalThumb.value = res.body.personalThumb
    personalEvaluateCount.value = res.body.personalEvaluateCount
    rankList.value = res.body.rankingListVos || []
  }
}

function errorHandler() {
  return true
}

function showOldRank() {
  rankOldRef.value?.show()
}

onMounted(async () => {
  getData()
  const res = await getTeacherInfo()
  if (res.status == 200) {
    if (res.body.extTeacUserDetailsExt.coursewareCampaignFlag != 2) {
      showDialog.value = true
      doFollowExtFlag({ filed: 'coursewareCampaignFlag' })
    }
  }
})

defineExpose({ getData })
</script>

<template>
  <div class="rank-board">
    <div class="participate-banner" @click="showDialog = true">
      <img :src="redEnvelopeUrl" class="banner-icon" />
      <div class="banner-text">参与题库使用，<span>获取现金奖励</span></div>
    </div>
    <template v-if="status === 'start'">
      <div class="rank-title">
        <div>
          题库奖励榜 <span>10月30日 - 11月12日</span>
        </div>
        <el-button type="primary" link @click="showOldRank">上期排行</el-button>
      </div>
      <div class="message">
        对单道题目点击一次，符合或不符合，并选择对应的选项，即记为一次题目反馈。<br>
        请老师反馈使用体验，助力题库进一步升级
        <img src="../../assets/images/small-question-bank/rocket.png" alt="" style="vertical-align: middle; height: 16px;" />
      </div>
      <div class="my-rank">
        <div class="rank-cell" style="width: 50px; min-width: 50px;text-align: center;">
          <span v-if="personalRanking == -1">--</span>
          <span v-else-if="[1,2,3].includes(personalRanking)">
            <img :src="medalIcon(personalRanking - 1)" class="medal-icon" />
          </span>
          <span v-else>{{ personalRanking }}</span>
        </div>
        <div class="rank-cell" style="width: 130px; min-width: 130px; text-align: center;">
          <div class="avatar" style="padding: 0 10px;">
            <el-avatar :src="personalThumb" @error="errorHandler">
              <img :src="iconmaleUrl" />
            </el-avatar>
            <span class="name">{{ nickName }}</span>
          </div>
        </div>
        <div class="rank-cell" style="width: 70px; min-width: 70px;text-align: center;">
          <span>{{ personalEvaluateCount }}</span>
        </div>
        <div class="rank-cell" style="width: 80px; min-width: 80px; text-align: center;">
          <div class="reward" v-if="personalRanking > 0 && personalRanking < 11">
            <template v-if="personalEvaluateCount >= 40">
              <div class="meet">
                <img :src="redEnvelopeUrl" alt="">
                <b>120</b>
              </div>
            </template>
            <template v-else>
              <div class="not-meet">
                <span>120</span>
                <small>(未达标)</small>
              </div>
            </template>
          </div>
          <div class="reward" v-else>--</div>
        </div>
      </div>
      <el-table
        :data="rankList"
        class="rank-table"
        :header-cell-style="{ background: '#f7f7f7', color: '#999', fontWeight: 500 }"
        :cell-style="cellStyle"
        style="width: 100%;min-width: 330px;overflow-x: hidden;"
      >
        <el-table-column label="排名" width="50" align="center">
          <template #default="scope">
            <span v-if="scope.$index < 3">
              <img :src="medalIcon(scope.$index)" class="medal-icon" />
            </span>
            <span v-else>{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="讲师信息" width="130" align="center">
          <template #default="scope">
            <div class="avatar">
              <el-avatar :src="scope.row.thumb" @error="errorHandler">
                <img :src="iconmaleUrl" />
              </el-avatar>
              <span class="name">{{ scope.row.teacherName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="反馈数" prop="evaluateCount" width="70" align="center" />
        <el-table-column label="奖励(元)" width="80" align="center">
          <template #default="scope">
            <div class="reward" v-if="scope.$index < 5">
              <template v-if="scope.row.evaluateCount >= 40">
                <div class="meet">
                  <img :src="redEnvelopeUrl" alt="">
                  <b>120</b>
                </div>
              </template>
              <template v-else>
                <div class="not-meet">
                  <span>120</span>
                  <small>(未达标)</small>
                </div>
              </template>
            </div>
            <div class="reward" v-else>-</div>
          </template>
        </el-table-column>
      </el-table>
    </template>
    <el-dialog v-model="showDialog" width="800px" class="reward-dialog" :close-on-click-modal="false" :show-close="true">
      <div class="dialog-header">
        <img :src="redEnvelopeUrl" class="dialog-icon" />
        <span class="dialog-title">参与题库使用，获取现金奖励</span>
      </div>
      <div class="dialog-content">
        <div class="dialog-info">
          <div><b>活动时间：</b>2025年10月30日（周四）00:00-11月12日（周三）23:59</div>
          <div><b>奖励规则：</b>活动期间，按<b>题目反馈数</b>进行排行。对单道题目，点击一次符合或不符合，并选中对应的选项，即记为一次题目反馈。</div>
          <div class="img-wrap">
            <img src="../../assets/images/small-question-bank/img5.png" alt="">
            <img src="../../assets/images/small-question-bank/img6.png" alt="">
          </div>
          <div>第一至五名：120元</div>
          <div>反馈次数<b>≥40次</b>，才具备领奖资格，否则显示<b>未达标</b></div>
          <div><b>领奖时间：</b>结束后一周内，产品经理Mark会主动联系获奖老师，填写<b>题库使用反馈问卷</b>后即可领取奖励。</div>
          <div>请老师反馈使用体验，助力题库进一步升级
            <img src="../../assets/images/small-question-bank/rocket.png" alt="" style="vertical-align: middle;" />
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="showDialog = false">我知道了</el-button>
        </span>
      </template>
    </el-dialog>
    <rankOld ref="rankOldRef" />
  </div>
</template>

<style lang="scss" scoped>
.rank-board {
  .participate-banner {
    display: inline-flex;
    align-items: center;
    background: linear-gradient(90deg, #FF8A1C 0%, #FFA722 100%);
    border-radius: 24px;
    height: 40px;
    margin-bottom: 50px;
    padding: 0 24px;
    cursor: pointer;

    .banner-icon {
      width: 24px;
      height: 24px;
      margin-right: 18px;
    }

    .banner-text {
      color: #FFFFFF;
      font-size: 14px;
      font-weight: 500;
      span {
        color: #FFF800;
      }
    }
  }
  background: #fff;
  border-radius: 12px;
  padding: 55px 0px 20px 0px;
  width: 330px;

  .rank-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    div {
      font-size: inherit;
    }
    span {
      color: #999;
      font-size: 12px;
      font-weight: normal;
      margin-left: 8px;
    }
    .el-button {
      padding: 0;
    }
  }
  .message {
    background-color: #f4fbfe;
    font-size: 12px;
    margin-bottom: 8px;
    padding: 12px 16px;
    line-height: 24px;
    border-radius: 4px;
  }

  .medal-icon {
    width: 30px;
    height: 30px;
    vertical-align: middle;
  }

  .rank-table {
    &::before {
      height: 0;
    }
    :deep(.el-table__header) {
      th {
        background: #F7F8FA !important;
        border: none;
        padding: 8px 0;
        font-size: 13px;
        color: #666 !important;
        font-weight: normal !important;
      }
    }

    :deep(.el-table__body) {
      td {
        border: none;
        padding: 8px 0;
      }

      tr {
        height: 48px;

        &:hover > td {
          background: #F7F8FA;
        }
      }
    }

    .avatar {
      display: flex;
      align-items: center;
      overflow: hidden;
      .el-avatar {
        min-width: 40px;
      }
      img {
        width: 100%;
        height: 100%;
      }
      .name {
        font-size: 12px;
        margin-left: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    :deep(.cell) {
      color: #666;
      font-size: 14px;
    }
  }
}

.my-rank {
  display: flex;
  align-items: center;
  height: 48px;
  border-radius: 4px;
  margin-bottom: 16px;

  .rank-cell {
    color: #666;
    font-size: 14px;

    .avatar {
      display: flex;
      align-items: center;
      overflow: hidden;
      .el-avatar {
        min-width: 40px;
      }
      img {
        width: 100%;
        height: 100%;
      }
      .name {
        font-size: 12px;
        margin-left: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}

.reward {
  color: #333;
  font-size: 14px;
  .meet {
    display: flex;
    align-items: center;
    img {
      height: 20px;
      margin-right: 4px;
    }
  }
  .not-meet {
    display: flex;
    flex-direction: column;
    color: #999;
    span,
    small {
      color: inherit;
      line-height: 1.4;
    }
  }
}

.reward-dialog {
  :deep(.el-dialog__header) {
    border-bottom: none;
    padding-bottom: 0;
  }
  :deep(.el-dialog__body) {
    padding: 0 32px 0 32px;
    background: #fff;
  }
  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 24px;
    margin-bottom: 18px;
    .dialog-icon {
      width: 32px;
      height: 32px;
      margin-right: 12px;
    }
    .dialog-title {
      font-size: 20px;
      font-weight: 700;
      color: #FF8A1C;
      letter-spacing: 1px;
    }
  }
  .dialog-content {
    .dialog-info {
      background: #EAF4FF;
      border-radius: 8px;
      padding: 18px 20px;
      font-size: 14px;
      color: #333;
      margin-bottom: 18px;
      line-height: 2;
      b {
        color: #333;
        font-weight: 600;
      }
      div {
        margin-bottom: 2px;
      }
      .img-wrap {
        display: flex;
        justify-content: space-around;
        margin: 18px 0;
        img {
          height: 220px;
        }
      }
    }
  }
  .dialog-footer {
    display: flex;
    justify-content: center;
    padding-bottom: 24px;
    .el-button {
      width: 180px;
      font-size: 16px;
      border-radius: 8px;
      background: #409EFF;
      color: #fff;
      letter-spacing: 1px;
    }
  }
}
</style>
