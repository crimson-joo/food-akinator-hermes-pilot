# Architecture — Zero-to-One

## 원칙

기존 구현 재사용 금지. 작은 도메인에서 투명하게 작동하는 지식베이스 + adaptive scoring engine으로 시작한다.

## Candidate schema

```ts
type Candidate = {
  id: string;
  nameKo: string;
  aliases: string[];
  category: string;
  tags: string[];
  attributes: Record<QuestionId, number>; // -1..1
  prior?: number;
  reveal: {
    oneLiner: string;
    reasonSeeds: string[];
  };
  status: 'active' | 'draft' | 'disabled';
};
```

## Question schema

```ts
type Question = {
  id: string;
  textKo: string;
  axis: 'taste' | 'ingredient' | 'form' | 'temperature' | 'cuisine' | 'occasion' | 'cooking' | 'texture' | 'context' | 'visual';
  role: 'broad_split' | 'family_lock' | 'sibling_elimination' | 'signature_discriminator' | 'false_path_guardrail' | 'recovery_disambiguation';
  clarity: 0 | 1 | 2 | 3;
  revealRisk: 0 | 1 | 2 | 3;
  cost: number;
  animationCue?: string;
  status: 'active' | 'draft' | 'disabled';
};
```

## Answer semantics

- 네: `+1.0`
- 아마도요: `+0.5`
- 모르겠어요: `0.0`
- 아마 아닐걸요: `-0.5`
- 아니요: `-1.0`

## Scoring MVP

- 후보 속성 기대값과 사용자 답변의 거리 기반 점수.
- prior는 0.7~1.3 범위로 제한.
- unknown은 점수를 거의 바꾸지 않되, 같은 질문은 반복하지 않는다.

## Adaptive selector

Sprint 1:

- 현재 후보 확률에서 질문별 weighted variance/split score 계산.
- 이미 물은 질문 제외.
- 1~3턴에는 `broad_split` 우선, revealRisk 높은 직접 질문 제외.
- family confidence가 생기면 `family_lock` / `sibling_elimination` 우선.
- top 후보가 2~4개로 좁혀지면 `signature_discriminator` 우선.
- reveal 직전 top2가 비슷하면 `false_path_guardrail` 또는 sibling elimination.
- unknown이 많으면 clarity 높은 쉬운 질문 우선.

현재 구현:

- `src/engine/selector.ts`는 순수 동기 selector API `rankNextQuestions(context)` / `selectNextQuestion(context)`를 제공한다.
- 입력은 기존 `Candidate`, `Question`, `AnsweredQuestion` shape를 그대로 사용하고, `candidateScores` 주입과 `rejectedCandidateIds`를 선택적으로 받는다.
- active candidate만 softmax-normalize한 뒤 질문별 weighted variance를 split signal로 계산한다.
- 이미 답한 질문, 비활성 질문, 비활성/거절 후보는 제외한다.
- 1~3턴 또는 unknown 직후에는 더 안전한 질문이 있으면 `revealRisk >= 3` 직접 질문을 제외하고, 모두 고위험이면 dead-end 대신 최선 질문을 허용한다.
- selector score는 `split + policyBonus - 0.03 * max(0, cost)`이며, cost는 near-tie에서만 낮은 비용 질문을 고르는 작은 marginal penalty다.
- unknown 직후에는 같은 질문을 반복하지 않고 clarity/recovery 성격의 low-risk 질문으로 회복한다.
- 동점은 원래 질문 배열 순서를 보존한다.

Sprint 3:

- expected information gain으로 고도화.

## Reveal threshold

추측 조건:

- `top1Probability >= 0.72` and `top1 - top2 >= 0.18`
- 또는 `turn >= 10` and `top1Probability >= 0.55`
- 또는 `turn >= 14` hard cap

UI에는 확률 숫자보다 캐릭터 mood/copy로 표시한다.

## Wrong recovery

오답 시:

- guessed candidate를 rejected list에 추가
- 해당 후보 확률 clamp
- rejected 후보와 남은 top 후보를 구분하는 disambiguation question 우선
- 캐릭터 `surprised` → `recover` cue 표시

## Character cue contract

엔진은 모든 응답에 `characterCue`를 포함한다.

- `idle`
- `ask`
- `thinking`
- `confident`
- `surprised`
- `recover`
- `reveal`

현재 session 구현:

- `src/engine/session.ts`는 `startSession()`, `submitAnswer()`, `submitGuessFeedback()` 순수 동기 API를 제공한다.
- session snapshot은 `status`, `characterCue`, `turn`, `currentQuestion`, 고정 5답변 `answerOptions`, `guess`, `rejectedCandidateIds`, `topCandidate`, `copy`, UI action 가능 여부를 포함한다.
- reveal은 기본값 `minRevealTurn: 5`, `confidenceThreshold: 0.72`, `marginThreshold: 0.18`, `softCapTurn: 10`, `softCapConfidence: 0.55`, `hardCapTurn: 14`, `maxUnknownBeforeExhausted: 5`를 사용한다.
- 오답 feedback은 현재 guess candidate를 `rejectedCandidateIds`에 한 번만 추가하고, 같은 후보를 다음 reveal/top candidate에서 제외하며 low-risk `recovery_disambiguation` 질문을 우선한다.
- all-unknown/flat evidence는 내부 점수나 가짜 확신을 노출하지 않고 `exhausted` + `characterCue: exhausted`로 종료한다.
- MVP 엔진 cue는 `ask`, `confident`, `reveal`, `recover`, `exhausted`를 실제 snapshot으로 보장한다. `thinking`/`surprised`의 시간 기반 전환은 UI scaffold presentation layer에서 semantic metadata로 표현한다.

## Builder gate

코드 시작 전 필요한 것:

- data coverage target 확정
- Rive/Lottie/layered pipeline 선택
- golden path 20개 음식 답변 시나리오 정의
- QA가 “설문 폼 + 장식 캐릭터”를 실패로 판정할 수 있는 기준 확정

## Golden path fixture contract

현재 golden path Builder 단계는 bulk catalogue가 아니라 `tests/fixtures/golden-scenarios.ts`의 작은 deterministic acceptance fixture로 고정한다.

- 후보 7개: 김치찌개, 된장찌개, 치킨, 떡볶이, 비빔밥, 라면, 돈까스.
- 질문 14개: broad split, family lock, signature discriminator, false-path guardrail, low-risk recovery question을 포함한다.
- 필수 path coverage: soup/stew, fried/crispy, spicy snack, rice/mixed bowl, noodle/comfort.
- scenario runner는 session API만 사용하며 selector/scoring private helper에 직접 의존하지 않는다.
- 각 path는 answered question 반복 금지, 6~9턴 reveal 또는 graceful exhausted/recovery, 한국어 reason seed 품질을 검증한다.

## Minimal browser UI scaffold

현재 UI scaffold는 Vite entrypoint `index.html`에서 `src/ui/app.ts`를 로드하는 로컬-only browser app이다.

- `renderApp(model)`은 테스트 가능한 pure renderer로, `data-ui-state`, `data-character-cue`, `data-answer-key`, `data-question-id`, `data-guess-candidate-id`, `data-result-candidate-id`, `data-rejected-candidate-ids` QA hook을 출력한다.
- `mountApp(root)`은 presentation transition만 관리한다: answer click → `answerAccepted` → `thinking` → engine `submitAnswer()` 결과를 `asking` 또는 `guessing`으로 매핑한다.
- Engine은 `thinking`/`surprised` timer를 갖지 않는다. UI가 transient state로 suspense와 wrong reaction을 표현한 뒤 session API 결과를 소비한다.
- Demo browser dataset은 `src/ui/app.ts` 안의 작은 active 후보/질문 set이며, canonical golden acceptance fixture(`tests/fixtures/golden-scenarios.ts`)와 bulk catalogue를 대체하지 않는다.
- Production build는 `npm run build`로 `dist/`에 생성되며, `dist/`는 local generated artifact로 gitignore한다.
