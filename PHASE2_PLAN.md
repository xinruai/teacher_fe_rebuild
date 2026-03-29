# Phase 2: Composables & Shared Components — Detailed Implementation Plan

## Overview
Convert 7 Vue 2 mixins to composables, migrate 10+ shared components, and build a custom ClassCalendar replacement for dayspan-vuetify.

---

## Pre-requisites (Before Components)

### P1. Add missing utility: `src/utils/validate.ts`
**Source:** `classbro-teacher-web-vue/src/utils/validate.js`
**Used by:** SvgIcon component
```ts
export function isExternal(path: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(path)
}
```

### P2. Expand `src/utils/task/Utils.ts` — add `formatTime`
**Source:** `classbro-teacher-web-vue/src/utils/task/Utils.js` lines 264-278
**Used by:** CalendarMixin → useCalendar composable
```ts
function formatNumber(n: number): string {
  const s = n.toString()
  return s.length > 1 ? s : '0' + s
}

export function formatTime(number: string | number | Date, format: string): string {
  const formateArr = ['Y', 'M', 'D', 'h', 'm', 's']
  const date = new Date(number as any)
  const returnArr = [
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
```

Also expand `formatSeconds` to match original's d/h/m/s return object (currently returns string, but hatch store uses the object form):
```ts
export function formatSeconds(value: number): { d: string; h: string; m: string; s: string } {
  // ... match original logic from Utils.js lines 38-75
}
```

### P3. Add missing API functions
**`src/api/modules/classIn.ts`** — add:
- `queryLateClassroom(params)` — used by TimeOut component
- `queryTeacherUrl(params)` — used by TimeOut component
- Existing functions need param type fix: `getClassInLink` takes `{roomId}`, not just `roomId`

**`src/api/modules/examOrder.ts`** — add:
- `getBeiJinTime()` — used by addCourseMixin → useAddCourse

**`src/api/modules/preExam.ts`** — add:
- `checkArrearsOrder(params)` — used by addCourseMixin → useAddCourse

### P4. Add missing URL constants in `src/api/config.ts`
- `winUrl` — Windows download URL (used by DownloadApp)
- `macUrl` — Mac download URL (used by DownloadApp)
- `mkClassScheme` already exists

---

## 2.1 Composables (`src/composables/`)

### 2.1.1 `useCalendar.ts`
**Source:** `classbro-teacher-web-vue/src/mixins/CalendarMixin.js`
**Deps:** dayjs (replaces moment), `formatTime` from `@/utils/task/Utils`
**Exports 4 functions:**
```ts
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

  function fmtDuration(startTime: string | number, endTime: string | number): number {
    return dayjs(endTime).diff(dayjs(startTime), 'minute') / 60
  }

  // Returns "AM/PM HH:mm-AM/PM HH:mm"
  function getZHDateRange(startTime: string | number, endTime: string | number): string {
    const s = dayjs(startTime)
    const e = dayjs(endTime)
    return s.format('A') + s.format('HH:mm') + '-' + e.format('A') + e.format('HH:mm')
  }

  // Safari-safe date parsing + AM/PM formatting
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
```

### 2.1.2 `useCountDown.ts`
**Source:** `classbro-teacher-web-vue/src/mixins/CountDown.js`
**Deps:** `useHatchStore` from `@/stores/hatch`
**Migration:** `mapGetters(['countdown', 'process', 'countTime'])` → direct store access
```ts
import { storeToRefs } from 'pinia'
import { useHatchStore } from '@/stores/hatch'

export function useCountDown() {
  const hatchStore = useHatchStore()
  const { countdown, process, countTime } = storeToRefs(hatchStore)

  async function initCurrentLine() {
    await hatchStore.currentLine()
  }

  // Call on created (component should call this in setup or onMounted)
  return { countdown, process, countTime, initCurrentLine }
}
```

### 2.1.3 `useClassroom.ts`
**Source:** `classbro-teacher-web-vue/src/mixins/ClassroomMixin.js`
**Deps:** `findClassroomInfo` from `@/api/modules/classtable`, goMKClass component ref
**Migration:** `this.$refs.goClassIn` → template ref
```ts
import { ref, type Ref } from 'vue'
import { findClassroomInfo as findClassroomInfoApi } from '@/api/modules/classtable'

export function useClassroom() {
  // Template ref to goMKClass component, consumer must bind: ref="goClassInRef"
  const goClassInRef = ref<InstanceType<any> | null>(null)

  async function goInClassNew(secretKey: string, url: string, row: Record<string, any>) {
    goClassIn(row)
  }

  async function findClassroomInfo(row: Record<string, any>) {
    return await findClassroomInfoApi(row)
  }

  async function goClassIn(row: Record<string, any>, type = 1) {
    goClassInRef.value?.show(row.id, type)
  }

  return { goClassInRef, goInClassNew, findClassroomInfo, goClassIn }
}
```

### 2.1.4 `useAutoScrollTop.ts`
**Source:** `classbro-teacher-web-vue/src/mixins/AutoScrollTop.js`
**No deps.** Pure DOM manipulation for calendar week view scroll.
```ts
import { onMounted } from 'vue'

export function useAutoScrollTop() {
  function autoScrollTop() {
    const childDom = document.getElementsByClassName('ds-day-today')[1]
    if (childDom) {
      const nodes = childDom.childNodes as NodeListOf<HTMLElement>
      const target = nodes[nodes.length - 3]
      const topPx = target?.style?.top
      if (topPx) {
        const top = parseInt(topPx)
        const resultTop = top > 400 ? top - 200 : undefined
        if (resultTop !== undefined) {
          setTimeout(() => {
            const el = document.getElementsByClassName('ds-week-view-scrollable')[0]
            if (el) el.scrollTop = resultTop
          }, 400)
        }
      }
    }
  }

  onMounted(() => autoScrollTop())

  return { autoScrollTop }
}
```
**Note:** This references `ds-day-today` and `ds-week-view-scrollable` which are dayspan-vuetify classes. When ClassCalendar is rebuilt, these class names must be updated to match the new component. Mark as TODO.

### 2.1.5 `useAddCourse.ts`
**Source:** `classbro-teacher-web-vue/src/mixins/addCourseMixin.js`
**Deps:** `getBeiJinTime` from `@/api/modules/examOrder`, `checkArrearsOrder` from `@/api/modules/preExam`
```ts
import { ref, computed } from 'vue'
import { getBeiJinTime as getBeiJinTimeApi } from '@/api/modules/examOrder'
import { checkArrearsOrder as checkArrearsOrderApi } from '@/api/modules/preExam'

export function useAddCourse() {
  const beijingTime = ref<Date>(new Date())
  const overList = ref<any[]>([])

  const overTime = computed(() => overList.value.length)

  async function getBeiJinTime() {
    const res = await getBeiJinTimeApi()
    if (res.status === 200) {
      beijingTime.value = res.body?.date?.replace(/-/g, '/')
    }
  }

  async function checkArrearsOrder(courseId: string | number) {
    const res = await checkArrearsOrderApi({ courseId })
    if (res.status === 200) {
      overList.value = res.body || []
    }
  }

  return { beijingTime, overList, overTime, getBeiJinTime, checkArrearsOrder }
}
```

### 2.1.6 `useScrollbarOnHover.ts`
**Source:** `classbro-teacher-web-vue/src/mixins/scrollbarOnHover.js`
**No deps.**
```ts
import { ref, computed, nextTick } from 'vue'

export function useScrollbarOnHover() {
  const hasScrollbar = ref(false)
  const isHovering = ref(false)

  const scrollbarClass = computed(() =>
    hasScrollbar.value && isHovering.value ? 'show-scrollbar' : 'hide-scrollbar'
  )

  function checkScrollbar(event?: Event) {
    nextTick(() => {
      const el = event?.target as HTMLElement | undefined
      if (el) {
        hasScrollbar.value = el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth
      }
    })
  }

  function handleMouseEnter(event: Event) {
    isHovering.value = true
    checkScrollbar(event)
  }

  function handleMouseLeave() {
    isHovering.value = false
  }

  return { hasScrollbar, isHovering, scrollbarClass, checkScrollbar, handleMouseEnter, handleMouseLeave }
}
```

### 2.1.7 `useResizeHandler.ts`
**Source:** `classbro-teacher-web-vue/src/layout/mixin/ResizeHandler.js`
**Deps:** `useAppStore` from `@/stores/app`
**Migration:** `store.dispatch('app/...')` → `appStore.closeSideBar()` / `appStore.toggleDevice()`
```ts
import { onBeforeMount, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

const WIDTH = 992

export function useResizeHandler() {
  const appStore = useAppStore()
  const route = useRoute()

  function isMobile(): boolean {
    const rect = document.body.getBoundingClientRect()
    return rect.width - 1 < WIDTH
  }

  function resizeHandler() {
    if (!document.hidden) {
      const mobile = isMobile()
      appStore.toggleDevice(mobile ? 'mobile' : 'desktop')
      if (mobile) {
        appStore.closeSideBar(true)
      }
    }
  }

  watch(() => route.path, () => {
    if (appStore.device === 'mobile' && appStore.sidebar.opened) {
      appStore.closeSideBar(false)
    }
  })

  onBeforeMount(() => {
    window.addEventListener('resize', resizeHandler)
  })

  onMounted(() => {
    if (isMobile()) {
      appStore.toggleDevice('mobile')
      appStore.closeSideBar(true)
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeHandler)
  })
}
```
**Note:** Check that `appStore.closeSideBar` and `appStore.toggleDevice` exist. The app store has `closeSideBar({ withoutAnimation })` — need to verify if param is object or boolean.

---

## 2.2 Shared Components (`src/components/`)

### 2.2.1 `SvgIcon/index.vue`
**Source:** `classbro-teacher-web-vue/src/components/SvgIcon/index.vue` (62 lines)
**Migration notes:**
- `v-on="$listeners"` → remove (Vue 3 inherits listeners via `$attrs`)
- Options API → `<script setup>`
- Import `isExternal` from `@/utils/validate`
- Props: `iconClass` (string, required), `className` (string, default '')
- Computed: `isExternal`, `iconName` (`#icon-${iconClass}`), `svgClass`, `styleExternalIcon`
- Keep exact same `<style scoped>` CSS

### 2.2.2 `Breadcrumb/index.vue`
**Source:** `classbro-teacher-web-vue/src/components/Breadcrumb/index.vue` (79 lines)
**Migration notes:**
- Remove `path-to-regexp` import (handleLink is commented out / no-op)
- `this.$route` → `useRoute()`
- `this.$route.matched` → `route.matched`
- `watch: { $route() }` → `watch(() => route.path, ...)`
- `created()` → call in `<script setup>` directly
- `<transition-group>` works same in Vue 3
- Keep SCSS scoped styles

### 2.2.3 `Hamburger/index.vue`
**Source:** `classbro-teacher-web-vue/src/components/Hamburger/index.vue` (38 lines)
**Migration notes:**
- `this.$emit('toggleClick')` → `emit('toggleClick')`
- Props: `isActive` (boolean, default false)
- Very simple component, direct conversion to `<script setup>`

### 2.2.4 `ClassIn/goClassIn.vue`
**Source:** `classbro-teacher-web-vue/src/components/ClassIn/goClassIn.vue` (113 lines)
**Migration notes:**
- `:visible.sync="isShow"` → `v-model="isShow"` on el-dialog
- `/deep/` → `:deep()` in scoped SCSS
- `this.$router.push` → `useRouter().push`
- `getClassInLink` API call — param is `{ roomId }` object
- Timer cleanup on unmount: `onBeforeUnmount(() => clearInterval(timer))`
- `show()` method exposed via `defineExpose({ show })`

### 2.2.5 `ClassIn/goMKClass.vue`
**Source:** `classbro-teacher-web-vue/src/components/ClassIn/goMKClass.vue` (184 lines)
**Migration notes:**
- Same el-dialog `:visible.sync` → `v-model` migration
- `/deep/` → `:deep()`
- `props: ['teacId']` → `defineProps<{ teacId?: string | number }>()`
- `import { mkClassScheme } from "@/api/api"` → `import { mkClassScheme } from '@/api/config'`
- `getMKClassInLink`, `getMKClassInLinkByCode`, `queryCourseByRoomId` — verify API params match
- `defineExpose({ show })` for parent component access
- JSON.parse try/catch for msgData.joinUrl (keep as-is)

### 2.2.6 `DeTooltip/index.vue`
**Source:** `classbro-teacher-web-vue/src/components/DeTooltip/index.vue` (57 lines)
**Migration notes:**
- Props: `text`, `placement`, `effect`, `lineClamp`
- `this.$emit('click')` → `emit('click')`
- Overflow detection via scrollHeight > clientHeight
- Direct `<script setup>` conversion, simple component

### 2.2.7 `TimeOut/index.vue`
**Source:** `classbro-teacher-web-vue/src/components/TimeOut/index.vue` (121 lines)
**Migration notes:**
- `:visible.sync="visiblePop"` → `v-model="visiblePop"`
- Named slots `slot="title"` / `slot="footer"` → `#title` / `#footer` (Vue 3 v-slot syntax)
- `/deep/` → `:deep()`
- `process.env.VUE_APP_AFTER_CLASS_FEEDBACK` → `import.meta.env.VITE_APP_AFTER_CLASS_FEEDBACK`
- Need new API functions: `queryLateClassroom`, `queryTeacherUrl` in classIn.ts
- 30s polling via setTimeout — add cleanup on `onBeforeUnmount`
- `getLocal('teactoken')` → check `window.localStorage.getItem('teactoken')`

### 2.2.8 `DownloadApp/index.vue`
**Source:** `classbro-teacher-web-vue/src/components/DownloadApp/index.vue` (460 lines)
**Migration notes:**
- `:visible.sync="dialogVisible"` → `v-model="dialogVisible"`
- `/deep/` → `:deep()`
- `import { winUrl, macUrl } from "@/api/api"` → `import { winUrl, macUrl } from '@/api/config'`
- Need to add `winUrl` and `macUrl` to config.ts
- `window.electronUrl` — keep as global, or add to config
- `@/assets/images/home/elc.png` etc. — verify these images exist in fe_rebuild/src/assets
- `defineExpose({ show })` for parent component access
- `slot` → `#title` (if applicable, but this component doesn't use named slots from parent)

### 2.2.9 `WeekTime/` (3 files)
**Source:**
- `classbro-teacher-web-vue/src/components/WeekTime/index.vue` (108 lines) — wrapper
- `classbro-teacher-web-vue/src/components/WeekTime/components/WeekTime.vue` (685 lines) — core
- `classbro-teacher-web-vue/src/components/WeekTime/util/index.js` (36 lines) — helpers

**Migration notes:**
- **util/index.ts**: Pure JS, just add TypeScript types
- **WeekTime.vue (core)**:
  - Large component with mouse drag selection logic
  - `this.$emit('change', ...)` → `emit('change', ...)`
  - No Vue 2 specific APIs used (no Vue.set, no $listeners)
  - `/deep/` → `:deep()` in styles
  - Convert to `<script setup>` or keep Options API (complex enough that Options might be clearer)
- **index.vue (wrapper)**:
  - `this.$refs.weekTimes` → template ref
  - `/deep/` → `:deep()`
  - Duplicate `components` declaration — remove one

### 2.2.10 `ClassCalendarApp/index.vue` — CUSTOM REPLACEMENT
**Source:** `classbro-teacher-web-vue/src/components/ClassCalendarApp/index.vue` (584 lines)
**This is the highest-risk item.** The original wraps `<ds-calendar-app>` from dayspan-vuetify (no Vue 3 port).

**Strategy:** Create a stub component that:
1. Accepts same props (`modelType`, `value`, `dayValue`)
2. Emits same events (`picked`, `added`, `prompt`, `event-update`, `mouse-up`, `mouse-down`, `mouse-up-event`)
3. Provides same slots (`eventTimeTitle`, `classTop`, `classContent`)
4. Has same `loadState()` and `setCalendar()` methods exposed
5. Uses a simple week/day calendar grid built with pure HTML/CSS + Element Plus date picker

**Phase 2 scope:** Create the **stub** with correct interface. Full calendar implementation is Phase 4 (when schooltimetable and paper views are migrated).

```
src/components/ClassCalendarApp/
├── index.vue          — Main wrapper (replaces ds-calendar-app)
├── CalendarHeader.vue — Month/week navigation
├── WeekView.vue       — 7-day × 24-hour grid
└── DayView.vue        — Single day timeline
```

**Slot interface to maintain:**
```vue
<slot name="eventTimeTitle" :calendarEvent="event" :details="details" />
<slot name="classTop" />
<slot name="classContent" :dayValue="dayValue" />
```

---

## 2.3 Additional Tasks

### 2.3.1 Wire `useResizeHandler` into LayoutDefault.vue
The original layout uses the ResizeHandler mixin. Add `useResizeHandler()` call to `src/layout/LayoutDefault.vue`.

### 2.3.2 Register SvgIcon globally
In `src/main.ts`, import and register SvgIcon as a global component:
```ts
import SvgIcon from '@/components/SvgIcon/index.vue'
app.component('svg-icon', SvgIcon)
```

### 2.3.3 Verify image assets exist
Components reference these images — verify they're copied to `src/assets/`:
- `images/home/elc.png`
- `images/home/jianyi.png`
- `images/home/winstep.png`
- `images/home/macstep.png`
- `images/home/win.png`
- `images/home/mac.png`
- `images/download/web.png`
- `images/download/jianyi.png`
- `images/iconmale.png`
- `images/iconfemale.png`

### 2.3.4 Add `.env` variable
`VITE_APP_AFTER_CLASS_FEEDBACK` — used by TimeOut component (was `VUE_APP_AFTER_CLASS_FEEDBACK`)

---

## Implementation Order

1. **Pre-requisites** (P1-P4): utils/validate.ts, expand task/Utils.ts, API additions, config additions
2. **Composables** (2.1.1-2.1.7): All 7 composables in parallel (no interdependencies except useCountDown→hatch store)
3. **Simple components** (2.2.1-2.2.3, 2.2.6): SvgIcon, Breadcrumb, Hamburger, DeTooltip
4. **ClassIn components** (2.2.4-2.2.5): goClassIn, goMKClass
5. **Complex components** (2.2.7-2.2.9): TimeOut, DownloadApp, WeekTime
6. **Calendar stub** (2.2.10): ClassCalendarApp with correct interface
7. **Integration** (2.3.1-2.3.4): Wire into layout, global registration, assets, env vars
8. **Build verification**: `npm run build` must pass

---

## Vue 2 → Vue 3 Migration Patterns Used

| Pattern | Before (Vue 2) | After (Vue 3) |
|---------|----------------|---------------|
| Dialog visible | `:visible.sync="x"` | `v-model="x"` |
| Deep selector | `/deep/ .foo` | `:deep(.foo)` |
| Named slots | `slot="name"` | `#name` |
| Scoped slots | `slot-scope="{x}"` | `v-slot="{x}"` or `#name="{x}"` |
| Listeners | `v-on="$listeners"` | Remove (included in `$attrs`) |
| Emit | `this.$emit('x')` | `const emit = defineEmits(['x'])` |
| Refs | `this.$refs.x` | `const x = ref(null)` |
| Router | `this.$router` | `useRouter()` |
| Route | `this.$route` | `useRoute()` |
| Lifecycle | `beforeDestroy` | `onBeforeUnmount` |
| Mixin data | `data() { return {...} }` | `const x = ref(...)` |
| Mixin computed | `computed: { x() {} }` | `const x = computed(() => ...)` |
| Mixin methods | `methods: { x() {} }` | `function x() {}` + return |
| moment.js | `moment(x).format(...)` | `dayjs(x).format(...)` |
| env vars | `process.env.VUE_APP_X` | `import.meta.env.VITE_APP_X` |
| require img | `require('@/assets/x.png')` | `import x from '@/assets/x.png'` |
