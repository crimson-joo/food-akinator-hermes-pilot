# Graph Report - final-service-completion  (2026-05-28)

## Corpus Check
- 32 files · ~10,512 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 181 nodes · 267 edges · 20 communities (18 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ecc44a0f`
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

## God Nodes (most connected - your core abstractions)
1. `Inference and question narrowing model` - 11 edges
2. `answerCurrentQuestion()` - 10 edges
3. `Akinator gameplay reference analysis` - 9 edges
4. `createSession()` - 8 edges
5. `FOODS` - 8 edges
6. `topCandidates()` - 8 edges
7. `Character animation pipeline research` - 8 edges
8. `Product brief — 아무거나 탐정단 final service` - 8 edges
9. `Design direction — final service` - 8 edges
10. `Architecture baseline — final service` - 7 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `RevealReadiness`  [EXTRACTED]
  src/App.tsx → src/game/session.ts
- `createSession()` --calls--> `initializePosterior()`  [EXTRACTED]
  src/game/session.ts → src/engine/score.ts
- `answerCurrentQuestion()` --calls--> `applyAnswer()`  [EXTRACTED]
  src/game/session.ts → src/engine/score.ts
- `CharacterController()` --calls--> `stateForSession()`  [EXTRACTED]
  src/character/CharacterController.tsx → src/character/characterStateMap.ts
- `RevealReadiness` --calls--> `topCandidates()`  [EXTRACTED]
  src/game/session.ts → src/engine/score.ts

## Communities (20 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (21): baseTraits, Food, FOODS, TraitKey, TRAITS, Question, QUESTIONS, ANSWER_STRENGTH (+13 more)

### Community 1 - "Community 1"
Cohesion: 0.18
Nodes (19): Answer, topCandidates(), selectNextQuestion(), readiness, seen, session, answerCurrentQuestion(), createSession() (+11 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (17): Candidate model, code:ts (type Candidate = {), code:ts (type FoodCandidate = {), code:ts (type Answer = 'yes' | 'probably' | 'unknown' | 'probablyNot'), code:text (candidateScore += questionWeight * similarity(answerEvidence), code:text (매운맛 태그를 선택하세요.), code:text (오늘은 얼큰하게 땀이 좀 나도 괜찮아요?), Core claim (+9 more)

### Community 3 - "Community 3"
Cohesion: 0.17
Nodes (14): Architecture baseline — final service, Architecture baseline — restart, Build rule, code:text (src/), code:text (entry), Core modules, Core modules to build later, Current status (+6 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (12): Character animation pipeline research, Likely approaches in Akinator-like products, Minimum character state set, Non-copy rule, Option A — pre-rendered sprite / WebP sequence, Option B — layered WebP/PNG rig, Option C — Rive state machine, Option D — Spine / Live2D (+4 more)

### Community 5 - "Community 5"
Cohesion: 0.19
Nodes (12): Candidate character concepts to explore, Design direction — final service, Design direction — restart baseline, Design stance, Direction name, Final character concept, QA acceptance, QA acceptance draft (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.2
Nodes (9): Akinator gameplay reference analysis, Character role, Core play loop, Do not copy, Five-answer semantics, Principles to borrow, Repeat-play pattern, Scope / limitation (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.2
Nodes (9): 아무거나 탐정단, code:bash (npm ci), Local development, Release, What it is, 아무거나 탐정단, code:bash (npm ci), Local development (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (9): Current phase, Decision, Final service scope, Non-goals, Product brief — 아무거나 탐정단 final service, Product brief — 아무거나 지니 fresh restart, Product principles, Product thesis (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.31
Nodes (7): CharacterController(), CHARACTER_STATES, CharacterState, stateForSession(), asking, entry, Session

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (5): Branch policy, Canary, CI, Deploy, Release contract

### Community 11 - "Community 11"
Cohesion: 0.4
Nodes (4): Changelog, Current truth, Docs index, Research

### Community 12 - "Community 12"
Cohesion: 0.5
Nodes (3): Changelog, Final service MVP, Fresh repository restart

### Community 13 - "Community 13"
Cohesion: 0.5
Nodes (3): Final service acceptance, Fresh vertical-slice acceptance, QA acceptance

## Knowledge Gaps
- **83 isolated node(s):** `checks`, `ANSWERS`, `before`, `after`, `entry` (+78 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `answerCurrentQuestion()` connect `Community 1` to `Community 0`, `Community 9`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `FOODS` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `checks`, `ANSWERS`, `before` to the rest of the system?**
  _83 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._