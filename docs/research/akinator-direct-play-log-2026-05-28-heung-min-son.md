# Akinator Direct Play Log — Heung-min Son

## Run metadata

- Date: 2026-05-28
- Environment: local macOS Chrome via `CuaDriver.app` / `cua-driver serve`
- URL path: `https://en.akinator.com/` → `/theme-selection` → `/game`
- Theme selected: Characters
- Target: Heung-min Son
- First guess: Heung-min Son
- Question count until first guess: 22 answered questions, reveal after answer to Q22
- Correct? Yes
- Screenshots captured locally:
  - `/tmp/akinator-son-q1.png` through `/tmp/akinator-son-reveal3.png`
  - `/tmp/akinator-son-correct.png`

## Question/answer trace

| Turn | Question | Answer | Notes |
|---:|---|---|---|
| 1 | Is your character from an anime? | No | Medium/source elimination first, not real/fictional first. |
| 2 | Does your character walk on two legs? | Yes | Body/human-likeness check. |
| 3 | Is your character a girl? | No | Gender split. |
| 4 | Is your character from a game? | No | Medium/source elimination. |
| 5 | Is your character a real person? | Yes | Real-person branch established later than Harry Potter run. |
| 6 | Is your character older than 35 years old? | No | Age narrowing. |
| 7 | Does your character know your name? | No | Personal-acquaintance/parasocial split. |
| 8 | Is your character a YouTuber? | No | Profession/content-creator elimination. |
| 9 | Is your character a singer, or does he work with a singer? | No | Entertainment-profession elimination. |
| 10 | Is your character a sportsman? | Yes | Profession family selected. |
| 11 | Is your character's fame linked with football? | Yes | Sport family narrowed. |
| 12 | Has your character ever played for Paris Saint-Germain? | No | Club-history discriminator; likely eliminates Messi/Neymar/Mbappé path. |
| 13 | Is your character linked to the English Premier League? | Yes | League narrowing. |
| 14 | Is your character linked with Manchester? | No | Club/city elimination. |
| 15 | Is your character from England? | No | Nationality elimination. |
| 16 | Has your character played for Liverpool? | No | Club elimination. |
| 17 | Is your character black? | No | Appearance/demographic discriminator. |
| 18 | Is your character European? | No | Continent/nationality narrowing. |
| 19 | Is your character from Argentina? | No | Messi path elimination. |
| 20 | Is your character Korean? | Yes | Nationality lock-in. |
| 21 | Does your character play for Tottenham Hotspur? | Yes | Club lock-in. |
| 22 | Does your character play for a German club? | No | Current-club/history ambiguity resolved before reveal. |
| Reveal | I THINK OF: Heung-min Son | Yes | Correct first guess. |

## Interaction insights

- For real people, Akinator spends many turns eliminating content/entertainment branches before selecting profession.
- Once “sportsman + football” is confirmed, the question strategy becomes league → club/city → nationality → exact club.
- The path shows how a system can use negative answers productively: PSG/Manchester/England/Liverpool/Argentina exclusions dramatically narrow candidate space.
- The strongest “felt confidence” moment was Q20–Q21: Korean + Tottenham Hotspur made the answer obvious before reveal.
- Some questions are temporally ambiguous: “play for a German club?” conflicts with past club history vs current club. The game still recovered because earlier Tottenham/current-context clues dominated.

## Product implications for Korean food Akinator

- A food version should use negative answers as active pruning, not just failed preference collection.
- After selecting a food family, narrow by region/serving context/venue/ingredient signature, analogous to league → club → nationality.
- Ambiguous wording can harm trust. Food questions should specify current craving context: “지금 먹고 싶은 건…” / “그 음식 자체가…” / “보통 떠올리는 형태가…”.
- Reveal should happen after a lock-in pair, e.g. “빨간 국물 + 떡/어묵 + 분식집” before 떡볶이.

## Gate status

This is direct-play log 3. Combined with Harry Potter and Pikachu, direct-play full logs: 3.
