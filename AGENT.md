# AGENT.md

## Project Purpose

This repository (`D:/work/fe_rebuild`) is a **Vue 3 + TypeScript rebuild** of:

- `D:/work/classbro-teacher-web-vue-master`

The target is **behavioral parity** with the source project while modernizing stack (Vue 2 -> Vue 3, Vuex -> Pinia, Element UI -> Element Plus, TS adoption).

If you are an agent working here, your primary rule is:

> Do not invent features from scratch when source behavior exists. Port from source first, then adapt.

---

## Source of Truth

Use these in order:

1. `D:/work/classbro-teacher-web-vue-master` (actual implementation truth)
2. `IMPLEMENTATION_PLAYBOOK.md` (migration plan and phase targets)
3. `IMPLEMENTATION_PLAYBOOK_COPY.md` (current progress snapshot)

The playbook gives roadmap, but source code defines exact behavior.

---

## Current Status Snapshot (Important)

- Phase 0-3: complete
- Phase 4: mostly complete; one known route regression was fixed (`/myorders/myorder` -> `myorderNew.vue`)
- Phase 5:
  - `5.1 dissertation`: implemented and source-aligned in this repo
  - `5.2 newTrain`: started, not finalized
  - `5.3-5.6`: pending

Do not assume "complete" means perfect parity; always re-check source module before new edits.

---

## Required Agent Workflow

1. **Read playbook + source module first**
   - Identify source files for target module.
   - Map components, API calls, store state, route/query contract.

2. **Port behavior, not just UI**
   - Preserve conditions, modal triggers, disabled logic, status transitions, payload shapes.
   - Keep route/query and localStorage compatibility with source where needed.

3. **Adapt to rebuild architecture**
   - Vuex -> Pinia
   - `require()` -> imports / URLs
   - Element UI syntax -> Element Plus syntax
   - Source local API modules -> `src/api/modules/*`

4. **Verify after edits**
   - Lint edited files.
   - Run type checks when possible.
   - If full typecheck fails from unrelated modules, confirm edited module has no new errors.

5. **Update progress docs**
   - Update `IMPLEMENTATION_PLAYBOOK_COPY.md` after meaningful progress.

---

## Hard Rules

- Never claim parity without reading matching source files.
- Never replace source behavior with simplified placeholders unless explicitly requested.
- Never silently break route contracts used by existing pages/stores.
- Do not revert unrelated user changes.

---

## Key Paths

### Rebuild project
- `src/views/`
- `src/stores/`
- `src/api/modules/`
- `src/router/index.ts`
- `src/constants/enums.ts`

### Source project
- `D:/work/classbro-teacher-web-vue-master/src/views/`
- `D:/work/classbro-teacher-web-vue-master/src/router/`
- `D:/work/classbro-teacher-web-vue-master/src/utils/`

---

## Module-Specific Notes: Dissertation (Phase 5.1)

Already migrated and aligned. Relevant files:

- `src/views/dissertation/index.vue`
- `src/views/dissertation/components/**/*`
- `src/stores/dissertation.ts`
- `src/api/modules/paper.ts`

When touching this module:

- Keep `AdjustClass` trigger behavior after init.
- Preserve material workflows (`MaterialList`, `MaterialUpload`, grouped file types, stage_over/sysfile_uploadList split).
- Keep readonly/CRM/query compatibility logic intact.

---

## Next Work Priority

1. Finalize `Phase 5.2 newTrain` from source
2. Implement `Phase 5.3 paperchedule`
3. Implement `Phase 5.4 hatch` (including API/store wiring)
4. Implement `Phase 5.5 account`
5. Implement `Phase 5.6 detail`
6. Phase 6 polish/regression pass

---

## Verification Commands (Windows/Powershell)

Because local shell path behavior may vary, prefer direct node invocation for typecheck:

- `node "node_modules/vue-tsc/bin/vue-tsc.js" -b`

Lint checks can be done via Cursor diagnostics on changed files.

---

## Definition of Done for Any Migrated Module

- Routed page is not a placeholder.
- Source component structure and critical interactions are ported.
- API payloads and response handling match source intent.
- Store state/actions required by module are wired.
- Edited files are lint-clean.
- No new type errors introduced for the migrated module.
