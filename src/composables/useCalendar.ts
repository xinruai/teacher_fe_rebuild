import dayjs from 'dayjs'
import { formatTime } from '@/utils/task/Utils'

export function useCalendar() {
  function fmtTimestamp(time: string | number | Date) {
    const d = dayjs(time)
    return {
      ymdhm: d.format('YYYY-MM-DD HH:mm'),
      hhmm: d.format('HH:mm'),
      year: d.year(),
      month: d.month(),
      today: d.date(),
      hour: d.hour(),
    }
  }

  /** Calculate duration in hours between two times */
  function fmtDuration(startTime: string | number, endTime: string | number): number {
    return dayjs(endTime).diff(dayjs(startTime), 'minute') / 60
  }

  /** Get Chinese AM/PM time range string like "凌晨00:39-凌晨01:09" */
  function getZHDateRange(startTime: string | number, endTime: string | number): string {
    const s = dayjs(startTime)
    const e = dayjs(endTime)
    return s.format('A') + s.format('HH:mm') + '-' + e.format('A') + e.format('HH:mm')
  }

  /** Get deadline string like "AM10:30" — Safari-safe with '-' to '/' replacement */
  function getDeadLine(val: string): string {
    val = val.replace(/-/g, '/')
    const time = formatTime(val, 'h')
    if (Number(time) < 12) {
      return 'AM' + formatTime(val, 'h:m')
    }
    return 'PM' + formatTime(val, 'h:m')
  }

  return { fmtTimestamp, fmtDuration, getZHDateRange, getDeadLine }
}
