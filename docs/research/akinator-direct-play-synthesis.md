# Akinator Direct Play Synthesis — Builder Handoff

## 판정

5회 직접 플레이로 v0 설계에 필요한 핵심 패턴은 충분히 확인됐다. 10회 전체를 채우는 것은 고도화 리서치로 남기고, 지금은 synthesis → 구현 계획으로 넘어간다.

확보 로그:

1. Harry Potter — fictional human / western franchise / 14 turns
2. Pikachu — fictional non-human / game+anime franchise / 17 turns
3. Heung-min Son — real sports celebrity / 22 turns
4. Naruto Uzumaki — anime fictional human / 13 turns
5. Elon Musk — real entrepreneur/public figure / 16 turns

## 공통 게임 루프

```txt
entry prompt
→ theme/target framing
→ broad split questions
→ family/domain narrowing
→ sibling candidate elimination
→ signature discriminator
→ suspense/guess
→ yes/no feedback
→ success or recovery
```

Akinator의 핵심은 “좋아하는 것을 묻는 설문”이 아니라 “후보 공간을 줄이는 추리극”이다. 사용자는 답변을 고르는 동안 직접 고른다는 부담보다, 캐릭터가 단서를 읽고 있다는 감각을 받는다.

## 질문 전략 패턴

### 1. Broad split

초반 질문은 정답을 맞히려는 질문이 아니라 큰 공간을 나눈다.

- real vs fictional
- gender / age / alive
- human vs animal/non-human
- medium: anime, game, movie, sports, music, YouTube
- profession/domain: sportsman, singer, actor, billionaire

Food Akinator 적용:

- 지금 필요한 것이 식사/간식/야식/해장/술안주인지
- 뜨거운 것/차가운 것
- 국물/비국물
- 밥/면/빵/떡
- 매운/순한
- 배달/외식/편의점/집밥 느낌

### 2. Family/domain lock-in

중반은 후보군 family를 잡는다.

- Harry Potter: movie → Harry Potter franchise
- Pikachu: animal → game → Pokemon
- Son: sportsman → football → EPL
- Naruto: anime → Naruto franchise
- Elon: billionaire → cars/Tesla

Food Akinator 적용:

- 국밥/찌개/탕/면/분식/구이/치킨/피자/덮밥/중식/일식/디저트 같은 family lock-in
- family가 잡히면 질문은 취향조사보다 sibling elimination으로 전환

### 3. Signature discriminator

후반에는 설명적인 취향보다 “그 음식/캐릭터만의 표식”을 묻는다.

- glasses → Harry Potter
- electricity / Ash / yellow tail → Pikachu
- Korean + Tottenham → Heung-min Son
- orange suit / mother backstory → Naruto
- billionaire + Tesla → Elon Musk

Food Akinator 적용:

- 빨간 국물인가?
- 밥을 말아먹는 그림이 떠오르나?
- 떡/어묵이 핵심인가?
- 철판/불향/고기 굽는 냄새인가?
- 포장마차/분식집/야식 배달 장면인가?
- 치즈/튀김/바삭함 같은 보상감인가?

### 4. Negative answer as active pruning

`No`는 실패가 아니라 강한 단서다. PSG/Manchester/England/Liverpool/Argentina 제거가 손흥민 path를 좁혔고, sports/music/YouTuber/president/actor 제거가 Elon path를 좁혔다.

Food Akinator 적용:

- “국물은 아니야” → 국밥/찌개/탕 후보 강하게 제거
- “매운 건 싫어” → 떡볶이/마라/매운 찌개 후보 제거
- “면은 아냐” → 라면/국수/파스타 후보 제거
- “튀긴 건 부담스러워” → 치킨/돈까스/튀김 후보 제거

### 5. Noise tolerance

직접 플레이에서는 이상한 질문도 섞였다.

- Pikachu path의 One Direction
- Elon path의 challenge videos
- Naruto path의 school/mother 질문

중요한 점은 노이즈가 있어도 게임이 무너지지 않는다는 것이다. 답변 팔레트에 `Don't know / Probably / Probably not`가 있어 애매함을 흡수하고, 다음 고신호 질문으로 회복한다.

Food Akinator 적용:

- 모든 질문이 완벽히 맞을 필요는 없다.
- 하지만 2~3턴 안에 다시 고신호 질문으로 돌아와야 한다.
- QA는 “이상한 질문 1개”보다 “이상한 질문 후 회복 실패”를 더 큰 fail로 본다.

## Designer handoff

### 캐릭터 역할

캐릭터는 장식이 아니라 inference를 의인화한다.

필수 감정/상태:

- idle: 사용자가 마음속 메뉴를 정하게 대기
- ask: 질문을 건넴
- answerAccepted: 답변을 받아 적거나 냄새/단서를 잡음
- thinking: 잠깐 계산/간 보기/메모
- confidence: “좁혀지고 있다”는 감정적 진행감
- guessing: suspense 후 추측
- surprised/recover: 틀렸을 때 인정하고 후보 제거
- reveal: 메뉴 선언/접시 공개

### 진행감 표현

Akinator는 확률 숫자를 거의 보여주지 않는다. 대신 질문이 점점 구체화되면서 confidence가 체감된다.

Food Akinator도 내부 score를 노출하지 말고 아래처럼 표현한다.

- “큰 갈래는 잡혔어요.”
- “후보가 둘로 갈리네요.”
- “이제 냄새가 좀 납니다.”
- “마지막으로 하나만 더 볼게요.”

### Reveal

Reveal은 결과 카드가 아니라 추리의 결말이어야 한다.

필수 요소:

- 메뉴명 1개 선언
- 왜 그렇게 봤는지 2~3개 단서
- 탈락한 큰 후보군 1~2개
- 사용자의 반박 CTA: “아닌데요”
- 즉시 행동 CTA: “근처/배달/레시피”는 v0에서는 외부 DB 없이 placeholder 가능

## Researcher handoff

추가 리서치가 필요하다면 10회 직접 플레이보다 음식 도메인 쪽이 우선이다.

다음 리서치 질문:

- 한국 사용자가 “아무거나”라고 할 때 실제로 더 잘 대답하는 축은 무엇인가?
  - 먹고 싶은 것 vs 먹기 싫은 것
  - 맛 vs 상황 vs 부담감 vs 날씨/시간
- 음식 family별 signature discriminator는 무엇인가?
- 메뉴 후보 50개의 sibling pair는 무엇인가?
  - 김치찌개 vs 된장찌개
  - 순대국밥 vs 돼지국밥
  - 떡볶이 vs 라볶이
  - 치킨 vs 돈까스

## Developer / Architect handoff

### Engine rule updates

v0 engine은 다음 개념을 명시적으로 지원해야 한다.

```ts
type QuestionRole =
  | 'broad_split'
  | 'family_lock'
  | 'sibling_elimination'
  | 'signature_discriminator'
  | 'false_path_guardrail'
  | 'recovery_disambiguation';
```

Question schema에 `role` 또는 equivalent metadata를 추가한다.

```ts
type Question = {
  id: string;
  textKo: string;
  axis: 'taste' | 'ingredient' | 'form' | 'temperature' | 'cuisine' | 'occasion' | 'cooking' | 'texture' | 'context' | 'visual';
  role: QuestionRole;
  clarity: 0 | 1 | 2 | 3;
  revealRisk: 0 | 1 | 2 | 3;
  cost: number;
  animationCue?: string;
  status: 'active' | 'draft' | 'disabled';
};
```

Selector policy:

- turns 1~3: broad_split 우선, high revealRisk 제외
- family confidence가 생기면 family_lock / sibling_elimination 우선
- top candidates가 2~4개로 좁혀지면 signature_discriminator 우선
- reveal 직전 top2가 비슷하면 false_path_guardrail 또는 sibling_elimination
- wrong guess 후에는 recovery_disambiguation 우선

### Reveal threshold adjustment

직접 플레이에서 first guess는 보통 13~22턴이었다. 음식 MVP는 더 짧아야 하지만 5~12턴을 무리하게 고정하면 추리감이 약해질 수 있다.

권장:

- simple/high-signal foods: 6~9턴 reveal
- ambiguous/sibling-heavy foods: 10~14턴 reveal
- hard cap: 14턴 유지
- confidence copy는 5턴 이후부터 점진 표시

## QA handoff

QA는 기능 통과보다 “추리극으로 느껴지는가”를 본다.

### Must-pass scenario tests

1. **Broad split divergence**
   - 같은 시작에서 `국물 yes` vs `국물 no`가 2~3턴 내 다른 질문 path로 갈라져야 함
2. **Family lock-in**
   - 분식/국밥/찌개/면/치킨 중 하나로 좁혀지는 순간이 체감되어야 함
3. **Signature discriminator**
   - reveal 직전 질문은 정답 납득에 직접 기여해야 함
4. **Negative pruning**
   - `아니요` 답변이 후보 제거와 다음 질문에 실제 영향을 줘야 함
5. **Noise recovery**
   - 애매한 질문/unknown 후에도 반복·정체 없이 회복해야 함
6. **Wrong recovery**
   - 틀린 후보를 제외하고, 남은 top 후보를 가르는 질문으로 이어져야 함
7. **Character agency**
   - 캐릭터가 단순 장식이면 fail
8. **Reveal reason quality**
   - 내부 score/attribute 노출이 아니라 사용자가 납득 가능한 단서로 설명해야 함

## Builder gate update

Builder 시작 가능. 단, 첫 production code는 UI가 아니라 테스트/데이터/엔진부터 시작한다.

순서:

1. domain types + fixtures
2. question/candidate validation tests
3. scoring tests
4. selector tests with role-aware question strategy
5. threshold/recovery tests
6. state machine + character cue mapper tests
7. golden path 20 foods
8. then UI scaffold

금지:

- 기존 구현/데이터 재사용
- 설문 폼 UI부터 만들기
- 정적 캐릭터로 “나중에 애니메이션 붙이기”
- TOP3 추천판 중심 결과
- score/probability 그대로 노출
