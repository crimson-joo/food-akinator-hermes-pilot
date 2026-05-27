# Release — Zero-to-One

## 현재 release 상태

- 구현 없음
- 배포 대상 없음
- Builder blocked

## Release policy

이 프로젝트는 현재 public demo 성격이지만, 이전 실패를 반복하지 않기 위해 다음 gate를 둔다.

1. Research gate
   - Akinator direct-play blocker must be cleared before Builder.
   - If direct play remains blocked, user must explicitly approve public video/screenshot observation as substitute.
2. Product/design gate
3. Architecture gate
4. TDD Builder gate
5. Reviewer gate
6. Browser QA + perceptual QA gate
7. main sync/deploy
8. live canary

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
