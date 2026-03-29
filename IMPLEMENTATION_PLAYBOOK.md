# Implementation Playbook — Phase 1: Core Infrastructure

## Status
- [x] Phase 0: Scaffolding complete (Vite + Vue 3 + TS + Element Plus, styles, assets)
- [x] Phase 1: Core Infrastructure — COMPLETE
  - [x] Utils: auth.ts, get-page-title.ts, event-bus.ts, task/Utils.ts
  - [x] Constants: enums.ts (all VEnum exports migrated)
  - [x] API: request.ts, hatch-request.ts, config.ts, 13 module stubs
  - [x] Stores: all 13 Pinia stores (app, settings, user, userchange, elcApp, follow, handsup, paper, medal, hatch, dissertation, smallQuestionBank, newTrain)
  - [x] Router: full route config with all routes, guards with NProgress
  - [x] Layout: LayoutDefault, AppMain, Navbar, Sidebar (index, SidebarItem, Item, Link, Logo)
  - [x] Stub views: 38 placeholder .vue files for all routes
  - [x] Build passes successfully
- [x] Phase 2: Composables & Shared Components — COMPLETE
  - [x] Pre-requisites: validate.ts, expanded task/Utils.ts (formatTime, formatSeconds, full pipeline logic), API additions (queryLateClassroom, queryTeacherUrl, getBeiJinTime, checkArrearsOrder), config (winUrl, macUrl)
  - [x] 7 Composables: useCalendar, useCountDown, useClassroom, useAutoScrollTop, useAddCourse, useScrollbarOnHover, useResizeHandler
  - [x] Simple components: SvgIcon, Breadcrumb, Hamburger, DeTooltip
  - [x] ClassIn components: goClassIn, goMKClass
  - [x] Complex components: TimeOut, DownloadApp, WeekTime (3 files)
  - [x] ClassCalendarApp stub (correct interface, full impl Phase 4)
  - [x] Integration: useResizeHandler in LayoutDefault, global SvgIcon registration, env vars
  - [x] Build passes successfully
- [x] Phase 3: Simple/Standalone Views — COMPLETE
  - [x] login/index.vue — full login flow with API, localStorage, routing logic
  - [x] messages/messages.vue — table + pagination + search
  - [x] getOrderSchemePage — index + schemeConent child component (service agreement)
  - [x] help module — index + cfg.ts + 4 sub-components (aboutMk, useGuide, webFunctions, teacManual)
  - [x] interviewFollow + classin/mkMoticeStep + classin/confirmModal — full interview flow
  - [x] Added API functions: loginByMobile, getMyInfo, postTimeZone, getSchemenInfo, creatClass, judgeComeIn, queryUserDetails, queryClassRoom, getZipFilePlus
  - [x] Added utils: fixed(), download()
  - [x] Build passes successfully
- [ ] Phase 4: Medium Complexity Views (in progress)
  - [x] 4.1 newSalary — 13 files migrated (index + cfg + 11 components), API module (13 endpoints), common.ts utils, stub deps
  - [x] 4.2 schooltimetable — 5 files migrated (cards + addcourse + coursedetail + changeModal + settingTimeTip), ClassCalendarApp expanded, API additions (classtable 6 fns, order 5 fns, preExam 5 fns, paper 2 fns, persondetail 1 fn), addNeedNew stub, checkexe util
- [ ] Phase 5: Complex Views
- [ ] Phase 6: Polish

---

## Phase 1 Tasks

### 1.1 Utils — Auth (`src/utils/auth.ts`)
**Source:** `classbro-teacher-web-vue/src/utils/auth.js`
**Action:** Direct port with TypeScript types
- Token: js-cookie based (key: `vue_admin_template_token`)
- Session/Local storage helpers
- Raw cookie get/set/del functions

### 1.2 Utils — Page Title (`src/utils/get-page-title.ts`)
**Source:** `classbro-teacher-web-vue/src/utils/get-page-title.js`
**Action:** Direct port

### 1.3 Constants — VEnum (`src/constants/enums.ts`)
**Source:** `classbro-teacher-web-vue/src/utils/VEnum.js`
**Action:** Convert all exports to TypeScript `as const` objects
- CalendarModelType, HatchRouterPath, Storage, TaskState, ReturnCode
- OwnClassStatus, StudentMakeClassStatus, AlertModalType, WishType
- LcType, HjType, CalendarVisited
- DissertationRouterPath, paperRouterPath
- StageField, StageStatus, StageType, ClassStatus, AddClasses
- StageClassesType, TableEvent, StageEvent
- StageClassFileType, ClassUploadFileType, HeaderStatused, CrmRouterLinkArgs

### 1.4 API — Request Layer (`src/api/request.ts`)
**Source:** `classbro-teacher-web-vue/src/utils/request.js`
**Migration:**
- `process.env.VUE_APP_BASE_API` → `import.meta.env.VITE_APP_BASE_API`
- `MessageBox, Message` from element-ui → `ElMessageBox, ElMessage` from element-plus
- `store.getters.token` → `useUserStore().token` (but careful with circular deps — use getToken() from auth.ts instead)
- `store.dispatch('user/resetToken')` → `useUserStore().resetToken()`
- Keep same interceptor logic: X-Token header, code 20000 success, 50008/50012/50014 token errors

### 1.5 API — Hatch Request Layer (`src/api/hatch-request.ts`)
**Source:** `classbro-teacher-web-vue/src/views/hatch/api/request.js`
**Migration:**
- Replace `Vue.prototype.$axios` with standalone axios instance
- Remove `Vue` import entirely

### 1.6 API — Config (`src/api/config.ts`)
**Action:** Create URL constants placeholder using env vars
- `BasicUrl`, `RequestUrl`, `algorithmUrl`, etc.
- These are referenced across API modules

### 1.7 API — Module Stubs (`src/api/modules/*.ts`)
Create typed stub files for each API module:
- `user.ts` — login, getInfo, logout
- `medal.ts` — getNewMedal, getTeacMedalInfo, getHangMedal
- `order.ts` — getStatus
- `classIn.ts` — getClassInLink, getMKClassInLink, getMKClassInLinkByCode, queryCourseByRoomId
- `persondetail.ts` — getTeacherInfo
- `classtable.ts` — findClassroomInfo
- `preExam.ts` — placeholder
- `examOrder.ts` — placeholder
- `paper.ts` — paper_stage, paper_teacherRate, crmStageTable, crmTeacherRate
- `newSalary.ts` — placeholder
- `newTrain.ts` — placeholder
- `smallQuestionBank.ts` — placeholder
- `table.ts` — getList

### 1.8 Pinia Stores (`src/stores/*.ts`)
Convert all 13+1 Vuex modules to Pinia stores:

**Simple stores (direct port):**
1. `app.ts` — sidebar, device state
2. `settings.ts` — fixedHeader, sidebarLogo
3. `user.ts` — token, name, avatar, ordernum, regNotifyFlag + login/logout/getInfo actions
4. `userchange.ts` — userphoto
5. `elcApp.ts` — showElcTip
6. `follow.ts` — showStep
7. `handsup.ts` — showGet + getStatus action
8. `paper.ts` — type state

**Medium stores:**
9. `medal.ts` — showglobal, currentObj, medalInfo, hangMedalList + API actions
10. `hatch.ts` — fuvfalg, countdown, countTime, process pipeline + API actions
    - Replace `moment` with `dayjs`
    - Import from `@/utils/task/Utils` (need to create stub)

**Complex stores:**
11. `dissertation.ts` — disabled, tables, stages, titleData, rate + API/router actions
    - Replace `Router` import with `useRouter()` or pass router as param
    - Replace `lodash` with `lodash-es`
12. `smallQuestionBank.ts` — tasks, activeTaskId, streamParams + SSE streaming
    - Replace `Vue.set()` with direct assignment (Vue 3 reactivity)
    - Replace `import { algorithmUrl } from "@/api/api"` with config import
13. `newTrain.ts` — documents with pages, productLearningViewed, officiallyJoinViewed
    - Replace `Vue.set()` with direct assignment
    - Replace `require('@/assets/...')` with static imports or URL constructor

### 1.9 Utils — Task Utils Stub (`src/utils/task/Utils.ts`)
**Source:** `classbro-teacher-web-vue/src/utils/task/Utils.js`
**Action:** Create typed stub with exports used by hatch store:
- `formatSeconds`, `clearCacheInterval`, `cacheIntervalId`, `getFmtCurrentLine`, `getTeacherInfo`

### 1.10 Utils — Event Bus (`src/utils/event-bus.ts`)
**Action:** Create mitt-based event bus

### 1.11 Router — Full Route Config (`src/router/`)
**Source files:**
- `classbro-teacher-web-vue/src/router/index.js`
- `classbro-teacher-web-vue/src/router/hatch.js`
- `classbro-teacher-web-vue/src/router/dissertation.js`
- `classbro-teacher-web-vue/src/router/paperschedule.js`
**Action:**
- Split into `src/router/modules/` files
- Convert to Vue Router 4 syntax
- `path: '*'` → `path: '/:pathMatch(.*)*'`
- Keep lazy loading pattern

### 1.12 Router — Guards (`src/router/guards.ts`)
**Source:** `classbro-teacher-web-vue/src/permission.js` (if exists, otherwise infer)
**Action:** Navigation guard with NProgress, token check, page title

### 1.13 Layout Shell (`src/layout/`)
**Source:** `classbro-teacher-web-vue/src/layout/`
**Action:** Create layout with stubs:
- `LayoutDefault.vue` — main layout wrapper
- `components/AppMain.vue` — router-view wrapper
- `components/Navbar.vue` — stub navbar
- `components/Sidebar/index.vue` — stub sidebar
- `components/Sidebar/SidebarItem.vue`
- `components/Sidebar/Item.vue`
- `components/Sidebar/Link.vue`
- `components/Sidebar/Logo.vue`

### 1.14 Login Page (`src/views/login/index.vue`)
**Source:** `classbro-teacher-web-vue/src/views/login/index.vue`
**Action:** Migrate login form with Element Plus components

---

## Phase 2 Tasks (brief)

### Composables
- `useCalendar.ts` — from CalendarMixin (moment→dayjs)
- `useCountDown.ts` — from CountDownMixin
- `useClassroom.ts` — from ClassroomMixin
- `useAutoScrollTop.ts` — from AutoScrollTopMixin
- `useAddCourse.ts` — from addCourseMixin
- `useScrollbarOnHover.ts` — from scrollbarOnHover
- `useResizeHandler.ts` — from ResizeHandler

### Shared Components
- SvgIcon, Breadcrumb, Hamburger, ClassIn (goClassIn, goMKClass)
- WeekTime, DeTooltip, DownloadApp, TimeOut

### Calendar Replacement
- Custom ClassCalendar to replace dayspan-vuetify
- Match slot interface: eventTimeTitle, classTop, classContent

---

## Key Migration Patterns

### Vuex → Pinia Pattern
```
// Vuex
const state = { foo: 'bar' }
const mutations = { SET_FOO(state, val) { state.foo = val } }
const actions = { setFoo({ commit }, val) { commit('SET_FOO', val) } }

// Pinia
export const useFooStore = defineStore('foo', {
  state: () => ({ foo: 'bar' }),
  actions: {
    setFoo(val: string) { this.foo = val }
  }
})
```

### Vue.set() removal
```
// Vue 2: Vue.set(obj, 'key', value)
// Vue 3: obj.key = value  (reactive by default)
```

### require() → import
```
// Vue 2: require('@/assets/images/foo.png')
// Vue 3: import fooImg from '@/assets/images/foo.png'
// Or in template: new URL('@/assets/images/foo.png', import.meta.url).href
```

### Element UI → Element Plus
- `MessageBox` → `ElMessageBox`
- `Message` → `ElMessage`
- `el-dialog :visible.sync` → `el-dialog v-model`
- `el-submenu` class names: `el-submenu__title` → `el-sub-menu__title`
- `this.$notify` → `ElNotification`
- `this.$confirm` → `ElMessageBox.confirm`
- `slot-scope="scope"` → `#default="scope"`
- `@keyup.enter.native` → `@keyup.enter`

### Options API → Composition API (`<script setup>`)
- `data()` → `ref()` / `reactive()`
- `computed` → `computed()`
- `watch` → `watch()` / `watchEffect()`
- `methods` → plain functions
- `created/mounted` → top-level / `onMounted()`
- `this.$refs.x` → `const x = ref<InstanceType<typeof X>>()`
- `this.$router` → `useRouter()`
- `this.$route` → `useRoute()`
- `this.$emit` → `defineEmits()`
- `props` → `defineProps()`
- `provide/inject` → `provide()` / `inject()`

### CSS
- `/deep/` or `::v-deep` → `:deep()`
- `scoped` stays as-is

---

## Phase 3: Simple/Standalone Views

**Goal:** Migrate views with few child components and minimal API dependencies. Validate migration patterns end-to-end.

**Already done:** 404.vue, redirect/index.vue (real implementations, not stubs)

### 3.1 login/index.vue
**Source:** `classbro-teacher-web-vue/src/views/login/index.vue` (~369 lines)
**Dependencies:** `user` store, `user` API, `auth` utils, `HatchRouterPath` enum, `persondetail` API, static images
**Key migrations:** `require()` images, `@keyup.enter.native`, `this.$store` → Pinia, Options → `<script setup>`
**Priority:** First — unblocks all testing

### 3.2 messages/messages.vue
**Source:** `classbro-teacher-web-vue/src/views/messages/messages.vue` (~148 lines)
**Dependencies:** table API (generic), `v-loading`
**Key migrations:** `slot-scope` → `#default`, Element Plus table syntax
**Priority:** Simplest real view, good pattern validation

### 3.3 getOrderSchemePage/index.vue
**Source:** 2 files (index + schemeConent component, ~517 lines)
**Dependencies:** Static images (many `require()`)
**Key migrations:** Heavy `require()` → `import`, create child `schemeConent.vue`
**Priority:** Good practice for image migration pattern

### 3.4 help/index.vue
**Source:** 7 files (index + 5 sub-components + cfg.js, ~2,120 lines)
**Dependencies:** Static config, 5 child components (aboutMk, downClassin, downMkClass, teacManual, useGuide/webFunctions)
**Key migrations:** Tab-based layout, self-contained children
**Priority:** First multi-component migration

### 3.5 interviewFollow/index.vue
**Source:** 1 file + classin/mkMoticeStep.vue dependency (~103 + 852 lines)
**Dependencies:** `classin/mkMoticeStep` component, `classIn` API (49 lines, exists)
**Key migrations:** Migrate mkMoticeStep as shared component
**Priority:** Last in Phase 3 due to cross-view dependency

**Phase 3 total:** ~4,100 lines across ~12 files

---

## Phase 4: Medium Complexity Views

**Goal:** Migrate views with multiple child components, real API integration, and moderate state management.

**Pre-work:** Flesh out API stubs for `order.ts`, `newSalary.ts`. Establish file upload pattern.

### 4.1 newSalary/index.vue
**Source:** 12 files (~2,825 lines)
**Dependencies:** `newSalary` API (stub), salary-related components
**Key children:** tableContent (812), appealList (373)
**Priority:** Clean component tree, moderate complexity

### 4.2 schooltimetable/cards.vue
**Source:** 5 files (~3,107 lines)
**Dependencies:** `classtable` API (exists), `useCalendar` composable (exists), `ClassCalendarApp`
**Key children:** addcourse (960), coursedetail (791), changeModal (171), settingTimeTip (82)
**Priority:** Calendar composable already built

### 4.3 orders/orderList.vue
**Source:** 24 files (~6,784 lines)
**Dependencies:** `order` API, `handsup` store, `examOrder` API, `preExam` API
**Key children:** rushOrder, rushModal, rushAutoModal, examTip, newGetOrder, getOrderHasScheme, newOrderNotice, registrationRecord, salarySystem, testorder/*
**Pre-work:** Expand `order.ts` API from 1 endpoint to full coverage
**Priority:** Central order pool, gateway to order domain

### 4.4 myorders/ (4 routed views)
**Source:** 20 files (~10,137 lines)
**Dependencies:** `order` API, file upload components, exam modals
**Key files:** myCourse (1,092), myorder (2,932), onCourse (551), finishedCourse (585), myorderNew.vue (may replace myorder.vue)
**Priority:** After orders — shares components and API

### 4.5 smallQuestionBank/index.vue
**Source:** 8 files (~3,909 lines)
**Dependencies:** `smallQuestionBank` store (real, 210 lines with streaming), API (stub)
**Key files:** index (1,610), Topic (1,084)
**Priority:** Last in Phase 4 — complex streaming/SSE logic but store already handles it

**Phase 4 total:** ~26,762 lines across ~69 files

---

## Phase 5: Complex Views

**Goal:** Migrate views with deepest component trees, cross-cutting concerns, and heaviest API dependencies.

**Pre-work:** Consolidate `hatch/api/` and `dissertation/api/` into `/src/api/modules/`. Establish deeply-nested component migration pattern.

### 5.1 dissertation/index.vue
**Source:** 19 files (~3,660 lines)
**Dependencies:** `dissertation` store (129 lines, real), `paper` API, own `api/` directory (290 lines)
**Structure:** Clean Modal/, Stage/, Table/ component directories
**Priority:** Smallest complex view, store and API already exist

### 5.2 newTrain/index.vue
**Source:** 30 files (~6,343 lines)
**Dependencies:** `newTrain` store (287 lines, real), `newTrain` API (stub), video playback
**Structure:** Step-based (step0-3, officiallyJoin, preJobTraining, productLearning)
**Priority:** Store fully implemented, mostly display/step logic

### 5.3 paperchedule/index.vue
**Source:** 22 files (~6,692 lines)
**Dependencies:** `paper` store + API (both exist), file upload, scheduling logic
**Key children:** taskDetail (895), addNeedNew (716), addClass (600), paperFiles (566)
**Priority:** Same domain as dissertation, paper infrastructure already in place

### 5.4 hatch/ (12 routed views)
**Source:** 30 files (~9,090 lines)
**Dependencies:** `hatch` store (exists, needs API wiring), own `api/` dir (7 files)
**Key views:** schedulecard (1,259), fakeclass (606), certificate, intention, letter, etc.
**Pre-work:** Migrate `hatch/api/` into centralized API modules
**Priority:** 12 routes but many are small; main challenge is API consolidation

### 5.5 account/ (8 routed subviews)
**Source:** 82 files (~20,572 lines)
**Dependencies:** `persondetail` API, `medal` API+store, `user` store, `follow` store
**Key views:** persondetail (1,072 + 40 child components in newHome/), myInformation (1,092), withdrawList (1,273), incomeList (924), historyorder (888), historyLessons (561), medalWall (47 + medal/ subdir), giveTimes (165)
**Strategy:** Start with simple subviews (giveTimes, medalWall) → medium (historyLessons, historyorder) → heavy (persondetail/newHome, myInformation, withdrawList)
**Priority:** Largest module, saved for last

### 5.6 detail/ (3 routed views)
**Source:** 31 files (~11,032 lines)
**Dependencies:** Order data, file management, deep component trees (conponment/ 15 files, wenya/ 7 files)
**Key files:** seller_detail1.vue (3,525 — possibly the active version), bigClassRoom (1,590), seller_detailWy (956)
**Priority:** Last — largest single file, deepest nesting, standalone pages (no Layout)

**Phase 5 total:** ~57,389 lines across ~214 files

---

## Dead Code — Skip These Original Directories

These exist in the original but are NOT routed or are dev scaffolding:
- `classin/` — only used as component import by interviewFollow, not a standalone view
- `common/`, `dashboard/`, `form/`, `nested/`, `table/`, `tree/` — dev/demo scaffolding
- `newHelpCenter/` — not referenced in any router
- `contentnull.vue` — simple empty-state component, migrate inline where needed

---

## Phase 6: Polish

- Visual regression testing (Chrome DevTools MCP comparison)
- Missing image/asset audit
- Responsive behavior verification
- Error handling standardization
- Performance audit (lazy loading, code splitting)
- Final build verification
