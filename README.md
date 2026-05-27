# Food Akinator — Zero-to-One Research Foundation

이 저장소는 이전 구현을 폐기하고, Akinator형 음식 추리 서비스를 처음부터 다시 설계하기 위한 깨끗한 기반입니다.

## 현재 상태

- 앱 구현 없음
- 기존 UI/엔진/음식 데이터 재사용 금지
- Builder 시작 금지
- 현재 단계: Research Lab + Product/Design Gate + Architecture Gate

## 목표

사용자가 마음속으로 떠올린 음식 또는 아직 언어화하지 못한 오늘의 메뉴 욕구를, 캐릭터가 한 질문씩 던지며 추리하고, 5~12턴 안에 납득 가능한 메뉴를 선언하는 게임형 음식 결정 서비스.

## 원칙

- Akinator 브랜드/캐릭터/문구/데이터를 복제하지 않는다.
- 가져올 것은 interaction primitive뿐이다.
- 정적 마스코트 + 버튼 설문은 실패로 본다.
- 질문 순서는 답변에 따라 적응적으로 바뀌어야 한다.
- 캐릭터 반응/thinking/suspense/reveal/wrong recovery는 제품 요구사항이다.
- 기능 통과보다 product feel과 perceptual QA를 우선 gate로 둔다.

## 문서

- `docs/current/product.md`
- `docs/current/design.md`
- `docs/current/architecture.md`
- `docs/current/qa.md`
- `docs/current/release.md`
- `docs/research/akinator-reference-observations.md`
- `docs/research/korean-food-decision-product-research.md`
- `docs/research/inference-motion-research.md`
- `docs/research/zero-to-one-team-synthesis.md`
