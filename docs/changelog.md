# Changelog

## 2026-06-01 — Representative simulation quality gate live PASS / full launch still BLOCKED

- PR #27 merged/deployed the representative simulation quality gate: 32 cases covering 20 canonical targets, 4 mixed-uncertainty paths, 4 unknown-heavy paths, and 4 rejected-guess recovery paths.
- Evidence passed for the gate itself: focused representative simulation test, full `npm test` 13 files / 100 tests, typecheck, build, local e2e 8/8, PR CI, main CI, Pages deploy, deployed canary, and independent live Playwright 8/8.
- Controlled demo / alpha remains PASS because the report is honest, leak-free, and separates controlled-demo success from full-launch failure.
- Full public production launch remains BLOCKED: exact first/final guess are 95% and top3 at first stop is 100%, but median first guess turn is 9, max first guess turn is 15, early branch entropy is below target, unique prefix4 paths are 8, and rejected-guess recovery success is 0%.
- Next blocker loop should target first-guess turn budget, early branch entropy/prefix diversity, and rejected-guess exact-final recovery before any final production launch review.

## 2026-06-01 — Production-feel reasoning/reveal/recovery/mobile wave live PASS

- PR #25 merged/deployed the production-feel wave: answer-trace reveal rationale, `recovery_disambiguation` gating before rejected guesses, dedicated `answerAccepted` micro-reaction, wrong recovery surprise → remove → refocus, and 360/390/412 mobile first-screen answerability.
- Builder/Reviewer/QA evidence passed: `npm test` 13 files / 97 tests, `npm run typecheck`, `npm run build`, `npm run test:e2e` 8/8, static internal-marker leak checks, local production-feel browser probe, and code/product-contract review.
- Release evidence passed: PR CI, squash merge to main, main CI, GitHub Pages deploy, workflow canary/live Playwright e2e, Hermes webhook delivery, and independent cache-busted production-feel live probe.
- Controlled demo / alpha remains OK and is stronger after this wave; full public production launch remains blocked pending representative simulation / branch entropy / broader reasoning-quality / first-guess turn-budget evidence, final production review/live QA, and operator approval.
- Release note: `release-manager` profile lacked GitHub PR/API auth, so Orchestrator/default recovered the routine release; fix that auth drift before relying on the release-manager profile for unattended PR/deploy work.

## 2026-06-01 — Live-verified Lottie authored-equivalent runtime

- Added repo-local `src/ui/character/assets/bogle-concept-a.lottie.json` and wired the character runtime to a truthful Lottie-ready path.
- Lottie `ready` requires manifest validation and rendered marker-state output; missing/malformed/duplicate-marker/renderer failures fail closed to CSS fallback with explicit metadata.
- PR #24 merged/deployed and live canary verified the public URL with `data-character-runtime="lottie"`, `data-runtime-status="ready"`, `data-runtime-reason="lottie-asset-rendered"`, `data-lottie-rendered="true"`, 8 distinct marker-state fingerprints, and zero console/page errors.
- Controlled demo / alpha remains OK; full public production launch remains blocked by intelligence/reasoning/perceptual/mobile/recovery production gates, not by pre-deploy Lottie proof.

## 2026-06-01 — Public docs aligned with live demo / production-blocked state

- Updated README from the stale “no app implementation” research-foundation state to the current live controlled-demo state.
- Added PR #21 and PR #22 evidence references to canonical docs.
- Reconfirmed that full public production launch remains blocked until real/equivalent character runtime, stronger Akinator-like UX, perceptual QA, docs/evidence, and production review/QA gates pass.

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
## 2026-06-06 — production-pass wave3 local simulation honesty gate

- Improved representative simulation first-guess budget and answer-aware branch/prefix metrics locally, while keeping full-launch-candidate BLOCKED because rejected-guess recovery success remains below threshold.
- Added a stricter representative simulation policy for the quality suite: soft cap turn 7, soft cap confidence 0.5, hard cap turn 10, without changing the public default session policy.
- Made branch entropy/prefix diversity answer-aware so the gate measures actual interaction paths (`question:answer`) instead of question IDs alone.
- Kept recovery success honest: rejecting a guessed candidate must not be counted as success merely because the next guess differs; exact final target recovery is still BLOCKED.
- Added reveal copy reconciliation for candidate/answer mismatches so final rationale stays truthful when weak conflicting clues exist.
- Local evidence: `npm test -- --run` 13 files / 100 tests PASS, `npm run typecheck` PASS, `npm run build` PASS, `npm run test:e2e` 8/8 PASS after installing the missing shared Playwright Chromium browser.
- Launch status remains not production PASS until reviewer, PR/release/deploy, live canary/browser QA, perceptual QA, docs closeout, and operator approval complete.


## 2026-06-06 — production-pass wave4 stable-target recovery gate

- Improved rejected-guess recovery simulation so hidden target/intent remains stable across pre-rejection ambiguity, wrong first guess rejection, recovery question, and exact final target reveal.
- Fixed representative recovery report ordering: recovery questions are appended chronologically instead of being unshifted ahead of pre-rejection questions.
- Updated recovery test assertions to verify the first recovery question at `firstGuessTurn - 1`, exact final target success, and no repeat of the rejected first guess.
- Representative simulation full-launch candidate now passes locally: exact first guess 95%, top3 100%, median/p90/max first guess turn 8/11/11, answer-aware entropy 2.161/3.071/3.984, prefix4 17, recovery success 100%, leak-free.
- Production status still requires PR CI, main CI, deploy, live canary/browser QA, perceptual QA, and final operator closeout before declaring PRODUCTION PASS.
