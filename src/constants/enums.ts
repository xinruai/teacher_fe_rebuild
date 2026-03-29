/** 日历组件 */
export const CalendarModelType = {
  COURSE: 2,
  STUDENT: 0,
  TEACHER: 1,
} as const

/** 讲师孵化端 路由路径 */
export const HatchRouterPath = {
  REDIRECT: '/hatch',
  LETTER: '/letter',
  PLAN: '/trainingplan',
  FAKE: '/fake',
  GROUND: '/trainingground',
  FAKE_CLASS: '/fakeclass',
  FAKE_CLASS_OLD: '/fakeclassold',
  CLASS_CARD: '/schedulecard',
  INTENTION: '/intention',
  INTENTIONOLD: '/intentionold',
  ID_FORM: '/idform',
  CERT: '/certificate',
  QR_CODE: '/classbro_app',
  PERSON_DETAIL: '/account/persondetail',
} as const

/** localStorage 枚举 */
export const Storage = {
  INTERVAL: '1',
  FAKE_SPEED: '2',
  TEACHER_ID: '3',
  CLASS_NO: '4',
  TEACHER_INFO: 'teacinfo',
  TOKEN: 'teactoken',
  COURSE_ID: '7',
  READ_ONLY: '8',
  CRM_LINK_DISS: 'CrmLinkDiss',
  NEW_LINK_DISS: 'NewLinkDiss',
} as const

/** 岗前培训流程图 状态枚举 */
export const TaskState = {
  DONE: 1,
  DOING: 2,
  TODO: 3,
} as const

/** next 返回枚举类型 */
export const ReturnCode = {
  SUCCESS: 1,
  OVER: 2,
  NON: 3,
} as const

/** 我的全真模拟课 statused 状态枚举 */
export const OwnClassStatus = {
  UNAUDITED: 1,
  END: 2,
  REPORT_DONE: 4,
  IS_LEVEL: 5,
  COMPLETE: 8,
  ONGOING: 16,
  AUDIT_FAILED: 17,
  IN_CLASS: 18,
} as const

/** 学生预约课程状态枚举 */
export const StudentMakeClassStatus = {
  WAIT: 1,
  COMPLETE: 2,
  REPORT_DONE: 4,
  IN_CLASS: 18,
  IS_REPORT: 19,
} as const

/** 课堂训练场 弹窗类型枚举 */
export const AlertModalType = {
  QUESTION: 1,
  TODO: 2,
  DONE: 3,
  REACTION: 4,
} as const

/** 意向表 意向类型 */
export const WishType = {
  ASSAULT: 1,
  GIFT: 65,
  SPECIAL: 66,
} as const

/** 流程类型 */
export const LcType = {
  CLASSTRAIN: 16,
  ACMTESRT: 128,
  BEFORETRAIN: 256,
  CLOSElOOP: 8,
} as const

/** 环节类型 */
export const HjType = {
  TRAINING_GROUND: 8,
} as const

/** 日历模式下 访问状态 */
export const CalendarVisited = {
  VISITED: 'visited',
  NOT_YET: 'notyet',
} as const

/** 毕业论文大礼包 路由路径 */
export const DissertationRouterPath = {
  HOME: '/dissertation',
} as const

/** 论文大礼包路由 */
export const paperRouterPath = {
  HOME: '/paperSchedule',
} as const

/** 阶段 字段枚举 */
export const StageField = {
  ORDER: 'order',
  PHASE: 'phase',
  CONTAIN: 'contain',
  ALREADY: 'already',
  SUMMARY: 'summary',
} as const

/** 阶段状态 */
export const StageStatus = {
  TODO: 0,
  DOING: 1,
  DONE: 2,
} as const

/** 阶段类型枚举 */
export const StageType = {
  BREAKING_ICE: 0,
  FIXED_TOPIC: 1,
  INTRODUCTION: 2,
  REVIEW: 3,
  METHODOLOGY: 4,
  ANALYSIS: 5,
  CONCLUSION: 6,
  EXAMINE: 7,
} as const

/** 课堂状态 枚举 */
export const ClassStatus = {
  TODO: 0,
  WAIT: 1,
  BEGIN: 2,
  DONE: 3,
} as const

/** 课程类别 是否是加课 */
export const AddClasses = {
  NO: 0,
  YES: 1,
} as const

/** 课程类别 */
export const StageClassesType = {
  MUST: 1,
  SELECTABLE: 2,
  DISSERTATION: 3,
} as const

/** Table Event */
export const TableEvent = {
  LOOK_UP: 1,
  UPLOAD: 2,
  EDIT: 3,
  ARRANGE: 4,
} as const

/** Stage Event */
export const StageEvent = {
  MODIFIED: 1,
  FEEDBACK: 2,
} as const

/** 讲师材料 stageClassFileType */
export const StageClassFileType = {
  TOPIC_LIST: 1,
  OUTLINE: 2,
  CORRECTION: 3,
  DATA_RESULTS: 4,
  FINAL_DOC: 5,
  RESEARCH_LIST: 6,
  COMPLETE: 7,
} as const

/** 课堂上传文件类型 */
export const ClassUploadFileType = {
  TEACHER_MATERIAL: 1,
  MUST_MATERIAL: 5,
} as const

/** 当前大论文订单进展状态 */
export const HeaderStatused = {
  DONE: 3,
  OVER: 4,
  ERR_OVER: 5,
} as const

/** crm 跳转规划表 参数hashkey 枚举 */
export const CrmRouterLinkArgs = {
  TOKEN: 'Q7HbyVkEtAGTKBk5',
  COURSE_ID: 'b7L3ZNXIKy42qV39',
  PATH: '5AOriMixcF9r5s50',
} as const
