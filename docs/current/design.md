# Design direction — restart baseline

## Direction name

**Korean food oracle game, not recommendation form**

## Design stance

이전 실패를 반복하지 않기 위해 production UI는 아직 만들지 않는다. 먼저 캐릭터 원화/리깅 방식, 질문 게임 루프, reveal drama를 정의한 뒤 빌드한다.

## Visual non-negotiables

- 기존 Akinator 지니/램프/터번/푸른 피부/수염/손짓 복제 금지.
- CSS 도형 캐릭터 금지.
- 구현 편의를 위해 캐릭터 품질을 희생하지 않는다.
- 캐릭터는 최소 7개 상태와 idle loop가 있어야 한다.
- 최종 앱은 “질문 폼”이 아니라 “캐릭터와 플레이하는 게임”으로 보여야 한다.

## Candidate character concepts to explore

최종 선택 전 Designer/Researcher가 비교해야 한다.

1. **미식 탐정** — 추리 게임감이 강함. 돋보기/노트/증거판 metaphor.
2. **점쟁이 셰프** — 음식과 예언/추측의 연결이 자연스러움.
3. **냉장고 요정** — 귀엽고 한국 배달/집밥 상황에 맞음.
4. **숟가락 탐정** — 독자적 실루엣 가능. 너무 유아틱해질 위험.
5. **한복 미식 오라클** — 한국성은 강하지만 지니/오라클과 겹치면 모방 위험.

🔶 추천 후보: **미식 탐정 + 살짝 신비한 셰프**. Akinator의 “마음 읽는 지니”를 직접 빌리지 않고도 추리/게임/음식 맥락을 모두 살릴 수 있다.

## Required states

- Entry / secret target prompt
- Idle / waiting
- Asking
- Answer accepted
- Thinking
- Confidence rising
- Guess anticipation
- Reveal
- Correct
- Wrong / recovery
- Restart

## QA acceptance draft

- 첫 화면에서 사용자가 “내가/상대가 생각한 음식을 앱이 맞힌다”를 5초 안에 이해한다.
- 한 화면에 질문 하나와 5지 답변만 보인다.
- 답변 클릭 후 캐릭터 상태가 즉시 바뀐다.
- 6~12문항 안에 reveal이 발생한다.
- wrong guess 후 recovery loop가 이어진다.
- 모바일 390px viewport에서 horizontal overflow가 없다.
- 캐릭터 asset은 `<img>` 단순 교체가 아니라 상태/애니메이션 pipeline으로 관리된다.
