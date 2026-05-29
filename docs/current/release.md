# Release — Zero-to-One

## 현재 release 상태

- 로컬 엔진 foundation 구현 있음: domain validation, candidate scoring, adaptive selector MVP.
- adaptive selector pilot local gate: PASS. Initial unknown turn-4 high reveal-risk blocker는 remediation/re-review/QA rerun으로 해결됨.
- 배포 대상 없음: PR/merge/deploy/live canary는 수행하지 않음.
- Builder gate 통과: 직접 플레이 5회 + product/design/architecture/QA synthesis 완료.
- 다음 단계: threshold/recovery/state machine tests, golden path data, UI scaffold + character stage.

## Release policy

이 프로젝트는 현재 public demo 성격이지만, 이전 실패를 반복하지 않기 위해 다음 gate를 둔다.

1. Research gate ✅
   - Akinator direct-play blocker cleared with 5 direct-play logs.
   - Public video/screenshot substitute not used.
2. Product/design gate
3. Architecture gate
4. TDD Builder gate
5. Reviewer gate
6. Browser QA + perceptual QA gate
7. main sync/deploy
8. live canary

## Repository artifact policy

- `.hermes/runs/**`는 작업 실행 중 생성되는 local run artifact 저장소이며 기본적으로 gitignore 대상이다. 영구 보존이 필요한 내용만 정리해서 `docs/current/**` 또는 `docs/archive/**`로 승격한다.
- `npm test`의 기본 Vitest discovery는 `.hermes/**`를 제외해 canonical test count가 QA/리뷰 probe artifact에 의해 흔들리지 않게 한다. 필요한 경우 worker는 직접 파일 경로를 넘겨 `.hermes/runs/**` probe를 명시 실행할 수 있다.
- Graphify는 project navigation layer로 유지한다. 커밋 대상은 안정 산출물(`graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.json`, `graphify-out/graph.html`, `graphify-out/wiki/**`, 기존 tracked labels)이며 cache/manifest/root sentinel은 제외한다.
- Graphify 산출물을 포함한 커밋 직후 `built_from`이 HEAD와 1커밋 어긋나는 graph-only self-reference drift는, 한 번의 `graphify update . --force`를 수행했다면 non-blocking으로 문서화하고 무한 재커밋하지 않는다.

## 금지

- Research/design/architecture gate 없이 앱 scaffold 시작 금지
- 기능 테스트만으로 deploy 완료 선언 금지
- 기존 실패 구현을 개선했다고 주장 금지
- 캐릭터/질문/엔진이 미정인 상태에서 UI부터 제작 금지

## 배포 완료 정의

완료는 다음 모두를 만족할 때만 말한다.

- CI pass
- deploy workflow pass
- live URL에서 acceptance flow pass
- product/design QA pass
- old markers absence pass
- wrong recovery pass
- 캐릭터 상태 반응 pass
