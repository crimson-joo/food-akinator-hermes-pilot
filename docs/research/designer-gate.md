# Designer Gate — Food Akinator Zero-to-One

## Gate 목적

Akinator 원리를 복제하지 않고, Food Akinator만의 살아있는 음식 추리 경험을 구현 가능한 수준으로 정의한다.

## 추천 캐릭터 방향

🔶 **보글 셰프 + 탐정 성격의 하이브리드**

작은 셰프가 탐정처럼 입맛 단서를 읽는다. 마법/지니가 아니라 냄새 맡기, 간 보기, 불 조절, 메모하기, 접시 공개 같은 음식 고유 행동으로 추론을 의인화한다.

## 후보 비교

### A. 입맛 탐정 “맛정이”

- 장점: 추리 게임 구조가 즉시 읽힘
- 리스크: 탐정 클리셰가 강함

### B. 보글 셰프

- 장점: 음식 도메인과 즉시 연결, 모션 cue 풍부
- 리스크: 일반 요리앱 캐릭터처럼 보일 수 있음

### C. 입맛 레이더 “냠테나”

- 장점: 독자 IP 가능성 높음
- 리스크: 음식과 연결이 약하면 추상적

## 최종 추천

**“오늘의 입맛 탐정 보글”**

- 따뜻하지만 리드하는 톤
- 틀리면 바로 인정하고 회복
- 결정 책임을 가져가는 캐릭터
- Akinator의 추론 구조를 음식 행동으로 번역

## Screen states

1. Entry
2. Asking
3. Answer accepted
4. Thinking
5. Confidence rising
6. Guessing
7. Reveal success
8. Wrong recovery
9. Graceful fail

## 5-answer rhythm

고정 순서:

1. 네 — `+1`
2. 아마도요 — `+0.5`
3. 모르겠어요 — `0`
4. 아마 아닐걸요 — `-0.5`
5. 아니요 — `-1`

답변 후 즉시 다음 질문 금지:

- 선택 반응: 150~250ms
- thinking: 300~800ms
- guess suspense: 900~1400ms

## Character motion spec

MVP 1순위: Rive state machine

필수 상태:

- idle
- ask
- thinking
- confident
- surprised
- recover
- reveal

Fallback:

- Lottie clips
- 최후 fallback layered raster rig
- 정적 SVG/PNG는 QA fail

## Microcopy 원칙

- “추천해드릴게요” 금지
- “제가 맞혀볼게요” 사용
- 내부 확률/score 노출 금지
- 틀렸을 때 사용자를 탓하지 않음

예시:

- “오늘 뭐 먹을지 제가 맞혀볼게요.”
- “흠… 후보가 갈리네요.”
- “두세 개로 좁혀졌어요.”
- “혹시… 김치찌개인가요?”
- “앗, 제가 너무 성급했네요. 그 메뉴는 빼고 다시 볼게요.”

## Visual acceptance

Pass:

- 첫 화면에서 게임/캐릭터/메뉴 맞히기가 즉시 읽힘
- 캐릭터가 상태별로 다르게 반응
- 답변 후 thinking/suspense가 있음
- reveal이 선언 장면처럼 보임
- 오답 후 회복 루프가 자연스럽게 보임

Fail:

- 설문 폼처럼 보임
- 캐릭터가 장식임
- 결과가 Top 3 추천 카드임
- 기존 구현 흔적이 남음
- Akinator 지니/마법/램프/색감/포즈를 연상시킴

## Builder handoff

Builder는 다음 UI state와 character cue contract를 먼저 구현 기준으로 삼는다.

```ts
type CharacterCue =
  | 'idle'
  | 'ask'
  | 'thinking'
  | 'confident'
  | 'surprised'
  | 'recover'
  | 'reveal';
```

필수 QA 캡처:

1. Entry
2. Asking
3. Answer accepted + thinking
4. Confidence rising
5. Guessing
6. Wrong recovery
7. Success reveal
8. Reduced motion fallback
