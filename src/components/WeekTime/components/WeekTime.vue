<template>
  <div class="week-time">
    <table class="left">
      <thead>
        <tr></tr>
        <tr></tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in weekdays"
          :key="index"
          class="time-lable"
        >
          <td @click="selectWeekday(index + 1)">{{ locale[index] || item }}</td>
        </tr>
      </tbody>
    </table>
    <table class="right">
      <thead>
        <tr>
          <th
            v-for="(item, index) in timezone"
            class="time-zone-label"
            :colspan="item.colspan"
            :key="index"
            @click="timeZoneLabelSelect ? selectDayPeriod(0, item.colspan - 1) : undefined"
          >
            <span :style="{ left: [0].includes(index) ? '0px' : -labeSize + 'px' }">{{ item.label }}</span>
            <span
              v-if="index === timezone.length - 1"
              :style="{ right: 0, left: 'unset' }"
            >{{ timezone[0].label }}</span>
          </th>
        </tr>
        <tr class="hour">
          <th
            :style="{ width: hourTimeWidth + 'px' }"
            v-for="n in 24"
            :key="n"
            @click="timeHourSelect ? selectDayPeriod(n - 1) : undefined"
          >
            <span
              class="hour-lable-text"
              :class="{ first: [1].includes(n), end: [24].includes(n) }"
              v-show="showHour.includes(n - 1) || n === 24"
            >{{ n === 24 ? 0 : n - 1 }}点</span>
          </th>
        </tr>
      </thead>
      <tbody @mouseleave="mouseLeave">
        <tr v-for="m in 7" :key="m">
          <td
            style="position: relative"
            v-for="n in 24"
            :style="{ background: getBgColor(m, n), borderColor: getBgColor(m, n) }"
            :class="{
              selected: selected[m].indexOf(n - 1) > -1,
              disabledSelected: disabledSelected[m].indexOf(n - 1) > -1,
            }"
            :key="n"
            @dragstart.stop.prevent
            @mousedown.stop="selectByMousedown(m, n - 1, $event)"
            @mouseover.stop="selectByMouseOver(m, n - 1)"
            @mouseout.stop="selectByMouseout(m, n - 1)"
            @mouseup.stop="selectByMouseup(m, n - 1)"
          >
            <div
              v-if="showText(m, n) && showText(m, n) !== -1"
              class="show-text"
              :style="{ width: getWidth(m, n) }"
            >{{ showText(m, n) }}</div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import Util from '../util'

interface TimezoneItem {
  label: string
  colspan: number
}

type Selected = Record<number, number[]>

export default defineComponent({
  name: 'WeekTime',
  props: {
    weekTimes: {
      type: Object as PropType<Record<number, number[]>>,
      default: () => ({}),
    },
    disabledWeekTimes: {
      type: Object as PropType<Record<number, number[]>>,
      default: () => ({}),
    },
    locale: {
      type: Object as PropType<Record<number, string>>,
      default: () => ({
        0: '周一', 1: '周二', 2: '周三', 3: '周四',
        4: '周五', 5: '周六', 6: '周日', 7: '全选', 8: '清空',
      }),
    },
    timezone: {
      type: Array as PropType<TimezoneItem[]>,
      default: () => [
        { label: '午夜', colspan: 4 },
        { label: '凌晨', colspan: 4 },
        { label: '上午', colspan: 4 },
        { label: '中午', colspan: 4 },
        { label: '下午', colspan: 4 },
        { label: '晚上', colspan: 4 },
      ],
    },
    timeZoneLabelSelect: { type: Boolean, default: false },
    timeHourSelect: { type: Boolean, default: false },
    showHour: {
      type: Array as PropType<number[]>,
      default: () => [0, 4, 8, 12, 16, 20, 24],
    },
    width: { type: Number, default: 650 },
    selectColor: { type: String, default: '#DEF0FD' },
    disabledColor: { type: String, default: '#BBB' },
    drawingColor: { type: String, default: '#0091FF' },
    labeSize: { type: Number, default: 12 },
  },
  emits: ['change'],
  computed: {
    hourTimeWidth(): number {
      return this.width / 24
    },
  },
  data() {
    return {
      weekdays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      drawing: false,
      selecting: true,
      startX: -1,
      startY: -1,
      startPointX: -1,
      startPointY: -1,
      endPointX: -1,
      endPointY: -1,
      preX: -1,
      preY: -1,
      currentX: -1,
      currentY: -1,
      selected: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] } as Selected,
      disabledSelected: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] } as Selected,
      selectedText: '',
      weekdaysList: [] as string[],
      selectTimeObj: {} as Record<number, number[][]>,
      currentM: 0,
      currentN: 0,
    }
  },
  watch: {
    weekTimes() {
      this.initData('weekTimes', 'selected')
    },
    disabledWeekTimes() {
      this.initData('disabledWeekTimes', 'disabledSelected')
    },
  },
  created() {
    this.initData('weekTimes', 'selected')
    this.initData('disabledWeekTimes', 'disabledSelected')
  },
  mounted() {
    this.initText()
  },
  methods: {
    initData(type: string, listName: string) {
      const source = (this as any)[type]
      if (!source || typeof source !== 'object') return
      for (let i = 1; i <= 7; i++) {
        if (Array.isArray(source[i])) {
          ;(this as any)[listName][i] = [].concat(source[i])
        } else {
          ;(this as any)[listName][i] = []
        }
      }
    },

    selectWeekday(i: number) {
      if (this.selected[i].length !== 24) {
        const hours: number[] = []
        for (let j = 0; j < 24; j++) hours.push(j)
        this.selected[i] = hours
      } else {
        this.selected[i].splice(0, this.selected[i].length)
      }
      this.emitWeekTimes()
    },

    selectDayPeriod(start: number, end?: number) {
      if (!end) {
        const isFull = this.isSelectedDayPeriod(start)
        for (let i = 1; i <= 7; i++) {
          isFull ? this.deleteHour(i, start) : this.selectHour(i, start)
        }
      } else {
        let isFull = true
        for (let i = start; i <= end; i++) {
          if (!this.isSelectedDayPeriod(i)) { isFull = false; break }
        }
        for (let i = 1; i <= 7; i++) {
          for (let j = start; j <= end; j++) {
            isFull ? this.deleteHour(i, j) : this.selectHour(i, j)
          }
        }
      }
      this.emitWeekTimes()
    },

    isSelectedDayPeriod(j: number): boolean {
      for (let i = 1; i <= 7; i++) {
        if (!this.isSelected(i, j)) return false
      }
      return true
    },

    isSelected(m: number, n: number): boolean {
      return this.selected[m].indexOf(n) > -1
    },

    isDisableded(m: number, n: number): boolean {
      return this.disabledSelected[m].indexOf(n) > -1
    },

    selectByMousedown(m: number, n: number, $event: MouseEvent) {
      if ($event.button !== 0) return
      this.selecting = !this.isSelected(m, n)
      this.drawing = true
      this.startX = m
      this.startY = n
      this.preX = m
      this.preY = n
    },

    selectByMouseOver(m: number, n: number) {
      if (!this.drawing) return
      const startX = m > this.startX ? this.startX : m
      const startY = n > this.startY ? this.startY : n
      const endX = m > this.startX ? m : this.startX
      const endY = n > this.startY ? n : this.startY
      this.startPointX = startX
      this.startPointY = startY
      this.endPointX = endX
      this.endPointY = endY
      for (let i = startX; i <= endX; i++) {
        for (let j = startY; j <= endY; j++) {
          this.selecting ? this.selectHour(i, j) : this.deleteHour(i, j)
        }
      }
      this.checkSelectedValid(m, n)
    },

    checkSelectedValid(m: number, n: number) {
      const currentList: string[] = []
      const preList: string[] = []
      const startX = m > this.startX ? this.startX : m
      const startY = n > this.startY ? this.startY : n
      const endX = m > this.startX ? m : this.startX
      const endY = n > this.startY ? n : this.startY
      for (let i = startX; i <= endX; i++) {
        for (let j = startY; j <= endY; j++) currentList.push(`${i},${j}`)
      }
      const preStartX = this.preX > this.startX ? this.startX : this.preX
      const preStartY = this.preY > this.startY ? this.startY : this.preY
      const preEndX = this.preX > this.startX ? this.preX : this.startX
      const preEndY = this.preY > this.startY ? this.preY : this.startY
      for (let i = preStartX; i <= preEndX; i++) {
        for (let j = preStartY; j <= preEndY; j++) preList.push(`${i},${j}`)
      }
      preList.forEach((item) => {
        if (currentList.indexOf(item) === -1) {
          const point = item.split(',')
          this.selecting
            ? this.deleteHour(+point[0], +point[1])
            : this.selectHour(+point[0], +point[1])
        }
      })
    },

    selectByMouseout(m: number, n: number) {
      this.preX = m
      this.preY = n
    },

    selectByMouseup(m: number, n: number) {
      this.currentM = m
      this.currentN = n
      if (!this.drawing) return
      this.selecting ? this.selectHour(m, n) : this.deleteHour(m, n)
      this.drawing = false
      this.emitWeekTimes()
    },

    mouseLeave() {
      if (this.drawing) this.emitWeekTimes()
      this.drawing = false
    },

    selectHour(m: number, n: number) {
      if (!this.isSelected(m, n) && !this.isDisableded(m, n)) {
        this.selected[m].push(n)
      }
    },

    deleteHour(m: number, n: number) {
      const flag = this.selected[m].indexOf(n)
      if (flag > -1) this.selected[m].splice(flag, 1)
    },

    selectAll() {
      const hours: number[] = []
      for (let j = 0; j <= 23; j++) hours.push(j)
      for (let i = 1; i <= 7; i++) this.selected[i] = [].concat(hours as any)
      this.emitWeekTimes()
    },

    clear() {
      for (let i = 1; i < 8; i++) this.selected[i] = []
      this.emitWeekTimes()
    },

    initText() {
      for (let i = 1; i <= 7; i++) {
        this.selected[i].sort((a: number, b: number) => a - b)
      }
      this.selectedText = this.getWeekTimeString(this.selected)
    },

    emitWeekTimes() {
      this.initText()
      this.$emit('change', this.selected, this.selectedText)
    },

    getWeekTimeString(week: Selected): string {
      const keys = Object.keys(week)
      const isNone = keys.every((key) => week[+key].length === 0)
      if (isNone) return '全不选'
      const hours = this.hoursPretreatment(week)
      return this.weekdayPretreatment(hours)
    },

    hoursPretreatment(week: Selected): string[] {
      const keys = Object.keys(week)
      const hours: string[] = []
      const obj: Record<number, number[][]> = {}
      keys.forEach((key, index) => {
        const hourList = Util.numberArrayGroup(week[+key])
        obj[index + 1] = hourList
        const hourListText: string[] = []
        hourList.forEach((hour) => {
          if (hour.length > 1) {
            hourListText.push(`${hour[0]} ~ ${hour[hour.length - 1]}时`)
          } else {
            hourListText.push(`${hour.join('')}时`)
          }
        })
        hours.push(hourListText.join(','))
      })
      this.selectTimeObj = obj
      return hours
    },

    weekdayPretreatment(hours: string[]): string {
      const weekday: string[] = []
      const day = [
        this.locale[0], this.locale[1], this.locale[2], this.locale[3],
        this.locale[4], this.locale[5], this.locale[6],
      ]
      const eqValIndex = Util.getEqualValueIndex(hours)
      eqValIndex.forEach((val) => {
        const valList = Util.numberArrayGroup(val)
        const valText: string[] = []
        valList.forEach((item) => {
          if (item.length > 1) {
            valText.push(day[item[0]] + ' ~ ' + day[item[item.length - 1]])
          } else {
            valText.push(day[item[0]])
          }
        })
        if (hours[val[0]].length > 0) {
          weekday.push(valText.join(',') + ': ' + hours[val[0]])
        }
      })
      this.weekdaysList = weekday
      return weekday.join('; ')
    },

    showText(m: number, n: number): string | number {
      const item = (this.selectTimeObj[m] || []).find((v: number[]) => v[0] === n - 1)
      if (this.selected[m].indexOf(n - 1) > -1 && item) {
        return item.length > 1 ? `${item[0]}-${item[item.length - 1]}` : item[0] + ''
      }
      return -1
    },

    getWidth(m: number, n: number): string | undefined {
      const item = (this.selectTimeObj[m] || []).find((v: number[]) => v[0] === n - 1)
      if (this.selected[m].indexOf(n - 1) > -1 && item) {
        return item.length * this.hourTimeWidth + 'px'
      }
    },

    getBgColor(m: number, n: number): string {
      if (
        this.selected[m].indexOf(n - 1) > -1 &&
        this.drawing &&
        m >= this.startPointX &&
        m <= this.endPointX &&
        n - 1 >= this.startPointY &&
        n - 1 <= this.endPointY
      ) {
        return '#0091FF'
      }
      if (this.selected[m].indexOf(n - 1) > -1) return this.selectColor
      if (this.disabledSelected[m].indexOf(n - 1) > -1) return this.disabledColor
      return ''
    },
  },
})
</script>

<style lang="scss">
.week-time {
  display: flex;
  font-size: 13px;
  table {
    border-collapse: collapse;
    td,
    th {
      border: 1px solid #ccc;
      word-break: keep-all;
      text-align: center;
    }
    tbody tr {
      height: 24px;
    }
  }
  table th {
    font-weight: normal;
  }
  table.left {
    width: 56px;
    flex-grow: 0;
    flex-shrink: 0;
    cursor: pointer;
    thead tr {
      height: 28px;
    }
    td,
    th {
      border-right: none;
      min-width: 45px;
      white-space: nowrap;
      word-break: keep-all;
      &:hover {
        background-color: #f2f2f2;
      }
    }
  }
  table.right {
    thead tr {
      height: 28px;
      cursor: pointer;
      &.hour th {
        width: 22px;
        white-space: nowrap;
      }
      td,
      th {
        &:hover {
          background-color: #f2f2f2;
        }
      }
    }
  }
  .selected {
    background-color: #00bf13;
  }
  .disabledSelected {
    background-color: #bbb;
  }
  .show-text {
    color: #0091ff;
    position: absolute;
    top: 0;
    left: -2px;
    z-index: 1;
    pointer-events: none;
    line-height: 34px;
    text-align: center;
    font-size: 12px;
    &::selection {
      background: transparent;
      color: #0091ff;
    }
  }
}
.week-time {
  .time-lable {
    border: none !important;
    td {
      border: none !important;
      font-size: 12px;
      color: #333333;
    }
  }
  .time-zone-label {
    border: none !important;
    position: relative;
    text-align: left;
    span {
      position: absolute;
      top: 8px;
      left: 0;
      z-index: 1;
      pointer-events: none;
      line-height: 4px;
      color: #333333;
      font-size: 12px;
    }
  }
  .hour {
    th {
      border: none !important;
      position: relative;
      .hour-lable-text {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        pointer-events: none;
        line-height: 14px;
        font-size: 12px;
        color: #7b849e;
        display: inline-block;
        width: 200%;
        left: -100%;
        &.first {
          text-align: left;
          left: 0;
        }
        &.end {
          text-align: right;
          left: unset;
          right: 0;
        }
      }
    }
  }
  table.right thead tr,
  table.left thead tr {
    height: 22px;
  }
  table td,
  table th {
    border-color: #eff6fc;
  }
  table.right tbody {
    background: #fff;
  }
}
</style>
