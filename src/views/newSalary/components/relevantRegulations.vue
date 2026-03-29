<script setup lang="ts">
import { ref } from 'vue'
import { ElDialog, ElLink } from 'element-plus'

const isShow = ref(false)

function show() {
  isShow.value = true
}

function closeModal() {
  isShow.value = false
}

defineExpose({ show })
</script>

<template>
  <div>
    <el-dialog
      v-model="isShow"
      width="740px"
      :close-on-click-modal="false"
      @close="closeModal"
      append-to-body
    >
      <div class="item-title">预缴税额规则</div>
      <div class="item-content">
        <div class="rules">1. 个税缴纳记录公开透明，老师可通过"个人所得税"APP实时查询，年度汇算清缴时多退少补；</div>
        <div class="rules">2. 根据《国家税务总局关于互联网平台企业为平台内从业人员办理扣缴申报、代办申报若干事项的公告》规定，具体个税计算公式如下：</div>
        <div class="rules-detail">
          本期应预扣预缴税额 =（累计收入 - 累计费用 - 累计免税收入 - 累计减除费用 - 累计依法确定的其他扣除）× 预扣率 - 速算扣除数 - 累计减免税额 - 累计已预扣预缴税额
        </div>
        <div class="rules-detail">
          其中：累计费用，按累计收入乘以20%计算；累计减除费用，按照5000元/月乘以纳税人当年截至本月在本互联网平台企业连续取得劳务报酬的月份数计算。
        </div>
      </div>
      <div class="item-title">如需更多信息，可参阅以下链接：</div>
      <div class="item-content">
        <div>
          <div class="rules-detail link">
            <el-link type="primary" href="https://fgk.chinatax.gov.cn/zcfgk/c100010/c5241238/content.html" target="_blank">《互联网平台企业涉税信息报送规定》</el-link>
          </div>
          <div class="rules-detail link">
            <el-link type="primary" href="https://fgk.chinatax.gov.cn/zcfgk/c100012/c5241477/content.html" target="_blank">《国家税务总局关于互联网平台企业报送涉税信息有关事项的公告》</el-link>
          </div>
          <div class="rules-detail link">
            <el-link type="primary" href="https://fgk.chinatax.gov.cn/zcfgk/c100012/c5241472/content.html" target="_blank">《国家税务总局关于互联网平台企业为平台内从业人员办理扣缴申报、代办申报若干事项的公告》</el-link>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.item-title {
  font-weight: 700;
  margin: 20px 0 10px;
  font-size: 18px;
}
.item-content {
  line-height: 25px;
  .rules-detail {
    color: #4b4b4b;
    line-height: 25px;
    position: relative;
    padding-left: 12px;
    font-weight: 400;
    &::before {
      width: 3px;
      height: 3px;
      display: inline-block;
      content: "";
      border-radius: 50%;
      background: #4b4b4b;
      position: absolute;
      left: 2px;
      top: 10px;
    }
    &.link {
      &::before {
        background-color: #66b1ff;
      }
    }
    :deep(.el-link--inner) {
      color: inherit;
    }
  }
  .rules {
    color: #3d3d3d;
    font-weight: 700;
  }
}
:deep(.el-dialog) {
  border-radius: 15px;
}
:deep(.el-dialog__header) {
  padding: 0;
}
:deep(.el-dialog__close) {
  font-size: 18px;
  color: #606266;
}
:deep(.el-dialog__title) {
  font-weight: 700;
}
:deep(.el-dialog__body) {
  height: 390px;
  overflow: auto;
  padding: 0px 20px 20px;
}
:deep(.el-button) {
  span {
    color: #fff;
  }
}
</style>
