# Autoplan Kanban — Food Akinator Production Completion Loop

Updated: 2026-06-01
Repo HEAD at synthesis: `6bcef0f` / PR #21
Docs alignment baseline: `0db5df7` / PR #22 autoplan merged to `main`
Live Lottie runtime baseline: `2e94ac0` / PR #24 merged and deployed
Production-feel wave baseline: `fa060d6` / PR #25 merged and deployed
Simulation-quality gate baseline: `ac12f4a` / PR #27 merged and deployed
Live URL: https://crimson-joo.github.io/food-akinator-hermes-pilot/
Board: `food-akinator-rebuild`

## Program goal

Bring Food Akinator from a technically deployed character/inference prototype to a production-ready Akinator-like Korean food guessing game, without copying Akinator protected assets, copy, genie silhouette, or exact layout.

## Current verdict

**Not ready for full public production launch.**

Current state is acceptable as a controlled public demo / alpha. PR #25 resolved the scoped production-feel blockers and PR #27 shipped an honest representative simulation quality gate with local QA, PR CI, merge/deploy, live smoke/canary, and independent live Playwright evidence. Full production launch remains blocked by the gate results:

1. First-guess turn budget is over full-launch target: median 9, max 15.
2. Early branch entropy is below target at turns 1–2: 0.881 / 1.395.
3. Prefix diversity is still narrow: unique prefix4 paths 8.
4. Rejected-guess recovery exact-final success is 0% under the current semantics.
5. Final production review + live QA gate must explicitly approve full public launch rather than scoped wave readiness.
6. Operator/public-launch approval has not been requested or granted.
7. Release-manager profile GitHub auth drift should be fixed before relying on routine release automation without orchestrator recovery.

## Review synthesis

### Designer

P0 design gaps:

- Answer-specific 300–600ms micro reactions must be visually unmistakable.
- Reveal must become a staged character performance, not mostly a result card.
- Wrong recovery needs a 3-beat drama: surprise → candidate removal → re-focus.
- Face hierarchy needs stronger brows/eyes/mouth/head tilt readability.

### Researcher / Product Critic

P0 product gaps:

- Questions need reasoning bridges so users feel prior answers are being used.
- Progress tension needs more than `큰 갈래는 잡혔어요 / 후보가 둘로 갈리네요 / 감이 왔어요`.
- Guess suspense needs a separate pre-reveal stage.
- Final reasons must tie directly to the user's answers, not generic candidate tags.

### Architect

P0 architecture gaps:

- Extract `CharacterStage`, `characterCueMapper`, runtime adapter, asset manifest, and motion scheduler.
- Remove hardcoded timing from `mountApp()` and make answer/reveal/recovery timing testable.
- Keep CSS fallback but prepare `rive | lottie | css-fallback` runtime swap boundary.

### Reviewer

Blocking findings / current status:

- PR #24 cleared the prior `css-fallback`-only runtime blocker on the public URL for controlled demo/alpha.
- PR #25 reviewer/QA/release evidence cleared the scoped production-feel blockers for answer-trace reveal, recovery gating, three-beat wrong recovery, answerAccepted beat, and mobile first-screen answerability.
- PR #27 reviewer/QA/release evidence added the representative simulation quality gate and proved it live; the gate itself blocks full launch on first-guess turn budget, early branch entropy, prefix diversity, and rejected-guess recovery success.
- Full production launch remains blocked until those metrics pass, then final production review/live QA and explicit launch approval pass.

### QA Lead

Live flow passed:

- Entry → questions → first guess → wrong recovery → second/third guesses → reveal → post-reveal recovery.
- Console errors: none observed.

QA risks:

- First guess can take ~14 questions; this feels long for food domain.
- `감이 왔어요` can repeat for too many turns.
- Wrong recovery lacks explanation of what changed.
- Final reasons may be generic or seem contradictory.
- Mobile needs explicit 360/390/412 viewport QA.

### Librarian

Documentation/evidence status:

- README/current docs/changelog/Graphify now include PR #27 simulation-quality release closeout.
- PR #25 and PR #27 evidence should be promoted only as durable truth: controlled demo/alpha PASS and honest full-launch blocker evidence, not full public launch approval.
- Graphify may show one-commit self-reference drift after graph-containing commits; record freshness explicitly rather than looping forever.

## Auto-resolved decisions

- Use the existing `food-akinator-rebuild` Kanban board.
- Use real repo workspace `dir:/Users/crimson/Projects/food-akinator-hermes-pilot`, not scratch.
- Keep current small/main PR flow for now because the repo currently has no `develop` branch; future medium-flow migration is separate.
- Treat public launch as blocked until Reviewer + QA Lead both pass a production-readiness gate.
- Do not copy Akinator protected visual identity; extract only interaction primitives.

## Escalation decisions

Escalate to user only if:

- Rive/Lottie authoring requires paid tooling, external commissioning, or API cost.
- A design direction changes Bogle's core identity away from Concept A.
- Public launch/marketing announcement is requested.
- A rollback or repo settings change is required.

## Kanban graph

### Wave 1 — unblock production foundation

1. `DOC-README`: Align README/changelog/current docs with actual live app state.
2. `ARCH-STAGE`: Extract character runtime boundary and asset manifest with no behavior change.
3. `PROD-UX`: Add reasoning bridges, progress tension, answer-specific visible reactions, reveal suspense, and answer-tied final reasons.
4. `QA-EVIDENCE`: Build browser screenshot/perceptual QA evidence suite for key states and mobile/reduced-motion.

### Wave 2 — production feel and proof after live Lottie

Status: scoped implementation/review/QA/release completed by PR #25 and PR #27 for controlled demo/alpha.

5. `PROD-REASONING`: Implement reasoning bridge, answer-tied progress tension, stronger suspense/reveal rationale, and representative simulation evidence. ✅ PR #25 implemented scoped reasoning/reveal; PR #27 added representative simulation/report gate.
6. `PROD-RECOVERY-MOBILE`: Implement 3-beat wrong recovery and mobile character safe-area polish. ✅ controlled-demo/live probe PASS.
7. `QA-PRODUCTION-GATE`: Full live QA against Akinator-like acceptance criteria, including perceptual/mobile/reduced-motion evidence. ✅ scoped production-feel and simulation-gate QA PASS; full-launch QA remains blocked by failed metrics.
8. `REVIEW-PRODUCTION-GATE`: Strict production review and release readiness decision. ✅ code/product-contract PASS for the waves; not a full public launch approval.
9. `LIB-RETRO`: Reconcile docs, Graphify, changelog, run artifacts, and reusable lessons. ✅ PR #25/PR #27 state reconciled.

### Wave 3 — simulation-quality blocker loop

Recommended next loop before any full public production launch candidate:

10. `ARCH-SIM-QUALITY-WAVE2`: specify metric-improvement strategy for first-guess turn budget, early entropy/prefix diversity, and recovery success.
11. `BUILD-SIM-QUALITY-WAVE2`: TDD implementation of the smallest selector/data/recovery improvements needed to move those metrics without leaking internals or copying protected IP.
12. `REVIEW-SIM-QUALITY-WAVE2`: verify metric honesty, no full-launch overclaim, code/test quality, and non-copy boundary.
13. `QA-SIM-QUALITY-WAVE2`: rerun representative simulation + browser/mobile/reduced-motion/live gates; declare full-launch candidate only if all thresholds pass.
14. `RELEASE-SIM-QUALITY-WAVE2`: if QA/Reviewer approve, run routine PR/CI/merge/deploy/live canary.
15. `LIB-SIM-QUALITY-WAVE2`: reconcile docs/Graphify/changelog and final launch verdict.

## Acceptance criteria for production launch

- Character runtime is live-verified as Lottie authored-equivalent or a later approved runtime; fallback paths remain truthful and fail closed.
- Entry, ask, answerAccepted, thinking, confident, surprised, recover, reveal are visually distinct in browser screenshots.
- Five answer reactions are perceptibly different within 300–600ms.
- Guess suspense and reveal are staged before the result text dominates.
- Wrong recovery explains candidate removal and asks a discriminating follow-up.
- Final reasons cite user answer evidence, not generic tags alone.
- Representative simulation full-launch candidate passes: first-guess median/max within budget, early branch entropy above threshold, unique prefix4 diversity above threshold, rejected-guess recovery success above threshold, rationale coverage/leak-free/unknown-heavy graceful behavior preserved.
- Mobile 360/390/412 and reduced-motion QA pass.
- README/docs/changelog/release/QA evidence are current.
- CI, Pages deploy, live canary, Reviewer, and QA Lead gates pass.

## Evidence index

- PR #21: https://github.com/crimson-joo/food-akinator-hermes-pilot/pull/21
- PR #22: https://github.com/crimson-joo/food-akinator-hermes-pilot/pull/22
- PR #24: Lottie authored-equivalent runtime merged/deployed/live canary PASS on the public URL.
- PR #25: production-feel reasoning/reveal/recovery/mobile wave merged/deployed/live canary PASS. Evidence: `.hermes/runs/t_4dade37a/qa-prod-feel-gate-report.md`, `.hermes/runs/t_d4d6b5dd/orchestrator-release-recovery/release-closeout.md`, and `.hermes/runs/t_d4d6b5dd/orchestrator-release-recovery/live-probe/`.
- Live cache-busted canary used for PR #25: public URL with production-feel probe PASS for desktop/mobile 360/390/412/reduced-motion, answerAccepted dedicated beat, wrong recovery three beats, answer-trace reveal, console/page error 0.
- PR #27: representative simulation quality gate merged/deployed/live canary PASS. Evidence: `.hermes/runs/t_c72bfb98/test-simulation-quality-report.md`, `.hermes/runs/t_635d31d8/qa-sim-final-gate-report.md`, and `.hermes/runs/t_627cc872/orchestrator-release-recovery-closeout.md`.
- Current simulation metrics: 32 cases, exact first/final guess 95%, top3 at first stop 100%, median first guess turn 9, max 15, entropy turn1/2/3 0.881/1.395/2.490, unique prefix4 8, rationale coverage 100%, unknown-heavy graceful 100%, recovery success 0%, leak-free true.
- Local screenshot inspected: `/Users/crimson/.hermes/cache/screenshots/browser_screenshot_0680642bc7d842cd89a97cd013d4e4e9.png`
- Current Graphify outputs: `graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.json`, `graphify-out/graph.html`
