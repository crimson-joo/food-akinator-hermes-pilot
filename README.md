# Food Akinator — 입맛 탐정 보글

한국 음식판 Akinator 스타일 추리 게임입니다. 사용자가 마음속 메뉴나 오늘의 식사 상태를 떠올리면, “입맛 탐정 보글”이 한 번에 하나씩 질문하고 답변에 따라 후보를 좁혀 한 메뉴를 추측합니다.

Live demo: https://crimson-joo.github.io/food-akinator-hermes-pilot/

## 현재 상태

- 상태: controlled public demo / alpha 가능.
- 풀 public production launch: 아직 blocked.
- 현재 앱: Vite 기반 브라우저 앱, canonical `foodKnowledgeBase` v1, adaptive selector, reveal/wrong-recovery session loop, inline SVG/CSS Bogle character fallback을 포함합니다.
- 최근 근거:
  - PR #21: Bogle motion state machine + production layer sheet contract.
  - PR #22: production completion autoplan 및 production-blocked verdict 정리.
- 다음 production blocker:
  1. Rive/Lottie 또는 동등한 authored runtime behind `CharacterStage`.
  2. Akinator-like 추리감 강화: reasoning bridge, progress tension, suspense/reveal payoff, wrong-recovery explanation.
  3. perceptual/screenshot QA와 mobile/reduced-motion evidence 확대.
  4. docs/evidence/review gate를 production launch 기준으로 정렬.
  5. app shell/character/runtime/timing boundary 분리.

## 제품 원칙

- Akinator 브랜드, 지니/램프/파란 마법사, 문구, 데이터, exact layout, protected identity를 복제하지 않습니다.
- 가져오는 것은 “비밀 타깃을 마음속에 정하고 캐릭터가 질문으로 맞히는” interaction primitive뿐입니다.
- 정적 마스코트 + 버튼 설문은 실패로 봅니다.
- 질문 순서는 답변에 따라 적응적으로 바뀌어야 합니다.
- 캐릭터 반응, thinking suspense, reveal, wrong recovery는 제품 요구사항입니다.

## 실행

```bash
npm install
npm run dev
```

## 검증

```bash
npm test
npm run typecheck
npm run build
npm run test:e2e --if-present
```

Focused docs/contract check used by the current docs alignment task:

```bash
npm test -- --run tests/ui-app.test.ts tests/character-assets.test.ts
```

## 문서

- `docs/current/product.md` — 제품 정의와 MVP/production 기준.
- `docs/current/design.md` — 보글 캐릭터/UX/visual contract와 production runtime 한계.
- `docs/current/architecture.md` — engine/session/selector/UI scaffold와 character boundary.
- `docs/current/qa.md` — automated, browser, perceptual QA gate.
- `docs/current/release.md` — release 상태, production blocker, automation contract.
- `docs/current/character-art-rig-plan.md` — source art, layer sheet, Rive/Lottie handoff plan.
- `docs/current/autoplan-kanban.md` — production completion self-improvement plan.
- `docs/changelog.md` — 주요 변경 및 gate evidence.

## Repository artifact policy

- `.hermes/runs/**`는 local run artifact이며 기본적으로 gitignore 대상입니다.
- 영구 보존할 내용만 `docs/current/**` 또는 `docs/archive/**`로 승격합니다.
- Graphify는 project wiki/code graph/navigation layer로 유지하며, 의미 있는 변경 뒤 `graphify update . --force`로 갱신합니다.
