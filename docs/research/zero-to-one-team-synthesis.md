# Zero-to-One Team Synthesis

## 회의 판정

이전 구현은 폐기한다. 이번 라운드는 “개선”이 아니라 제품 생성 순서를 바꾼다.

1. Reference/gameplay research
2. Korean food decision research
3. Inference + character pipeline architecture
4. Product/design synthesis
5. Builder only after gate pass

## 합의된 방향

🔶 추천 방향: **살아있는 음식 추리자 + adaptive menu guessing engine**

- 사용자는 마음속 음식/오늘 상태를 떠올린다.
- 캐릭터가 한 질문씩 던진다.
- 답변마다 후보 분포가 바뀐다.
- 캐릭터가 실제로 반응한다.
- 확신이 차면 suspense 후 추측한다.
- 틀리면 후보를 제외하고 회복한다.

## 기존 실패와의 단절

재사용 금지:

- 이전 React UI
- 이전 CSS/캐릭터 SVG
- 이전 음식 데이터/질문 데이터
- 이전 “TOP3 후보판” 중심 구조
- 이전 completion/deploy 판단 기준

유지할 것은 문제의식뿐:

- 한국 음식 결정 문제
- Akinator-like secret target guessing

## 다음 agent graph

### T1 Researcher — 실제 Akinator 플레이 로그 보강

- 사람 브라우저/접근 가능한 환경에서 3~5타깃 플레이
- 질문 수, 질문 종류, answer transition, wrong path, character state 기록
- Cloudflare 우회 금지

### T2 Designer — product feel/design handoff

- 캐릭터 콘셉트 2~3안
- screen/state inventory 확정
- visual system과 motion rules
- Builder/QA acceptance criteria

### T3 Architect — engine/data architecture

- candidate/question schema 확정
- adaptive selector pseudocode
- threshold/recovery rules
- test matrix

### T4 Builder Lead — blocked until T2/T3 pass

- TDD로 데이터 검증부터 시작
- app scaffold는 gate 후 시작

### T5 Reviewer/QA — gate owner

- “설문 폼 + 장식 캐릭터”면 fail
- perceptual QA가 기능 QA보다 우선

## 현재 next step

- clean foundation docs committed
- old implementation absent from working tree
- remote main reset 여부는 Orchestrator가 destructive ship gate에서 처리
