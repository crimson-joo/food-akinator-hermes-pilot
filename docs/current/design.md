# Design — Zero-to-One Direction

## 디자인 방향

**살아있는 음식 추리자**

사용자가 설문을 채우는 화면이 아니라, 캐릭터가 앞에서 직접 추리하는 게임 무대처럼 보여야 한다.

## Reference principles from Akinator

- 사용자가 비밀 타깃을 마음속에 정한다.
- 한 화면에는 질문 하나만 나온다.
- 5단계 답변이 고정 리듬으로 반복된다.
- 답변 후 캐릭터가 생각/반응한다.
- 확신이 차면 suspense 후 추측한다.
- 틀리면 실패가 아니라 회복 루프로 이어진다.

## Non-copy boundary

금지:

- 파란 지니, 램프, 마법사/지니 콘셉트 복제
- Akinator 명칭/문구/브랜드/데이터/API 사용
- 동일 화면 배치/색감/포즈/애니메이션 모방

허용:

- 비밀 타깃 추론 게임의 구조적 원리
- 5단계 불확실성 답변 모델
- 캐릭터가 추론을 의인화하는 인터랙션 원리

## Screen/state inventory

1. Entry
   - “오늘 뭐 먹을지 제가 맞혀볼게요.”
   - 사용자는 음식/상태를 마음속에 떠올리고 시작한다.

2. Asking
   - 질문 하나 + 5답변
   - 답변 위치는 안정적이어야 한다.

3. Answer accepted
   - 선택한 답변이 짧게 반응한다.
   - 다음 질문이 즉시 튀어나오지 않는다.

4. Thinking
   - 캐릭터가 답변을 해석하는 짧은 suspense.
   - 300~800ms 권장.

5. Confidence rising
   - “감이 오고 있어요” 등 정량 확률이 아닌 감정적 진행감.

6. Guessing
   - “혹시… 김치찌개인가요?”
   - 맞아요/아니에요로 피드백.

7. Reveal success
   - 캐릭터 축하/선언.
   - 메뉴명, 이유, 탈락 후보, 실행 CTA.

8. Wrong recovery
   - 오답 후보 제거를 시각화.
   - 캐릭터가 인정하고 다시 질문.

9. Graceful fail
   - 여러 번 실패하면 정답 입력/재시작.

## Character requirement

정적 이미지/SVG는 실패다. 최소 조건:

- idle breathing/blinking
- answer reaction
- thinking posture
- confident posture
- wrong/surprised reaction
- recovery posture
- reveal celebration

MVP 권장: Rive state machine. 일정상 어려우면 Lottie clips. 최후 fallback은 layered raster rig이나, crude look이면 QA fail.

## Visual acceptance

실패 기준:

- 메뉴 추천 설문처럼 보임
- 캐릭터가 장식처럼 보임
- 질문/답변만 있는 데모처럼 보임
- 답변 후 반응 없이 다음 질문으로 즉시 넘어감
- reveal이 단순 결과 카드처럼 보임

성공 기준:

- 첫 화면에서 “게임/추리자/내 메뉴를 맞힌다”가 즉시 읽힘
- 캐릭터가 각 상태에서 다른 감정/자세를 보임
- 질문이 진행될수록 긴장감이 쌓임
- 틀렸을 때도 계속하고 싶음
