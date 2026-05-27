# Akinator Direct Play Blocker + Manual Observation Protocol

## 현재 판정

Builder는 계속 blocked다. Akinator 실제 플레이 관찰 로그가 아직 없다.

## 시도한 경로

### 1. Headless/browser 공식 웹

- `https://en.akinator.com/` 및 게임 진입 시도
- 결과: Cloudflare/security block
- 판정: 자동화 브라우저로 직접 플레이 불가

### 2. SilverGames embedded route

- `https://www.silvergames.com/en/akinator` 접속
- 소개/스크린샷/PLAY 버튼 확인
- PLAY 후 공식 Akinator 쪽 Cloudflare block으로 이동
- 판정: 실제 질문 루프 플레이 불가

### 3. npm/API wrapper

- `akinator@1.0.1`
  - old endpoint `api-usa4.akinator.com` DNS fail
- `aki-api@7.0.1`
  - `en.akinator.com/game` 403
- 판정: 공식 서비스 보호 우회 없이 API 플레이 불가

### 4. macOS local browser/computer-use

- `cua-driver` 설치/도구 존재 확인
- Chrome/Brave window 감지 가능
- 그러나 Accessibility permission 미승인으로 window state/action 불가
- `page` Apple Events도 permission dialog로 timeout
- 보이는 상태: `universalAccessAuthWarn` permission dialog
- 판정: 사용자의 명시적 권한 승인 없이는 로컬 브라우저 직접 플레이 불가

## 하지 않은 것

- Cloudflare 우회 패키지/프록시 사용 안 함
- permission dialog 클릭 안 함
- Akinator 내부 데이터 scraping 안 함
- 브랜드/문구/캐릭터 복제 안 함

## 왜 blocker인가

사용자 요구는 “처음부터 Akinator를 탐구하고 직접 플레이하고 인사이트와 동작을 철저히 탐구”다.

현재 docs는 공개 자료와 team synthesis 기반으로 충분한 1차 틀은 잡았지만, 실제 플레이 로그 없이 Builder로 넘어가면 이전 실패처럼 표면 primitive만 흉내 낼 위험이 있다.

## 필요한 사용자 입력/권한

다음 중 하나가 필요하다.

### Option A — 사용자가 macOS permission 승인

사용자가 macOS에서 `cua-driver`/Hermes/Terminal 관련 Accessibility + Screen Recording permission을 직접 승인한다.

그 후 Orchestrator가 local Chrome/Safari에서 직접 Akinator를 플레이하고 로그를 남긴다.

### Option B — 사용자가 직접 플레이 로그 제공

사용자가 Akinator를 직접 3~5회 플레이하고 아래 형식으로 로그/스크린샷을 제공한다.

### Option C — 직접 플레이 요구를 공개 영상/스크린샷 관찰로 대체 승인

직접 플레이는 blocked로 인정하고, 공개 플레이 영상/스크린샷/문서 기반으로 observation artifact를 보강한다.

## Manual play protocol

최소 3개 타깃:

1. Real celebrity: Taylor Swift 또는 손흥민
2. Fictional character: Harry Potter 또는 Pikachu
3. Ambiguous/niche target: 덜 유명한 캐릭터/인물 1개

각 세션 기록:

```txt
Target:
Run environment:
Question count until first guess:
Final guess:
Correct? yes/no
Wrong recovery observed? yes/no

Q1:
Question text:
Answer chosen:
Immediate visual/character reaction:
Next question felt caused by answer? yes/no/unclear

Q2:
...

Before guess:
Progress/confidence cue:
Suspense/thinking cue:
Candidate name hidden before reveal? yes/no

After wrong guess if tested:
Does it exclude candidate visibly?
Does character acknowledge miss?
Does it continue questions or end?
```

## Observation checklist

- 첫 화면 copy: 사용자가 무엇을 떠올리게 하는가
- 질문 카드 layout
- 답변 순서와 label
- 답변 클릭 후 transition duration/legibility
- 캐릭터 idle/answer/thinking/confident/wrong/reveal state
- progress/confidence 표현 방식
- 질문이 고정 순서인지 adaptive로 보이는지
- first guess question count
- wrong guess continuation behavior
- final reveal의 reason/metadata 유무

## Builder gate

이 blocker가 해소되기 전 Builder 시작 금지.

해소 조건:

- 실제 플레이 로그 3개 이상, 또는
- 사용자가 Option C를 명시 승인하고 공개 자료 관찰 artifact를 보강
