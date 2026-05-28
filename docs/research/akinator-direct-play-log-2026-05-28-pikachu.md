# Akinator Direct Play Log — Pikachu

## Run metadata

- Date: 2026-05-28
- Environment: local macOS Chrome via `CuaDriver.app` / `cua-driver serve`
- URL path: `https://en.akinator.com/` → `/theme-selection` → `/game`
- Theme selected: Characters
- Target: Pikachu
- First guess: Pikachu
- Question count until first guess: 17 answered questions, reveal after answer to Q17
- Correct? Yes
- Screenshots captured locally:
  - `/tmp/akinator-pikachu-q1.png` through `/tmp/akinator-pikachu-reveal5.png`
  - `/tmp/akinator-pikachu-correct.png`

## Question/answer trace

| Turn | Question | Answer | Notes |
|---:|---|---|---|
| 1 | Does your character really exist? | No | Fictional branch. |
| 2 | Is your character a girl? | No | Broad demographic/gender split, despite fictional non-human target. |
| 3 | Does your character wear a hat? | No | Early visual accessory discriminator. |
| 4 | Does your character speak Japanese? | No | Language/culture branch; awkward for a non-verbal Pokémon. |
| 5 | Does your character have a human nose? | No | Human/non-human split. |
| 6 | Is your character an animal? | Yes | Non-human animal-like branch. |
| 7 | Is your character from a game? | Yes | Medium/source narrowing. |
| 8 | Is your character from an horror game? | No | Game genre elimination. |
| 9 | Does your character wear shoes? | No | Visual/body discriminator. |
| 10 | Does your character stand on two legs? | Yes | Body posture discriminator. |
| 11 | Is your character a Pokemon? | Yes | Franchise-level narrowing. |
| 12 | Does your character produce electricity? | Yes | Signature ability discriminator. |
| 13 | Has your character ever been in Ash's pokemon team? | Yes | Canon relationship narrowing. |
| 14 | Is your character linked to One Direction? | No | Odd/low-signal branch appeared even after Pokémon narrowing. |
| 15 | Does your character have a yellow tail? | Yes | Visual color/body discriminator. |
| 16 | Is your character a travel companion of Ash? | Yes | Main-character relationship discriminator. |
| 17 | Does your character always wear a hat? | No | Final accessory exclusion before reveal. |
| Reveal | I THINK OF: Pikachu | Yes | Correct first guess. |

## Interaction insights

- Akinator mixes clean taxonomy with occasional noisy probes. Even after strong Pokémon/electric clues, an irrelevant “One Direction” question appeared; the system tolerates wrong-looking questions without derailing.
- Fictional non-human targets still start with human-style attributes, then quickly pivot to body, medium, and franchise.
- The perceived confidence spike came from Q11–Q13: franchise → signature ability → relationship to Ash.
- The final reveal did not need an explicit “Are you Pikachu?” question; it used distinctive visual/relationship discriminators.
- The persistent answer palette kept ambiguous semantic questions answerable even when wording was not perfect.

## Product implications for Korean food Akinator

- Food guessing should tolerate noisy/low-signal questions but recover quickly with high-signal discriminators.
- Mid-game should have family-level pivots equivalent to “Pokemon”: e.g. 국밥/찌개/분식/치킨/면/구이.
- Late-game should use signature sensory clues: color, texture, serving vessel, topping, sauce/broth behavior.
- Some questions may be imperfect for a target; UI copy should make uncertainty acceptable rather than punishing users.

## Gate status

This is direct-play log 2. Combined with Harry Potter, direct-play full logs: 2.
