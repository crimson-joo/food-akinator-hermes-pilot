# QA — Zero-to-One Acceptance

## 핵심 판정

기능 테스트 통과만으로 완료 금지. 이 제품은 perceptual/product QA가 ship gate다.

## Product acceptance

Pass 조건:

- 사용자가 마음속 메뉴/상태를 떠올리고 시작한다.
- 한 화면에는 질문 하나만 나온다.
- 5답변 의미가 안정적으로 유지된다.
- 질문 순서가 답변에 따라 달라진다.
- 5~12턴 사이에 대다수 대표 메뉴를 추측한다.
- reveal 전에 suspense/guessing 상태가 있다.
- 틀렸을 때 오답 후보를 제외하고 회복 질문으로 이어진다.
- 캐릭터가 최소 7상태로 눈에 띄게 반응한다.
- 결과는 “추천 리스트”가 아니라 “선언 + 이유 + 반박”이다.

Fail 조건:

- 설문 폼처럼 보임
- 캐릭터가 정적/장식임
- 고정 질문 순서임
- 메뉴 후보 TOP3만 보여줌
- 오답 후 재시작만 강요함
- 이유가 `clue: yes` 같은 내부값 노출임
- 기존 실패 UI/데이터/구조가 남아 있음

## Data tests

- active candidate 50개 이상
- active question 35개 이상
- 각 후보는 최소 20개 질문 attribute coverage
- 각 질문은 yes/no 양쪽 후보를 충분히 가름
- 모든 attribute는 `-1 <= value <= 1`

## Engine tests

- strong answer는 ranking을 크게 바꿈
- probably는 yes/no보다 약하게 반영됨
- unknown은 ranking을 왜곡하지 않고 질문 반복을 막음
- selector는 이미 물은 질문을 제외함
- selector는 high-split 질문을 우선함
- reveal은 confidence와 margin을 모두 요구함
- wrong guess suppression이 같은 후보 재추측을 막음
- recovery는 오답 후보와 남은 후보를 구분하는 질문을 고름
- all-unknown path도 무한루프 없이 graceful 종료

## Browser QA

필수 캡처:

1. Entry — 캐릭터/목표/CTA가 보이는 첫 화면
2. Adaptive branch — 서로 다른 답변 path에서 다른 2~3번째 질문
3. Thinking/suspense — 답변 후 전환 상태
4. Guessing — 후보명 공개 직전 또는 tentative guess
5. Wrong recovery — 오답 후보 제거와 회복 질문
6. Success reveal — 메뉴 선언/이유/CTA

## Live canary

배포 후 canonical URL + cache-busted URL에서 확인:

- console errors 없음
- public assets 정상 로드
- horizontal overflow 없음
- animation/reduced-motion fallback 확인
- old implementation markers absence 확인
- acceptance flow 1회 이상 실제 플레이
