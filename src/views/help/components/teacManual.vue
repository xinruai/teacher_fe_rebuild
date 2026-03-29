<template>
    <div>
        <div id="2" class="menu-title">万能讲师规范手册</div>
        <div class="content">
            <div id="2.1" class="item-title">1.部门介绍</div>
            <div id="2.1.1">
                <div>
                    ● 师资渠道：负责讲师的简历筛选、试讲考核、入职签约等事宜
                </div>
                <div>（紧急联系人企业微信@ Colin）</div>
            </div>
            <div id="2.1.2">
                <div>
                    ● 师资孵化：负责讲师的学术检测、入职培训、新手期孵化等事宜
                </div>
                <div>（紧急联系人企业微信@ 培训师 Coco）</div>
            </div>
            <div id="2.1.3">
                <div>
                    ●
                    师资运营：负责各学科讲师订单的委派、薪资核算、订单跟进等事宜
                </div>
                <div>（企业微信@ Dephlin）</div>
            </div>
            <div id="2.1.4">
                <div>
                    ●
                    讲师培优：负责监控教学服务质量、处理客户投诉、订单退款及讲师奖惩复核等事宜
                </div>
                <div>（企业微信@ Elena）</div>
            </div>
            <div id="2.2" class="item-title">2.工作软件</div>
            <div id="2.2.3">
                <div class="third-title">
                    ● 小班带你飞公众号
                </div>
                <img class="code-img" :src="officialAccountsCode" alt="" />
            </div>
            <div id="2.2.1">
                <div class="third-title ">● 通讯软件：企业微信插件</div>
                <div>
                    【企业微信插件】将会是万能讲师团队的<span class="desc"
                        >唯一沟通平台</span
                    >。关注企业微信插件，并验证身份，同时<span class="desc"
                        >确保接收企业消息为打开状态</span
                    >，您将不会错过任何重要信息哦（<span class="desc"
                        >如：订单推送）</span
                    >！
                </div>
                <div class="img-box">
                    <img src="@/assets/images/help/qwstep.png" alt="" />
                </div>
            </div>
            <div id="2.2.2">
                <div class="third-title ">
                    ● 教学软件：万能讲师网页端&ClassRoom
                </div>
                <div>
                    万能讲师网页端为讲师提供培训视频、订单管理、课堂日程、工资记录等多信息，是老师正式接单的唯一操作平台。讲师可经排课表进入授课课堂（ClassRoom），课程自动录制并保存在订单后台。如遇学生无法进入或正常使用ClassRoom，请讲师及时向师资部门报备，方可使用腾讯会议等其他软件并自行保存课程回放、提交师资组复核教学质量、核算薪资。
                </div>
            </div>
            <div id="2.3" class="item-title">3. 讲师接单制度</div>
            <div>
                运营伙伴会根据讲师信息与订单需求，在企业微信发起询单。请讲师务必点击订单链接、仔细查阅订单信息（包括但不限于学员需求、订单DDL、备课资料、预计收入等），并通过企微及时回复接单意愿，并在1小时内在万能讲师平台操作"接单"。讲师点击接单后，系统会自动生成学习交流群（包含学员、运营、讲师、培训师、销售等人员）。请讲师主动在群内打招呼，与学生确认破冰课的上课时间。
            </div>
            <div class="desc">
                *
                如遇无法及时操作接单但接单意向明确，请讲师与运营协商好"接单"时间，以免耽误订单进度
            </div>
            <div id="2.4" class="item-title">4. 考勤规范</div>
            <div class="third-title ">● 考勤原则</div>
            <div>
                所有讲师在任职期间不可出现无故迟到、改约、旷课、取消课堂等现象，须按时出席约定课程。
            </div>
            <div class="third-title ">● 监察方式</div>
            <div>
                师资系统将自动对迟到、改约、旷课、取消课堂的行为进行处罚，考核与违纪处理方法参考附件《违规与违纪处理方法》。
            </div>
            <div id="2.5" class="item-title">5.备课规范</div>
            <div>
                讲师在上课前应做好本次课堂的备课准备，包括通知学生课程内容以及上课时间，以及课程培训课件的提前制作，需包含以下信息：
            </div>
            <el-table
                :data="preClasstableData"
                style="width: 100%"
                border
                :cell-class-name="tableCellClassName"
                :header-cell-style="{
                    color: '#999999',
                    background: '#F3F3F3',
                    textAlign: 'center'
                }"
            >
                <el-table-column
                    v-for="(item, index) in preClassColumns"
                    :key="index"
                    :label="item.label"
                    :prop="item.prop"
                    :width="item.width"
                >
                </el-table-column>
            </el-table>
            <div>若讲师违反以上规范要求，将按照《违规与违纪处理方法》处理</div>
            <div id="2.6" class="item-title">6.课堂规范</div>
            <div>
                讲师在课堂上应注意个人教学行为规范：其中包括授课过程内容、教学互动规范、课堂时间管理，详细考核标准参见下图：
            </div>
            <el-table
                :data="classRuleData"
                style="width: 100%"
                border
                :span-method="classRuleSpanMethod"
                :cell-class-name="tableCellClassName"
                :header-cell-style="headFirst"
            >
                <el-table-column
                    v-for="(item, index) in classRuleColumns"
                    :key="index"
                    :label="item.label"
                    :prop="item.prop"
                    :width="item.width"
                >
                </el-table-column>
            </el-table>
            <div>若讲师违反以上规范要求，将按照《违规与违纪处理方法》处理</div>
            <div id="2.7" class="item-title">7.课后规范</div>
            <div>
                讲师在与学生的课后沟通中应注意沟通方式和资源的完整提供，及时提供课后反馈，保证学生的良好辅导体验，详细要求如图：
            </div>
            <el-table
                :data="afterClasstableData"
                style="width: 100%"
                border
                :header-cell-style="{
                    color: '#999999',
                    background: '#F3F3F3',
                    textAlign: 'center'
                }"
                :cell-class-name="tableCellClassName"
            >
                <el-table-column
                    v-for="(item, index) in preClassColumns"
                    :key="index"
                    :label="item.label"
                    :prop="item.prop"
                    :width="item.width"
                >
                </el-table-column>
            </el-table>
            <div>若讲师违反以上规范要求，将按照《违规与违纪处理方法》处理</div>
            <div id="2.8" class="item-title">8.离职解约流程</div>
            <div>
                ●
                如需解除合作关系，请联系对应师资运营人员。讲师有义务协助工作人员完成在途辅导订单交接，若拒绝配合工作人员完成交接，师资部门会根据讲师的师资配合度，进行相对应的薪资扣除。
            </div>
            <div>
                ●
                讲师申请离职前，需和师资工作人员确定好账户内剩余薪资数额。确认完毕后，剩余薪资将于讲师账户移除当天起<span
                    class="desc"
                    >30个自然日</span
                >后由财务部门打款发放。
            </div>
            <div id="2.9" class="item-title">9.附件《违规与违纪处理方法》</div>
            <el-table
                :data="memoRuleData"
                style="width: 100%"
                border
                :span-method="memoRuleSpanMethod"
                :header-cell-style="{
                    color: '#999999',
                    background: '#F3F3F3',
                    textAlign: 'center'
                }"
                :cell-class-name="tableCellClassName"
            >
                <el-table-column
                    v-for="(item, index) in memoRuleColumns"
                    :key="index"
                    :label="item.label"
                    :prop="item.prop"
                    :width="item.width"
                >
                    <template #default="scope">
                        <div v-html="scope.row[item.prop]"></div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { officialAccountsCode } from '@/api/config'
import {
    preClassColumns,
    preClasstableData,
    afterClasstableData,
    classRuleColumns,
    classRuleData,
    memoRuleColumns,
    memoRuleData,
} from '../cfg'

interface SpanMethodParams {
    row: Record<string, unknown>
    column: { property: string }
    rowIndex: number
    columnIndex: number
}

function classRuleSpanMethod({ column, rowIndex }: SpanMethodParams) {
    if (column.property == 'ruleFirstItem' && !rowIndex) return [2, 1]
    else if (column.property == 'ruleFirstItem' && rowIndex == 2)
        return [4, 1]
    else if (
        column.property == 'ruleFirstItem' &&
        [6, 8].includes(rowIndex)
    )
        return [2, 1]
    else if (
        column.property == 'ruleFirstItem' &&
        ![0, 2, 6, 8].includes(rowIndex)
    )
        return [0, 0]
}

function memoRuleSpanMethod({ column, rowIndex }: SpanMethodParams) {
    if (column.property == 'level' && !rowIndex) return [4, 1]
    else if (column.property == 'level' && rowIndex == 4) return [5, 1]
    else if (column.property == 'level' && rowIndex == 9) return [4, 1]
    else if (column.property == 'level' && rowIndex == 13)
        return [2, 1]
    else if (
        column.property == 'level' &&
        ![0, 4, 9, 13].includes(rowIndex)
    )
        return [0, 0]
    else if (
        column.property == 'type' &&
        [3, 8, 12, 14].includes(rowIndex)
    )
        return [1, 2]
    else if (
        column.property == 'rule' &&
        [3, 8, 12, 14].includes(rowIndex)
    )
        return [0, 0]
}

function tableCellClassName({ column }: { column: { property: string } }) {
    if (
        [
            'ruleItem',
            'ruleFirstItem',
            'ruleSecondItem',
            'level',
            'type',
        ].includes(column.property)
    )
        return 'center'
}

interface HeaderParams {
    row: Array<{ property: string }>
    column: unknown
    rowIndex: number
    columnIndex: number
}

function headFirst({ row, rowIndex, columnIndex }: HeaderParams): CSSProperties {
    const base: CSSProperties = {
        color: '#999999',
        background: '#F3F3F3',
        textAlign: 'center',
    }
    if (rowIndex === 0) {
        if (row[columnIndex].property === 'ruleFirstItem') {
            return {
                ...base,
                width: '200%',
                display: 'inline-block',
                position: 'relative',
                zIndex: 2,
            }
        }
    }
    return base
}
</script>

<style scoped lang="scss">
:deep(.center) {
    text-align: center !important;
}
.desc {
    color: red;
}
.bottom {
    margin-top: 40px;
}
.content {
    padding-left: 60px;
    line-height: 25px;
    width: 800px;
    > div {
        width: 100%;
    }
}
.fw700 {
    font-weight: 700;
}
.success-icon {
    font-weight: 700;
    color: #00b050;
    margin-right: 5px;
}
.error-icon {
    font-weight: 700;
    color: #c00000;
    margin-right: 5px;
}
.img-box {
    img {
        width: 100%;
        margin: -5px 0 -25px -55px;
    }
}
.code-img {
    width: 200px;
    height: 200px;
}
</style>
