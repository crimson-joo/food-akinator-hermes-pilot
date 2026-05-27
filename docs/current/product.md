# Product brief — 아무거나 지니 fresh restart

## Decision

이 repo는 기존 파일럿을 이어 고치는 프로젝트가 아니다. 기존 repo는 `food-akinator-hermes-pilot-archive-20260527`로 백업/아카이브했고, 이 repo는 같은 컨셉을 처음부터 다시 짜는 fresh restart다.

## Product thesis

사용자가 먼저 “상대가 지금 먹고 싶어 하는 음식” 또는 “내가 떠올린 음식”을 마음속으로 정한다. 앱은 짧고 자연스러운 질문을 통해 그 음식 후보를 점점 좁히고, 마지막에 극적으로 추측한다.

핵심은 추천 폼이 아니라 **캐릭터가 나와 대결하듯 질문하며 맞히는 게임감**이다.

## Target use case

- 한국 커플/친구/가족이 배달 음식이나 외식 메뉴를 정하지 못하는 상황.
- “아무거나”라는 말 뒤에 숨어 있는 실제 craving을 놀이처럼 추론.
- 한 세션은 짧아야 하며, 맞히면 감탄/공유, 틀리면 다시 도전하고 싶은 구조여야 한다.

## Non-goals

- 단순 음식 추천 설문지.
- 내부 태그를 사용자가 직접 고르는 필터 UI.
- 기존 Akinator UI/캐릭터/로고/문구/색감/포즈 복제.
- CSS만으로 만든 저품질 procedural mascot.
- 구현부터 시작해서 나중에 디자인을 끼워 맞추는 방식.

## Product principles

1. **Secret target first**: 사용자가 마음속 정답을 정해야 게임이 된다.
2. **One short question at a time**: 한 화면에는 하나의 질문과 5개 답변만.
3. **Uncertainty allowed**: 예/아니오뿐 아니라 아마 예/모름/아마 아니오가 있어야 한다.
4. **Progressive narrowing**: 초반은 넓게, 후반은 구체적으로.
5. **Character as opponent/host**: 캐릭터는 장식이 아니라 추론 상태를 보여주는 상대다.
6. **Reveal as drama**: 최종 후보 공개는 별도 연출이 필요하다.
7. **Recovery loop**: 틀리면 끝이 아니라 추가 질문/정답 입력/재도전으로 이어진다.

## Current phase

Research and planning only. Production UI implementation is blocked until:

- reference gameplay analysis
- character animation pipeline decision
- inference/question model design
- product/design/architecture acceptance criteria

이 네 가지가 문서화된다.
