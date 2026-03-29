import { winUrl as mkWinURL, macUrl as mkMacURL } from '@/api/config'
import iosImg from '@/assets/images/ios.png'
import winImg from '@/assets/images/win.png'

export interface MenuItem {
  title: string
  id: string
  showArrow?: boolean
  upType?: boolean
  showNo?: boolean
  children?: MenuItem[]
}

export const menusList: MenuItem[] = [
  {
    title: '授课应用相关',
    id: '1',
    showArrow: true,
    upType: true,
    children: [
      { title: '腾讯会议课堂测试入口', id: '1.1', showNo: true, showArrow: false },
      { title: '腾讯会议客户端下载', id: '1.2', showNo: true, showArrow: false },
      {
        title: '腾讯会议课堂操作指南',
        id: '1.3',
        showNo: true,
        showArrow: true,
        upType: false,
        children: [
          { title: '课程大纲', id: '1.3.2', showNo: true, showArrow: false },
          { title: '共享屏幕', id: '1.3.3', showNo: true, showArrow: false },
          { title: '手写板', id: '1.3.4', showNo: true, showArrow: false },
          { title: '虚拟背景', id: '1.3.5', showNo: true, showArrow: false },
          { title: '下课', id: '1.3.6', showNo: true, showArrow: false },
          { title: '镜像摄像头', id: '1.3.7', showNo: true, showArrow: false },
          { title: '教室背景更换', id: '1.3.8', showNo: true, showArrow: false },
          { title: '教室功能按键介绍', id: '1.3.9', showNo: true, showArrow: false },
          { title: '教学工具介绍', id: '1.3.10', showNo: true, showArrow: false },
          { title: '教室设置介绍', id: '1.3.11', showNo: true, showArrow: false },
          { title: '美颜设置', id: '1.3.12', showNo: true, showArrow: false },
          { title: '学生点赞', id: '1.3.13', showNo: true, showArrow: false },
        ],
      },
    ],
  },
  {
    title: '万能讲师网页端功能指引',
    id: '3',
    showArrow: true,
    upType: true,
    children: [
      {
        title: '订单操作',
        id: '3.1',
        showNo: true,
        showArrow: true,
        children: [
          { title: '抢单/接单', id: '3.1.1', showNo: true, showArrow: false },
          { title: '查看订单信息', id: '3.1.2', showNo: true, showArrow: false },
          { title: '订单结课', id: '3.1.3', showNo: true, showArrow: false },
        ],
      },
      {
        title: '备课中心使用',
        id: '3.2',
        showNo: true,
        showArrow: true,
        children: [
          { title: '进入备课中心', id: '3.2.1', showNo: true, showArrow: false },
          { title: '创建课堂&进入课堂', id: '3.2.2', showNo: true, showArrow: false },
          { title: '云文档备课', id: '3.2.3', showNo: true, showArrow: false },
          { title: '查看订单当前收入', id: '3.2.4', showNo: true, showArrow: false },
        ],
      },
      {
        title: '薪资查询',
        id: '3.3',
        showNo: true,
        showArrow: true,
        upType: false,
        children: [
          { title: '查看收入明细&提现', id: '3.3.1', showNo: true, showArrow: false },
          { title: '薪资模式介绍', id: '3.3.2', showNo: true, showArrow: false },
        ],
      },
    ],
  },
  {
    title: '万能讲师规范手册',
    id: '2',
    showArrow: true,
    upType: true,
    children: [
      {
        title: '部门介绍',
        id: '2.1',
        showNo: true,
        upType: true,
        showArrow: true,
        children: [
          { title: '师资渠道', id: '2.1.1', showNo: true },
          { title: '师资孵化', id: '2.1.2', showNo: true },
          { title: '师资运营', id: '2.1.3', showNo: true },
          { title: '讲师培优', id: '2.1.4', showNo: true },
        ],
      },
      {
        title: '工作软件',
        id: '2.2',
        showNo: true,
        upType: true,
        showArrow: true,
        children: [
          { title: '小班带你飞公众号', id: '2.2.3', showNo: true },
          { title: '通讯软件：企业微信插件', id: '2.2.1', showNo: true },
          { title: '教学软件：万能讲师网页端&ClassRoom', id: '2.2.2', showNo: true },
        ],
      },
      { title: '讲师接单制度', id: '2.3', showNo: true },
      { title: '考勤规范', id: '2.4', showNo: true },
      { title: '备课规范', id: '2.5', showNo: true },
      { title: '课堂规范', id: '2.6', showNo: true },
      { title: '课后规范', id: '2.7', showNo: true },
      { title: '离职解约流程', id: '2.8', showNo: true },
      { title: '附件《违规与违纪处理方法》', id: '2.9', showNo: true },
    ],
  },
]

export const downList = [
  {
    img: iosImg,
    id: 'classInDownLoad_macOS',
    desc: 'Mac版',
    downLoadLink: mkMacURL,
    guideName: 'Mac版安装指南',
    guideUrl:
      'https://wchk-oss.oss-accelerate.aliyuncs.com/statics/app/%E8%B5%84%E6%BA%90/Mac%E7%89%88%20%E5%AE%A2%E6%88%B7%E7%AB%AF%E4%B8%8B%E8%BD%BD.pdf',
  },
  {
    img: winImg,
    id: 'classInDownLoad_win7',
    desc: 'Windows',
    downLoadLink: mkWinURL,
    guideName: 'Windows版安装指南',
    guideUrl:
      'https://wchk-oss.oss-accelerate.aliyuncs.com/statics/app/%E8%B5%84%E6%BA%90/Win%E7%89%88%20%E5%AE%A2%E6%88%B7%E7%AB%AF%E4%B8%8B%E8%BD%BD.pdf',
  },
]

export const preClassColumns = [
  { label: '规范内容', prop: 'ruleItem', width: '135px' },
  { label: '要求标准', prop: 'ruleContent' },
]

export const preClasstableData = [
  { ruleItem: '本节课程章节具体分类', ruleContent: '将本节课程内容按照顺序和主题划分成若干章节，提供简要的内容概述，让学生了解本章节的学习目标，帮助学生形成系统化的知识结构' },
  { ruleItem: '重难点清晰标记与解析', ruleContent: '讲师需针对课程中出现的重难点在备课阶段做出明显颜色或者符号标记告知学生重点所在，并且进行详细的标注，提供额外的解释，必要时可提供举例来帮助学生理解' },
  { ruleItem: '课堂总结', ruleContent: '课程内容讲解完成之后讲师需对课程进行一个整体总结，包括本堂课程的重难点分析情况以及课下需要学生着重复习掌握的地方，并为学生布置阶段性作业/任务' },
  { ruleItem: '下节课程上课时间与课程规划安排', ruleContent: '讲师需在本次课程课件末确定下节课程上课时间以及明确课程规划安排，要求放松至下一节课程的授课时间，后续具体时间可与学生跟进确认' },
]

export const afterClasstableData = [
  { ruleItem: '资源提供', ruleContent: '课后为学生提供课堂相关的学习资源，课件、参考资料等，便于学生自主学习' },
  { ruleItem: '作业布置', ruleContent: '根据课程内容布置相应的作业，帮助学生巩固所学知识，并在下一节课前及时检查和反馈' },
  { ruleItem: '群内答疑', ruleContent: '2小时内回复学生群内问题，可以采用文字或者语音发送帮助学生解决问题，如果涉及计算方面题目建议讲师提供解题计算过程/任务' },
  { ruleItem: '课后反馈', ruleContent: '讲师需要在每节课结束后及时填写当节课堂反馈，以免影响课堂薪资结算。及时跟进学生课程进度，作业完成情况、课程复习情况等，遇到学生不配合的情况则需要及时与运营沟通，避免造成进一步影响' },
]

export const classRuleColumns = [
  { label: '考核项目', prop: 'ruleFirstItem', width: '135px' },
  { label: '考核项目', prop: 'ruleSecondItem', width: '135px' },
  { label: '考核标准', prop: 'rule' },
]

export const classRuleData = [
  { ruleFirstItem: '个人教学行为规范', ruleSecondItem: '行为端正', rule: '授课过程中应保持专业形象，例如衣冠整洁、环境整洁、不抽烟、不梳头化妆、不与人交谈等与教学无关的行为，同时在教学过程中应注意行为礼貌，使用文明用语并保持良好的沟通态度，不得对学生进行讽刺、挖苦或其他不当言辞' },
  { ruleFirstItem: '个人教学行为规范', ruleSecondItem: '个人隐私保护', rule: '不透露个人住址、联系电话、社交媒体账号、其他可能泄露个人身份的敏感信息。例如，与学生的交流应通过公司指定的工作平台和工作账号进行，避免使用个人账号进行业务沟通。' },
  { ruleFirstItem: '授课过程', ruleSecondItem: '板书清晰', rule: '授课过程中使用的板书应保持字迹清晰，易于学生阅读。确保字体大小适中，颜色对比明显' },
  { ruleFirstItem: '授课过程', ruleSecondItem: '内容整洁', rule: '板书内容应条理分明、整洁有序，避免杂乱无章。重要信息应当重点标注，以便学生理解和记忆' },
  { ruleFirstItem: '授课过程', ruleSecondItem: '信息完整', rule: '板书内容应当包括本节课的重要概念、例题、结论等，确保信息的完整性和系统性' },
  { ruleFirstItem: '授课过程', ruleSecondItem: '摄像清晰', rule: '在授课过程中，讲师需要全程打开摄像头，保证背景整洁，摄像区域覆盖人脸。不可未经允许，关闭摄像头上课。' },
  { ruleFirstItem: '教学互动规范', ruleSecondItem: '积极互动', rule: '授课过程中讲师应积极与学生互动，鼓励学生提问和参与讨论，以提高课堂参与度和学习效果。' },
  { ruleFirstItem: '教学互动规范', ruleSecondItem: '耐心解答', rule: '对于学生提出的问题，应耐心解答，确保学生理解问题的核心和解决方法，可以采取完成讲解后额外准备习题了解学生掌握情况' },
  { ruleFirstItem: '课堂时间管理', ruleSecondItem: '合理安排时间', rule: '合理分配每部分教学内容的时间，确保课程内容完整覆盖，不拖堂也不提前结束' },
  { ruleFirstItem: '课堂时间管理', ruleSecondItem: '课程预估', rule: '课程结束前在课堂上与学生及时确认下节课上课时间与简述下节课课程内容，方便学生课后预习' },
]

export const memoRuleColumns = [
  { label: '等级', prop: 'level', width: '80px' },
  { label: '类型', prop: 'type', width: '100px' },
  { label: '违规与违纪细则', prop: 'rule' },
]

export const memoRuleData = [
  { level: 'S级', type: '产品服务不合规', rule: '1. 不遵守产品服务流程，未按照产品接单须知中的要求提供服务；<br/>2. 讲师提供的课程教学文件中有明显AI工具使用痕迹；<br/>3. 不配合工作人员进行正常工作对接，不配合工作人员解决学生事宜；<br/>4. 长时间不回复学生信息耽误教学服务进度；<br/>5. 使用不当言语损害学生自尊或人格或辱骂他人等' },
  { level: 'S级', type: '违反保密协议', rule: '1. 抱怨公司或合作单位的运营、制度或课程安排等损害公司或合作单位形象的行为；<br/>2. 贬低公司或合作单位价值或推荐其它机构；<br/>3. 泄露课程价格、薪资等敏感信息；<br/>4. 私加学生约课、撬学生脱离万能班长的服务；<br/>5. 泄露学生信息、订单资料等行为' },
  { level: 'S级', type: '个人行为不当', rule: '1. 学历、学位等资料信息造假；<br/>2. 以任何手段获得不当利益；<br/>3. 课上行为不端或课上进行与教学无关的行为，例如衣冠不整、抽烟、喂宠物、与他人交谈、梳头化妆等；<br/>4. 出现教学不诚信行为，主动提出或私下答应学生代写/代考相关服务；<br/>5. 透露讲师个人住址、联系电话、社交媒体账号、其他可能泄露个人身份的敏感信息' },
  { level: 'S级', type: '<div style="font-weight:700;text-align:left !important">以上情形属于严重违纪，若讲师出现任一行为，万能班长有权扣除未结算的所有课程费用，并有权单方解除与讲师签署的《合作协议》（以下简称解除合作关系），公司保留追偿及起诉权利，不作任何补偿。</div>' },
  { level: 'A级', type: '迟到', rule: '讲师进入课堂时间晚于系统排课时间1分钟及以上视作迟到。若讲师迟到，系统将自动扣除讲师账户10 G作为处罚' },
  { level: 'A级', type: '迟到', rule: '擅自更改已经与学生约定好的上课时间视作改约。若讲师擅自改约，系统将自动扣除讲师账户20 G作为处罚。若学生发起改约，请讲师务必在群聊内@教辅修改或取消课堂时间，以免影响薪资结算' },
  { level: 'A级', type: '旷课', rule: '讲师未出席课程或缺席课程15分钟以上视作旷课。若讲师旷课，系统自动扣除讲师账户50 G作为处罚' },
  { level: 'A级', type: '吐单', rule: '讲师点击确认接单后，因个人原因主动提出终止课程安排或让学生更换讲师视作甩课。若讲师甩课，系统自动扣除吐单订单的预计收入作为处罚' },
  { level: 'A级', type: '<div style="font-weight:700;text-align:left !important">无故迟到和无故早退在 1 个自然年度内累计达到三次，将视为严重违反教学规范，包括但不限于暂停授课、扣除奖金，以及终止合作。旷课、吐单次数 1 个自然年度内累计达到两次即刻终止合作取消兼职讲师身份</div>' },
  { level: 'B级', type: '课前沟通', rule: '进群后未与学生主动沟通确认课堂内容及时间，对学生需求不明确' },
  { level: 'B级', type: '教学质量问题', rule: 'a. 课堂备课不充分、没有询问清楚学生需求和课程资料，导致未能按照学生要求备课；<br/>b. 学术储备不足，授课时内容知识点不熟悉、讲解错误、课堂较长时间卡顿思考；<br/>c. 课堂无教学成果，课上未及时确认学生理解程度、课堂无实际进度推进；<br/>d. 课上长时间无讲解行为，空耗学生课时；<br/>e. 课堂纯口述，无板书、无重点痕迹' },
  { level: 'B级', type: '教学环境问题', rule: 'a. 授课设备未提前调试，授课中花费超过 5 分钟时间调试设备，带来较差体验；<br/>b. 授课环境嘈杂，影响教学效果和课堂体验；<br/>c. 授课过程中未开摄像头、摄像头不清晰、摄像区域未覆盖人脸或摄像头背景混乱等' },
  { level: 'B级', type: '<div style="font-weight:700;text-align:left !important">以上情形属于B级违纪，公司将根据情节轻重，扣除相应课程当次课时费用，或相应课程全部未结算费用，降低课程对接优先级，并由师资管理人员对讲师做出警告</div>' },
  { level: 'C级', type: '日常对接', rule: 'a. 长期不回复工作人员派单消息；<br/>b.课后24小时内未发送课程反馈' },
  { level: 'C级', type: '<div style="font-weight:700;text-align:left !important">以上情形属于 C 级违纪，由师资管理人员给予警告，降低课程对接优先级。累计出现3次C级违规，半年内取消涨薪资格。</div>' },
]
