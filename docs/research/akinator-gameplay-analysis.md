# Akinator gameplay reference analysis

## Scope / limitation

직접 사이트 플레이는 자동 브라우저 환경에서 차단될 수 있으므로, 공개적으로 알려진 플레이 화면/영상/리뷰/앱 설명 기반의 관찰 가능한 UX 원리만 정리한다. 원본 asset, 캐릭터, UI, copy는 복제하지 않는다.

## Core play loop

1. 사용자가 먼저 비밀 정답 대상을 마음속에 정한다.
2. 캐릭터/호스트가 하나의 짧은 질문을 제시한다.
3. 사용자가 5지 답변 중 하나를 고른다.
4. 시스템이 후보군을 업데이트하고 다음 질문을 고른다.
5. 질문이 누적되면서 구체성이 올라간다.
6. 충분히 확신하면 후보를 극적으로 추측한다.
7. 맞으면 성공/재시작, 틀리면 추가 질문 또는 정답 입력/학습 루프로 이어진다.

## Five-answer semantics

- Yes: 명확한 긍정 evidence.
- Probably: 약한 긍정 evidence.
- I don't know: 정보 없음. 해당 질문의 영향도를 낮춘다.
- Probably not: 약한 부정 evidence.
- No: 명확한 부정 evidence.

UX적으로 중요한 점은 사용자가 완벽히 알지 못해도 진행할 수 있다는 것이다. 이 5지 체계는 음식 취향처럼 애매한 도메인에도 적합하다.

## Tension curve

- Early: 실제/가상, 사람/동물/사물 같은 넓은 질문. 음식 버전에서는 한식/양식/면/밥/디저트/음료, 따뜻함/차가움, 끼니/간식 등.
- Mid: 직업/국가/작품/플랫폼 같은 중간 범주. 음식 버전에서는 국물, 매움, 고기, 해산물, 튀김, 배달 친화성 등.
- Late: 특정 후보를 암시하는 구체 질문. 음식 버전에서는 “빨간 국물인가요?”, “밥과 같이 먹는 메뉴인가요?”, “술안주로도 자연스러운가요?” 등.

## Character role

캐릭터는 단순 decoration이 아니다.

- 질문 중: 관찰/궁금함.
- 답변 직후: 반응/생각.
- 확신 상승: 자신감.
- 추측 직전: 긴장감.
- 정답: 의기양양/축하.
- 오답: 당황/회복.

시스템 추론 과정을 캐릭터 감정으로 의인화해야 “폼”이 아니라 “게임”이 된다.

## Repeat-play pattern

재미는 두 방향에서 생긴다.

- 맞힐 때: “어떻게 알았지?” 감탄.
- 못 맞힐 때: “이걸 못 맞히네 / 다시 해보자” 도전감.

따라서 세션은 짧고, 재시작은 즉시 가능해야 하며, 오답도 실패가 아니라 다음 플레이 재료가 되어야 한다.

## Do not copy

- Akinator 이름/로고/브랜드.
- 푸른 지니/램프/터번/수염/실루엣/대표 포즈.
- 원본 질문 문구 대량 복제.
- 원본 UI 색감/레이아웃/애니메이션을 식별 가능하게 모방.
- 원본 DB나 결과 구조 복제.

## Principles to borrow

- secret target first
- one-question loop
- 5지 불확실성 답변
- progressive narrowing
- character reaction model
- dramatic reveal
- success/failure/recovery loop
- short replayable sessions
