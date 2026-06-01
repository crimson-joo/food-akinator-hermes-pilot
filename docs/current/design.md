# Design — Zero-to-One Direction

## 디자인 방향

**살아있는 음식 추리자**

사용자가 설문을 채우는 화면이 아니라, 캐릭터가 앞에서 직접 추리하는 게임 무대처럼 보여야 한다.

## Reference principles from direct play

5회 직접 플레이에서 확인한 핵심 UX:

- 초반은 큰 분기, 중반은 family/domain lock-in, 후반은 signature discriminator로 좁힌다.
- 확률 숫자보다 질문이 구체화되는 체감이 confidence 역할을 한다.
- `No / Probably not / Don't know`가 흐름을 끊지 않고 후보 제거/회복 단서가 된다.
- 틀리거나 애매한 질문이 있어도 캐릭터가 다음 고신호 질문으로 회복하면 경험이 유지된다.
- Reveal은 단순 결과 카드가 아니라 “내가 이렇게 추리했다”는 선언 장면이어야 한다.

## Reference principles from Akinator

- 사용자가 비밀 타깃을 마음속에 정한다.
- 한 화면에는 질문 하나만 나온다.
- 5단계 답변이 고정 리듬으로 반복된다.
- 답변 후 캐릭터가 생각/반응한다.
- 확신이 차면 suspense 후 추측한다.
- 틀리면 실패가 아니라 회복 루프로 이어진다.

## Non-copy boundary

금지:

- 파란 지니, 램프, 마법사/지니 콘셉트 복제
- Akinator 명칭/문구/브랜드/데이터/API 사용
- 동일 화면 배치/색감/포즈/애니메이션 모방

허용:

- 비밀 타깃 추론 게임의 구조적 원리
- 5단계 불확실성 답변 모델
- 캐릭터가 추론을 의인화하는 인터랙션 원리

## Screen/state inventory

1. Entry
   - “오늘 뭐 먹을지 제가 맞혀볼게요.”
   - 사용자는 음식/상태를 마음속에 떠올리고 시작한다.

2. Asking
   - 질문 하나 + 5답변
   - 답변 위치는 안정적이어야 한다.

3. Answer accepted
   - 선택한 답변이 짧게 반응한다.
   - 다음 질문이 즉시 튀어나오지 않는다.

4. Thinking
   - 캐릭터가 답변을 해석하는 짧은 suspense.
   - 300~800ms 권장.

5. Confidence rising
   - “감이 오고 있어요” 등 정량 확률이 아닌 감정적 진행감.

6. Guessing
   - “혹시… 김치찌개인가요?”
   - 맞아요/아니에요로 피드백.

7. Reveal success
   - 캐릭터 축하/선언.
   - 메뉴명, 이유, 탈락 후보, 실행 CTA.

8. Wrong recovery
   - 오답 후보 제거를 시각화.
   - 캐릭터가 인정하고 다시 질문.

9. Graceful fail
   - 여러 번 실패하면 정답 입력/재시작.

## Character requirement

정적 이미지/SVG는 실패다. 최소 조건:

- idle breathing/blinking
- answer reaction
- thinking posture
- confident posture
- wrong/surprised reaction
- recovery posture
- reveal celebration

MVP 권장: Rive state machine. 일정상 어려우면 Lottie clips. 최후 fallback은 layered raster rig이나, crude look이면 QA fail.

## Visual acceptance

실패 기준:

- 메뉴 추천 설문처럼 보임
- 캐릭터가 장식처럼 보임
- 질문/답변만 있는 데모처럼 보임
- 답변 후 반응 없이 다음 질문으로 즉시 넘어감
- reveal이 단순 결과 카드처럼 보임

성공 기준:

- 첫 화면에서 “게임/추리자/내 메뉴를 맞힌다”가 즉시 읽힘
- 캐릭터가 각 상태에서 다른 감정/자세를 보임
- 질문이 진행될수록 긴장감이 쌓임
- 틀렸을 때도 계속하고 싶음

## Current minimal UI scaffold

현재 로컬 browser scaffold는 `index.html` + `src/ui/app.ts`의 Vite 기반 단일 화면 앱이다.

- Entry는 `오늘 뭐 먹을지 제가 맞혀볼게요.`와 `시작하기` CTA로 “마음속 메뉴를 맞히는 게임”임을 먼저 보여준다.
- Asking은 한 화면 한 질문과 고정 5답변(`네`, `아마도요`, `모르겠어요`, `아마 아닐걸요`, `아니요`)만 노출한다.
- Answer accepted와 Thinking은 별도 `data-ui-state`로 렌더링되어, 답변 직후 다음 질문으로 즉시 튀는 설문 폼 회귀를 막는다.
- Guessing은 `혹시… {menu}인가요?`와 `맞아요` / `아니에요`를 먼저 보여주고, Success reveal은 한 메뉴 선언 + 한국어 reason seed만 표시한다.
- Wrong recovery는 `surprised` 반응, `제외됨: {menu}` chip, recovery 질문으로 이어진다.
- 캐릭터 stage는 최종 mascot asset은 아니지만, CSS/DOM procedural host “입맛 탐정 보글”로 국자/메모장/접시/steam/표정이 상태별로 움직이며 `idle`, `ask`, `answerAccepted`, `thinking`, `confident`, `surprised`, `recover`, `reveal` cue가 label뿐 아니라 pose/prop/face와 cue-specific CSS로 구분된다.

## Canonical character/brand direction — 보글 탐정의 작은 식탁

다음 product iteration의 canonical 방향은 **보글 탐정의 작은 식탁**이다. 사용자는 설문지를 작성하는 사람이 아니라, 마음속 메뉴를 떠올리고 작은 음식 탐정 “보글”이 국자와 메모장으로 단서를 모아 맞히는 게임에 참여한다.

### Host identity

- 이름/역할: **입맛 탐정 보글** — 셰프보다는 식탁 탐정. 국자는 포인터, 메모장은 추리 노트, 접시는 reveal stage다.
- 말투: 친근한 존댓말, 과장된 마법 톤 금지, 내부 확률/score 대신 “감이 왔어요”, “후보가 둘로 갈리네요”처럼 단서 기반 진행감 표현.
- 법적/브랜드 경계: Akinator의 지니/파란 마법사/램프/브랜드/문구/포즈/화면 배치 복제 금지. 구조 원리만 사용한다.

### Visual system

- Palette: warm table neutrals `#fff7ea`, `#ffffff`, `#fff1d8`, warm ink `#2b2118`, muted brown `#6f5948`, border `#ead7bd`, gochugaru red CTA `#d9422b`, focus blue `#1d6fd8`.
- Typography: Korean system stack + Pretendard/Apple SD Gothic Neo preference, 800-weight headline/question, 16–18px readable helper text.
- Surfaces: rounded 24–30px cards, pill answer buttons, warm layered shadow, no glassmorphism/generic SaaS gradient.
- Motion: 120–220ms micro reactions, 300–800ms thinking/reveal suspense, subtle idle steam/breathing only; reduced-motion mode preserves state by copy/position/color rather than large transforms.

### State behavior contract

- `idle`: breathing/blink/steam; 사용자가 메뉴를 떠올리는 시간.
- `ask`: 보글이 질문 카드 쪽으로 기울고 국자로 단서를 가리킨다.
- `answerAccepted`: 선택 답변이 잠기고 메모장에 단서가 기록되는 cue가 보인다.
- `thinking`: 메모장/눈/steam 변화로 “추리 중” suspense를 만든다.
- `confident`: guess 직전 몸/접시/국자가 앞으로 오며 확신이 읽힌다.
- `surprised`: 틀린 추측 후 recoil/O-mouth 등 놀람이 즉시 보인다.
- `recover`: 오답 후보를 제외하고 메모장을 다시 펴는 안정된 회복 자세.
- `reveal`: 접시/뚜껑/작은 celebration으로 한 메뉴 선언을 무대화한다.

### QA criteria for this direction

Fail:

- character pose/face/prop는 거의 같고 label/copy만 바뀐다.
- 답변 후 `answerAccepted`/`thinking` 체감 없이 바로 다음 질문으로 이동한다.
- reveal이 일반 결과 카드처럼 보이고 접시 공개/선언감이 없다.
- wrong recovery가 재시작 강요 또는 rejected chip 없이 진행된다.
- mobile에서 answer hit target이 44px 미만이거나 horizontal overflow가 있다.

Pass:

- 첫 화면에서 “보글이 내 메뉴를 맞히는 게임”이 즉시 읽힌다.
- 최소 `idle/ask/answerAccepted/thinking/confident/surprised/recover/reveal`이 서로 다른 자세·소품·표정·카피로 구분된다.
- reduced-motion에서도 상태 의미가 사라지지 않는다.
- 사용자 visible text에는 `score`, `probability`, `top1`, `top3`, `attribute`, `clue:`, raw `q-*` id가 없다.

## Premium Oracle Theater v2 contract

Current public demo verdict: the live app now has an interactive Bogle host, answer-specific reaction hooks, state-specific SVG/CSS acting, and motion metadata from PR #21. This is enough for a controlled demo, but not enough for full production launch: the runtime remains an inline SVG/CSS fallback rather than authored Rive/Lottie/equivalent character animation, and perceptual QA has not approved it against the Akinator-level benchmark.

사용자 피드백상 기존 procedural `bogle-*` mascot foundation은 “저급한 디자인/모션”으로 간주한다. 이후 구현은 단순 색상/그림자 polish가 아니라 새 visual-system 계약을 유지해야 한다.

Required DOM contract:

- `data-visual-system="culinary-oracle-theater-v2"`
- `data-character-tier="premium-oracle-host"`
- `data-motion-system="layered-oracle-rig"`
- rendered path must not include old `hero-stage`, `bogle-figure`, `bogle-hat`, `bogle-face`, `bogle-arm`, `bogle-ladle` foundation.

Required layered rig:

- `oracle-theater` stage with cinematic backdrop and premium warm-table lighting.
- `oracle-host` with aura, particles, shadow, body/head, brows/eyes/mouth, spoon arm, note arm, note card, plate stage, dish glow, lid.
- Motion tokens/keyframes: `--motion-snap`, `--motion-suspense`, `aura-breathe`, `particle-drift`, `note-ink`, `oracle-blink`.

State contract:

| State | silhouette | expression | prop motion | stage tone |
|---|---|---|---|---|
| idle | `soft-idle` | `warm-blink` | `steam-orbit` | `warm-table` |
| ask | `lean-forward` | `curious-focus` | `spoon-point` | `question-spotlight` |
| answerAccepted | `note-capture` | `focused-smile` | `ink-check` | `clue-captured` |
| thinking | `analysis-huddle` | `narrow-thinking` | `steam-spiral` | `suspense` |
| confident | `reveal-ready` | `spark-confidence` | `plate-present` | `golden-reveal` |
| surprised | `recoil-reset` | `oops-open` | `spoon-drop` | `correction` |
| recover | `steady-reframe` | `calm-detective` | `note-reopen` | `recovery-focus` |
| reveal | `celebration-open` | `bright-payoff` | `lid-lift` | `celebration` |

Current limitation: v2 is a high-fidelity CSS/DOM layered rig, not a true Rive/Lottie asset pipeline. User feedback on 2026-05-31 confirms the v2 CSS/procedural host still reads too low-detail and toy-like versus the original Akinator benchmark. The next pass must follow `docs/current/character-art-rig-plan.md`: canonical illustrated source art, production rig-ready layer naming, Rive state-machine preference, Lottie fallback, and CSS only as a contract-preserving fallback.

## Interactive Character Animation v3 contract

사용자가 답을 누를 때마다 캐릭터의 관절/표정/소품/피드백 카피가 즉시 반응해야 한다. 단순히 다음 질문으로 넘어가는 것은 실패다.

Required interaction contract:

- 최소 10개 이상의 named animations and 10개 이상의 named expressions를 DOM contract로 노출한다.
- `oracle-host`는 `data-joint-rig="shoulder-elbow-wrist"`를 가진다.
- visible joint anchors: left/right `shoulder`, `elbow`, `wrist` 총 6개.
- `answerAccepted` 상태는 최소 700ms 유지되어 사용자가 반응을 인지할 수 있어야 한다.
- `thinking` 상태는 짧은 suspense 이후 다음 질문으로 이어지며, “단서들을 다시 섞어보는 중이에요.” 같은 진행 피드백을 보여준다.

Required answer reactions:

| Answer | sentiment | motion | expression | visible copy |
|---|---|---|---|---|
| yes | `positive` | `approve-nod` | `soft-smile` | `좋아요, 방향이 꽤 선명해졌어요.` |
| probably | `soft-positive` | `maybe-tilt` | `maybe-smirk` | `아마도군요. 그쪽 후보를 살짝 올려볼게요.` |
| unknown | `uncertain` | `puzzled-shrug` | `puzzled-open` | `모르겠으면 괜찮아요. 애매한 단서는 잠시 보류할게요.` |
| probably_not | `soft-negative` | `narrow-away` | `skeptical-narrow` | `아마 아니군요. 그 후보군은 조금 낮춰볼게요.` |
| no | `negative` | `prune-swipe` | `decisive-prune` | `아니군요. 그 길은 과감히 지워둘게요.` |

Required animation catalog:

`idle-breath`, `blink-gaze`, `spoon-point`, `approve-nod`, `maybe-tilt`, `puzzled-shrug`, `narrow-away`, `prune-swipe`, `thinking-scan`, `confidence-rise`, `oops-recoil`, `recovery-reset`, `lid-reveal`.

Required expression catalog:

`warm-blink`, `curious-focus`, `focused-smile`, `soft-smile`, `maybe-smirk`, `puzzled-open`, `skeptical-narrow`, `decisive-prune`, `narrow-thinking`, `spark-confidence`, `oops-open`, `calm-detective`, `bright-payoff`.

## Visual QA follow-up contract — mobile stage + wrong recovery

Source evidence: `.hermes/runs/t_2c0c169f/screenshots/mobile-360-asking.png`, `.hermes/runs/t_2c0c169f/screenshots/mobile-390-asking.png`, `.hermes/runs/t_2c0c169f/screenshots/mobile-412-asking.png`, `.hermes/runs/t_2c0c169f/screenshots/desktop-05-wrong-recovery.png`.

### Mobile character stage composition

At 360/390/412px mobile widths, the character stage must preserve Bogle as a centered host while keeping every prop visually inside the rounded stage. The current issue is visual composition, not page overflow: the 360px asking screenshot has no horizontal overflow, but the spoon bowl appears pressed against/cut by the right stage edge.

Required acceptance:

- Spoon, notebook, steam, plate, shadow, and aura remain fully visible inside `data-testid="character-stage"`.
- Spoon bowl must have visible right-edge breathing room: at least 16px at 360px, 20px at 390px, and 24px at 412px.
- Do not solve by removing the spoon, cutting the prop, or introducing horizontal page overflow.
- Preferred correction: rebalance mobile safe-area by slightly reducing host scale and/or rotating/shifting the `ask` spoon pose inward while keeping the stage visually full.

### Wrong recovery 3-beat staging

Wrong recovery must read as a short acted sequence, not a single apology card. Keep Bogle's detective-oracle identity; do not copy Akinator character assets, pose language, copy, or brand identity.

Required sequence inside `data-ui-state="recovering"`:

1. **Surprise** — `data-recovery-beat="surprise"`, `data-character-cue="surprised"`, oops/recoil acting, headline admission such as `앗, 제가 너무 성급했네요.`; next question is not yet visually primary.
2. **Candidate removal** — `data-recovery-beat="remove"`, stable rejected-list/chip hooks, the rejected candidate is visibly crossed off/swept/marked as removed, with copy such as `그 메뉴는 후보에서 뺄게요.`
3. **Refocus** — `data-recovery-beat="refocus"`, `data-character-cue="recover"`, calm notebook/reframe pose, next recovery question and exactly five answer controls visible.

Reduced-motion mode may shorten transitions, but the three semantic beats must remain observable through DOM state, copy, and chip treatment.

## Production UX/motion spec — Akinator-like reasoning, reveal, recovery

Source handoff: `.hermes/runs/t_983596ae/production-ux-motion-spec.md`.

Canonical direction: **작은 식탁 추리극**. Bogle is not decorative mascot chrome; Bogle is the persistent detective-oracle host who receives every answer, records it in the notebook, prunes paths with the spoon, builds tension through the covered plate, and repairs wrong guesses through a visible recovery sequence.

### Reference principles extracted

- Use Akinator-like structure only: secret target, one-question rhythm, five-answer loop, character-as-inference-engine, confidence tension, staged guess, wrong recovery.
- Do not copy Akinator protected identity: no genie/magic-lamp/blue wizard silhouette, exact pose language, exact layout, brand, copy, data, or API.
- Borrow visual principles, not brand identity: Airbnb-like warm tactility, Notion-like warm-paper clarity, and PostHog-like personality/handmade detail. Keep Food Akinator original through Korean table, Bogle, notebook, spoon, covered plate, and warm food palette.

### Answer micro-reactions

Every answer click must show an immediate “Bogle heard me” acknowledgement before the next question appears.

- First visible reaction: <=150ms after click/tap.
- `answerAccepted` hold: minimum 400ms, target 600–750ms.
- Required hooks: `data-ui-state="answerAccepted"`, `data-answer-reaction`, `data-answer-sentiment`, `data-reaction-motion`.
- Add/keep a testable cut-in hook in the next Builder pass if missing: `data-snap="answer-accepted"` or `data-pulse="answer-accepted"`.
- Selected answer remains locked; other answers disabled; Bogle expression/prop/surface copy all react together.

| Answer | Sentiment | Required motion | Copy rule |
|---|---|---|---|
| `yes` | positive | approve nod / notebook check | clue sharpened direction |
| `probably` | soft-positive | tilted nod / maybe-smirk | raise branch softly without overclaiming |
| `unknown` | uncertain | puzzled shrug | reassure ambiguity is safe and clue is parked |
| `probably_not` | soft-negative | skeptical narrow / branch lowered | reduce candidate family gently |
| `no` | negative | decisive spoon prune | visibly cut off that path |

### Reasoning bridges

`thinking` must explain that the prior answer changed the investigation, not merely show delay.

- Required hooks: `data-ui-state="thinking"`, `data-character-cue="thinking"`, `aria-busy="true"` or equivalent busy state on the changing panel.
- Thinking duration: 450–900ms; avoid long fake waiting.
- Copy must be role/path-aware and avoid repeated generic lines.
- Never expose raw `q-*`, `score`, `probability`, `attribute`, `top1`, or `top3`.

Recommended bridge templates:

- Broad split: `큰 갈래가 하나 잡혔어요. 이제 {axisKo} 쪽으로 더 좁혀볼게요.`
- Family lock: `{familyKo} 쪽 단서가 이어져요. 비슷한 후보끼리 갈라볼게요.`
- Sibling elimination: `비슷한 후보가 남았어요. 차이가 잘 나는 단서로 확인할게요.`
- Signature discriminator: `거의 왔어요. 마지막으로 결정적인 특징만 볼게요.`
- False-path guardrail: `성급하게 맞히기 전에, 틀리기 쉬운 길부터 한 번 막아볼게요.`
- Recovery disambiguation: `방금 지운 후보와 남은 후보를 가르는 질문으로 돌아갈게요.`
- Unknown-heavy recovery: `애매한 단서는 보류했어요. 더 쉬운 단서로 다시 잡아볼게요.`

If data is not yet available for exact `{axisKo}` / `{familyKo}`, use role-based safe templates rather than inventing factual claims.

### Progress tension states

Replace the repeated `큰 갈래는 잡혔어요 / 후보가 둘로 갈리네요 / 감이 왔어요` loop with named tension stages. Visual intensity should rise through notebook, steam, plate, light, and chip treatment — not through numerical probability.

| Stage | Suggested trigger | Visible label | Bogle posture |
|---|---|---|---|
| `orienting` | turn 1–2 | `큰 갈래 탐색` | curious ask, low steam |
| `narrowing` | turn 3–5 or family signal | `후보군 좁히는 중` | notebook check, dots 2–3 |
| `fork` | top candidates close | `두 갈래 접전` | split spotlight / two chips |
| `guardrail` | reveal risk before guess | `성급함 방지` | spoon blocks false path |
| `lock` | threshold near reveal | `접시가 열리기 직전` | plate forward, golden rim |
| `recovery` | wrong/unknown-heavy | `다시 정리 중` | calm notebook reopen |

Acceptance: progress copy should not repeat the same phrase more than two consecutive turns.

### Guess suspense and reveal sequence

Guessing must be a theatrical pre-reveal step, not a result card.

- `guessing`: `data-ui-state="guessing"`, `data-character-cue="confident"`; Bogle holds covered plate forward; copy shape `혹시… {candidateName}인가요?`; actions `맞아요` / `아니에요`.
- Reveal sequence:
  1. Hold 150–250ms with plate/lid suspense.
  2. Lid lift/payoff 450–900ms with `data-character-cue="reveal"`.
  3. Declaration: `오늘은 {candidateName} 쪽이에요.`
  4. Reasoning receipt: 2–3 reasons tied to user-visible answer evidence where available.
  5. Actions: restart and not-right recovery.

Final reason copy rules:

- Prefer `“{questionSummary}” 쪽 단서가 있어서 {candidateTrait} 후보가 강해졌어요.`
- If exact answer evidence is unavailable, use softer seed-based copy: `{reasonSeed} 단서가 지금 흐름과 잘 맞았어요.`
- Say `오늘 단서는 X 쪽이에요`, not `당신은 X를 좋아해요`, unless the user explicitly provided preference data.
- Do not show internal scoring/probability/question IDs.

### Wrong recovery drama

Wrong guesses must become trust repair, not a restart prompt.

Required sequence inside `data-ui-state="recovering"`:

1. Surprise — `data-recovery-beat="surprise"`, `data-character-cue="surprised"`, 350–650ms, oops/recoil/spoon-drop, copy `앗, 제가 너무 성급했네요.`, next question not primary.
2. Candidate removal — `data-recovery-beat="remove"`, 450–700ms, stable rejected candidate chip/list, visible crossed-off/swept treatment, copy `그 메뉴는 후보에서 뺄게요.`
3. Refocus — `data-recovery-beat="refocus"`, `data-character-cue="recover"`, five answer controls visible with recovery question, copy `다시 단서를 좁혀볼게요.`

The rejected candidate must remain visible through refocus.

### Mobile and reduced-motion acceptance

Mobile 360/390/412:

- No horizontal overflow.
- Bogle remains centered; spoon, notebook, plate, steam, and aura stay fully inside `data-testid="character-stage"`.
- Keep current safe-area target: spoon bowl right breathing room >=16px at 360, >=20px at 390, >=24px at 412.
- Answer controls remain >=44px hit height, preferred >=48px.
- Recovery chip list wraps without covering the recovery question.

Reduced motion:

- All state changes remain observable through DOM hooks, copy, pose, chip treatment, light/color, and selected answer state.
- Disable/collapse large transforms, looping particles, and repeated spark/steam animations.
- Preserve answerAccepted → thinking, reveal, and surprise → remove → refocus semantic order.

### Builder/QA acceptance

Builder must implement against observable hooks, not vague polish:

- `data-progress-stage="orienting|narrowing|fork|guardrail|lock|recovery"` exists when progress is shown.
- Answer acknowledgement has `data-snap="answer-accepted"` or `data-pulse="answer-accepted"` once the next pass adds the cut-in layer.
- `aria-live="polite"` covers bridge/recovery/reveal status copy.
- `aria-busy="true"` or equivalent busy state covers answer processing.
- Browser QA captures entry, asking, five answer reactions, thinking bridge, at least three progress stages, guess suspense, reveal, wrong recovery beats, mobile 360/390/412, and reduced-motion recovery/reveal.
- Pass only if the flow reads as a character-led deduction performance, not a survey with a mascot.
