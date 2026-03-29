import { defineStore } from 'pinia'

// Static image imports (replacing require())
import doc1Img from '@/assets/images/newTrain/doc1.png'
import doc2Img from '@/assets/images/newTrain/doc2.png'
import doc3Img from '@/assets/images/newTrain/doc3.png'
import withdrawalTimeImg from '@/assets/images/newTrain/withdrawal-time.png'
import payrollImg from '@/assets/images/newTrain/payroll.png'
import accountOverviewImg from '@/assets/images/newTrain/account-overview.png'
import orderPoolImg from '@/assets/images/newTrain/order-pool.png'
import myOrderImg from '@/assets/images/newTrain/my-order.png'
import classroomScheduleImg from '@/assets/images/newTrain/classroom-schedule.png'
import cloudDocImg from '@/assets/images/newTrain/cloud-document-preparation.png'
import editTemplateImg from '@/assets/images/newTrain/edit-template.png'
import startLessonImg from '@/assets/images/newTrain/start-lesson-preparation.png'
import uploadImg from '@/assets/images/newTrain/upload.png'
import helpCenterImg from '@/assets/images/newTrain/help-center.png'
import teacherFunctionImg from '@/assets/images/newTrain/teacher-function.png'
import payroll1Img from '@/assets/images/newTrain/payroll1.png'
import payroll2Img from '@/assets/images/newTrain/payroll2.png'
import payroll3Img from '@/assets/images/newTrain/payroll3.png'

interface ContentItem {
  type: string
  data: string
  height?: string
  marginBottom?: string | number
  marginTop?: string
}

interface DocumentPage {
  contents: ContentItem[]
  viewed: boolean
}

interface TrainDocument {
  id: number
  title: string
  type: number
  imgUrl: string
  completed: boolean
  pages: DocumentPage[]
}

export const useNewTrainStore = defineStore('newTrain', {
  state: () => ({
    productLearningViewed: false,
    officiallyJoinViewed: false,
    documents: [
      {
        id: 1,
        title: '01 薪资模式',
        type: 33,
        imgUrl: doc1Img,
        completed: false,
        pages: [
          {
            contents: [
              { type: 'list', data: '1.1 收入组成' },
              { type: 'tips', data: '万能讲师的收入由【课堂收入】、【订单收入】以及【bonus收入】组成：' },
              { type: 'list-item', data: '1. 课堂收入：讲师<b>时薪</b>*授课<b>课时</b>' },
              { type: 'list-item', data: '2. 订单收入：根据产品规则计算的<b>一口价</b>' },
              { type: 'list-item', data: '3. Bonus收入： ' },
              { type: 'list-item-type', data: '课堂点赞：任一课堂收到学生点赞，即可额外收入当节课时费的10%' },
              { type: 'list-item-type', data: '高分奖励：<b>项目制</b>订单出分达到高分档，即可额外收入订单一口价的10%' },
              { type: 'tips', data: '由于不同产品类型规则不同，薪资模式也不一样：' },
              { type: 'list-item', data: '1. 课时制产品：课堂收入+课堂点赞Bonus' },
              { type: 'list-item', data: '2. 项目制产品：订单收入（一口价）+课堂点赞bonus+高分奖励bonus' },
              { type: 'list', data: '1.2 结算模式' },
              { type: 'list-item', data: '1. 课时制产品：随堂结算课时费（需要及时填写课后反馈）' },
              { type: 'list-item', data: '2. 项目制产品：先随堂结算课时费（需要及时填写课后反馈），待订单结课后发放剩余薪资，补齐一口价' },
            ],
            viewed: false,
          },
          {
            contents: [
              { type: 'list', data: '1.3 提现规则' },
              { type: 'list-item', data: '1. 平台统一计算单位为<b>"GB"</b>，<b>1</b>GB=<b>10</b>CNY' },
              { type: 'list-item', data: '2. 提现时间为北京时间<b>每周一</b>，打款时间为北京时间<b>每周三</b>（遇节假日顺延）<br/>&nbsp;&nbsp;&nbsp;&nbsp;*若提现时间在北京时间周一后，则在下一周的周三发放' },
              { type: 'image', data: withdrawalTimeImg, height: '93px' },
              { type: 'list-item', data: '3. 需<b>按照时间顺序</b>，<b>以周为单位</b>进行完整提取<br/>&nbsp;&nbsp;&nbsp;&nbsp;*例：从下至上按顺序依次提取，不可跳周，不可将某一周薪资拆分后提取 ' },
              { type: 'image', data: payrollImg, height: '217px' },
            ],
            viewed: false,
          },
          {
            contents: [
              { type: 'list-item', data: '4. 需满足提现后账户里≥<b>50G</b><br/>&nbsp;&nbsp;&nbsp;&nbsp;*为了共同保障教学成果和规避后续风险，建立双向的履约保障机制，讲师在职期间需要预留<b>50G</b>作为<b>长期信用保证金</b>。这笔薪资会一直留在账户中，待离职后，会连同最后一笔薪资全额发放。' },
              { type: 'image', data: accountOverviewImg, height: '127px' },
              { type: 'list-item', data: '5. 根据国家税务政策要求，企业平台需依法对灵活用工收入进行个人所得税代扣代缴。<br/>&nbsp;&nbsp;&nbsp;&nbsp;万能班长将为各位老师承担灵活用工平台全部服务费，讲师只需依法缴纳个税（可通过"个人所得税"APP实时查询，年度汇算清缴时多退少补）' },
            ],
            viewed: false,
          },
        ],
      },
      {
        id: 2,
        title: '02 业务流程',
        type: 34,
        imgUrl: doc2Img,
        completed: false,
        pages: [
          {
            contents: [
              { type: 'list', data: '2.1.抢单池功能' },
              { type: 'list-item', data: '1. 系统会根据讲师的专业信息自动推送订单' },
              { type: 'image', data: orderPoolImg, height: '209px' },
              { type: 'list-item', data: '2. 讲师可点击订单号查看详细信息，自由挑选订单，确认后点击<b>【抢】</b>' },
              { type: 'list-item', data: '3. 部分订单暂未开放直接抢单的权限，讲师可点击<b>【报】</b>进行报名，或复制单号联系对应运营询问 ' },
              { type: 'list-item', data: '4. 抢单前可关注"<b>订单标签</b>"，"<b>预计收入</b>"，并点击<b>订单号</b>查看详情，确认<b>学生的辅导需求</b>与<b>可排课时间</b>是否匹配 ' },
            ],
            viewed: false,
          },
          {
            contents: [
              { type: 'list', data: '2.2 日常工作步骤-备课-备课中心（讲师帮助中心指引界面）' },
              { type: 'list-item', data: '1. 进入订单的备课中心界面' },
              { type: 'image', data: myOrderImg, height: '195px' },
              { type: 'list-item', data: '2. 点击右侧【创建课堂】排课，从左侧【课堂表】下方进入上课教室' },
              { type: 'image', data: classroomScheduleImg, height: '188px' },
            ],
            viewed: false,
          },
          {
            contents: [
              { type: 'list-item', data: '3. 进入右侧【云文档备课】' },
              { type: 'image', data: cloudDocImg, height: '239px' },
              { type: 'list-item', data: '4. 点击【编辑模板】' },
              { type: 'image', data: editTemplateImg, height: '178px' },
            ],
            viewed: false,
          },
          {
            contents: [
              { type: 'list-item', data: '5. 选中模板，开始备课' },
              { type: 'image', data: startLessonImg, height: '210px' },
              { type: 'list-item', data: '6. 选中备课课件，上传至课堂' },
              { type: 'image', data: uploadImg, height: '212px' },
            ],
            viewed: false,
          },
          {
            contents: [
              { type: 'list', data: '2.3  日常工作步骤-授课-课堂模拟（讲师帮助中心指引界面）' },
              { type: 'list-item', data: '1. 在【讲师帮助中心】找到课堂模拟功能' },
              { type: 'image', data: helpCenterImg, height: '163px' },
              { type: 'list-item', data: '2. 常用教室功能（请讲师保存该图片）' },
              { type: 'image', data: teacherFunctionImg, height: '227px' },
            ],
            viewed: false,
          },
        ],
      },
      {
        id: 3,
        title: '03 订单服务要求',
        imgUrl: doc3Img,
        completed: false,
        type: 44,
        pages: [
          {
            contents: [
              { type: 'list', data: '<span style="color: #FF0000; font-weight: bold;">3.1 红线问题</span>' },
              { type: 'tips', data: '学术诚信要求' },
              { type: 'list-item', data: '<span style="color: #FF0000;font-weight: bold;">· 禁止直接使用AI生成内容作为教学材料（包括使用AI梳理的内容用作给予学生思路启发或在备课材料中呈现出AI痕迹）；</span>' },
              { type: 'list-item', data: '· 禁止抄袭（包括但不限于直接复制、改写他人内容而未规范引用）；' },
              { type: 'list-item', data: '· 禁止伪造/篡改（如编造数据、虚构参考文献、曲解学术观点等）；' },
              { type: 'list-item', data: '· 禁止其他学术失信行为（如重复提交作业、未经许可的合作等）。 ' },
              { type: 'tips', data: '职业行为准则' },
              { type: 'list-item', data: '· 禁止辱骂、贬损或歧视学生，请注意和学生的沟通方式与话术；' },
              { type: 'list-item', data: '· 禁止称呼运营/教辅/孵化等同事伙伴为"中介"，或者称公司为"中介机构"；' },
              { type: 'list-item', data: '· 禁止公开抱怨工作安排或公司政策，或发布其他有损平台声誉的言行（如发布不实信息、煽动负面情绪等）。' },
              { type: 'tips', data: '禁止私联学生' },
              { type: 'list-item', data: '· 不得以任何形式向学生透露个人联系方式，包括微信、QQ、邮箱、社交媒体等（尤其使用屏幕共享功能时需特别注意）；' },
              { type: 'list-item', data: '· 所有沟通须通过企业微信群聊进行，且不得涉及与订单无关的内容。' },
            ],
            viewed: false,
          },
          {
            contents: [
              { type: 'tips', data: '信息保密义务' },
              { type: 'list-item', data: '为保护每位讲师的个人隐私及公司信息安全，请所有讲师在与学生沟通时严格遵守以下规定：' },
              { type: 'list-item', data: '<b>一、 禁止透露的信息范围</b>' },
              { type: 'list-item-type', data: '<b>个人背景信息：</b>包括但不限于毕业院校、就读专业、具体研究方向、学历细节等。' },
              { type: 'list-item-type', data: '<span style="color: #FF0000; font-weight: bold;">职业状态信息：不得透露是否为兼职、在本公司的入职时间、是否为首次授课、是否缺乏相关课程教学经验等。</span>' },
              { type: 'list-item-type', data: '<b>其他个人隐私：</b>当前全职工作单位、过往工作经历、住址、联系方式等。' },
              { type: 'list-item-type', data: '<b>商业敏感信息：</b>订单具体薪资、公司内部沟通记录或订单处理决策等。' },
              { type: 'list-item', data: '<b>二、若在课堂中被问及，请参考以下友好、专业的话术进行回应，并自然转移话题：</b>' },
              { type: 'list-item', data: '"同学你好，根据公司的教学服务规范，为了更好地保障教学专注度与服务质量，我们不建议讲师与学生在课堂中交流个人背景信息哦。如果你有任何课程或学习上的疑问，欢迎随时问我。如果是关于课程安排或教务方面的问题，课后也可以联系你的教辅老师，他们会全力协助你。"' },
              { type: 'tips', data: '订单履约责任' },
              { type: 'list-item', data: '· 严禁无故取消已接订单（"吐单"）；' },
              { type: 'list-item', data: '· 未履行备课、授课、订单服务等合同义务视为严重违约。' },
              { type: 'message', data: '对于违反上述红线规定的行为，公司将视情节严重程度采取书面警告、薪资扣罚、扣除保证金并终止合作的分级处理措施。' },
            ],
            viewed: false,
          },
          {
            contents: [
              { type: 'list', data: '3.2. 授课规范' },
              { type: 'tips', data: '备课质量要求' },
              { type: 'list-item', data: '· 必须以公司提供的备课模板为标准进行充分备课' },
              { type: 'list-item', data: '· 禁止无任何备课材料直接在课堂中以聊天形式进行授课' },
              { type: 'tips', data: '课堂纪律要求' },
              { type: 'list-item', data: '· 授课内容应严格围绕教学目标展开，禁止闲聊或过度讨论与课程无关的话题' },
              { type: 'list-item', data: '· 在课程进行期间，无特殊情况不可离开课堂让学生独自等待' },
              { type: 'tips', data: '课前课后规范' },
              { type: 'list-item', data: '· 课前：提前进入教室，完成课件上传、设备调试等准备工作' },
              { type: 'list-item', data: '· 课后：完成网页端【课后反馈】的填写，及时将课堂相应课件笔记发送至辅导群' },
            ],
            viewed: false,
          },
          {
            contents: [
              { type: 'tips', data: '课堂录制规范' },
              { type: 'list-item', data: '· 自动录课功能将在进入课堂后即刻开启，进入在线教室即视为知晓全程录制，讲师需开启摄像头并保持端庄的仪容仪表 ' },
              { type: 'list-item', data: '· 授课期间禁止：' },
              { type: 'list-item', data: '✓ 接听私人电话或与旁人闲聊' },
              { type: 'list-item', data: '✓ 播放背景音乐' },
              { type: 'list-item', data: '✓ 浏览私人社交账号' },
              { type: 'list-item', data: '✓ 展示含个人隐私的电脑桌面' },
              { type: 'list-item', data: '✓ 进行其他与教学无关的操作' },
            ],
            viewed: false,
          },
          {
            contents: [
              { type: 'list', data: '3.3 常见情况处理' },
              { type: 'tips', data: '订单进度出现异常' },
              { type: 'list-item', data: '· 例如：学生失联、约课不回、学习态度消极等影响订单推进的情况' },
              { type: 'list-item', data: '· 第一时间联系订单的负责运营，说明情况，等待反馈' },
              { type: 'tips', data: '学生迟到/旷课' },
              { type: 'list-item', data: '· 群里第一时间联系学生或教辅老师，若未收到回复，讲师需在教室等待15分钟' },
              { type: 'list-item', data: '· 学生失联15分钟视为旷课，可取消课堂改约时间' },
              { type: 'list-item', data: '· 同一学生发生2次无故旷课，联系运营老师反馈情况，等待确认解决方案' },
              { type: 'tips', data: '讲师迟到/改约课堂/旷课' },
              { type: 'list-item', data: '· 讲师发生迟到、改约、旷课行为时，系统会自动进行对应等级的薪资扣罚，若存在特殊原因讲师可进入工资记录界面进行申诉' },
              { type: 'list-item', data: '· 与学生协商一致的课堂改约请及时联系订单的教辅老师在系统操作修改时间' },
              { type: 'image', data: payroll1Img, height: '107px' },
            ],
            viewed: false,
          },
          {
            contents: [
              { type: 'image', data: payroll2Img, height: '170px', marginBottom: '20px' },
              { type: 'image', data: payroll3Img, height: '270px' },
            ],
            viewed: false,
          },
          {
            contents: [
              { type: 'tips', data: '发生客诉/售后' },
              { type: 'list-item', data: '1. 讲师需积极配合售后部门对事故订单进行复盘，若判定为讲师原因，公司有权对讲师进行相应处罚，包括但不限于薪资扣罚等处理方式。讲师如对售后判责存在异议，可进行合理申诉。' },
              { type: 'list-item', data: '2. 若老师出现 【未按需求备课】、【备课不充分】、【多次迟到】 或 【无故旷课】 等情况，经核实后，公司将依据情节严重程度执行以下处理：' },
              { type: 'list-item-type', data: '立即终止当前订单服务，更换讲师；' },
              { type: 'list-item-type', data: '对客诉订单涉及的全部或部分收入进行扣罚；' },
              { type: 'list-item-type', data: '情节严重者，将直接终止后续合作;' },
              { type: 'message', data: '请各位老师知悉并严格遵守教学规范，共同维护良好的教学环境与学生体验。', marginTop: '120px' },
            ],
            viewed: false,
          },
        ],
      },
    ] as TrainDocument[],
  }),
  actions: {
    setProductLearningViewed(bool: boolean) {
      this.productLearningViewed = bool
    },
    setOfficiallyJoinViewed(bool: boolean) {
      this.officiallyJoinViewed = bool
    },
    setDocumentsViewed({ type, pageIndex }: { type: number; pageIndex: number }) {
      const doc = this.documents.find((d) => d.type === type)
      if (doc && doc.pages[pageIndex]) {
        doc.pages[pageIndex].viewed = true
      }
    },
    setDocumentsCompleted({ type }: { type: number }) {
      const doc = this.documents.find((d) => d.type === type)
      if (doc) doc.completed = true
    },
    setDocumentsId({ type, id }: { type: number; id: number }) {
      const doc = this.documents.find((d) => d.type === type)
      if (doc) doc.id = id
    },
  },
})
