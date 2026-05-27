# Release baseline — restart

## Governance

현재 새 repo는 small/local-main flow로 시작한다.

- `main`: 초기 truth.
- feature branches: non-trivial work.
- public deploy is not configured yet.
- merge/deploy/canary policy will be added after first vertical slice.

## Archived previous repo

Previous failed repo is preserved as:

- Remote: `crimson-joo/food-akinator-hermes-pilot-archive-20260527`
- URL: https://github.com/crimson-joo/food-akinator-hermes-pilot-archive-20260527
- State: archived

New repo:

- Remote: `crimson-joo/food-akinator-hermes-pilot`
- URL: https://github.com/crimson-joo/food-akinator-hermes-pilot

## Public release rule

No public demo until:

- product/design/architecture docs are coherent,
- reference research is reflected,
- engine vertical slice passes tests,
- character pipeline has accepted direction,
- browser QA passes.
