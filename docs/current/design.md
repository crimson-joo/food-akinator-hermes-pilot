# Design direction — final service

## Direction name

**Premium Korean food detective board**

## Design stance

최종 UI는 “추천 폼”이 아니라 “미식 탐정과 하는 짧은 추리 게임”이어야 한다. Akinator의 원리인 secret target, one-question loop, character reaction, dramatic reveal은 빌리되 지니/램프/터번/푸른 피부/원본 UI는 복제하지 않는다.

## Visual non-negotiables

- 기존 Akinator 지니/램프/터번/푸른 피부/수염/손짓 복제 금지.
- 첫 화면에서 최종 서비스임이 보이는 사건 보드/수첩/후보판이 있어야 한다.
- 캐릭터는 최소 7개 상태와 props/stage label을 가진다.
- 한 화면은 “질문 하나 + 5답변” 원칙을 유지한다.
- 모바일 390px에서 horizontal overflow가 없어야 한다.

## Final character concept

**미식 탐정 + 살짝 신비한 셰프**

상태:
- Entry / CASE OPEN
- Asking / CLUE SCAN
- Thinking / DEDUCTION
- Confidence / CONFIDENCE
- Reveal / REVEAL
- Correct / SOLVED
- Wrong recovery / REOPEN

## Screen/state inventory

- Entry: 비밀 목표 안내, 모드 선택, 후보/질문 카드 수 표시.
- Asking: 단서 번호, 한 질문, 5지 답변, evidence meter.
- Thinking/confidence: 캐릭터 상태와 후보 보드가 확신 상승을 표현.
- Reveal: 추측 메뉴, 이유, 질문 수/격차/confidence breakdown.
- Wrong recovery: 오답 후보 suppress, 정답 메모, 다음 질문으로 회복.
- Correct: 재시작과 링크 복사 CTA.

## Tokens / visual system

- Warm cream canvas, oat borders, hard offset shadows.
- Detective notebook/card metaphors: case board, candidate board, evidence meter.
- Accent palette: lemon, ube, pomegranate, slushie, matcha.
- Rounded cards and dashed borders for tactile board-game feel.

## QA acceptance

- 5초 안에 “마음속 음식을 앱이 맞힌다”를 이해한다.
- 시작 후 질문 하나와 5지 답변만 보인다.
- 답변 클릭 후 캐릭터 상태/후보 보드/진행 수치가 바뀐다.
- 6~12문항 안에 reveal이 발생한다.
- wrong guess 후 “오답도 단서입니다”와 정답 메모가 보인다.
- public live URL에서 이미지 로드, console error, overflow를 확인한다.
