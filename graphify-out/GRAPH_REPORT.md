# Graph Report - food-akinator-hermes-pilot  (2026-05-28)

## Corpus Check
- 23 files · ~12,466 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 315 nodes · 312 edges · 25 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c7ad3c15`
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

## God Nodes (most connected - your core abstractions)
1. `Architect Gate — Food Akinator v0` - 14 edges
2. `작은 음식 도메인 Akinator-like 추론 엔진 + 캐릭터/모션 파이프라인 제안` - 14 edges
3. `Designer Gate — Food Akinator Zero-to-One` - 11 edges
4. `Architecture — Zero-to-One` - 11 edges
5. `Akinator Direct Play Synthesis — Builder Handoff` - 9 edges
6. `Akinator Direct Play Blocker + Manual Observation Protocol` - 9 edges
7. `Product — Food Akinator Zero-to-One` - 9 edges
8. `QA — Zero-to-One Acceptance` - 8 edges
9. `Design — Zero-to-One Direction` - 8 edges
10. `Akinator Direct Play Log — Harry Potter` - 7 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities (25 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (35): 1. 목표와 핵심 제품 경험, 10.1 클라이언트, 10.2 서버 또는 로컬 엔진, 10.3 데이터 파일 구조 예, 10. 전체 MVP 아키텍처, 11. 주요 리스크와 대응, 12.1 데이터 검증 테스트, 12.2 추론 엔진 테스트 (+27 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (30): ANSWER_VALUES, AnswerKey, AnswerValue, asRecord(), Candidate, LEVELS, Question, QUESTION_AXES (+22 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (23): 판정, 캐릭터 역할, 진행감 표현, 공통 게임 루프, 1. Broad split, 2. Family/domain lock-in, 질문 전략 패턴, 3. Signature discriminator (+15 more)

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (20): 핵심 결정, Answer semantics, Architect Gate — Food Akinator v0, Builder 금지, Character boundary, code:txt (data/), code:ts (type AnswerValue = 1 | 0.5 | 0 | -0.5 | -1;), code:txt (logScore(candidate)) (+12 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (17): 현재 판정, 시도한 경로, 1. Headless/browser 공식 웹, 2. SilverGames embedded route, 3. npm/API wrapper, 하지 않은 것, 4. macOS local browser/computer-use, 필요한 사용자 입력/권한 (+9 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (15): 추천 캐릭터 방향, 후보 비교, 최종 추천, 5-answer rhythm, A. 입맛 탐정 “맛정이”, B. 보글 셰프, Builder handoff, C. 입맛 레이더 “냠테나” (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (15): 핵심 인사이트, 주요 맥락, 배달, 외식, 야식, 혼밥, 데이트, 추천 제품안 (+7 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (13): 원칙, Adaptive selector, Answer semantics, Architecture — Zero-to-One, Builder gate, Candidate schema, Character cue contract, code:ts (type Candidate = {) (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.17
Nodes (11): 회의 판정, 합의된 방향, 기존 실패와의 단절, 다음 agent graph, 현재 next step, T1 Researcher — 실제 Akinator 플레이 로그 보강 ✅, T2 Designer — product feel/design handoff, T3 Architect — engine/data architecture (+3 more)

### Community 9 - "Community 9"
Cohesion: 0.17
Nodes (12): 7.1 세션 시작, 7.2 답변 제출, 7.3 추측 피드백, 7. 엔진 API 초안, code:http (POST /sessions), code:json ({), code:http (POST /sessions/{id}/answers), code:json ({) (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.2
Nodes (9): 제품 한 줄 정의, 구현 우선순위, 핵심 문제, Builder 시작 조건, MVP 범위, Non-goals, Product — Food Akinator Zero-to-One, 제품 thesis (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.2
Nodes (10): 4.1 후보 확률 정규화, 4.2 Expected information gain, 4.3 작은 도메인에서의 간단 대안, 4. Adaptive next-question selection, code:txt (IG(q) = H(C) - Σ_a P(a | q) * H(C | answer=a, q)), code:txt (questionScore(q) = IG(q)), code:txt (mean = Σ P(c) * expected(c,q)), code:txt (P(c) = exp(logScore(c) / T) / Σ exp(logScore(i) / T)) (+2 more)

### Community 12 - "Community 12"
Cohesion: 0.22
Nodes (8): 핵심 판정, Browser QA, Data tests, Direct-play derived QA, Engine tests, Live canary, Product acceptance, QA — Zero-to-One Acceptance

### Community 13 - "Community 13"
Cohesion: 0.22
Nodes (8): 디자인 방향, Character requirement, Design — Zero-to-One Direction, Non-copy boundary, Reference principles from Akinator, Reference principles from direct play, Screen/state inventory, Visual acceptance

### Community 14 - "Community 14"
Cohesion: 0.25
Nodes (7): Akinator Direct Play Log — Harry Potter, Entry flow observations, Gate status, Interaction insights, Product implications for Korean food Akinator, Question/answer trace, Run metadata

### Community 15 - "Community 15"
Cohesion: 0.29
Nodes (6): Akinator Direct Play Log — Elon Musk, Gate status, Interaction insights, Product implications for Korean food Akinator, Question/answer trace, Run metadata

### Community 16 - "Community 16"
Cohesion: 0.29
Nodes (7): 3.1 점수 갱신 방식 A: soft distance scoring, MVP 추천, 3.2 점수 갱신 방식 B: naive Bayes, 3. 5-answer weight semantics, code:txt (logScore(c) = log(prior(c)) + Σ answered q [ weight(q, answe), code:txt (similarity(a, e) = 1 - abs(a - e)        // 범위 대략 -1~1), code:txt (similarity(a, e) = - ((a - e)^2) / (2σ²)), code:txt (answerConfidence = abs(answerValue)      // yes/no는 1, proba)

### Community 17 - "Community 17"
Cohesion: 0.29
Nodes (6): Akinator Direct Play Log — Pikachu, Gate status, Interaction insights, Product implications for Korean food Akinator, Question/answer trace, Run metadata

### Community 18 - "Community 18"
Cohesion: 0.29
Nodes (6): Akinator Direct Play Log — Naruto Uzumaki, Gate status, Interaction insights, Product implications for Korean food Akinator, Question/answer trace, Run metadata

### Community 19 - "Community 19"
Cohesion: 0.29
Nodes (6): Akinator Direct Play Log — Heung-min Son, Gate status, Interaction insights, Product implications for Korean food Akinator, Question/answer trace, Run metadata

### Community 20 - "Community 20"
Cohesion: 0.29
Nodes (6): 직접 플레이 상태, 관찰된 핵심 원리, Akinator Reference Observations, Food 서비스 적용 원칙, Non-copy boundary, 추가 리서치 TODO

### Community 21 - "Community 21"
Cohesion: 0.33
Nodes (6): 6.1 Suppression 데이터, 6.2 Recovery strategy, 6.3 Learning hook, 6. Wrong guess suppression/recovery, code:ts (type SessionState = {), code:json ({)

### Community 22 - "Community 22"
Cohesion: 0.33
Nodes (5): 금지, 배포 완료 정의, 현재 release 상태, Release policy, Release — Zero-to-One

### Community 23 - "Community 23"
Cohesion: 0.33
Nodes (5): 현재 상태, 목표, 원칙, 문서, Food Akinator — Zero-to-One Research Foundation

### Community 24 - "Community 24"
Cohesion: 0.4
Nodes (5): 9.1 1순위: Rive state machine, 9.2 2순위: Lottie clips + light state controller, 9.3 Fallback: layered raster, 9. 추천 MVP 캐릭터 파이프라인, code:ts (function cueFromEngine(state, confidence, lastAnswer, wrongG)

## Knowledge Gaps
- **216 isolated node(s):** `validQuestion`, `question`, `candidate`, `soupCandidate`, `crispyCandidate` (+211 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `작은 음식 도메인 Akinator-like 추론 엔진 + 캐릭터/모션 파이프라인 제안` connect `Community 0` to `Community 9`, `Community 11`, `Community 16`, `Community 21`, `Community 24`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `7. 엔진 API 초안` connect `Community 9` to `Community 0`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `4. Adaptive next-question selection` connect `Community 11` to `Community 0`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `validQuestion`, `question`, `candidate` to the rest of the system?**
  _216 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._