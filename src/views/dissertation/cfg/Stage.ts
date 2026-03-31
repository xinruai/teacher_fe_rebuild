import { StageStatus, StageType } from '@/constants/enums'

const {
  BREAKING_ICE, FIXED_TOPIC, INTRODUCTION, REVIEW,
  METHODOLOGY, ANALYSIS, CONCLUSION, EXAMINE,
} = StageType

export const StageType2Val: Record<number, string> = {
  [BREAKING_ICE]: '阶段一',
  [FIXED_TOPIC]: '阶段二',
  [INTRODUCTION]: '阶段三',
  [REVIEW]: '阶段四',
  [METHODOLOGY]: '阶段五',
  [ANALYSIS]: '阶段六',
  [CONCLUSION]: '阶段七',
  [EXAMINE]: '阶段八',
}

import donePng from '@/assets/images/dissertation/stage/done.png'
import doingPng from '@/assets/images/dissertation/stage/doing.png'

const { DONE, DOING } = StageStatus

export const OrderImg: Record<number, string> = {
  [DONE]: donePng,
  [DOING]: doingPng,
}
