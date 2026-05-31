# Autoplan Kanban — Food Akinator Production Completion Loop

Updated: 2026-06-01
Repo HEAD at synthesis: `6bcef0f` / PR #21
Live URL: https://crimson-joo.github.io/food-akinator-hermes-pilot/
Board: `food-akinator-rebuild`

## Program goal

Bring Food Akinator from a technically deployed character/inference prototype to a production-ready Akinator-like Korean food guessing game, without copying Akinator protected assets, copy, genie silhouette, or exact layout.

## Current verdict

**Not ready for full public production launch.**

Current state is acceptable as a controlled public demo / alpha, but production launch is blocked by:

1. Character runtime is still `css-fallback`, not real Rive/Lottie or equivalent authored motion runtime.
2. User perception is still closer to a polished survey than a character who is actively narrowing the answer.
3. Reveal and wrong-recovery moments work functionally but lack enough dramatic payoff and trust recovery.
4. README/docs/evidence are not fully aligned with the live product state.
5. Visual/perceptual QA evidence and screenshot indexing are not yet production-grade.
6. `app.ts` still carries app shell, character SVG, CSS, timing, and event orchestration in one large file.

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

- Runtime remains `css-fallback`.
- README is stale and still implies app implementation is not present.
- Perceptual QA / screenshot regression is missing.
- App renderer is too monolithic for production asset replacement.

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

### Wave 2 — real production character runtime

5. `ART-RIVE-SPIKE`: Rive/Lottie feasibility spike for Concept A with real state-machine asset contract.
6. `BUILD-RUNTIME`: Implement `rive | lottie | css-fallback` runtime adapter behind `CharacterStage`.
7. `QA-PRODUCTION-GATE`: Full live QA against Akinator-like acceptance criteria.
8. `REVIEW-PRODUCTION-GATE`: Strict production review and release readiness decision.
9. `LIB-RETRO`: Reconcile docs, Graphify, changelog, run artifacts, and reusable lessons.

## Acceptance criteria for production launch

- Character runtime is no longer only `css-fallback`, or the user explicitly accepts fallback as launch quality.
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
- Live cache-busted canary used: https://crimson-joo.github.io/food-akinator-hermes-pilot/?v=1780244268797
- Local screenshot inspected: `/Users/crimson/.hermes/cache/screenshots/browser_screenshot_0680642bc7d842cd89a97cd013d4e4e9.png`
- Current Graphify outputs: `graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.json`, `graphify-out/graph.html`
