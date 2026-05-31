# Changelog

## 2026-06-01 — Bogle motion state machine + production completion autoplan

- Merged PR #21 with `productionLayerSheet` and `animationStateMachine` v2 for Bogle: source-art quality bar, non-copy boundary, layer export groups, clip names, timings, easing, and per-layer motion beats.
- Exposed runtime hooks through the visible SVG puppet: `data-layer-sheet`, `data-art-quality`, `data-source-concept-id`, `data-motion-state`, `data-motion-clip`, `data-motion-duration-ms`, and `data-motion-beat-count`.
- Passed PR CI, main CI, GitHub Pages deploy, scripted live canary, and browser DOM/console smoke.
- Ran Designer, Researcher/Product Critic, Architect, Reviewer, QA Lead, and Librarian self-review; verdict is controlled demo OK, full public production blocked.
- Added `docs/current/autoplan-kanban.md` as the next self-improvement plan for production completion.
- Remaining blockers: real Rive/Lottie or accepted-equivalent runtime, README/docs alignment, perceptual/screenshot QA, stronger Akinator-like reasoning/reveal/recovery UX, and character boundary extraction.

## 2026-05-31 — Akinator-level canonical knowledge base local PASS

- Ran a Product/Engine, Design/Service, and QA/Release gap-review meeting for the user's “actual Akinator-level” target.
- Added canonical `src/data/food-knowledge-base.ts` with 50 active Korean food candidates and 42 active adaptive questions.
- Switched the public UI demo from the old 3-candidate `src/ui/app.ts` toy fixture to canonical `foodKnowledgeBase`; `demoDataset` remains a compatibility alias.
- Added `tests/food-knowledge-base.test.ts` to gate domain validation, 50+/35+ scale, 20+ non-neutral candidate coverage, question split quality, role coverage, and trust-boundary reason copy.
- Updated e2e flow to tolerate deeper canonical search space while preserving entry → answerAccepted/thinking → guess → wrong recovery → reveal coverage.
- Final local gates passed: `npm test` 56 tests, `npm run typecheck`, `npm run build`, `npm run test:e2e` 4 tests.
- Not done: representative 20-food aggregate simulation, branch entropy matrix, Rive/Lottie-ready character runtime, scene choreography split, PR/CI/merge/deploy/live canary.

## 2026-05-31 — Character/brand interaction slice local PASS

- Refined the UI scaffold from a placeholder stage into a lightweight CSS/DOM procedural host for “입맛 탐정 보글” with visible arms, ladle, notebook check mark, plate lid, steam, face, and state-specific cue selectors.
- Added non-numeric “단서 진행” clue progress expression without exposing score/probability/topN internals.
- Added UI regression tests for visible host rig parts, every required cue having multiple visible CSS changes, and exhausted/error recover-family contracts.
- Preserved reduced-motion CSS, keyboard focus styles, fixed five-answer controls, wrong recovery, reveal copy, and current engine/session behavior.
- Final local gates passed: `npm test`, `npm run typecheck`, `npm run build`, `npm run test:e2e --if-present`.
- Not done in this Builder slice: perceptual QA approval, PR CI, main deploy, live canary, Hermes webhook QA.

## 2026-05-30 — Threshold / golden paths / minimal UI scaffold pilot local PASS

- Added threshold/reveal/wrong-recovery session state machine and golden Korean food scenario acceptance fixtures.
- Added minimal Vite browser scaffold with Entry → Asking → Answer accepted → Thinking → Guessing → Reveal → Wrong recovery states.
- Added visible CSS/DOM character stage placeholder with QA hooks for `idle`, `ask`, `thinking`, `confident`, `surprised`, `recover`, and `reveal` cues.
- Added UI render/transition tests that verify fixed 5-answer controls, Korean question/reveal/recovery copy, no internal score/probability copy, reduced-motion CSS, and recovered `recover` cue preservation.
- Added release automation bootstrap: PR `test-lint-build` CI, GitHub Pages deploy workflow, Playwright e2e smoke, post-deploy scripted asset canary, optional Hermes webhook notification, Vite Pages base config.
- Updated release/QA docs with workflow contract and quantitative Playwright gate.
- Fixed reviewer-blocking UI error trust-boundary issue: raw engine errors/question ids are no longer rendered to users; safe Korean recovery copy is shown instead.
- Final local gates passed: integrated review remediation, QA browser flow, `npm test`, `npm run typecheck`, `npm run build`, focused CLI acceptance probe.
- Final ship gates later completed: PR #5 merge, PR #6 live smoke base URL fix, main CI, GitHub Pages deploy, scripted asset canary, live Playwright smoke, and Pixel 7 mobile viewport smoke.
- Not done: final mascot/brand polish, perceptual QA polish, large catalogue expansion, optional Hermes webhook secret wiring.


## 2026-05-29 — Adaptive selector pilot local PASS

- Added local engine foundation: domain validation, candidate scoring, and adaptive selector MVP.
- Fixed validator finite-number gaps for non-finite candidate/question numeric values.
- Fixed adaptive selector unknown recovery blocker: after an `unknown` answer, turn 4+ avoids high `revealRisk` direct questions when a clear low-risk alternative exists.
- Added regression and QA probes for branch divergence, marginal cost behavior, and unknown turn-4 low-risk recovery.
- Updated architecture/release docs and Graphify outputs.
- Final local gates passed: reviewer re-review, QA rerun, `npm test`, `npm run typecheck`, focused QA acceptance probe.
- Not done: PR, merge, deploy, browser QA, live canary.

Notes:
- Canonical remediation path: `t_26ede10d` + HEAD `c5f1981`.
- Duplicate remediation card `t_43ed9e23` is coordination noise for the same blocker.
- Graphify output freshness can churn on graph-only commits; decide a repo policy before release automation.
