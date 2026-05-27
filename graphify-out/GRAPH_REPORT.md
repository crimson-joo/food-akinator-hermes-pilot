# Graph Report - food-akinator-hermes-pilot  (2026-05-28)

## Corpus Check
- 30 files · ~7,816 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 155 nodes · 211 edges · 19 communities (16 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4faba4a4`
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

## God Nodes (most connected - your core abstractions)
1. `Inference and question narrowing model` - 11 edges
2. `Akinator gameplay reference analysis` - 9 edges
3. `answerCurrentQuestion()` - 8 edges
4. `Character animation pipeline research` - 8 edges
5. `createSession()` - 7 edges
6. `Product brief — 아무거나 지니 fresh restart` - 7 edges
7. `Architecture baseline — restart` - 7 edges
8. `Design direction — restart baseline` - 7 edges
9. `FOODS` - 6 edges
10. `topCandidates()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `createSession()` --calls--> `initializePosterior()`  [EXTRACTED]
  src/game/session.ts → src/engine/score.ts
- `answerCurrentQuestion()` --calls--> `applyAnswer()`  [EXTRACTED]
  src/game/session.ts → src/engine/score.ts
- `CharacterController()` --calls--> `stateForSession()`  [EXTRACTED]
  src/character/CharacterController.tsx → src/character/characterStateMap.ts
- `createSession()` --calls--> `selectNextQuestion()`  [EXTRACTED]
  src/game/session.ts → src/engine/selectQuestion.ts
- `answerCurrentQuestion()` --calls--> `selectNextQuestion()`  [EXTRACTED]
  src/game/session.ts → src/engine/selectQuestion.ts

## Communities (19 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.14
Nodes (20): Food, FOODS, TraitKey, TRAITS, Question, QUESTIONS, ANSWER_STRENGTH, applyAnswer() (+12 more)

### Community 1 - "Community 1"
Cohesion: 0.18
Nodes (16): Answer, topCandidates(), selectNextQuestion(), answerCurrentQuestion(), createSession(), markGuessCorrect(), markGuessWrong(), Phase (+8 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (17): Candidate model, code:ts (type Candidate = {), code:ts (type FoodCandidate = {), code:ts (type Answer = 'yes' | 'probably' | 'unknown' | 'probablyNot'), code:text (candidateScore += questionWeight * similarity(answerEvidence), code:text (매운맛 태그를 선택하세요.), code:text (오늘은 얼큰하게 땀이 좀 나도 괜찮아요?), Core claim (+9 more)

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (12): Character animation pipeline research, Likely approaches in Akinator-like products, Minimum character state set, Non-copy rule, Option A — pre-rendered sprite / WebP sequence, Option B — layered WebP/PNG rig, Option C — Rive state machine, Option D — Spine / Live2D (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.2
Nodes (9): Architecture baseline — restart, Build rule, code:text (src/), code:text (entry), Core modules to build later, Current status, First implementation milestone, Recommended stack candidate (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.31
Nodes (7): CharacterController(), CHARACTER_STATES, CharacterState, stateForSession(), asking, entry, Session

### Community 6 - "Community 6"
Cohesion: 0.2
Nodes (9): Akinator gameplay reference analysis, Character role, Core play loop, Do not copy, Five-answer semantics, Principles to borrow, Repeat-play pattern, Scope / limitation (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (7): Current phase, Decision, Non-goals, Product brief — 아무거나 지니 fresh restart, Product principles, Product thesis, Target use case

### Community 8 - "Community 8"
Cohesion: 0.25
Nodes (7): Candidate character concepts to explore, Design direction — restart baseline, Design stance, Direction name, QA acceptance draft, Required states, Visual non-negotiables

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (5): Branch policy, Canary, CI, Deploy, Release contract

### Community 10 - "Community 10"
Cohesion: 0.4
Nodes (4): 아무거나 탐정단, code:bash (npm ci), Local development, Release

### Community 11 - "Community 11"
Cohesion: 0.4
Nodes (4): Changelog, Current truth, Docs index, Research

## Knowledge Gaps
- **80 isolated node(s):** `checks`, `ANSWERS`, `before`, `after`, `entry` (+75 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `answerCurrentQuestion()` connect `Community 1` to `Community 0`, `Community 5`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `checks`, `ANSWERS`, `before` to the rest of the system?**
  _80 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._