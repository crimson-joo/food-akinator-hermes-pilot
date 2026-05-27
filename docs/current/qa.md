# QA baseline — restart

## Definition of done for future builds

A future implementation is not done when tests pass. It is done only when:

- engine tests pass,
- UI flow tests pass,
- browser QA passes,
- design acceptance criteria pass,
- deployed live URL passes canary if public,
- old failed foundation is not reintroduced.

## Core QA flows

1. Entry → start → 5-answer question loop → reveal → correct → restart.
2. Entry → start → mixed uncertain answers → reveal.
3. Entry → start → reveal → wrong → additional question → second reveal.
4. Mobile viewport 390x844 with no horizontal overflow.
5. Reduced motion mode still usable.
6. Character changes state on answer, thinking, confidence, reveal, success, wrong.

## Visual QA red flags

- Looks like a form/survey.
- Character is crude CSS/DOM mascot.
- Character swaps disconnected images without continuity.
- First screen does not explain secret-target game.
- Questions expose internal tags directly.
- Reveal is just text on a card without drama.
