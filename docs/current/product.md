# Product brief — 아무거나 탐정단 final service

## Decision

이 repo는 기존 파일럿을 이어 고치는 프로젝트가 아니라, 실패한 기반을 아카이브한 뒤 처음부터 다시 세운 한국 음식 Akinator형 게임이다.

## Product thesis

사용자가 먼저 “내가 떠올린 음식” 또는 “상대가 지금 먹고 싶어 하는 음식”을 마음속으로 정한다. 앱은 한 번에 하나의 짧은 질문을 던지고, 5지 답변을 바탕으로 후보 메뉴를 좁힌 뒤 6~12턴 안에 극적으로 추측한다.

핵심은 추천 폼이 아니라 **캐릭터가 나와 대결하듯 질문하며 맞히는 게임감**이다.

## Target use case

- 한국 커플/친구/가족이 배달 음식이나 외식 메뉴를 정하지 못하는 상황.
- “아무거나”라는 말 뒤에 숨어 있는 실제 craving을 놀이처럼 추론.
- 한 세션은 짧고, 맞히면 공유/재시작, 틀리면 같은 흐름 안에서 추가 질문으로 회복한다.

## Final service scope

- 46개 메뉴 후보와 46개 자연어 질문 카드.
- 내 음식 맞히기 / 상대 음식 맞히기 모드.
- 5지 답변: 응 / 아마 / 모름 / 아마 아니오 / 아니오.
- 후보 확률, 1·2위 격차, 질문 수를 보여주는 사건 수첩.
- 상위 용의 메뉴 TOP 3 보드.
- 6~12턴 reveal, confidence breakdown, wrong-guess recovery.
- 정답 메모 입력과 재시작/링크 복사 CTA.

## Non-goals

- 내부 태그를 직접 고르는 추천 설문지.
- 기존 Akinator UI/캐릭터/로고/문구/색감/포즈 복제.
- CSS 도형 캐릭터 중심의 저품질 mascot.
- 복잡한 로그인/서버/데이터 수집.

## Product principles

1. **Secret target first**: 사용자가 마음속 정답을 정해야 게임이 된다.
2. **One short question at a time**: 한 화면에는 하나의 질문과 5개 답변만.
3. **Uncertainty allowed**: 예/아니오뿐 아니라 아마 예/모름/아마 아니오가 있어야 한다.
4. **Progressive narrowing**: 초반은 넓게, 후반은 구체적으로.
5. **Character as opponent/host**: 캐릭터는 장식이 아니라 추론 상태를 보여주는 상대다.
6. **Reveal as drama**: 최종 후보 공개는 별도 연출과 confidence evidence가 필요하다.
7. **Recovery loop**: 틀리면 끝이 아니라 오답 후보를 지우고 추가 질문으로 이어진다.

## Current phase

Final service MVP implemented and shipped-ready pending release gate/canary.
