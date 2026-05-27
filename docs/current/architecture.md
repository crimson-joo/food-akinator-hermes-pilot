# Architecture baseline — restart

## Current status

No app scaffold yet. This is intentional. Implementation starts only after the first research/design/architecture gate is accepted.

## Recommended stack candidate

- Frontend: Vite + React + TypeScript or Next.js if routing/content grows.
- State: explicit finite game session state, not ad hoc component booleans.
- Animation: one of:
  - Layered WebP/PNG + Framer Motion/GSAP
  - Rive state machine
- Testing: Vitest + React Testing Library for engine/UI state; Playwright for full game flow.
- Docs: `docs/current/*` canonical docs, `docs/research/*` research notes, `.hermes/runs/*` local run artifacts.

## Core modules to build later

```text
src/
  data/
    foods.ts
    questions.ts
  engine/
    score.ts
    selectQuestion.ts
    reveal.ts
  game/
    session.ts
    states.ts
  character/
    CharacterController.tsx
    characterStateMap.ts
  ui/
    EntryScreen.tsx
    QuestionScreen.tsx
    RevealScreen.tsx
    RecoveryScreen.tsx
```

## State machine draft

```text
entry
→ asking
→ answerAccepted
→ thinking
→ asking | guessAnticipation
→ reveal
→ correct | wrongRecovery
→ entry | asking
```

## Build rule

Strict TDD once implementation begins:

1. Engine tests first.
2. State machine tests.
3. Character state mapping tests.
4. UI flow tests.
5. Browser QA / canary.

## First implementation milestone

Do not build full UI first. Build a vertical slice:

1. 20 food candidates.
2. 25 discriminating questions.
3. 5-answer scoring.
4. adaptive next question selection.
5. reveal threshold.
6. wrong guess suppression.
7. placeholder character state contract, but no crude CSS mascot.

Character art pipeline can use temporary neutral placeholders only if visually hidden from public release; public demo requires accepted asset direction.
