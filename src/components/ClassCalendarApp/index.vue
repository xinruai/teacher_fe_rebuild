<script setup lang="ts">
/**
 * ClassCalendarApp — Custom replacement for dayspan-vuetify's <ds-calendar-app>
 * Preserves the interface used by schooltimetable/cards.vue.
 * Full calendar grid rendering is a stub — events are rendered in a list.
 *
 * Original used: dayspan-vuetify (no Vue 3 port)
 * Slot interface preserved: eventTimeTitle, classTop, classContent
 */
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import { useCalendar } from '@/composables/useCalendar'

const props = withDefaults(defineProps<{
  value?: any[]
  dayValue?: any[]
  eventHeight?: number
  dayData?: any[]
  hasBorder?: number
  showTime?: number
  topType?: number
  pickWidth?: string
  minHeight?: number
  showClassNum?: boolean
  isLeft0?: boolean
}>(), {
  value: () => [],
  dayValue: () => [],
  dayData: () => [],
  eventHeight: 21.6,
  hasBorder: 2,
  showTime: 2,
  topType: 1,
  pickWidth: '460px',
  minHeight: 28,
  showClassNum: true,
  isLeft0: true,
})

const emit = defineEmits<{
  picked: [event: any]
  'change-date': [event: any]
  prompt: [event: any]
  'event-update': [event: any]
  'mouse-up': [event: any]
  'mouse-down': [event: any]
  changeOff: [day: any, index: number]
  setdateType: [val: number]
}>()

const { fmtTimestamp, fmtDuration } = useCalendar()

const currentDate = ref(dayjs())
const defaultEvents = ref<any[]>([])
const dateType = ref(1) // 1=week, 0=day
const summary = ref(dayjs().format('YYYY-MM-DD'))

// Expose calendar state for parent to read
const calendar = computed(() => {
  const start = currentDate.value.startOf('week')
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = start.add(i, 'day')
    return {
      date: { _d: d.toDate() },
      dayOfMonth: d.date(),
      month: d.month(),
    }
  })
  return { days, start: { time: start.valueOf() } }
})

function onPicked(params: { time: number; type: number }) {
  emit('picked', {
    time: params.time,
    type: params.type,
    calendar: calendar.value,
  })
}

function loadState() {
  const storage = localStorage.getItem('dayspanState')
  if (storage) {
    try {
      const data = JSON.parse(storage)
      defaultEvents.value = data.events || []
    } catch {
      // ignore
    }
  }
}

function prev() {
  if (dateType.value === 1) {
    currentDate.value = currentDate.value.subtract(1, 'week')
  } else {
    currentDate.value = currentDate.value.subtract(1, 'day')
  }
  summary.value = currentDate.value.format('YYYY-MM-DD')
  emitDateChange()
}

function next() {
  if (dateType.value === 1) {
    currentDate.value = currentDate.value.add(1, 'week')
  } else {
    currentDate.value = currentDate.value.add(1, 'day')
  }
  summary.value = currentDate.value.format('YYYY-MM-DD')
  emitDateChange()
}

function changePattern(type: number) {
  dateType.value = type
  emit('setdateType', type)
}

function emitDateChange() {
  const start = dateType.value === 1
    ? currentDate.value.startOf('week')
    : currentDate.value.startOf('day')
  emit('change-date', {
    time: start.valueOf(),
    type: dateType.value,
    calendar: calendar.value,
  })
}

function handleDayClick(day: any, index: number) {
  emit('changeOff', day, index)
}

defineExpose({
  loadState,
  onPicked,
  prev,
  next,
  changePattern,
  calendar,
  summary,
  dateType,
})
</script>

<template>
  <div class="class-calendar-app-container">
    <section class="calendar-app-container">
      <div class="calendar-app">
        <!-- Calendar header -->
        <div class="calendar-header">
          <el-button size="small" @click="prev">&lt;</el-button>
          <span class="current-date">{{ currentDate.format('YYYY年MM月') }}</span>
          <el-button size="small" @click="next">&gt;</el-button>
          <div class="mode-switch">
            <el-button
              :type="dateType === 1 ? 'primary' : 'default'"
              size="small"
              @click="changePattern(1)"
            >周</el-button>
            <el-button
              :type="dateType === 0 ? 'primary' : 'default'"
              size="small"
              @click="changePattern(0)"
            >日</el-button>
          </div>
        </div>

        <!-- classTop slot -->
        <slot name="classTop" />

        <!-- Week mode: day headers with switch toggles -->
        <div v-if="dateType === 1" class="ds-week-header">
          <div
            v-for="(day, index) in calendar.days"
            :key="index"
            class="ds-day"
            @mousedown="emit('mouse-down', { time: { time: day.date._d.getTime() } })"
            @mouseup="emit('mouse-up', { time: { time: day.date._d.getTime() } })"
          >
            <div class="ds-week-weekday">
              {{ dayjs(day.date._d).format('MM/DD ddd') }}
            </div>
            <!-- Toggle switch for part-time teachers -->
            <div
              v-if="topType === 2 && dayData[index]"
              class="switch-img"
              @click.stop="handleDayClick(day.date, index)"
            >
              <img
                v-if="dayData[index]?.off"
                src="@/assets/images/card/hastime.png"
                alt="有空"
                style="width: 15px; height: auto; cursor: pointer"
              />
              <img
                v-else
                src="@/assets/images/card/noTime.png"
                alt="忙碌"
                style="width: 15px; height: auto; cursor: pointer"
              />
            </div>
          </div>
        </div>

        <!-- Week grid: render events -->
        <div v-if="dateType === 1" class="ds-week-view">
          <div class="events-list">
            <div
              v-for="(event, idx) in value"
              :key="idx"
              class="event-item"
            >
              <slot
                name="eventTimeTitle"
                :calendarEvent="event"
                :details="event.data"
              />
            </div>
          </div>
        </div>

        <!-- Day mode: classContent slot -->
        <div v-if="dateType === 0" class="ds-day-picker">
          <slot
            name="classContent"
            :dayValue="dayValue || []"
            :summary="currentDate.format('YYYY年MM月DD日')"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss">
.class-calendar-app-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .calendar-app-container {
    height: 100%;
    overflow-y: auto;

    .calendar-app {
      height: 100%;
    }
  }

  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15px;
    gap: 10px;
    border-bottom: 1px solid #eee;

    .current-date {
      font-size: 18px;
      font-weight: 600;
    }

    .mode-switch {
      margin-left: 20px;
    }
  }

  .ds-week-header {
    display: flex;
    border-bottom: 1px solid #eee;

    .ds-day {
      flex: 1;
      text-align: center;
      padding: 8px 4px;
      border-right: 1px solid #eee;

      &:last-child {
        border-right: none;
      }

      .ds-week-weekday {
        font-size: 13px;
        margin-bottom: 12px;
      }
    }
  }

  .ds-week-view {
    min-height: 400px;
    margin-bottom: 100px;
    height: 100%;
  }

  .events-list {
    width: 100%;
    padding: 10px;
  }

  .event-item {
    border-radius: 4px;
    margin-bottom: 4px;
  }

  .ds-day-picker {
    min-height: 400px;
    padding: 10px;
  }

  .switch-img {
    margin-top: 4px;
    cursor: pointer;
  }

  .el-dialog__body {
    padding: 10px 20px;
  }

  ul {
    padding: 0;
  }
}
</style>
