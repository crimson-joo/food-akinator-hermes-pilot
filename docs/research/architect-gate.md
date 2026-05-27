# Architect Gate — Food Akinator v0

## Gate 판정

Food Akinator v0는 ML 추천기가 아니라, 작은 음식 도메인에서 투명하게 동작하는 **연속 attribute 기반 추론 엔진 + adaptive question selector + 캐릭터 상태머신**으로 시작한다.

## 핵심 결정

- 엔진: 로컬 우선 TypeScript pure engine
- 데이터: 신규 JSON seed 데이터
- 추론: weighted distance scoring + softmax probability
- 질문 선택: Sprint 1 weighted variance split score
- reveal: top1 confidence + top1-top2 margin + turn cap
- 오답 회복: rejected candidate suppression + disambiguation question
- 캐릭터 연동: 엔진은 cue만 반환, 렌더링은 Rive/Lottie adapter가 담당
- 테스트 순서: data validation → scoring → selector → threshold/recovery → state machine → golden path

## v0 file layout

```txt
data/
  candidates.json
  questions.json
  calibration.json
src/
  domain/
    types.ts
    constants.ts
  data/
    validateCandidates.ts
    validateQuestions.ts
    validateCoverage.ts
  engine/
    answers.ts
    scoring.ts
    probabilities.ts
    selector.ts
    threshold.ts
    recovery.ts
    reducer.ts
    engine.ts
  character/
    cueMapper.ts
    characterTypes.ts
  ui/
    components/
      EntryScreen.tsx
      QuestionCard.tsx
      AnswerButtons.tsx
      CharacterStage.tsx
      GuessScreen.tsx
      RevealScreen.tsx
tests/
  data/
  engine/
  character/
  fixtures/
```

## Data minimums

- active candidate: 50개 이상
- active question: 35개 이상
- candidate당 attribute coverage: 최소 20개, 권장 25개
- 각 후보는 top 유사 후보 3개와 구분 가능한 질문 최소 2개
- prior는 0.7~1.3으로 제한

## Answer semantics

```ts
type AnswerValue = 1 | 0.5 | 0 | -0.5 | -1;
```

- 네: `+1.0`
- 아마도요: `+0.5`
- 모르겠어요: `0.0`
- 아마 아닐걸요: `-0.5`
- 아니요: `-1.0`

## Scoring

```txt
logScore(candidate)
  = log(prior)
  + Σ answeredQuestions contribution(candidate, question, answer)
  + suppressionPenalty
```

```txt
similarity = - ((answerValue - expectedValue)^2) / (2 * sigma^2)
contribution = abs(answerValue) * (1 / cost) * similarity
```

기본값:

- sigma: 0.75
- temperature: 1.0
- prior: 1.0

## Selector

Sprint 1:

```txt
mean(q) = Σ P(c) * expected(c, q)
variance(q) = Σ P(c) * (expected(c, q) - mean(q))^2
coverage(q) = Σ P(c) for candidates with attribute q
baseScore(q) = variance(q) * coverage(q) / cost(q)
```

규칙:

- 이미 물은 질문 제외
- 초반 1~4턴에는 revealRisk >= 2 제외
- unknown 2연속이면 clarity 높은 쉬운 질문 우선
- 같은 axis 3회 연속이면 penalty

## Guess / reveal threshold

Guess 조건:

- top1 >= 0.72 and top1-top2 >= 0.18
- 또는 turn >= 10 and top1 >= 0.55
- 또는 useful questions 없음
- 또는 turn >= 14 hard cap

Reveal은 guess accepted 후에만 발생한다.

## Wrong recovery

오답 시:

- candidate를 rejectedCandidateIds에 추가
- probability를 epsilon clamp
- 같은 후보 재추측 금지
- rejected 후보와 남은 top 후보군을 가장 잘 구분하는 recovery question 선택
- character cue: surprised → recover

## State machine

```txt
entry → asking
asking → answerAccepted → thinking → asking | guessing | gracefulFail
guessing → revealed | recovering
recovering → thinking → asking | guessing | gracefulFail
```

## Character boundary

엔진은 Rive/Lottie를 직접 알지 않는다.

엔진 책임:

- phase
- confidence
- characterCue
- optional animationCue

Adapter 책임:

- Rive input mapping
- Lottie clip selection
- reduced-motion fallback
- asset load fallback

## Test-first build sequence

1. domain type + mini fixtures
2. data validation tests
3. scoring tests
4. adaptive selector tests
5. threshold/guessing tests
6. wrong recovery tests
7. session reducer/state machine tests
8. character cue mapper tests
9. golden path 20개
10. 실제 50 candidates / 35 questions seed
11. UI scaffold

## Builder 금지

- UI부터 만들기 금지
- 기존 데이터 재사용 금지
- 고정 질문 순서 금지
- TOP3 후보판 중심 금지
- 정적 캐릭터 금지
- 오답 후 재시작만 제공 금지
