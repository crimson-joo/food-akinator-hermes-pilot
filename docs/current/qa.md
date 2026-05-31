# QA — Zero-to-One Acceptance

## 핵심 판정

기능 테스트 통과만으로 완료 금지. 이 제품은 perceptual/product QA가 ship gate다.

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

### Minimal UI scaffold DOM checks

현재 minimal UI scaffold에서 자동/수동으로 확인할 수 있는 DOM 기준:

- Entry: `data-ui-state="entry"`, `data-character-cue="idle"`, headline `오늘 뭐 먹을지 제가 맞혀볼게요.`, CTA `시작하기`.
- Asking: `data-ui-state="asking"`, 질문 하나, `[data-answer-key]` 5개, 버튼 label 순서 고정.
- Answer accepted / Thinking: `data-ui-state="answerAccepted"`와 `data-ui-state="thinking"`이 별도로 나타나며, thinking은 `data-character-cue="thinking"`과 disabled controls를 보여준다.
- Guessing: `data-ui-state="guessing"`, `data-character-cue="confident"`, `혹시… {menu}인가요?`, `맞아요` / `아니에요`.
- Wrong recovery: `data-ui-state="recovering"`, `data-character-cue="surprised"`, `data-rejected-candidate-ids`, `제외됨: {menu}` chip. 이후 recovered asking screen은 engine `recover` cue를 유지한다.
- Reveal: `data-ui-state="revealed"`, `data-character-cue="reveal"`, one menu declaration + 2~3 Korean reason seeds; visible text must not include `score`, `probability`, `top1`, `top3`, `attribute`, `clue:`.
- Reduced motion: CSS includes `@media (prefers-reduced-motion: reduce)` and flow remains usable without large motion.
