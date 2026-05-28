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

## Builder gate

코드 시작 전 필요한 것:

- data coverage target 확정
- Rive/Lottie/layered pipeline 선택
- golden path 20개 음식 답변 시나리오 정의
- QA가 “설문 폼 + 장식 캐릭터”를 실패로 판정할 수 있는 기준 확정
