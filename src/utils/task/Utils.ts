import { Storage, LcType, HjType } from '@/constants/enums'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { isNil } from 'lodash-es'

dayjs.extend(utc)
dayjs.extend(timezone)

function formatBit(val: number): string {
  val = +val
  return val > 9 ? String(val) : '0' + val
}

function fmtNilDate(val: string | undefined): string {
  if (isNil(val)) return '00'
  return val
}

/**
 * Format seconds into d/h/m/s components
 */
export function formatSeconds(value: number): { d: string; h: string; m: string; s: string } {
  let theTime = parseInt(String(value))
  let theTime1 = 0 // minutes
  let theTime2 = 0 // hours
  let theTime3 = 0 // days
  if (theTime > 60) {
    theTime1 = parseInt(String(theTime / 60))
    theTime = parseInt(String(theTime % 60))
    if (theTime1 > 60) {
      theTime2 = parseInt(String(theTime1 / 60))
      theTime1 = parseInt(String(theTime1 % 60))
      if (theTime2 > 24) {
        theTime3 = parseInt(String(theTime2 / 24))
        theTime2 = parseInt(String(theTime2 % 24))
      }
    }
  }
  let d: string | undefined,
    h: string | undefined,
    m: string | undefined,
    s: string | undefined
  if (theTime > 0) s = formatBit(theTime)
  if (theTime1 > 0) m = formatBit(theTime1)
  if (theTime2 > 0) h = formatBit(theTime2)
  if (theTime3 > 0) d = formatBit(theTime3)
  return {
    d: fmtNilDate(d),
    h: fmtNilDate(h),
    m: fmtNilDate(m),
    s: fmtNilDate(s),
  }
}

/**
 * Format date range
 */
export function fmtDateRange(start: string | Date, end: string | Date) {
  const s = dayjs(start).format('YYYY-MM-DD HH:mm')
  const e = dayjs(end).format('YYYY-MM-DD HH:mm')
  return { start: s, end: e, range: `${s} ${e}` }
}

/**
 * Cache interval ID for cleanup
 */
export function cacheIntervalId(id: number | ReturnType<typeof setInterval>): void {
  localStorage.setItem(Storage.INTERVAL, String(id))
}

/**
 * Clear cached intervals
 */
export function clearCacheInterval(): void {
  const _id = localStorage.getItem(Storage.INTERVAL)
  if (_id) clearInterval(+_id)
  const fakeSpeed = localStorage.getItem(Storage.FAKE_SPEED)
  if (fakeSpeed) clearInterval(+fakeSpeed)
}

/**
 * Format training pipeline data
 */
function getResultLine(process: any, list: any[]): any {
  const _doing: Record<number, boolean> = { 0: false, 1: true }
  if (Array.isArray(process)) {
    return process.map((item) => {
      const {
        processName,
        acState,
        operatingState,
        childProcess,
        lcType,
        hjType,
        classNo,
        path,
        processReport,
      } = item
      if (HjType.TRAINING_GROUND === +hjType)
        localStorage.setItem(Storage.CLASS_NO, classNo)
      if (+hjType === 32) localStorage.setItem('processReport', processReport)
      const cache: any = {
        processName,
        lcType,
        path,
        loading: _doing[+acState],
        doing: _doing[+acState],
        acState,
        operatingState,
      }
      if (childProcess && childProcess.length > 0) {
        cache.childProcess = getResultLine(childProcess, list)
      }
      return cache
    })
  }
  if (process && typeof process === 'object') {
    const { processName, acState, operatingState, childProcess } = process
    const cache: any = { acState, operatingState, processName }
    if (childProcess && childProcess.length > 0) {
      cache.childProcess = getResultLine(childProcess, list)
    }
    list.push(cache)
  }
  return list
}

/**
 * Get formatted pipeline UI data
 */
export function getFmtCurrentLine(lines: any) {
  const { childProcess } = lines
  if (!childProcess || childProcess.length === 0) {
    ElMessage({ message: '流水线流程数据为空', type: 'warning', duration: 5000 })
    return { childProcess: [] }
  }
  const list: any[] = []
  getResultLine(lines, list)
  const result = list[0]
  const { CLASSTRAIN, ACMTESRT, BEFORETRAIN, CLOSElOOP } = LcType
  result.childProcess = result.childProcess.filter(({ lcType }: any) =>
    [CLASSTRAIN, ACMTESRT, BEFORETRAIN, CLOSElOOP].includes(lcType),
  )
  return result
}

/**
 * Get from localStorage by key
 */
export function getStorage(id: string) {
  const storage = localStorage.getItem(id)
  return storage ? JSON.parse(storage) : null
}

/**
 * Set localStorage
 */
export function setStorage(id: string, data: unknown) {
  localStorage.setItem(id, JSON.stringify(data))
}

/**
 * Get teacher info from localStorage
 */
export function getTeacherInfo(): Record<string, unknown> {
  const info = localStorage.getItem(Storage.TEACHER_INFO)
  if (!info) throw '未能获取到登录用户信息'
  return JSON.parse(info)
}

/** Format number with leading zero */
export function formatNumber(n: number | string): string {
  const s = n.toString()
  return s.length > 1 ? s : '0' + s
}

/**
 * Format timestamp to custom format string
 * Supports: Y(year), M(month), D(day), h(hour), m(minute), s(second)
 */
export function formatTime(number: string | number | Date, format: string): string {
  const formateArr = ['Y', 'M', 'D', 'h', 'm', 's']
  const date = new Date(number as any)
  const returnArr: (number | string)[] = [
    date.getFullYear(),
    formatNumber(date.getMonth() + 1),
    formatNumber(date.getDate()),
    formatNumber(date.getHours()),
    formatNumber(date.getMinutes()),
    formatNumber(date.getSeconds()),
  ]
  let result = format
  for (let i = 0; i < returnArr.length; i++) {
    result = result.replace(formateArr[i], String(returnArr[i]))
  }
  return result
}

/** Get weekday name in Chinese */
export function getweekday(date: string | Date): string {
  const weekArray = ['日', '一', '二', '三', '四', '五', '六']
  return weekArray[new Date(date).getDay()]
}

/** Precise addition to avoid floating point errors */
export function accAdd(arg1: number, arg2: number): number {
  let r1: number, r2: number
  try {
    r1 = arg1.toString().split('.')[1].length
  } catch {
    r1 = 0
  }
  try {
    r2 = arg2.toString().split('.')[1].length
  } catch {
    r2 = 0
  }
  const m = Math.pow(10, Math.max(r1, r2))
  return (arg1 * m + arg2 * m) / m
}

/** Precise subtraction */
export function Subtr(arg1: number, arg2: number): string {
  let r1: number, r2: number
  try {
    r1 = arg1.toString().split('.')[1].length
  } catch {
    r1 = 0
  }
  try {
    r2 = arg2.toString().split('.')[1].length
  } catch {
    r2 = 0
  }
  const m = Math.pow(10, Math.max(r1, r2))
  const n = r1 >= r2 ? r1 : r2
  return ((arg1 * m - arg2 * m) / m).toFixed(n)
}

/** Sort comparator by field */
export const sortBy = (field: string) => {
  return (x: any, y: any) => {
    return x[field] && x[field] - y[field]
  }
}

/** Get current timezone */
export const getTimeZone = (): string => {
  return dayjs.tz.guess()
}
