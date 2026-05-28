# Akinator Direct Play Log — Harry Potter

## Run metadata

- Date: 2026-05-28
- Environment: local macOS Chrome via `CuaDriver.app` / `cua-driver serve`
- URL path: `https://en.akinator.com/` → `/theme-selection` → `/game`
- Theme selected: Characters
- Target: Harry Potter
- First guess: Harry Potter
- Question count until first guess: 14 answered questions, reveal after answer to Q14
- Correct? Yes
- Screenshots captured locally:
  - `/tmp/akinator-initial.png`
  - `/tmp/akinator-theme.png`
  - `/tmp/akinator-q1.png`
  - `/tmp/akinator-q1-query.png`
  - `/tmp/akinator-q2-query.png`
  - `/tmp/akinator-after-play.png`

## Entry flow observations

1. Home screen uses a direct character prompt:
   - “Hello, I am Akinator”
   - “Think about a real or fictional character. I will try to guess who it is”
   - Primary CTA: “PLAY”
2. After PLAY, Akinator does not start immediately. It asks for game thematic:
   - Characters
   - Objects
   - Animals
3. The game uses a stable 5-answer palette:
   - Yes
   - No
   - Don’t know
   - Probably
   - Probably not
4. The visible question number increments every turn.
5. The UI keeps the character/brand stage around the question card, but the question/answers remain the operational center.

## Question/answer trace

| Turn | Question | Answer | Notes |
|---:|---|---|---|
| 1 | Does your character really exist? | No | First split real vs fictional. |
| 2 | Is your character a girl? | No | Broad demographic split. |
| 3 | Is your character from a video game? | No | Medium/source split. |
| 4 | Does your character speak Japanese? | No | Anime/Japanese media branch elimination. |
| 5 | Does your character have a human nose? | Yes | Human/non-human split. |
| 6 | Does your character go to school? | Yes | School-age/student identity split. |
| 7 | Does your character have a brother or sister? | No | Family attribute split. |
| 8 | Is your character from a cartoon? | No | Animation branch elimination. |
| 9 | Is your character from a TV series? | No | TV branch elimination. |
| 10 | Is your character from a movie? | Yes | Movie branch selected. |
| 11 | Does your character play in 'Harry Potter'? | Yes | Franchise-level narrowing. |
| 12 | Is your character part of a trio? | Yes | Main trio branch. |
| 13 | Is your character from Gryffindor? | Yes | House/faction narrowing. |
| 14 | Does your character wear glasses? | Yes | Distinguishes Harry from Ron/Hermione/others. |
| Reveal | I THINK OF: Harry Potter | Yes | Correct first guess. |

## Interaction insights

- Akinator’s early questions are not “random trivia”; they are high-information splitters: existence → gender → medium/source → language/culture → human trait.
- The mid-game shifts from broad taxonomy to domain membership: movie → Harry Potter franchise.
- Late-game questions become discriminators inside a tight candidate set: trio → Gryffindor → glasses.
- The app does not expose numeric confidence, but the narrowing is felt through question specificity.
- First guess happens immediately after a visually distinctive discriminator, not after asking for redundant confirmation.
- The answer palette matters: “Probably / Probably not / Don’t know” lets the game continue under uncertainty without requiring binary truth.

## Product implications for Korean food Akinator

- Early food questions should split craving space broadly: meal moment, temperature, broth/sauce, rice/noodle/bread, heaviness, spice, meat/seafood/veg.
- Mid-game should move into cuisine/format families: 국밥/찌개/면/분식/구이/덮밥/치킨/야식.
- Late-game should ask distinctive discriminators, not generic preferences: “국물이 빨갛고 얼큰해야 해?”, “밥을 말아먹는 그림이 떠올라?”, “치즈/튀김 같은 보상감이 필요해?”
- Reveal should feel earned by the last discriminator and show why the guess follows from answers.
- Uncertainty buttons are required; Korean craving selection often starts fuzzy, not as known target lookup.

## Gate status

This is direct-play log 1 of minimum 3 required by the Builder gate.
