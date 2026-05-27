# Fresh restart run — 2026-05-27

## User intent

사용자는 기존 repo의 근본이 잘못되었다고 판단했고, 단순 redesign이 아니라 새 repo에서 완전 재시작을 승인했다.

## Execution mode

Kanban Program / Research Lab hybrid.

## Completed setup

- 기존 repo를 `food-akinator-hermes-pilot-archive-20260527`로 rename/archive.
- 새 `crimson-joo/food-akinator-hermes-pilot` public repo 생성.
- 초기 README/.gitignore commit/push.
- canonical docs seed 작성.

## Research lanes

1. Akinator gameplay/UX loop.
2. Character animation pipeline.
3. Inference/question narrowing model.

## Next recommended lanes

1. Designer: 캐릭터 concept 비교와 asset pipeline 결정.
2. Architect: engine/state machine/data schema detailed spec.
3. Builder: TDD vertical slice only after design/architecture gate.
4. QA: reference-driven acceptance scenarios.
5. Release Manager: Pages/CI/canary setup after first vertical slice.

## Escalation

캐릭터 최종 콘셉트와 구현 파이프라인(Rive vs layered WebP)은 사용자의 taste/product-direction 판단이 필요하다. 단, 다음 단계에서는 2~3안 prototype/handoff를 먼저 만들어 비교할 수 있다.
