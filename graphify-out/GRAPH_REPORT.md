# Graph Report - feat-rive-runtime-adapter  (2026-06-01)

## Corpus Check
- 55 files · ~302,232 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 748 nodes · 974 edges · 50 communities (49 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `504fedd0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]

## God Nodes (most connected - your core abstractions)
1. `Release — Zero-to-One` - 15 edges
2. `Architect Gate — Food Akinator v0` - 14 edges
3. `작은 음식 도메인 Akinator-like 추론 엔진 + 캐릭터/모션 파이프라인 제안` - 14 edges
4. `Candidate` - 13 edges
5. `Architecture — Zero-to-One` - 13 edges
6. `Design — Zero-to-One Direction` - 13 edges
7. `AnswerKey` - 12 edges
8. `Character Art/Rig Plan — Akinator-level Benchmark Without Copying` - 12 edges
9. `Designer Gate — Food Akinator Zero-to-One` - 11 edges
10. `QA — Zero-to-One Acceptance` - 11 edges

## Surprising Connections (you probably didn't know these)
- `answerCurrent()` --calls--> `submitAnswer()`  [EXTRACTED]
  tests/engine-session.test.ts → src/engine/session.ts
- `fakeGuessingSession()` --calls--> `createDemoSession()`  [EXTRACTED]
  tests/ui-app.test.ts → src/ui/app.ts
- `sessionWithQuestionRole()` --calls--> `createDemoSession()`  [EXTRACTED]
  tests/ui-app.test.ts → src/ui/app.ts
- `pick()` --calls--> `selectNextQuestion()`  [EXTRACTED]
  tests/engine-selector.test.ts → src/engine/selector.ts
- `simulate()` --calls--> `startSession()`  [EXTRACTED]
  tests/engine-representative-simulation.test.ts → src/engine/session.ts

## Communities (50 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (53): CharacterAssetManifest, AnimationClip, animationStateMachine, baseTransforms, CharacterConcept, CharacterConceptId, characterConcepts, MotionTimelineStep (+45 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (46): scoreCandidates(), ANSWER_OPTIONS, answerOptions(), askingSession(), BuildInput, buildNextSession(), CharacterCue, DEFAULT_POLICY (+38 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (44): events, plan, scheduled, animationNames, answerLabel, answerOrder, answerReaction, cueContract (+36 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (46): EngineSession, accepted, afterAnswer, afterThinking, animations, answerKeys, answerLabels, askingSession (+38 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (34): 현재 상태, 제품 원칙, 실행, 검증, 문서, code:bash (npm install), code:bash (npm test), code:bash (npm test -- --run tests/ui-app.test.ts tests/character-asset) (+26 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (23): 판정, 캐릭터 역할, 진행감 표현, 공통 게임 루프, 1. Broad split, 2. Family/domain lock-in, 질문 전략 패턴, 3. Signature discriminator (+15 more)

### Community 6 - "Community 6"
Cohesion: 0.1
Nodes (20): 핵심 결정, Answer semantics, Architect Gate — Food Akinator v0, Builder 금지, Character boundary, code:txt (data/), code:ts (type AnswerValue = 1 | 0.5 | 0 | -0.5 | -1;), code:txt (logScore(candidate)) (+12 more)

### Community 7 - "Community 7"
Cohesion: 0.1
Nodes (19): 디자인 방향, Canonical character/brand direction — 보글 탐정의 작은 식탁, Character requirement, Current minimal UI scaffold, Design — Zero-to-One Direction, Host identity, Interactive Character Animation v3 contract, Mobile character stage composition (+11 more)

### Community 8 - "Community 8"
Cohesion: 0.15
Nodes (17): AnswerValue, asRecord(), LEVELS, QUESTION_AXES, QUESTION_ROLES, QuestionAxis, QuestionId, requireString() (+9 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (18): Atmosphere, Bogle Canonical Source Art Board, Canonical art direction, code:txt (3ca540c6bf7fd31f37edce2f789dde3f38109c46e2d577744fe8ccbdac92), Concept A — selected, Concept B — secondary reference, Concept C — not selected, Concept evaluation (+10 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (18): Acceptance criteria, Art style target, Character Art/Rig Plan — Akinator-level Benchmark Without Copying, code:txt (src/ui/character/), Fallback: Lottie clips, Frontend component contract, Name / role, New canonical design direction (+10 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (17): Acceptance criteria for production launch, Architect, Auto-resolved decisions, Autoplan Kanban — Food Akinator Production Completion Loop, Current verdict, Designer, Escalation decisions, Evidence index (+9 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (17): 현재 판정, 시도한 경로, 1. Headless/browser 공식 웹, 2. SilverGames embedded route, 3. npm/API wrapper, 하지 않은 것, 4. macOS local browser/computer-use, 필요한 사용자 입력/권한 (+9 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (15): 추천 캐릭터 방향, 후보 비교, 최종 추천, 5-answer rhythm, A. 입맛 탐정 “맛정이”, B. 보글 셰프, Builder handoff, C. 입맛 레이더 “냠테나” (+7 more)

### Community 14 - "Community 14"
Cohesion: 0.12
Nodes (15): 금지, 배포 완료 정의, 배포 완료 정의, 배포 완료 정의, 배포 완료 정의, 배포 완료 정의, 배포 완료 정의, 배포 완료 정의 (+7 more)

### Community 15 - "Community 15"
Cohesion: 0.12
Nodes (15): 원칙, Adaptive selector, Answer semantics, Architecture — Zero-to-One, Builder gate, Candidate schema, Character cue contract, code:ts (type Candidate = {) (+7 more)

### Community 16 - "Community 16"
Cohesion: 0.12
Nodes (15): 핵심 인사이트, 주요 맥락, 배달, 외식, 야식, 혼밥, 데이트, 추천 제품안 (+7 more)

### Community 17 - "Community 17"
Cohesion: 0.14
Nodes (11): selectNextQuestion(), candidates, fallback, nearTie, pick(), questions, ranked, selected (+3 more)

### Community 18 - "Community 18"
Cohesion: 0.15
Nodes (13): 핵심 판정, Baseline browser/perceptual QA gate — 2026-06-01, Browser QA, Data tests, Direct-play derived QA, Engine tests, Golden scenario tests, Live canary (+5 more)

### Community 19 - "Community 19"
Cohesion: 0.2
Nodes (13): answer(), answerButtons, answerUntilGuess(), cases, driveToWrongRecovery(), expectNoConsoleErrors(), expectNoForbiddenVisibleMarkers(), expectRecoveryBeatSequence() (+5 more)

### Community 20 - "Community 20"
Cohesion: 0.24
Nodes (12): FOLLOWUP_ROLES, getActiveCandidates(), getEligibleQuestions(), normalizeWeights(), policyBonus(), QuestionSelection, rankNextQuestions(), round() (+4 more)

### Community 21 - "Community 21"
Cohesion: 0.23
Nodes (8): foodCandidates, foodKnowledgeBase, foodQuestions, Candidate, coveredAttributes, questionIds, roles, values

### Community 22 - "Community 22"
Cohesion: 0.17
Nodes (11): 회의 판정, 합의된 방향, 기존 실패와의 단절, 다음 agent graph, 현재 next step, T1 Researcher — 실제 Akinator 플레이 로그 보강 ✅, T2 Designer — product feel/design handoff, T3 Architect — engine/data architecture (+3 more)

### Community 23 - "Community 23"
Cohesion: 0.17
Nodes (12): 7.1 세션 시작, 7.2 답변 제출, 7.3 추측 피드백, 7. 엔진 API 초안, code:http (POST /sessions), code:json ({), code:http (POST /sessions/{id}/answers), code:json ({) (+4 more)

### Community 24 - "Community 24"
Cohesion: 0.18
Nodes (9): dataset, exactHits, failedSummary, paths, representativeCandidateIds, results, SimulationResult, targets (+1 more)

### Community 25 - "Community 25"
Cohesion: 0.18
Nodes (8): ANSWER_VALUES, AnsweredQuestion, CandidateScore, crispyCandidate, probablyScores, scores, soupCandidate, yesScores

### Community 26 - "Community 26"
Cohesion: 0.18
Nodes (10): 제품 한 줄 정의, 구현 우선순위, 핵심 문제, Akinator-level loop — canonical knowledge base v1, Builder 시작 조건, MVP 범위, Non-goals, Product — Food Akinator Zero-to-One (+2 more)

### Community 27 - "Community 27"
Cohesion: 0.2
Nodes (7): Question, QuestionRole, goldenCandidates, goldenDataset, goldenQuestions, GoldenScenario, goldenScenarios

### Community 28 - "Community 28"
Cohesion: 0.2
Nodes (10): 4.1 후보 확률 정규화, 4.2 Expected information gain, 4.3 작은 도메인에서의 간단 대안, 4. Adaptive next-question selection, code:txt (IG(q) = H(C) - Σ_a P(a | q) * H(C | answer=a, q)), code:txt (questionScore(q) = IG(q)), code:txt (mean = Σ P(c) * expected(c,q)), code:txt (P(c) = exp(logScore(c) / T) / Σ exp(logScore(i) / T)) (+2 more)

### Community 29 - "Community 29"
Cohesion: 0.2
Nodes (6): assetMatch, assetUrl, forbiddenJsPatterns, requiredHtmlPatterns, requiredJsPatterns, url

### Community 30 - "Community 30"
Cohesion: 0.22
Nodes (8): 2026-05-29 — Adaptive selector pilot local PASS, 2026-05-30 — Threshold / golden paths / minimal UI scaffold pilot local PASS, 2026-05-30 — Threshold / golden paths / minimal UI scaffold pilot local progress, 2026-05-31 — Akinator-level canonical knowledge base local PASS, 2026-05-31 — Character/brand interaction slice local PASS, 2026-06-01 — Bogle motion state machine + production completion autoplan, 2026-06-01 — Public docs aligned with live demo / production-blocked state, Changelog

### Community 31 - "Community 31"
Cohesion: 0.25
Nodes (7): 1. 목표와 핵심 제품 경험, 13. 회의용 권장 결론, 5.1 추측 조건, 5.2 Reveal vs tentative guess, 5.3 Confidence messaging, 5. Confidence/reveal threshold, 작은 음식 도메인 Akinator-like 추론 엔진 + 캐릭터/모션 파이프라인 제안

### Community 32 - "Community 32"
Cohesion: 0.25
Nodes (7): Akinator Direct Play Log — Harry Potter, Entry flow observations, Gate status, Interaction insights, Product implications for Korean food Akinator, Question/answer trace, Run metadata

### Community 33 - "Community 33"
Cohesion: 0.29
Nodes (6): 직접 플레이 상태, 관찰된 핵심 원리, Akinator Reference Observations, Food 서비스 적용 원칙, Non-copy boundary, 추가 리서치 TODO

### Community 34 - "Community 34"
Cohesion: 0.29
Nodes (7): 8. 캐릭터/모션 파이프라인 선택지, 8.1 Rive, 8.2 Spine, 8.3 Lottie, 8.4 Layered raster rig, 8.5 CSS procedural rig, 8.6 Canvas/WebGL custom rig

### Community 35 - "Community 35"
Cohesion: 0.29
Nodes (7): 3.1 점수 갱신 방식 A: soft distance scoring, MVP 추천, 3.2 점수 갱신 방식 B: naive Bayes, 3. 5-answer weight semantics, code:txt (logScore(c) = log(prior(c)) + Σ answered q [ weight(q, answe), code:txt (similarity(a, e) = 1 - abs(a - e)        // 범위 대략 -1~1), code:txt (similarity(a, e) = - ((a - e)^2) / (2σ²)), code:txt (answerConfidence = abs(answerValue)      // yes/no는 1, proba)

### Community 36 - "Community 36"
Cohesion: 0.29
Nodes (6): Akinator Direct Play Log — Pikachu, Gate status, Interaction insights, Product implications for Korean food Akinator, Question/answer trace, Run metadata

### Community 37 - "Community 37"
Cohesion: 0.29
Nodes (6): Akinator Direct Play Log — Naruto Uzumaki, Gate status, Interaction insights, Product implications for Korean food Akinator, Question/answer trace, Run metadata

### Community 38 - "Community 38"
Cohesion: 0.29
Nodes (6): Akinator Direct Play Log — Heung-min Son, Gate status, Interaction insights, Product implications for Korean food Akinator, Question/answer trace, Run metadata

### Community 39 - "Community 39"
Cohesion: 0.29
Nodes (6): Akinator Direct Play Log — Elon Musk, Gate status, Interaction insights, Product implications for Korean food Akinator, Question/answer trace, Run metadata

### Community 40 - "Community 40"
Cohesion: 0.33
Nodes (6): 6.1 Suppression 데이터, 6.2 Recovery strategy, 6.3 Learning hook, 6. Wrong guess suppression/recovery, code:ts (type SessionState = {), code:json ({)

### Community 41 - "Community 41"
Cohesion: 0.33
Nodes (6): 11. 주요 리스크와 대응, 리스크 1: 질문 데이터 품질 부족, 리스크 2: 사용자가 속성을 모름, 리스크 3: 너무 빨리 정답을 찍어 틀림, 리스크 4: 캐릭터 제작 병목, 리스크 5: 애니메이션이 추론 상태와 어긋남

### Community 42 - "Community 42"
Cohesion: 0.4
Nodes (5): 10.1 클라이언트, 10.2 서버 또는 로컬 엔진, 10.3 데이터 파일 구조 예, 10. 전체 MVP 아키텍처, code:txt (/data)

### Community 43 - "Community 43"
Cohesion: 0.4
Nodes (5): 12.1 데이터 검증 테스트, 12.2 추론 엔진 테스트, 12.3 UX/캐릭터 테스트, 12.4 제품 품질 테스트, 12. Acceptance tests

### Community 44 - "Community 44"
Cohesion: 0.4
Nodes (5): 2. 도메인 데이터 모델, 2.1 Candidate schema: 음식 후보, 2.2 Question bank schema, code:ts (type Candidate = {), code:ts (type Question = {)

### Community 45 - "Community 45"
Cohesion: 0.4
Nodes (5): 9.1 1순위: Rive state machine, 9.2 2순위: Lottie clips + light state controller, 9.3 Fallback: layered raster, 9. 추천 MVP 캐릭터 파이프라인, code:ts (function cueFromEngine(state, confidence, lastAnswer, wrongG)

### Community 46 - "Community 46"
Cohesion: 0.5
Nodes (3): isExplicitHermesRun, isExplicitHermesRun, isExplicitHermesRun

### Community 47 - "Community 47"
Cohesion: 0.5
Nodes (3): useExistingServer, useExistingServer, useExistingServer

## Knowledge Gaps
- **457 isolated node(s):** `useExistingServer`, `isExplicitHermesRun`, `runtime`, `html`, `manifest` (+452 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AnswerKey` connect `Community 0` to `Community 1`, `Community 2`, `Community 8`, `Community 24`, `Community 25`, `Community 27`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `Candidate` connect `Community 21` to `Community 1`, `Community 2`, `Community 8`, `Community 17`, `Community 20`, `Community 24`, `Community 25`, `Community 27`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `작은 음식 도메인 Akinator-like 추론 엔진 + 캐릭터/모션 파이프라인 제안` connect `Community 31` to `Community 34`, `Community 35`, `Community 40`, `Community 41`, `Community 42`, `Community 43`, `Community 44`, `Community 45`, `Community 23`, `Community 28`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `useExistingServer`, `isExplicitHermesRun`, `runtime` to the rest of the system?**
  _457 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._