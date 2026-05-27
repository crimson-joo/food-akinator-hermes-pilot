# Architecture baseline — final service

## Stack

- Frontend: Vite + React + TypeScript.
- State: explicit finite game session state in `src/game/session.ts`.
- Data: static menu/question catalogue in `src/data/*`.
- Engine: weighted posterior scoring and information-gain-ish question selection in `src/engine/*`.
- Character: state mapping and SVG asset pipeline in `src/character/*` and `src/assets/characters/*`.
- Testing: Vitest + React Testing Library.
- Deploy: GitHub Pages from `dist`.

## Core modules

```text
src/
  data/
    foods.ts          # 46 menu candidates
    questions.ts      # 46 natural Korean questions
  engine/
    score.ts          # answer likelihood and top candidates
    selectQuestion.ts # next-question selection by candidate split
  game/
    session.ts        # finite session/reveal/recovery state
  character/
    CharacterController.tsx
    characterStateMap.ts
  App.tsx             # final service UI shell/flow
```

## State machine

```text
entry
→ asking
→ thinking | guessAnticipation | asking
→ reveal
→ correct | wrongRecovery
→ asking | reveal
→ entry on restart
```

## Reveal rule

`revealReadiness()` exposes:
- `answeredCount`
- top confidence
- top1/top2 gap
- reason: too-early, confident, max-turns, no-question

Reveal occurs when:
- at least 6 questions and confidence/gap are sufficient, or
- max 12 questions reached, or
- no useful question remains.

## Build rule

Strict TDD remains the default:
1. Data/engine/session acceptance tests first.
2. UI flow tests for visible final-service elements.
3. Browser QA / canary after build.

## Current status

Final service MVP implemented with local test/lint/build passing. Public release requires PR/merge, GitHub Pages deploy, and live canary.
