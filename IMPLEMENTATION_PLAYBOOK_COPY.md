# Implementation Playbook — Working Copy (Updated)

## Status
- [x] Phase 0: Scaffolding complete (Vite + Vue 3 + TS + Element Plus, styles, assets)
- [x] Phase 1: Core Infrastructure — COMPLETE
  - [x] Utils: auth.ts, get-page-title.ts, event-bus.ts, task/Utils.ts
  - [x] Constants: enums.ts (all VEnum exports migrated)
  - [x] API: request.ts, hatch-request.ts, config.ts, 13 module stubs
  - [x] Stores: all 13 Pinia stores
  - [x] Router: full route config with guards + NProgress
  - [x] Layout shell and routed stub views
  - [x] Build baseline established
- [x] Phase 2: Composables & Shared Components — COMPLETE
- [x] Phase 3: Simple/Standalone Views — COMPLETE
- [ ] Phase 4: Medium Complexity Views (in progress)
  - [x] 4.1 newSalary
  - [x] 4.2 schooltimetable
  - [x] 4.3 orders/orderList
  - [x] 4.4 myorders
  - [x] Route regression fix: `/myorders/myorder` -> `myorderNew.vue`
  - [ ] 4.x full regression/type cleanup pending (cross-module)
- [ ] Phase 5: Complex Views
  - [x] 5.1 dissertation — COMPLETED (source-referenced alignment pass done in this session)
    - [x] `src/views/dissertation/index.vue` implemented from placeholder
    - [x] Source parity behavior added (`AdjustClass` trigger logic after init)
    - [x] Material workflow completed and source-aligned:
      - [x] `components/Modal/MaterialList.vue` grouped display + delete/reload behavior
      - [x] `components/Modal/MaterialUpload.vue` payload/remark/type flow aligned
      - [x] `components/Modal/Upload/index.vue` path parity wrapper added
      - [x] `components/Table/Material.vue` readonly/canRead/fileType parsing aligned
    - [x] Add/Arrange/Stage/Table parity improvements against source module
    - [x] Dissertation-specific lints clean after edits
  - [x] 5.2 newTrain — COMPLETED
    - [x] `src/views/newTrain/index.vue` migrated to step-based flow (top/stepInfo/stepDesc/countdown + substep persistence)
    - [x] Core step runtime ported:
      - [x] `components/top.vue`, `components/stepInfo.vue`, `components/stepDesc.vue`, `components/countTime.vue`
      - [x] `components/step0.vue`, `components/step1.vue`, `components/step2.vue`, `components/step3.vue`
      - [x] `components/preJobTraining.vue`, `components/productLearning.vue`, `components/officiallyJoin.vue`
      - [x] `components/videoItem.vue`, `components/question.vue`, `components/rushOrderTip.vue`
    - [x] Existing dependency components aligned from source:
      - [x] `components/videoStep.vue` (QR upload + video guide + refresh status)
      - [x] `components/uploadvideoTip.vue` (type-based upload/unlock modal flow)
      - [x] `components/videoplay.vue` (shared video dialog capability)
    - [x] `src/views/newTrain/cfg.ts` added (step config and join flow text/image mapping)
    - [x] `src/api/modules/newTrain.ts` expanded with source-aligned endpoint surface (process, interview, question, worktime, upload, completion)
    - [x] `src/stores/newTrain.ts` asset references stabilized to URL-based resources for rebuild compatibility
  - [ ] 5.3 paperchedule — not started
  - [ ] 5.4 hatch — not started
  - [ ] 5.5 account — not started
  - [ ] 5.6 detail — not started
- [ ] Phase 6: Polish

---

## Session Update Notes

### What was updated in this copy
- Created this working copy to track actual migration progress.
- Updated status based on implementation work done in the current repository.
- Explicitly marked `Phase 5.1 dissertation` complete only after source-referenced parity checks against:
  - `D:/work/classbro-teacher-web-vue-master/src/views/dissertation/index.vue`
  - `D:/work/classbro-teacher-web-vue-master/src/views/dissertation/components/**/*`

### Important scope note
- Full repository typecheck still contains pre-existing errors outside dissertation scope.
- Dissertation module changes are lint-clean and source-aligned for Phase 5.1 closure.

---

## Next Recommended Order (unchanged from playbook intent)
1. Implement Phase 5.3 (`paperchedule`).
3. Implement Phase 5.4 (`hatch`) with API/store wiring.
4. Implement Phase 5.5 (`account`) then 5.6 (`detail`).
5. Run Phase 6 polish and final verification.
