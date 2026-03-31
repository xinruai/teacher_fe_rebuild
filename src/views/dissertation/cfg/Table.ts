import { ClassStatus, StageType, StageClassFileType as ClassFileType } from '@/constants/enums'

const { TODO, WAIT, BEGIN, DONE } = ClassStatus

export const ClassStatus2Val: Record<number, string> = {
  [TODO]: '未开启',
  [WAIT]: '待排课',
  [BEGIN]: '待上课',
  [DONE]: '已完成',
}

const {
  BREAKING_ICE, FIXED_TOPIC, INTRODUCTION, REVIEW,
  METHODOLOGY, ANALYSIS, CONCLUSION, EXAMINE,
} = StageType

export const StageType2Val: Record<number, string> = {
  [BREAKING_ICE]: '破冰/定题阶段',
  [FIXED_TOPIC]: 'Proposal阶段',
  [INTRODUCTION]: 'Introduction',
  [REVIEW]: 'Literature Review',
  [METHODOLOGY]: 'Methodology',
  [ANALYSIS]: 'Data Analysis',
  [CONCLUSION]: 'Dicussion&Conclusion',
  [EXAMINE]: '梳理全文',
}

export const StageType2ClassTypeListVal: Record<number, Array<{ classType: number; label: string }>> = {
  [BREAKING_ICE]: [{ classType: 1, label: '破冰课' }, { classType: 2, label: '定题课' }],
  [FIXED_TOPIC]: [
    { classType: 3, label: 'Tutor Meeting课 - P01' },
    { classType: 4, label: 'Proposal / Draft 课' },
    { classType: 5, label: 'Proposal批改课' },
  ],
  [INTRODUCTION]: [
    { classType: 1, label: '论文框架搭建' },
    { classType: 2, label: '绪论部分批改课' },
  ],
  [REVIEW]: [
    { classType: 1, label: 'LR课' },
    { classType: 2, label: 'LR精读课' },
    { classType: 3, label: 'Tutor Meeting课 - LR01' },
    { classType: 4, label: 'LR部分批改课' },
    { classType: 5, label: 'Tutor Meeting课 - LR02' },
  ],
  [METHODOLOGY]: [
    { classType: 1, label: '解锁研究方法' },
    { classType: 2, label: 'Tutor Meeting课' },
    { classType: 3, label: 'ME部分批改课' },
  ],
  [ANALYSIS]: [
    { classType: 1, label: '数据处理结果剖析课' },
    { classType: 2, label: 'Tutor Meeting课' },
  ],
  [CONCLUSION]: [
    { classType: 1, label: '讨论总结课' },
    { classType: 2, label: 'D&C部分批改课' },
  ],
  [EXAMINE]: [
    { classType: 1, label: 'Tutor Meeting课' },
  ],
}

export const ClassFileType2Val: Record<number, string> = {
  [ClassFileType.TOPIC_LIST]: 'Topic List',
  [ClassFileType.OUTLINE]: 'Outline',
  [ClassFileType.CORRECTION]: '批改文件',
  [ClassFileType.COMPLETE]: '批改文件(完整)',
  [ClassFileType.RESEARCH_LIST]: 'Research List',
  [ClassFileType.DATA_RESULTS]: 'Data Results',
  [ClassFileType.FINAL_DOC]: 'Final Document',
}
