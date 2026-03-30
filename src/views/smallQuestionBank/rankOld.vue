<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getRankingList } from '@/api/modules/smallQuestionBank'

import medal1Url from '@/assets/images/small-question-bank/medal-1.png'
import medal2Url from '@/assets/images/small-question-bank/medal-2.png'
import medal3Url from '@/assets/images/small-question-bank/medal-3.png'
import iconmaleUrl from '@/assets/images/iconmale.png'
import redEnvelopeUrl from '@/assets/images/small-question-bank/red-envelope.png'

const rankList = ref<any[]>([])
const dialogVisible = ref(false)

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
  const res = await getRankingList()
  if (res.status == 200) {
    rankList.value = res.body.rankingListVos || []
  }
}

function show() {
  dialogVisible.value = true
}

function errorHandler() {
  return true
}

onMounted(() => {
  getData()
})

defineExpose({ show })
</script>

<template>
  <el-dialog title="上期题库奖励榜" v-model="dialogVisible" width="410px">
    <div class="rank-board">
      <div class="rank-title">
        <p class="rank-period">
          统计维度：按题目反馈数排序
          <span>10月23日 00:00-10月29日 23:59</span>
        </p>
      </div>
      <el-table
        :data="rankList"
        class="rank-table"
        :header-cell-style="{ background: '#f7f7f7', color: '#999', fontWeight: 500 }"
        :cell-style="cellStyle"
        style="width: 100%;min-width: 360px;overflow-x: hidden;"
      >
        <el-table-column label="排名" width="60" align="center">
          <template #default="scope">
            <span v-if="scope.$index < 3">
              <img :src="medalIcon(scope.$index)" class="medal-icon" />
            </span>
            <span v-else>{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="讲师信息" width="150" align="center">
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
        <el-table-column label="奖励（元）" width="90" align="center">
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
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.rank-board {
  background: #fff;
  border-radius: 12px;
  width: 370px;

  .rank-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;

    .rank-period {
      font-size: 14px;
      font-weight: normal;
      margin-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      span {
        color: #999;
        font-size: 12px;
      }
    }
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

    :deep(.cell) {
      color: #666;
      font-size: 14px;
    }
  }
}
:deep(.el-dialog__title) {
  font-weight: 600;
}
:deep(.el-dialog__body) {
  padding: 0 20px;
}
</style>
