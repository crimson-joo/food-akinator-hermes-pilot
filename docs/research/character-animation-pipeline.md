# Character animation pipeline research

## Problem

이전 파일럿의 핵심 실패는 캐릭터를 CSS 도형/DOM 조각으로 “그럴듯하게” 만들려 한 것이다. Akinator류 경험에서 캐릭터는 브랜드와 게임감의 중심이므로, 상태 기반 캐릭터 애니메이션 시스템으로 설계해야 한다.

## Likely approaches in Akinator-like products

Akinator 원본 내부 제작 방식은 공개 확인이 제한적이다. 관찰 가능한 동작과 일반 2D 캐릭터 제작 관행을 기준으로 보면, 단순 CSS 캐릭터라기보다 다음 중 하나 또는 혼합일 가능성이 높다.

- 프리렌더드 포즈/표정 스프라이트.
- 상태별 캐릭터 이미지 세트.
- 짧은 idle loop animation.
- 질문/생각/확신/추측/성공/실패에 대응하는 pose library.
- 상태 전환 transition animation.
- 눈 깜빡임, 시선 이동, 손/어깨/머리 미세 동작.

## Pipeline options

### Option A — pre-rendered sprite / WebP sequence

장점:
- 구현이 단순하다.
- 일러스트 품질이 그대로 보인다.
- 브라우저 호환성이 좋다.

단점:
- 상태가 늘면 asset 수가 급증한다.
- 런타임 조합이 어렵다.

적합:
- 초단기 MVP, 상태 수가 적은 프로토타입.

### Option B — layered WebP/PNG rig

몸, 머리, 눈, 눈썹, 입, 팔, 손, 소품, aura를 분리하고 상태별로 조합한다.

장점:
- 고품질 일러스트를 유지하면서 조합 수를 늘릴 수 있다.
- 눈/입/팔/소품을 독립적으로 반응시킬 수 있다.
- React + Framer Motion/GSAP로 구현 가능하다.

단점:
- 파츠 분리와 pivot 정의가 필요하다.
- 잘못 만들면 종이인형처럼 보인다.

적합:
- 이번 프로젝트의 1차 추천안.

### Option C — Rive state machine

장점:
- 웹 친화적이고 상태 머신 지원.
- idle/reaction/transition 연결이 자연스럽다.
- 캐릭터가 핵심인 서비스에 적합하다.

단점:
- Rive asset 제작 역량이 필요하다.
- 런타임 의존성이 생긴다.

적합:
- 캐릭터 품질을 제품 핵심으로 둘 때의 강력 후보.

### Option D — Spine / Live2D

장점:
- 가장 유기적인 움직임과 포즈 블렌딩 가능.
- 장기적으로 캐릭터 IP화에 적합.

단점:
- 툴/라이선스/러닝커브/런타임 부담.

적합:
- 고도화 단계.

## Recommended path

🔶 추천: **Design first → layered WebP/Rive feasibility spike → implementation**

초기 빌드는 다음 둘 중 하나를 결정한 뒤 시작한다.

1. **Layered WebP + Framer Motion/GSAP**
   - 빠른 MVP와 높은 일러스트 품질 균형.
   - 디자이너/이미지 생성/수동 보정 협업이 쉽다.
2. **Rive state machine**
   - 캐릭터가 제품의 중심이라면 더 적합.
   - 상태 전환과 organic movement에 강하다.

## Minimum character state set

- idle: 호흡, 눈 깜빡임, 시선 이동.
- asking: 질문을 던지는 자세.
- thinking: 고개 숙임, 눈썹, 턱/소품 제스처.
- confident: 확신, 손가락/소품 강조.
- guessing: 답 공개 직전 anticipation.
- success: 활짝 웃음/축하.
- wrong: 당황/회복.

## Organic motion rules

- 항상 움직이는 idle loop가 있어야 한다.
- 포즈 전환은 sudden swap 금지. anticipation → transition → settle.
- 눈 깜빡임/시선/작은 제스처는 약간 랜덤화한다.
- linear easing 금지. ease-out/ease-in-out/back-out 중심.
- 질문 confidence에 따라 표정과 자세가 단계적으로 바뀐다.

## Non-copy rule

Akinator의 푸른 지니, 램프, 터번, 수염, 실루엣, 대표 손짓을 쓰지 않는다. 한국 음식 게임에 맞는 독자 캐릭터를 만든다. 후보: 음식 탐정, 미식 셰프, 냉장고 요정, 점쟁이 셰프, 숟가락 탐정 등.
