<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fixed } from '@/utils/index'
import { getSchemenInfo } from '@/api/modules/order'

import addImg from '@/assets/images/order/add.png'
import shengImg from '@/assets/images/order/sheng.png'
import img1_1 from '@/assets/images/order/1-1.png'
import img1_2 from '@/assets/images/order/1-2.png'
import img1_3 from '@/assets/images/order/1-3.png'
import img1_4 from '@/assets/images/order/1-4.png'
import img2_1 from '@/assets/images/order/2-1.png'
import img2_2 from '@/assets/images/order/2-2.png'
import img2_3 from '@/assets/images/order/2-3.png'
import img2_4 from '@/assets/images/order/2-4.png'
import img3_1 from '@/assets/images/order/3-1.png'
import img3_2 from '@/assets/images/order/3-2.png'

const props = defineProps<{
  courseId: string | number
  isNewLastMinuteCramming: boolean
}>()

const route = useRoute()

const titleEnum: Record<number, string> = {
  0: '定制辅导',
  1: '考前突击',
  26: '包课辅导',
  65: '论文大礼包',
  67: '毕业大论文',
  71: '作业辅导',
}

const giveTimeEnum: Record<number, string> = {
  1: '结课',
  26: '出分',
  65: '结课',
  67: '出分',
  71: '结课',
}

const current = ref<Record<string, any>>({})
const isNewLastMinuteCrammingLocal = ref(props.isNewLastMinuteCramming)

onMounted(() => {
  if (route.query.isNewLastMinuteCramming) {
    isNewLastMinuteCrammingLocal.value = route.query.isNewLastMinuteCramming === 'true'
  }
  fetchSchemeInfo()
})

async function fetchSchemeInfo() {
  const res: any = await getSchemenInfo({ courseId: props.courseId })
  if (res.status === 200) {
    current.value = res.body || {}
  }
}
</script>

<template>
  <div class="scheme-conent">
    <h3 class="scheme-title">
      {{ isNewLastMinuteCrammingLocal ? '【保Pass版】考前突击' : titleEnum[current.spoType] }}接单服务协议
    </h3>
    <div class="item-title">一、收入模式</div>
    <div class="item-content pdb45">
      <div v-if="[0, 1].includes(+current.spoType)">课时制产品，请提供完整课时规划。订单收入模式：</div>
      <div v-else>项目制产品，需要对订单的最终分数负责。订单执行一口价收入模式：</div>
      <div class="detail-area">
        <div class="item">
          <div class="first">基础收入</div>
          <div class="second">
            <div>授课收入(实时获得）)</div>
            <div v-if="[1, 26, 65, 67, 71].includes(+current.spoType)">
              服务收入({{ giveTimeEnum[current.spoType] }}后发放)
            </div>
          </div>
        </div>
        <img :src="addImg" alt="" />
        <div class="item">
          <div class="first">奖励收入</div>
          <div class="second">
            <div>课堂点赞奖励</div>
            <div v-if="[65, 67, 71].includes(current.spoType)">订单高分奖励</div>
            <div v-if="[65, 71, 26].includes(current.spoType)">额外课时收入</div>
          </div>
        </div>
      </div>
      <div v-if="[0, 1].includes(+current.spoType)" class="left-tip">
        <i class="el-icon-warning"></i>
        <template v-if="[0].includes(+current.spoType) && [1, 2].includes(+current.payType)">
          订单最高课时请与运营确认
        </template>
        <template v-else>
          超过{{ (current.scheduledTime && fixed(+current.scheduledTime, 2)) || 0 }}H将无法结算额外薪资
        </template>
      </div>
      <div class="tip">
        <img :src="shengImg" alt="" />
        讲师可以通过<span>提高服务质量</span>，获得<span>更多额外收益</span>
      </div>
    </div>

    <div class="item-title">二、服务要求</div>
    <div class="item-content">
      <!-- 定制辅导 -->
      <template v-if="current.spoType == 0">
        <div class="rule">1. 讲师需要根据订单需求，在破冰课上提供<span>完整辅导规划</span>，确认排课<span>主题</span>、排课<span>频次</span>和排课<span>时长</span>；</div>
        <div class="rule">2. 课堂结束<span>12小时内</span>，群内发送<span>课堂反馈</span>，主动追踪学生学习效果；</div>
        <div class="rule">3. 若学生有<span>超时排课需求</span>，请及时联系运营处理，以免影响<span>薪资结算</span>。</div>
      </template>
      <!-- 考前突击 -->
      <template v-if="current.spoType == 1">
        <div class="rule">1. 订单默认课时<span>{{ current.scheduledTime }}小时</span>，讲师需要根据订单需求，在破冰课上提供<span>完整的辅导规划</span>，确认排课<span>主题</span>、排课<span>频次</span>和排课<span>时长</span>；</div>
        <div class="rule">2.课程安排中务必包含<span>刷题</span>环节，并注明每节课所使用题目的<span>资料来源</span>。若刷题资料不足，请及时联系订单运营处理；</div>
        <div class="rule">3.讲师需要完成{{ current.scheduledTime }}小时课时要求，<span>不可随意删减课程时间</span>。若学生<span>不愿配合排课</span>或有<span>超时排课需求</span>，请及时联系订单运营处理，以免影响薪资结算；</div>
        <div class="rule">4.讲师需要按照<span>sample</span>制作资料整理文件，并在最后一节课结束后及时发送给学生，帮助学生复习巩固；</div>
        <div class="rule">5.订单结课时，讲师需要提供完整资料整理文件，否则无法获得<span>服务收入</span>。</div>
      </template>
      <!-- 论文大礼包 -->
      <template v-if="current.spoType == 65">
        <template v-if="current.protocolVersion == 1">
          <div class="rule">1. 为保障服务质量，讲师需要完成以下要求：</div>
          <div>
            <div>（1）破冰课结束后按时完成【<span>论文写作时间规划表</span>】；</div>
            <div>（2）在学生初稿提交时间内上传初稿<span>进行重复率和AI率检测</span>；</div>
            <div>（3）在讲师终稿提交时间内上传<span>修改完的终稿</span>；</div>
            <div>（4）配合执行论文辅导QC流程，按QC意见<span>修改论文终稿</span>，避免出现低级失误</div>
            <div>*未按时完成以上要求，系统将自动扣除一口价50%的收入。如遇特殊情况，请讲师<span>及时通知订单运营</span>，以免影响薪资发放</div>
          </div>
          <div class="rule">2. 若论文<span>出分低于订单PASS线</span>，讲师将面临已获薪资被扣除的风险。若讲师账户余额不足，公司有权要求讲师线下返还已获订单薪资。</div>
        </template>
        <template v-else>
          <div class="new-rule">1. 讲师需要按时制作<span class="font-weight">【论文写作时间规划表】， 预留充分时间配合执行终稿QC；</span></div>
          <div class="new-rule">2. <span class="font-weight">关注学生提交初稿时间，</span>及时同步订单运营进行重复率及AI率检测。若学生拖稿，请务必及时反馈！</div>
          <div class="new-rule">3. <span class="font-weight">破冰课件、</span><span class="red-text">论文Outline</span><span class="font-weight">和讲师终稿都需要讲师人工制作，</span><span class="red-text">严禁直接复制粘贴AI生成内容！</span>若发现AI重复问题，讲师需要配合修改。若直接导致客诉的，讲师需承担对应后果；</div>
          <div class="new-rule">4. <span class="font-weight">若论文出分低于订单PASS线，讲师将面临已获薪资被扣除的风险。</span>若讲师账户余额不足，公司有权要求讲师线下返还已获订单薪资。</div>
        </template>
      </template>
      <!-- 作业辅导 -->
      <template v-if="current.spoType == 71">
        <template v-if="current.protocolVersion == 1">
          <div class="rule">1. 讲师需要<span>先完成作业的具体内容</span>，再与学生约课讲解作业完成思路；</div>
          <div class="rule">2. 讲师需要及时上传作业终版进行查重，<span>避免AI率和重复率不合格</span>；</div>
          <div class="rule-tip"><span class="star">*</span>如遇特殊情况，请讲师及时通知订单运营，以免影响薪资发放</div>
          <div class="rule">3. 若作业<span>出分低于订单PASS线</span>，讲师将面临已获薪资被扣除的风险。若讲师账户余额不足，公司有权要求讲师线下返还已获订单薪资。</div>
        </template>
        <template v-else>
          <div class="new-rule">1. 讲师需要<span class="font-weight">先完成作业的具体内容</span>，再与学生约课讲解作业完成思路；</div>
          <div class="new-rule">2. 合理规划完成时间，<span class="font-weight">预留充分时间配合执行终稿QC流程；</span></div>
          <div class="new-rule">3. 及时联系<span class="font-weight">订单运营</span>进行终版作业的查重，<span class="font-weight">避免</span><span class="red-text">AI率</span><span class="font-weight">和重复率不合格；</span></div>
          <div class="rule-tip"><span class="star">*</span>如遇特殊情况，请讲师及时通知订单运营，以免影响薪资发放</div>
          <div class="new-rule">4.<span class="font-weight">若作业出分低于订单PASS线，讲师将面临已获薪资被扣除的风险。</span>若讲师账户余额不足，公司有权要求讲师线下返还已获订单薪资。</div>
        </template>
      </template>
      <!-- 毕业大论文 -->
      <template v-if="current.spoType == 67">
        <template v-if="current.protocolVersion == 1">
          <div class="rule">1. 讲师需要合理规划论文的辅导阶段，<span>设置各阶段具体的论文规划表</span>，明确终稿时间；</div>
          <div class="rule">2. 讲师需要<span>分阶段提供outline产出和阶段终稿修改</span>。帮助学生完成数据处理部分，产出数据处理的结果和分析；</div>
          <div class="rule">3. 讲师需要及时上传毕业论文终版进行查重，<span>避免AI率和重复率不合格</span>；</div>
          <div class="rule">4. 若论文<span>出分低于订单PASS线</span>，讲师将面临已获薪资被扣除的风险。若讲师账户余额不足，公司有权要求讲师线下返还已获订单薪资。</div>
        </template>
        <template v-else>
          <div class="new-rule">1. 讲师需要合理规划论文的辅导阶段，<span class="font-weight">设置各阶段具体的论文规划表，</span>明确终稿时间；</div>
          <div class="new-rule">2. 讲师需要<span class="font-weight">分阶段提供outline产出和阶段终稿修改</span>。帮助学生完成数据处理部分，产出数据处理的结果和分析；</div>
          <div class="new-rule">3. <span class="font-weight">破冰课件、</span><span class="red-text">论文Outline</span><span class="font-weight">和讲师终稿</span>都需要讲师人工制作，<span class="red-text">严禁直接复制粘贴AI生成内容！</span>若发现AI重复问题，讲师需要配合修改。若直接导致客诉的，讲师需承担对应后果；</div>
          <div class="new-rule">4. 及时联系<span class="font-weight">订单运营</span>进行毕业论文终版查重，<span class="font-weight">避免</span><span class="red-text">AI率</span><span class="font-weight">和重复率不合格；</span></div>
          <div>5. <span class="font-weight">若论文出分低于订单PASS线，讲师将面临已获薪资被扣除的风险</span>。若讲师账户余额不足，公司有权要求讲师线下返还已获订单薪资。</div>
        </template>
      </template>
      <!-- 包课 -->
      <template v-if="current.spoType == 26">
        <div class="rule">1. 讲师需要按规则保证<span>每周至少排课一次</span>且<span>每周主动约课和排课</span>。若有特殊情况（例如，学生不配合排课、学生旷课等），请及时通知运营处理；</div>
        <div class="rule">2. 订单<span>标准课时15小时</span>，最高课时<span>20小时</span>。若订单<span>无法满足标准课时</span>或有<span>上超最高课时</span>的风险，讲师需在<span>课程中期</span>及时通知运营，否则将无法正常结算薪资；</div>
        <div class="rule">3. 若<span>该订单总成绩Fail</span>，且讲师未按照服务要求执行流程，讲师已获收入将被全部扣除。</div>
      </template>
    </div>

    <template v-if="isNewLastMinuteCrammingLocal">
      <div class="item-title">三、订单执行流程</div>
      <div class="item-content">
        <p>考前突击产品升级为<strong>保Pass版本</strong>，需要老师执行以下3个步骤：</p>
        <div class="content-block">
          <p class="title">1.首课前确认订单规划</p>
          <p class="desc">讲师需在首课前确认重要考点并完成订单规划</p>
          <div class="img-wrap">
            <div>
              <el-image :src="img1_1" :preview-src-list="[img1_1]" fit="scale-down" />
              <p>01 确认重要考点</p>
            </div>
            <i class="el-icon-arrow-right"></i>
            <div>
              <el-image :src="img1_2" :preview-src-list="[img1_2]" fit="scale-down" />
              <p>02 发送重要考点给学生</p>
            </div>
          </div>
          <div class="img-wrap">
            <div>
              <el-image :src="img1_3" :preview-src-list="[img1_3]" fit="scale-down" />
              <p>03 完成课堂规划</p>
            </div>
            <i class="el-icon-arrow-right"></i>
            <div>
              <el-image :src="img1_4" :preview-src-list="[img1_4]" fit="scale-down" />
              <p>04 将课堂规划插入PPT中</p>
            </div>
          </div>
        </div>
        <div class="content-block">
          <p class="title">2.排课前确认重要考点</p>
          <p class="desc">讲师需在排课前再次确认重要考点，并确认是否发送对应的课后练习。</p>
          <div class="img-wrap">
            <div>
              <el-image :src="img2_1" :preview-src-list="[img2_1]" fit="scale-down" />
              <p>01 排课前确认重要考点</p>
            </div>
            <i class="el-icon-arrow-right"></i>
            <div>
              <el-image :src="img2_2" :preview-src-list="[img2_2]" fit="scale-down" />
              <p>02 课后自动发送课后作业</p>
            </div>
          </div>
          <div class="img-wrap">
            <div>
              <el-image :src="img2_3" :preview-src-list="[img2_3]" fit="scale-down" />
              <p>03 课后进行课堂反馈</p>
            </div>
            <i class="el-icon-arrow-right"></i>
            <div>
              <el-image :src="img2_4" :preview-src-list="[img2_4]" fit="scale-down" />
              <p>04 发送学生课堂反馈</p>
            </div>
          </div>
        </div>
        <div class="content-block">
          <p class="title">3.结课前及时发送结课报告</p>
          <p class="desc">请讲师合理安排课堂时间，并于最后一节课前发送结课报告。系统会自动生成学生的学习情况数据，并生成相应的错题集和Final Mock</p>
          <p class="error"><i class="el-icon-warning"></i> 若未及时发送，无法申请结课，获取剩余薪酬！</p>
          <div class="img-wrap">
            <div>
              <el-image :src="img3_1" :preview-src-list="[img3_1]" fit="scale-down" />
              <p>01 发送结课报告</p>
            </div>
            <i class="el-icon-arrow-right"></i>
            <div>
              <el-image :src="img3_2" :preview-src-list="[img3_2]" fit="scale-down" />
              <p>02 学生查看结果报告</p>
            </div>
          </div>
          <p class="desc">按照订单的实际情况完成以上要求，我们会<strong>全额结算</strong>保Pass考前突击的订单薪资。</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.scheme-title {
  text-align: center;
  font-size: 25px !important;
  color: #222222;
  margin: 30px;
}

.item-title {
  color: #3d3d3d;
  font-weight: 700;
  font-size: 16px;
}

.item-content {
  background: #f9f9f9;
  border-radius: 5px;
  padding: 10px 15px;
  margin: 15px 0 20px 0;
  position: relative;

  .left-tip {
    position: absolute;
    width: 378px;
    margin-top: 10px;
    text-align: center;
    color: rgb(246, 93, 93);

    i {
      color: rgb(246, 93, 93);
      margin-right: 5px;
      font-size: 16px;
    }
  }

  .tip {
    float: right;
    margin: 10px 40px 0 0;
    font-size: 12px;

    img {
      width: 18px;
      margin-right: 5px;
    }

    span {
      color: #ff8440;
    }
  }

  .content-block {
    p {
      margin-bottom: 12px;
    }

    .title {
      font-size: 14px !important;
      font-weight: bold;
      font-family: inherit !important;
    }

    .desc {
      margin-left: 14px;
    }

    .error {
      color: #da5b54;
      font-weight: bold;
      margin-left: 14px;

      .el-icon-warning {
        color: inherit;
      }
    }

    .img-wrap {
      display: flex;
      gap: 20px;
      padding: 0 40px;
      align-items: center;

      .el-icon-arrow-right {
        font-weight: bolder;
        margin-top: -50px;
      }

      p {
        text-align: center;
      }

      .el-image {
        width: 300px;
        height: 300px;
        background-color: #fff;
      }
    }
  }
}

.detail-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;

  .item {
    width: calc(50% - 50px);
    border: 1px solid #ffaa70;
    border-radius: 15px;
    text-align: center;
    padding: 5px 0;
    background: #fff;

    .first {
      font-weight: 700;
    }

    .second {
      display: flex;
      justify-content: space-evenly;
      margin-top: 3px;

      > div {
        background: #f9f9f9;
        padding: 0 15px;
        border-radius: 15px;
        line-height: 25px;
      }
    }
  }

  .item:nth-of-type(2) {
    .first {
      color: #ffaa70;
    }

    .second {
      div {
        background: #fff6ed;
        color: #ffaa70;
      }
    }
  }

  img {
    width: 20px;
    height: 20px;
  }
}

.rule {
  font-weight: 700;
  color: #3d3d3d;
  line-height: 28px;
}

.rule-tip {
  color: #444444;
  font-size: 12px;
  margin-left: 15px;
}

.first {
  font-weight: 700;
}

div {
  line-height: 28px;

  span {
    color: #ff8440;
  }
}

div.text {
  margin-top: 15px;
  padding: 0 20px;
}

.pdb45 {
  padding-bottom: 45px !important;
}

.show-know-tip {
  span {
    color: #222222;
    margin-left: 5px;
  }
}

.new-rule {
  color: #3d3d3d;
}

.font-weight {
  color: #3d3d3d;
  font-weight: 700;
}

.red-text {
  color: #cb2a33;
  font-weight: 700;
}

.star {
  color: #ff8440;
}
</style>
