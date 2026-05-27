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

Builder는 다음 문서가 통과되기 전까지 시작하지 않는다.

- Akinator reference observations
- Product thesis
- Design state inventory + visual direction
- Inference architecture
- QA acceptance criteria
