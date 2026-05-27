# Inference and question narrowing model

## Core claim

Akinator류 시스템은 단순한 고정 이진트리가 아니라, 후보 객체와 질문/속성 기대값을 기반으로 점수를 갱신하고 다음 질문을 선택하는 adaptive inference game에 가깝다.

## Candidate model

각 후보는 질문 또는 latent attribute에 대한 기대 답변 분포를 가진다.

예: 캐릭터 도메인

```ts
type Candidate = {
  id: string;
  name: string;
  priors: number;
  attributes: Record<QuestionId, AnswerExpectation>;
};
```

음식 도메인에서는 후보가 메뉴가 된다.

```ts
type FoodCandidate = {
  id: string;
  nameKo: string;
  category: string[];
  attributes: {
    spicy: number;
    soup: number;
    riceBased: number;
    noodleBased: number;
    meat: number;
    seafood: number;
    fried: number;
    deliveryFriendly: number;
    lateNight: number;
    lightMeal: number;
  };
};
```

## Five answer weights

```ts
type Answer = 'yes' | 'probably' | 'unknown' | 'probablyNot' | 'no';

const answerEvidence = {
  yes: 1.0,
  probably: 0.6,
  unknown: 0.0,
  probablyNot: -0.6,
  no: -1.0,
};
```

- Yes/No는 강한 evidence.
- Probably/Probably not은 soft evidence.
- Unknown은 후보 제거를 거의 하지 않는다.

## Scoring model

MVP는 확률 모델 대신 해석 가능한 weighted scoring으로 시작할 수 있다.

```text
candidateScore += questionWeight * similarity(answerEvidence, candidateExpectedValue)
```

후보별 score를 normalize해서 confidence로 표현한다.

## Question selection

좋은 다음 질문은 남은 후보를 잘 나누는 질문이다.

MVP:
- 이미 물은 질문 제외.
- 상위 후보들이 서로 다르게 반응할 질문 우선.
- 너무 obvious하거나 모든 후보가 같은 값인 질문 제외.
- 초반 broad question, 후반 discriminating question.

Later:
- entropy / information gain 기반 선택.
- expected posterior confidence gain 계산.
- 질문 fatigue/variety penalty.

## Food adaptation

음식은 “정답 맞히기”와 “추천”의 경계에 있다. 이번 제품은 사용자가 내부 태그를 직접 선택하는 추천기가 아니라, 캐릭터가 자연어 질문으로 preference vector를 추론하는 게임이어야 한다.

잘못된 UX:

```text
매운맛 태그를 선택하세요.
국물 태그를 선택하세요.
```

올바른 UX:

```text
오늘은 얼큰하게 땀이 좀 나도 괜찮아요?
숟가락으로 국물을 떠먹고 싶은 쪽이에요?
밥이 같이 있어야 마음이 놓이나요?
```

## Reveal threshold

추측 조건 예시:

- 최소 질문 수 >= 6.
- 1위 후보 confidence >= 0.72.
- 1위와 2위 gap >= 0.15.
- 또는 max questions reached.

## Wrong guess recovery

오답은 실패 화면으로 끝내지 않는다.

1. 방금 후보를 suppressed/excluded 처리.
2. 남은 상위 후보를 기준으로 다음 질문을 고른다.
3. 사용자가 원하면 정답 입력으로 데이터 개선 후보를 남긴다.

## MVP architecture implication

- `data/foods.ts`: 초기 후보 메뉴 DB.
- `data/questions.ts`: 자연어 질문 + target attributes + weight.
- `engine/score.ts`: 답변 evidence와 후보 점수 갱신.
- `engine/selectQuestion.ts`: 다음 질문 선택.
- `engine/reveal.ts`: reveal threshold와 top candidates.
- `state/gameSession.ts`: asked questions, answers, score snapshot, wrong guesses.

## QA scenarios

- 사용자가 5개 답변을 섞어도 세션이 끊기지 않는다.
- unknown 답변은 후보를 과도하게 제거하지 않는다.
- 같은 질문이 반복되지 않는다.
- 초반 질문은 broad, 후반 질문은 narrower.
- wrong guess 후 같은 후보를 다시 바로 제시하지 않는다.
- confidence가 충분하면 reveal로 전환된다.
