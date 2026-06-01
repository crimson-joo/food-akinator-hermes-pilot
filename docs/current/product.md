# Product — Food Akinator Zero-to-One

## 제품 한 줄 정의

“아무거나”로 멈춘 사용자의 오늘 메뉴를, 캐릭터가 질문 몇 개로 추리해 확신 있게 선언하는 게임형 음식 결정 서비스.

## 핵심 문제

한국 사용자의 “아무거나”는 무취향이 아니라 선택 책임 회피, 결정 피로, 실패 회피, 관계 부담, 현재 상태를 말로 설명하기 귀찮음에서 나온다.

## 제품 thesis

1. **추천기가 아니라 결정 책임을 가져가는 게임**
   - 사용자는 직접 메뉴를 고르는 부담을 잠시 내려놓는다.
   - 서비스는 “제가 맞혀볼게요”라는 리드 톤을 가진다.

2. **선호보다 오늘의 거부감이 더 중요하다**
   - 사용자는 먹고 싶은 것보다 먹기 싫은 것을 더 잘 안다.
   - 질문은 취향조사가 아니라 후보 제거/심리 추리처럼 느껴져야 한다.

3. **정답보다 납득 가능한 reveal이 중요하다**
   - 최종 화면은 메뉴명만 보여주지 않는다.
   - 오늘 상태 해석, 탈락 후보, 선택 이유, 즉시 행동, 반박/회복을 포함한다.

## MVP 범위

- 모드: 배달 / 외식 / 야식 / 혼밥 / 데이트 중 1~2개부터 시작
- 후보: 대표 음식 50개 내외
- 질문: 35~45개
- 답변: 5단계 — 네 / 아마도요 / 모르겠어요 / 아마 아닐걸요 / 아니요
- 추론: 후보 attribute 기반 scoring + adaptive next-question selection
- 캐릭터: 최소 7상태 — idle, ask, thinking, confident, surprised, recover, reveal
- 결과: 1개 메뉴 선언 + 이유 + 반박/회복

## Non-goals

- 음식점 DB 구축
- 배달 주문 중개
- 회원가입/개인 프로필
- 리뷰 플랫폼
- SNS 피드
- 긴 자유입력 챗봇
- 추천 메뉴 리스트 나열
- 기존 코드/데이터 재사용

## Builder 시작 조건

Builder gate는 통과했다. 직접 플레이 5회 synthesis 기준으로 구현 단계로 넘어가되, 첫 production code는 UI가 아니라 테스트/데이터/엔진부터 시작한다.

통과 근거:

- Akinator reference observations
- 직접 플레이 5회 로그 + synthesis
- Product thesis
- Design state inventory + visual direction
- Inference architecture
- QA acceptance criteria

## 구현 우선순위

1. domain types + mini fixtures
2. candidate/question validation tests
3. scoring + adaptive selector tests
4. threshold/recovery/state machine tests
5. golden path 20 foods
6. UI scaffold + character stage

## v0 성공 기준

v0는 “추천 리스트”가 아니라 **한 메뉴를 추리해 선언하는 게임**이어야 한다. 질문이 진행될수록 후보군이 좁혀지는 체감, 캐릭터의 thinking/confidence/reveal 상태, 오답 후 회복 루프가 없으면 ship 불가.

## Akinator-level loop — canonical knowledge base v1

사용자 기준은 “원본 Akinator 수준”에 도달할 때까지 자가 검증/회의를 반복하는 것이다. 2026-05-31 gap review의 결론은, 현재 engine/UI scaffold보다 **지식베이스 규모와 서비스 구조**가 원본 수준 체감의 다음 병목이라는 점이다.

이번 iteration의 제품 기준:

- public demo는 더 이상 3개 후보 toy fixture가 아니다.
- canonical `foodKnowledgeBase`는 active candidate 50개와 active question 42개를 제공한다.
- 각 후보는 20개 이상 non-neutral active attributes와 3개 이상 reveal reason seed를 가진다.
- 질문은 broad split, family lock, sibling elimination, signature discriminator, false-path guardrail, recovery disambiguation role을 모두 포함한다.
- PR #24로 Lottie authored-equivalent runtime은 live-verified 되었지만, 계속 남은 큰 다음 단계는 20개 대표 음식 scenario simulation, branch entropy 검증, reasoning bridge/progress tension, answer-tied reveal rationale, 3-beat wrong recovery, mobile/perceptual production QA다.
