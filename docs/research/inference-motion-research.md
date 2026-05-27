# 작은 음식 도메인 Akinator-like 추론 엔진 + 캐릭터/모션 파이프라인 제안

작성일: 2026-05-28 KST  
범위: 기존 코드/데이터 재사용 없는 zero-to-one 설계. 작은 음식 도메인(예: 30~150개 후보)을 대상으로 5단계 답변 기반 adaptive guessing, 캐릭터 연출 기술 선택지, MVP 파이프라인, 리스크, acceptance tests.

---

## 1. 목표와 핵심 제품 경험

사용자는 “내가 생각한 음식”을 떠올리고, 캐릭터가 예/아니오/모르겠음 계열 질문을 던지며 추론한다. 시스템은 답변마다 후보 음식들의 점수를 갱신하고, 정보량이 큰 다음 질문을 선택한다. 충분히 확신하면 정답을 공개하거나 추측한다. 틀렸을 때는 같은 오답을 반복하지 않고 회복 질문으로 좁혀간다.

MVP 성공 기준:
- 50개 내외 음식 후보에서 평균 8~12문항 내 1차 추측.
- 정답 미포함/애매한 답변에서도 “가장 가까운 후보”와 회복 플로우 제공.
- 캐릭터는 정적 SVG/정적 이미지가 아니라 최소 idle/thinking/ask/confident/surprised/recover/reveal 상태 애니메이션을 가진다.
- 데이터 추가만으로 새 음식/질문을 확장할 수 있다.

---

## 2. 도메인 데이터 모델

### 2.1 Candidate schema: 음식 후보

작은 도메인에서는 복잡한 ML 모델보다 사람이 관리 가능한 지식 베이스 + 베이지안/가중 점수 엔진이 적합하다.

권장 candidate 필드:

```ts
type Candidate = {
  id: string;                    // "kimchi_jjigae"
  nameKo: string;                 // "김치찌개"
  aliases: string[];              // ["김찌", "kimchi stew"]
  category: "한식" | "중식" | "일식" | "양식" | "디저트" | "음료" | "분식" | "기타";
  subcategory?: string;           // "찌개", "면", "밥", "튀김" 등
  tags: string[];                 // 검색/설명용: ["매움", "국물", "돼지고기"]

  // 질문별 기대 답변. -1~+1 연속값 권장.
  // +1: 강한 yes, +0.5: 약한 yes, 0: 중립/모름, -0.5: 약한 no, -1: 강한 no
  attributes: Record<QuestionId, number>;

  // 빈도/인지도 prior. 전체 합 1이 아니어도 됨. 추론 시 정규화.
  prior?: number;                 // 예: 대중적인 음식 1.2, 희귀 음식 0.7

  // 공개/엔딩에 사용
  reveal: {
    oneLiner: string;             // "따끈하고 얼큰한 국물, 김치찌개!"
    imagePrompt?: string;         // 생성형/일러스트 작업용. 런타임 추론에는 불필요.
    funFact?: string;
  };

  // 운영 품질
  status: "active" | "draft" | "disabled";
  version: number;
};
```

설계 포인트:
- `attributes`는 boolean보다 연속값이 좋다. 음식에는 “대체로 매운 편”, “가끔 고기가 들어감” 같은 회색 지대가 많다.
- 후보별 모든 질문을 채울 필요는 없지만, 핵심 질문은 70% 이상 커버해야 정보 이득 계산이 안정적이다.
- `prior`는 초반 질문이 부족할 때 인기 음식 쏠림을 만들 수 있으므로 기본값 1.0, MVP에서는 0.7~1.3 범위로 제한한다.

### 2.2 Question bank schema

질문은 추론용 feature이면서 UX 문장이다. 한 feature에 여러 문장을 둘 수 있다.

```ts
type Question = {
  id: string;                       // "is_spicy"
  textKo: string;                   // "매운 편인가요?"
  shortLabel: string;               // "매움"
  axis: "taste" | "ingredient" | "form" | "temperature" | "cuisine" | "occasion" | "cooking" | "texture";
  polarity: "positive";             // MVP는 positive 질문만 권장. 부정문 질문 지양.

  // 답변 의미가 명확한지. 낮으면 후반 질문으로 밀거나 제외.
  clarity: 0 | 1 | 2 | 3;

  // 너무 직접적인 질문 방지 또는 reveal 전용
  revealRisk: 0 | 1 | 2 | 3;         // "김치가 들어가나요?"는 김치찌개에 직접적일 수 있음

  // 사용자 피로도와 문장 길이
  cost: number;                      // 기본 1.0, 어려운 질문 1.3, 쉬운 질문 0.8

  // 연출 힌트
  animationCue?: "sniff" | "taste" | "think" | "hot" | "cold" | "crunch";

  status: "active" | "draft" | "disabled";
};
```

질문 은행 구성 가이드:
- 1차 분기: 형태/카테고리 — “국물이 있나요?”, “면 요리인가요?”, “밥과 함께 먹나요?”, “디저트인가요?”
- 2차 분기: 맛/온도/조리 — “매운 편인가요?”, “차갑게 먹나요?”, “튀긴 음식인가요?”, “달콤한가요?”
- 3차 분기: 재료/문화권 — “해산물이 들어가나요?”, “치즈가 들어가나요?”, “한식에 가까운가요?”
- 4차 확인: 고유한 식별 질문 — “김치가 핵심 재료인가요?”, “면이 두꺼운 편인가요?”

초기 MVP 규모:
- 후보 50개.
- 질문 35~45개.
- 후보당 답변 coverage 25개 이상.
- 음식군별로 최소 3개 이상의 분리 질문 보유.

---

## 3. 5-answer weight semantics

Akinator 스타일의 5개 답변을 숫자 관측치로 변환한다.

권장 UI 답변:
- “네”: `+1.0`
- “아마도요”: `+0.5`
- “모르겠어요”: `0.0`, 단 정보량 낮춤
- “아마 아닐걸요”: `-0.5`
- “아니요”: `-1.0`

후보의 질문별 기대값도 `[-1, 1]`이다. 관측 답변과 후보 기대값이 가까울수록 점수를 올린다.

### 3.1 점수 갱신 방식 A: soft distance scoring, MVP 추천

각 후보 `c`의 로그 점수:

```txt
logScore(c) = log(prior(c)) + Σ answered q [ weight(q, answer) * similarity(answerValue, expected(c,q)) ]
```

유사도 예시:

```txt
similarity(a, e) = 1 - abs(a - e)        // 범위 대략 -1~1
```

더 안정적인 버전:

```txt
similarity(a, e) = - ((a - e)^2) / (2σ²)
```

권장:
- MVP는 제곱오차 기반이 점수 폭주가 덜하다.
- `모르겠어요`는 점수 갱신을 거의 하지 않되, 질문 재선택에서는 “이미 물어본 질문”으로 처리한다.
- 질문별 `clarity`, `cost`, `revealRisk`로 가중치를 조절한다.

```txt
answerConfidence = abs(answerValue)      // yes/no는 1, probably는 0.5, unknown은 0
questionWeight = 1.0 / cost
contribution = answerConfidence * questionWeight * similarity
```

### 3.2 점수 갱신 방식 B: naive Bayes

질문별로 `P(answer | candidate)`를 사전에 정의하거나 기대값으로부터 생성한다.

장점:
- 확률 해석이 명확하고 entropy/information gain과 자연스럽게 연결된다.

단점:
- 작은 팀이 모든 확률을 관리하기 어렵다.
- 음식 속성의 모호함 때문에 확률 테이블이 과설계가 되기 쉽다.

추천: 내부 표현은 연속값 attributes로 두고, next-question selection 때만 확률 분포로 변환한다.

---

## 4. Adaptive next-question selection

목표: 현재 후보 확률 분포를 가장 잘 쪼개는 질문을 고른다. 단, 너무 직접적이거나 어려운 질문은 패널티를 준다.

### 4.1 후보 확률 정규화

로그 점수에서 softmax로 후보 확률을 만든다.

```txt
P(c) = exp(logScore(c) / T) / Σ exp(logScore(i) / T)
```

- `T` temperature는 0.8~1.2로 시작.
- T가 낮으면 top 후보에 빨리 몰리고, 높으면 탐색적이다.
- MVP 기본 `T=1.0`.

### 4.2 Expected information gain

현재 엔트로피:

```txt
H(C) = -Σ P(c) log2 P(c)
```

질문 `q`를 물었을 때 가능한 답변 `a ∈ {-1, -0.5, 0, 0.5, 1}`에 대한 확률을 예측한다.

```txt
P(a | q) = Σ P(c) * P(a | c, q)
```

각 답변을 받았다고 가정하고 후보 분포를 업데이트한 뒤 기대 엔트로피를 구한다.

```txt
IG(q) = H(C) - Σ_a P(a | q) * H(C | answer=a, q)
```

실제 선택 점수:

```txt
questionScore(q) = IG(q)
                 / cost(q)
                 * clarityFactor(q)
                 * noveltyFactor(q)
                 - revealRiskPenalty(q, turn)
                 - repetitionPenalty(q)
```

권장 휴리스틱:
- 초반 1~4턴: `revealRisk >= 2` 질문 제외.
- top1 확률이 0.45 이상이거나 후보가 5개 이하로 좁혀지면 direct 질문 허용.
- 같은 axis 질문이 3회 연속 나오면 axis 다양성 패널티.
- `unknown` 답변이 직전 2회 이상이면 더 쉬운 `clarity=3`, `cost<=1` 질문 우선.

### 4.3 작은 도메인에서의 간단 대안

처음 MVP에서는 완전한 expected IG 대신 weighted split score로 시작 가능하다.

```txt
mean = Σ P(c) * expected(c,q)
variance = Σ P(c) * (expected(c,q)-mean)^2
coverage = Σ P(c) where expected exists
score = variance * coverage / cost - penalties
```

분산이 큰 질문은 후보를 잘 나눈다. 구현이 쉽고 50개 후보에서는 충분히 좋다. 이후 로그를 모아 IG로 고도화한다.

추천 로드맵:
- Sprint 1: weighted split score.
- Sprint 2: softmax confidence + threshold/recovery.
- Sprint 3: expected IG + analytics 기반 질문 개선.

---

## 5. Confidence/reveal threshold

### 5.1 추측 조건

다음 조건 중 하나를 만족하면 reveal 또는 guess 모드로 전환한다.

권장 기본값:
- `top1Probability >= 0.72` and `top1 - top2 >= 0.18`
- 또는 `turn >= 10` and `top1Probability >= 0.55`
- 또는 남은 유효 후보 수 `<= 2` and top 후보를 구분할 질문이 더 없음
- hard cap: `turn >= 14`이면 반드시 추측/회복으로 이동

### 5.2 Reveal vs tentative guess

두 단계가 좋다.

1. Tentative guess: “혹시 **김치찌개**인가요?”
2. 사용자가 “맞아요/아니에요” 응답.
3. 맞으면 reveal 애니메이션. 틀리면 wrong guess suppression + recovery.

즉, 추측 자체를 질문으로 처리하면 오답 회복이 쉽다.

### 5.3 Confidence messaging

- top1 ≥ 0.85: “거의 알겠어요!”
- 0.65~0.85: “감이 왔어요.”
- 0.45~0.65: “두세 개로 좁혀졌어요.”
- <0.45: “조금 더 물어볼게요.”

UI에는 실제 확률을 노출하지 말고 캐릭터 표정/대사 강도로 표현한다.

---

## 6. Wrong guess suppression/recovery

오답이 가장 중요한 UX 리스크다. “틀렸지만 계속 똑똑해 보이는” 회복이 필요하다.

### 6.1 Suppression 데이터

세션 상태에 다음을 둔다.

```ts
type SessionState = {
  answered: Record<QuestionId, AnswerValue>;
  guessedCandidateIds: string[];
  rejectedCandidateIds: string[];
  turn: number;
  wrongGuessCount: number;
};
```

사용자가 “아니요”라고 하면:
- 해당 후보를 `rejectedCandidateIds`에 추가.
- 그 후보 확률을 0 또는 매우 낮은 epsilon으로 clamp.
- 다음 N턴 동안 동일 subcategory 후보를 바로 공개하지 않도록 약한 패널티. 단 정답 가능성을 완전히 제거하지는 않음.

### 6.2 Recovery strategy

오답 직후에는 일반 질문보다 “disambiguation question”을 선택한다.

방법:
- rejected top 후보와 현재 top 후보들을 가장 잘 구분하는 질문 선택.
- 사용자가 이미 답한 내용과 모순되는 축을 찾고, 모호 답변이 많았던 축을 재확인한다.

대사 예:
- “앗, 제가 너무 성급했네요. 그럼 한 가지만 더요.”
- “비슷한 음식들이 남았어요. 형태부터 다시 볼게요.”

### 6.3 Learning hook

MVP에서는 세션 로그만 저장한다.

로그 예:
```json
{
  "sessionId": "...",
  "answers": {"is_spicy": 1, "has_soup": 1},
  "guesses": [{"id": "kimchi_jjigae", "accepted": false}],
  "finalCandidate": "budae_jjigae",
  "userCorrection": "부대찌개"
}
```

운영자가 주기적으로 확인할 지표:
- 오답 직전 top1/top2 조합.
- 자주 `unknown`이 나오는 질문.
- 정답 후보별 평균 질문 수.
- 특정 후보의 false positive/false negative 속성.

---

## 7. 엔진 API 초안

### 7.1 세션 시작

```http
POST /sessions
```

응답:
```json
{
  "sessionId": "s_123",
  "state": "asking",
  "question": {
    "id": "has_soup",
    "textKo": "국물이 있는 음식인가요?",
    "answers": ["네", "아마도요", "모르겠어요", "아마 아닐걸요", "아니요"]
  },
  "characterCue": "ask"
}
```

### 7.2 답변 제출

```http
POST /sessions/{id}/answers
{
  "questionId": "has_soup",
  "answer": 1
}
```

응답은 다음 중 하나:

```json
{
  "state": "asking",
  "question": {"id":"is_spicy", "textKo":"매운 편인가요?"},
  "progressText": "조금 좁혀졌어요.",
  "characterCue": "think"
}
```

또는:

```json
{
  "state": "guessing",
  "guess": {"candidateId":"kimchi_jjigae", "nameKo":"김치찌개"},
  "text": "혹시 김치찌개인가요?",
  "characterCue": "confident"
}
```

### 7.3 추측 피드백

```http
POST /sessions/{id}/guess-feedback
{
  "candidateId": "kimchi_jjigae",
  "accepted": false
}
```

오답 응답:
```json
{
  "state": "asking",
  "text": "앗, 제가 너무 성급했네요. 다시 좁혀볼게요.",
  "question": {"id":"has_sausage", "textKo":"햄이나 소시지가 들어가나요?"},
  "characterCue": "recover"
}
```

정답 응답:
```json
{
  "state": "revealed",
  "candidate": {
    "nameKo": "김치찌개",
    "oneLiner": "따끈하고 얼큰한 국물, 김치찌개!"
  },
  "characterCue": "reveal"
}
```

---

## 8. 캐릭터/모션 파이프라인 선택지

요구: crude SVG/정적 이미지 금지. 캐릭터가 살아있는 느낌을 줘야 한다. 작은 게임/웹앱 기준으로 Rive, Spine, Lottie, layered raster, CSS procedural rig, Canvas/WebGL을 비교한다.

### 8.1 Rive

장점:
- 런타임 state machine, blend, input 값 제어가 강하다.
- 웹/모바일 런타임 지원이 좋고, 인터랙티브 캐릭터에 적합하다.
- 디자이너가 툴에서 상태 전환을 구성하고 개발자는 `cue`만 전달 가능.

단점/리스크:
- 팀에 Rive 제작 경험이 없으면 초기 러닝커브.
- 복잡한 캐릭터 리깅/아트 품질은 전담 모션 역량 필요.
- 파일/런타임 버전 관리 필요.

적합도: **MVP 1순위**. “추론 상태 → 캐릭터 상태머신” 연결이 가장 자연스럽다.

### 8.2 Spine

장점:
- 2D skeletal animation의 산업 표준에 가깝고 게임 캐릭터 품질이 좋다.
- 스킨/본/mesh deformation에 강하다.
- Unity/게임 엔진 확장성이 좋다.

단점/리스크:
- 웹 캐주얼 MVP에는 파이프라인이 무거울 수 있다.
- 라이선스/툴 비용, 애니메이터 숙련도 필요.
- 상태머신은 별도 앱 로직에서 더 많이 관리해야 한다.

적합도: 게임형 장기 제품이면 좋지만, 웹 MVP에는 과할 수 있음.

### 8.3 Lottie

장점:
- After Effects 기반 워크플로우가 익숙한 디자이너가 많다.
- 짧은 reaction 애니메이션 제작/적용이 쉽다.
- 웹에서 가볍게 재생 가능.

단점/리스크:
- 진짜 인터랙티브 리깅/상태머신에는 약하다.
- AE 효과 중 지원되지 않는 기능이 있어 QA 필요.
- 눈동자 추적, 입 모양, 감정 blend 같은 런타임 제어가 제한적이다.

적합도: MVP에서 “상태별 클립 재생”이면 가능. 캐릭터가 대화에 반응하는 느낌은 Rive보다 약함.

### 8.4 Layered raster rig

설명: PNG/WebP 레이어(머리, 눈, 입, 팔 등)를 분리하고 CSS/JS transform으로 움직인다.

장점:
- 일러스트레이터가 일반 래스터 툴로 작업 가능.
- 구현이 단순하고 런타임 의존성이 낮다.
- 표정/눈깜빡임/살짝 흔들림 정도는 빠르게 가능.

단점/리스크:
- 품질이 개발자의 모션 감각에 좌우된다.
- 복잡한 움직임은 금방 누더기가 된다.
- “정적 이미지 금지” 요구는 만족할 수 있으나 고급 캐릭터감은 제한적.

적합도: 예산/일정이 매우 빡빡한 fallback.

### 8.5 CSS procedural rig

설명: DOM/CSS border-radius/gradient/transform으로 캐릭터를 절차적으로 그리거나 움직인다.

장점:
- 에셋 없이 빠른 프로토타이핑.
- 상태 변화, idle loop, bounce, shake 등 구현 쉬움.
- 번들 가볍고 텍스트 UI와 통합 쉬움.

단점/리스크:
- 아트 디렉션 한계가 크다.
- crude SVG 금지와 유사하게 “조악해 보일” 위험.
- 디자이너 핸드오프가 어렵다.

적합도: 내부 프로토타입에는 좋지만 외부 MVP의 메인 캐릭터로는 비추천.

### 8.6 Canvas/WebGL custom rig

장점:
- 최고 수준의 제어, 파티클/셰이더/물리 효과 가능.
- 장기적으로 독특한 인터랙션 가능.

단점/리스크:
- MVP에는 구현 비용이 높다.
- 애니메이션 툴체인과 런타임이 분리되어 유지보수 부담.
- 접근성/반응형/저사양 최적화 이슈.

적합도: 추후 고도화나 미니게임 결합 시 고려. 초기 선택으로는 비추천.

---

## 9. 추천 MVP 캐릭터 파이프라인

### 9.1 1순위: Rive state machine

권장 구조:
- 아트: 1개 캐릭터, bust-up 또는 full-body 단순형.
- 상태:
  - `idle`: 기본 숨쉬기, 눈깜빡임.
  - `ask`: 질문 등장, 손짓.
  - `thinking`: 답변 후 계산 중, 눈동자 이동/머리 갸웃.
  - `confident`: 확신, 반짝임/앞으로 몸 기울임.
  - `surprised`: 오답 피드백 직후.
  - `recover`: 다시 질문, 미안한 표정에서 회복.
  - `reveal`: 정답 공개, 축하 모션.
- 입력값:
  - `mood`: 0~100. confidence 기반.
  - `isThinking`: boolean.
  - `triggerAsk`, `triggerGuess`, `triggerWrong`, `triggerReveal`.
  - `topicCue`: hot/cold/crunch/sweet/soup 등은 선택.

엔진과 매핑:

```ts
function cueFromEngine(state, confidence, lastAnswer, wrongGuessCount) {
  if (state === "revealed") return { triggerReveal: true, mood: 100 };
  if (state === "guessing") return { triggerGuess: true, mood: confidence * 100 };
  if (wrongGuessCount > 0 && state === "asking") return { triggerWrong: true, mood: 35 };
  if (state === "asking") return { triggerAsk: true, mood: confidence * 100 };
  return { isThinking: true, mood: confidence * 100 };
}
```

### 9.2 2순위: Lottie clips + light state controller

일정상 Rive 제작자가 없다면:
- 상태별 Lottie 클립 6~8개 제작.
- 앱은 상태 전환 시 clip을 crossfade/replace.
- confidence에 따른 동적 blend는 포기하고, low/mid/high confidence 3단계 클립으로 보완.

### 9.3 Fallback: layered raster

- WebP 레이어 8~12개.
- CSS keyframes + JS state class.
- 눈깜빡임/입/팔/몸통 bounce 구현.
- 단, 외부 공개 전 아트 품질 리뷰 필수.

---

## 10. 전체 MVP 아키텍처

### 10.1 클라이언트

- Question UI: 5답변 버튼.
- Character runtime: Rive 또는 Lottie.
- Session state display: 질문 번호 대신 “감이 오는 중” 같은 비정량 진행 문구.
- Guess feedback UI: 맞아요/아니에요.

### 10.2 서버 또는 로컬 엔진

작은 도메인에서는 클라이언트 로컬 엔진도 가능하지만, 운영 로그와 데이터 업데이트를 고려하면 서버 API 추천.

구성:
- `candidateStore`: JSON/DB.
- `questionStore`: JSON/DB.
- `scoringEngine`: 답변 반영, 후보 확률 계산.
- `questionSelector`: split score/IG.
- `sessionManager`: 답변/오답/종료 상태.
- `analyticsLogger`: 익명 세션 이벤트.

### 10.3 데이터 파일 구조 예

```txt
/data
  candidates.json
  questions.json
  calibration.json       // threshold, weights, penalties
/src
  inference/
    score.ts
    selectQuestion.ts
    threshold.ts
    recovery.ts
  api/
    sessions.ts
  character/
    cueMapper.ts
```

---

## 11. 주요 리스크와 대응

### 리스크 1: 질문 데이터 품질 부족

증상:
- 특정 음식이 계속 오답.
- 질문이 후보를 잘 나누지 못함.

대응:
- 후보별 coverage 리포트 생성.
- 질문별 split score 사전 검사.
- false positive가 많은 후보는 고유 분리 질문 추가.

Acceptance gate:
- 모든 active 후보는 최소 20개 질문에 기대값 보유.
- 각 후보는 top 유사 후보 3개와 구분 가능한 질문을 최소 2개 보유.

### 리스크 2: 사용자가 속성을 모름

증상:
- `모르겠어요`가 많고 엔진이 진전 없음.

대응:
- clarity 낮은 질문 후순위.
- unknown 2회 연속 시 쉬운 형태/맛 질문으로 전환.
- “잘 모르겠다면 느낌으로 골라도 돼요” 마이크로카피.

### 리스크 3: 너무 빨리 정답을 찍어 틀림

대응:
- top1-top2 margin threshold 적용.
- early direct question 금지.
- tentative guess 후 feedback을 별도 처리.

### 리스크 4: 캐릭터 제작 병목

대응:
- Rive 1캐릭터/7상태만 MVP scope로 고정.
- topic별 특수 애니메이션은 v2로 미룸.
- Lottie fallback 준비.

### 리스크 5: 애니메이션이 추론 상태와 어긋남

대응:
- 엔진 응답에 `characterCue`를 명시적으로 포함.
- 프론트가 임의로 판단하지 않게 cue contract 정의.
- 상태 전환 중복 trigger debounce.

---

## 12. Acceptance tests

### 12.1 데이터 검증 테스트

1. **Candidate coverage**
   - Given active candidate 50개
   - When 데이터 검증을 실행하면
   - Then 각 후보는 active question 중 최소 20개 이상의 attribute 값을 가진다.

2. **Question coverage**
   - Given active question 전체
   - Then 각 질문은 최소 10개 후보에서 yes 계열, 최소 10개 후보에서 no 계열 기대값을 가진다. 단 niche 질문은 `revealRisk` 또는 `lateOnly`로 표시한다.

3. **No invalid weights**
   - Then 모든 candidate attribute 값은 `-1 <= value <= 1`이다.

4. **No duplicate labels**
   - Then candidate `id`, question `id`는 중복이 없다.

### 12.2 추론 엔진 테스트

1. **Single strong answer updates ranking**
   - Given “국물 있음=네” 답변
   - Then `has_soup` 기대값이 높은 후보들의 평균 점수는 기대값이 낮은 후보보다 상승한다.

2. **Probably answer has weaker impact**
   - Given 동일 질문에 “네”와 “아마도요”를 각각 입력
   - Then “아마도요”의 logScore 변화량 절대값은 “네”보다 작다.

3. **Unknown does not distort ranking**
   - Given “모르겠어요” 답변
   - Then 후보 순위 변화는 prior 대비 허용 오차 이내이며, 해당 질문은 재질문되지 않는다.

4. **Adaptive selector avoids asked questions**
   - Given 이미 물어본 question ids
   - Then next question은 그 ids를 포함하지 않는다.

5. **Selector prefers high split**
   - Given 후보 분포가 국물 음식과 비국물 음식으로 양분됨
   - Then `has_soup` 또는 유사한 high variance 질문이 top 3 selection 안에 든다.

6. **Reveal threshold requires margin**
   - Given top1=0.73, top2=0.66
   - Then confidence가 높아도 margin 부족으로 reveal하지 않는다.

7. **Late guess cap**
   - Given turn=14
   - Then 시스템은 추가 일반 질문 대신 guessing 또는 recovery 종료로 전환한다.

8. **Wrong guess suppression**
   - Given `kimchi_jjigae`를 추측했고 사용자가 아니라고 함
   - Then 다음 guess는 `kimchi_jjigae`가 아니며 해당 후보 확률은 clamp된다.

9. **Recovery chooses disambiguation**
   - Given 오답 후보와 top 후보가 특정 재료 질문으로 구분 가능
   - Then 오답 직후 next question은 그 구분 질문을 우선 선택한다.

10. **No infinite loop**
    - Given 모든 답변이 “모르겠어요”
    - Then turn cap 이내에 graceful fallback guess 또는 “못 맞혔어요” 상태로 종료한다.

### 12.3 UX/캐릭터 테스트

1. **Cue contract completeness**
   - Given engine response states `asking`, `guessing`, `revealed`, `recovering`
   - Then 모든 state는 유효한 `characterCue`를 포함한다.

2. **Rive state availability**
   - Given MVP Rive 파일
   - Then `idle`, `ask`, `thinking`, `confident`, `surprised`, `recover`, `reveal` 상태가 존재한다.

3. **Confidence mood mapping**
   - Given confidence 0.2/0.6/0.9
   - Then 캐릭터 mood input은 low/mid/high 시각 차이를 만든다.

4. **Wrong answer reaction**
   - Given 사용자가 guess를 부정
   - Then 300ms~1000ms 안에 `surprised` 또는 `recover` 애니메이션이 재생된다.

5. **Reveal celebration**
   - Given 정답 accepted
   - Then reveal 애니메이션과 candidate one-liner가 동시에 또는 순차적으로 표시된다.

6. **Reduced motion fallback**
   - Given OS/browser reduced-motion 설정
   - Then 애니메이션은 과격한 이동을 줄이고 idle subtle motion 또는 정지 프레임+fade로 대체된다.

### 12.4 제품 품질 테스트

1. **Golden path set**
   - Given 대표 음식 20개에 대한 사전 정의 답변 시나리오
   - Then 80% 이상이 12문항 이내 1차 정답 또는 2차 회복 정답에 도달한다.

2. **Ambiguous food set**
   - Given 비슷한 음식 쌍: 김치찌개/부대찌개, 라면/우동, 떡볶이/라볶이, 초밥/김밥 등
   - Then 각 쌍을 분리하는 질문이 2개 이상 존재하고, selector가 후반부에 해당 질문을 선택한다.

3. **Session log quality**
   - Given 완료/포기/오답 세션
   - Then answers, guesses, final state, timestamps가 익명 로그에 남는다.

---

## 13. 회의용 권장 결론

1. **추론 모델**: ML 학습 모델이 아니라 연속 attribute 기반 weighted scoring + adaptive split/IG 선택으로 시작한다.
2. **데이터 구조**: `Candidate.attributes[questionId] = -1..1`, `Question`은 clarity/cost/revealRisk를 포함한다.
3. **답변 의미**: 5답변을 `+1/+0.5/0/-0.5/-1`로 통일하고, 확신도는 `abs(answer)`로 반영한다.
4. **질문 선택**: Sprint 1은 weighted variance split, Sprint 3에서 expected information gain으로 고도화한다.
5. **정답 공개**: top1 확률뿐 아니라 top1-top2 margin과 turn cap을 함께 사용한다.
6. **오답 회복**: rejected 후보 suppression, disambiguation 질문, 회복 대사/애니메이션을 필수 플로우로 둔다.
7. **캐릭터 기술**: MVP 1순위는 Rive. 디자이너/일정 리스크가 있으면 Lottie clips, 최후 fallback은 layered raster rig.
8. **acceptance tests**: 데이터 coverage, selector behavior, threshold, recovery, character cue contract를 CI/QA 체크리스트로 관리한다.
