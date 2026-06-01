# Autoplan Kanban — Food Akinator Production Completion Loop

Updated: 2026-06-01
Repo HEAD at synthesis: `6bcef0f` / PR #21
Docs alignment baseline: `0db5df7` / PR #22 autoplan merged to `main`
Live Lottie runtime baseline: `2e94ac0` / PR #24 merged and deployed
Live URL: https://crimson-joo.github.io/food-akinator-hermes-pilot/
Board: `food-akinator-rebuild`

## Program goal

Bring Food Akinator from a technically deployed character/inference prototype to a production-ready Akinator-like Korean food guessing game, without copying Akinator protected assets, copy, genie silhouette, or exact layout.

## Current verdict

**Not ready for full public production launch.**

Current state is acceptable as a controlled public demo / alpha, but production launch is blocked by:

1. User perception may still be closer to a polished adaptive survey than a character who is actively narrowing the answer.
2. Reasoning bridge/progress tension must visibly connect prior answers to the next clue without exposing internal score/id data.
3. Reveal and wrong-recovery moments work functionally but need stronger payoff, answer-tied rationale, and 3-beat trust recovery.
4. Mobile/perceptual QA still needs production-grade evidence for safe-area composition and state readability.
5. Representative simulation / branch entropy / reasoning quality evidence is not yet production-grade.
6. Final production review + live QA gate has not approved full public launch.

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

Blocking findings:

- PR #24 cleared the prior `css-fallback`-only runtime blocker on the public URL for controlled demo/alpha.
- Perceptual/mobile QA and screenshot regression remain below the full-production bar.
- User-perceived intelligence/reasoning bridge/reveal rationale/wrong recovery still require an integrated production-feel wave.
- Full production launch remains blocked until Reviewer + QA Lead approve the deployed artifact against the production/reference-product bar.

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

Documentation/evidence gaps:

- PR #21 needs a run/evidence bundle or documented summary.
- `docs/current/design.md`, `qa.md`, `release.md`, `changelog.md`, and README need current-state cleanup.
- Graphify may show one-commit self-reference drift after graph-containing PRs; record freshness explicitly rather than looping forever.

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

5. `PROD-REASONING`: Implement reasoning bridge, answer-tied progress tension, stronger suspense/reveal rationale, and representative simulation evidence.
6. `PROD-RECOVERY-MOBILE`: Implement 3-beat wrong recovery and mobile character safe-area polish.
7. `QA-PRODUCTION-GATE`: Full live QA against Akinator-like acceptance criteria, including perceptual/mobile/reduced-motion evidence.
8. `REVIEW-PRODUCTION-GATE`: Strict production review and release readiness decision.
9. `LIB-RETRO`: Reconcile docs, Graphify, changelog, run artifacts, and reusable lessons.

## Acceptance criteria for production launch

- Character runtime is live-verified as Lottie authored-equivalent or a later approved runtime; fallback paths remain truthful and fail closed.
- Entry, ask, answerAccepted, thinking, confident, surprised, recover, reveal are visually distinct in browser screenshots.
- Five answer reactions are perceptibly different within 300–600ms.
- Guess suspense and reveal are staged before the result text dominates.
- Wrong recovery explains candidate removal and asks a discriminating follow-up.
- Final reasons cite user answer evidence, not generic tags alone.
- First guess generally happens within 8–12 questions or explains why it needs more.
- Mobile 360/390/412 and reduced-motion QA pass.
- README/docs/changelog/release/QA evidence are current.
- CI, Pages deploy, live canary, Reviewer, and QA Lead gates pass.

## Evidence index

- PR #21: https://github.com/crimson-joo/food-akinator-hermes-pilot/pull/21
- PR #22: https://github.com/crimson-joo/food-akinator-hermes-pilot/pull/22
- PR #24: Lottie authored-equivalent runtime merged/deployed/live canary PASS on the public URL.
- Live cache-busted canary used for PR #24: public URL with Lottie markers `data-character-runtime="lottie"`, `data-runtime-status="ready"`, `data-lottie-rendered="true"`.
- Local screenshot inspected: `/Users/crimson/.hermes/cache/screenshots/browser_screenshot_0680642bc7d842cd89a97cd013d4e4e9.png`
- Current Graphify outputs: `graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.json`, `graphify-out/graph.html`
