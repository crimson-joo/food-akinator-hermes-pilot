# QA — Zero-to-One Acceptance

## 핵심 판정

기능 테스트 통과만으로 완료 금지. 이 제품은 perceptual/product QA가 ship gate다.

현재 판정: Wave4 local/review gate 기준으로 representative simulation full-launch candidate threshold는 PASS다. PR #24는 public URL에서 Lottie authored-equivalent runtime을 검증했고, PR #25는 deployed live probe에서 desktop/mobile 360/390/412/reduced-motion, answerAccepted dedicated beat, wrong recovery surprise → remove → refocus, answer-trace reveal, console/page error 0을 검증했다. Wave3는 first-guess turn budget, answer-aware branch entropy, prefix diversity를 개선했고, Wave4는 stable hidden target 기반 rejected-guess recovery success를 full-launch threshold까지 끌어올렸다. Full public production launch 판정은 release/live/perceptual/operator closeout 완료 후에만 선언한다.

현재 threshold/golden UI pilot의 자동화/live smoke QA gate는 PASS다. 검증 범위는 `npm test`, `npm run typecheck`, `npm run build`, focused CLI golden acceptance probe, Vite browser flow(entry → asking → answerAccepted/thinking → guessing → wrong recovery → reveal), console/assets/layout desktop check, GitHub Pages live canary, Pixel 7 크기 mobile viewport smoke를 포함한다. Release automation bootstrap 이후 PR/deploy gate는 Playwright e2e와 post-deploy scripted canary를 포함한다. Perceptual polish와 최종 mascot/brand는 아직 별도 product/design gate로 남아 있다.

## Product acceptance

Pass 조건:

- 사용자가 마음속 메뉴/상태를 떠올리고 시작한다.
- 한 화면에는 질문 하나만 나온다.
- 5답변 의미가 안정적으로 유지된다.
- 질문 순서가 답변에 따라 달라진다.
- 5~12턴 사이에 대다수 대표 메뉴를 추측한다.
- reveal 전에 suspense/guessing 상태가 있다.
- 틀렸을 때 오답 후보를 제외하고 회복 질문으로 이어진다.
- 캐릭터가 최소 7상태로 눈에 띄게 반응한다.
- 결과는 “추천 리스트”가 아니라 “선언 + 이유 + 반박”이다.

Fail 조건:

- 설문 폼처럼 보임
- 캐릭터가 정적/장식임
- 고정 질문 순서임
- 메뉴 후보 TOP3만 보여줌
- 오답 후 재시작만 강요함
- 이유가 `clue: yes` 같은 내부값 노출임
- 기존 실패 UI/데이터/구조가 남아 있음

## Direct-play derived QA

5회 직접 플레이 synthesis에서 추가된 must-pass:

- Broad split divergence: 같은 시작이라도 핵심 답변이 다르면 2~3턴 내 질문 path가 달라진다.
- Family lock-in: 국밥/찌개/분식/면/치킨 등 후보 family로 좁혀지는 순간이 체감된다.
- Signature discriminator: reveal 직전 질문은 정답 납득에 직접 기여한다.
- Negative pruning: `아니요`가 실제 후보 제거와 다음 질문 선택에 영향을 준다.
- Noise recovery: 애매한 질문/unknown 후에도 반복 없이 고신호 질문으로 돌아온다.
- Character agency: 캐릭터가 추론을 하는 주체로 느껴진다.
- Reveal reason quality: 내부 score가 아니라 사용자가 이해할 단서로 설명한다.

## Data tests

- active candidate 50개 이상 ✅ canonical `foodKnowledgeBase` v1: 50개
- active question 35개 이상 ✅ canonical `foodKnowledgeBase` v1: 42개
- 각 후보는 최소 20개 질문 attribute coverage ✅ non-neutral active attribute 기준 자동 검증
- 각 질문은 yes/no 양쪽 후보를 충분히 가름 ✅ active question split quality 자동 검증
- 모든 attribute는 `-1 <= value <= 1`
- reveal copy/reason seed는 내부 score/probability/question id를 노출하지 않는다.

## Engine tests

- strong answer는 ranking을 크게 바꿈
- probably는 yes/no보다 약하게 반영됨
- unknown은 ranking을 왜곡하지 않고 질문 반복을 막음
- selector는 이미 물은 질문을 제외함
- selector는 high-split 질문을 우선함
- selector는 동일/유사 split에서 낮은 marginal cost 질문을 고르되, 충분히 높은 split 신호는 낮은 cost를 이길 수 있음
- selector는 초반에 낮은 risk 대안이 있으면 high reveal-risk 직접 질문을 피함
- selector는 unknown 직후 같은 질문을 반복하지 않고 clarity 높은 available question으로 회복함
- selector scenario pilot은 `국물 yes`와 `국물 no` path가 2턴 내 다른 질문으로 갈라지는지 검증함
- reveal은 confidence와 margin을 모두 요구함
- wrong guess suppression이 같은 후보 재추측을 막음
- recovery는 오답 후보와 남은 후보를 구분하는 질문을 고름
- all-unknown path도 무한루프 없이 graceful 종료

## Golden scenario tests

현재 golden scenario fixture는 bulk catalogue가 아니라 7개 후보 / 14개 질문의 작은 acceptance set으로 유지한다.

- 필수 coverage: soup/stew, fried/crispy, spicy snack, rice/mixed bowl, noodle/comfort.
- 각 reveal path는 질문 반복 없이 5개 이상 질문을 거치고 6~9턴 안에 기대 후보를 reveal한다.
- soup/stew와 fried/crispy는 같은 시작 질문 이후 2~3턴 안에 질문 path가 갈라져야 한다.
- reveal reason은 `reasonSeeds` 기반 한국어 단서여야 하며 내부 score/probability/question id를 노출하지 않는다.
- wrong guess path는 거절 후보를 suppression하고 low-risk `recovery_disambiguation` 질문으로 회복한다.
- all-unknown path는 반복 질문이나 fake reveal 없이 `exhausted`로 종료한다.

## Quantitative Playwright gate

PR/deploy gate에서 자동 확인하는 기준:

- Entry: `data-ui-state="entry"`, character idle, headline/CTA visible.
- Asking: one question card, exactly five `[data-answer-key]` controls.
- Transition: answer click 후 `answerAccepted`/`thinking`을 거쳐 다음 state로 진행.
- Wrong recovery: tentative guess reject 후 `recovering`, rejected candidate marker, recovery asking flow.
- Reveal: confirmed guess 후 `data-ui-state="revealed"`, `data-character-cue="reveal"`, reason copy visible.
- Trust boundary: visible text에 `score`, `probability`, `top1`, `top3`, `attribute`, `clue:`, raw `q-*` id 노출 없음.
- Mobile smoke: Pixel-sized viewport에서 horizontal overflow 없음, answer controls usable.
- Browser health: page console error/pageerror 없음.

## Browser QA

필수 캡처:

1. Entry — 캐릭터/목표/CTA가 보이는 첫 화면
2. Adaptive branch — 서로 다른 답변 path에서 다른 2~3번째 질문
3. Thinking/suspense — 답변 후 전환 상태
4. Guessing — 후보명 공개 직전 또는 tentative guess
5. Wrong recovery — 오답 후보 제거와 회복 질문
6. Success reveal — 메뉴 선언/이유/CTA

## Live canary

배포 후 canonical URL + cache-busted URL에서 확인:

- console errors 없음
- public assets 정상 로드
- horizontal overflow 없음
- animation/reduced-motion fallback 확인
- old implementation markers absence 확인
- acceptance flow 1회 이상 실제 플레이

Recent evidence references:

- PR #21 live/demo evidence: Bogle motion state machine, production layer sheet hooks, main CI, Pages deploy, scripted canary, browser DOM/console smoke.
- PR #22 evidence: production completion autoplan and explicit production-blocked verdict in `docs/current/autoplan-kanban.md`.
- PR #24 evidence: live Lottie canary verified public URL runtime markers (`lottie`, `ready`, rendered asset, 8/8 distinct fingerprints) with CI/deploy success.
- PR #25 evidence: production-feel wave passed local QA and deployed live canary. Evidence includes PR CI, main CI, Pages deploy, workflow canary/live e2e 8/8, webhook delivery, and independent cache-busted live probe with desktop/mobile 360/390/412/reduced-motion, answerAccepted dedicated beat, wrong recovery surprise → remove → refocus, answer-trace reveal, and zero console/page errors.
- PR #27 evidence: representative simulation quality gate passed local QA/review/release and deployed live canary. Evidence includes 32-case report, focused simulation test, full `npm test` 13 files / 100 tests, typecheck, build, local e2e 8/8, PR CI, main CI, Pages deploy, deployed canary, and independent live Playwright 8/8.
- `t_2c0c169f` live baseline browser/perceptual QA evidence: `.hermes/runs/t_2c0c169f/qa-baseline-report.md` and `.hermes/runs/t_2c0c169f/browser-qa-evidence.json`.

## Production-feel wave QA gate — 2026-06-01

PR #25 resolved the scoped production-feel blockers from the previous baseline for controlled demo/alpha:

- Local QA evidence: `.hermes/runs/t_4dade37a/qa-prod-feel-gate-report.md`.
- Release/live evidence: `.hermes/runs/t_d4d6b5dd/orchestrator-release-recovery/release-closeout.md` and `.hermes/runs/t_d4d6b5dd/orchestrator-release-recovery/live-probe/`.
- Automated gates: `npm test` 13 files / 97 tests, `npm run typecheck`, `npm run build`, `npm run test:e2e` 8/8, PR CI, main CI, Pages deploy, live Playwright e2e 8/8, deployed production-feel probe overall PASS.
- Browser/perceptual checks: desktop, mobile 360/390/412, and reduced-motion all passed with console/page errors 0, no horizontal overflow, all answer controls first viewport, answerAccepted dedicated beat, wrong recovery three beats, and answer-trace reveal rationale.

Full public production launch is still not declared from this QA note alone. Wave4 local evidence now passes first-guess turn budget, answer-aware early branch entropy, prefix diversity, rationale coverage, and stable-target rejected-guess recovery success. Remaining launch gates are PR/release/deploy, live browser/canary, perceptual QA, docs closeout, and explicit operator approval.

## Baseline browser/perceptual QA gate — 2026-06-01

Current live controlled demo/alpha smoke is PASS, but full public production launch remains BLOCKED.

Validated against `https://crimson-joo.github.io/food-akinator-hermes-pilot/` with cache-busted QA URLs:

- Live Playwright e2e: desktop/mobile entry → answering → wrong recovery → reveal passed with no console errors.
- Post-deploy canary: `html-200`, module asset reachable, required markers present, old markers absent.
- Screenshot evidence captured entry, asking, answerAccepted, thinking, guessing, wrong recovery, recovered asking, reveal, five answer reactions, 360/390/412 mobile entry/asking, and reduced-motion entry/asking/answerAccepted.
- Mobile horizontal overflow was 0px at 360/390/412 entry and asking.
- Forbidden visible internals (`score`, `probability`, `top1`, `top3`, `attribute`, `clue:`, raw `q-*`) were not observed.

Production-blocking observations after PR #24 live Lottie, with PR #25 status:

- Lottie authored-equivalent runtime is live-verified on the public URL, so the prior deploy/runtime-readiness blocker is cleared for the controlled demo.
- The CSS fallback remains required as a fail-closed path for missing/malformed authored assets; production QA must continue checking truthful `failed`/`fallback` metadata paths.
- PR #25 improves proof that Bogle actively reasons by adding answer-trace reveal rationale, dedicated answerAccepted beat, and three-beat wrong recovery; these are now controlled-demo/live-canary PASS.
- Remaining full-launch proof after Wave4 is narrowed to reviewer/release/live/perceptual validation on the shipped artifact and final operator approval.

### Minimal UI scaffold DOM checks

현재 minimal UI scaffold에서 자동/수동으로 확인할 수 있는 DOM 기준:

- Entry: `data-ui-state="entry"`, `data-character-cue="idle"`, headline `오늘 뭐 먹을지 제가 맞혀볼게요.`, CTA `시작하기`.
- Asking: `data-ui-state="asking"`, 질문 하나, `[data-answer-key]` 5개, 버튼 label 순서 고정.
- Answer accepted / Thinking: `data-ui-state="answerAccepted"`와 `data-ui-state="thinking"`이 별도로 나타나며, thinking은 `data-character-cue="thinking"`과 disabled controls를 보여준다.
- Guessing: `data-ui-state="guessing"`, `data-character-cue="confident"`, `혹시… {menu}인가요?`, `맞아요` / `아니에요`.
- Wrong recovery: `data-ui-state="recovering"`, `data-character-cue="surprised"`, `data-rejected-candidate-ids`, `제외됨: {menu}` chip. 이후 recovered asking screen은 engine `recover` cue를 유지한다.
- Reveal: `data-ui-state="revealed"`, `data-character-cue="reveal"`, one menu declaration + 2~3 Korean reason seeds; visible text must not include `score`, `probability`, `top1`, `top3`, `attribute`, `clue:`.
- Reduced motion: CSS includes `@media (prefers-reduced-motion: reduce)` and flow remains usable without large motion.

### Visual QA follow-up acceptance — mobile stage + wrong recovery

Builder/QA must add visual/DOM evidence for the two P1 perceptual issues from `t_2c0c169f` before the next production QA pass.

Mobile asking stage:

- Capture 360/390/412px asking screenshots.
- Horizontal overflow remains 0px.
- Bogle's spoon bowl is fully inside `data-testid="character-stage"` and keeps right-edge safe area: 16px at 360, 20px at 390, 24px at 412.
- Answer controls remain usable with at least 44px hit height.

Wrong recovery staging:

- Rejecting a tentative guess exposes three observable beats in order inside `data-ui-state="recovering"`: `data-recovery-beat="surprise"`, then `remove`, then `refocus`.
- Surprise beat uses `data-character-cue="surprised"` and admission copy; next question is not yet primary.
- Remove beat exposes stable rejected-candidate list/chip hooks and a visible removed/crossed-off treatment.
- Refocus beat uses `data-character-cue="recover"`, keeps rejected candidate context, and shows exactly five answer controls for the recovery question.
- Reduced-motion mode preserves the three semantic beats through DOM/copy/chip treatment even if large transforms are disabled.
