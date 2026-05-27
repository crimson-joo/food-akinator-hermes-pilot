# 아무거나 탐정단

Korean food guessing game rebuilt from first principles.

Try it live: https://crimson-joo.github.io/food-akinator-hermes-pilot/

## What it is

The player secretly chooses a food. The app asks one short Korean question at a time, updates an original food-detective character state, and reveals a guess within a short game loop.

Final service MVP:
- 46 Korean/nearby menu candidates
- 46 natural-language question cards
- 5-answer uncertainty loop
- food detective character states
- candidate board and confidence breakdown
- wrong-guess recovery with actual-answer memo

## Local development

```bash
npm ci
npm run test:run
npm run lint
npm run build
npm run dev
```

## Release

- Branch policy: small public pilot, feature branch → PR/main release gate unless repo policy changes.
- CI gate: `test-lint-build`.
- Deploy target: GitHub Pages at https://crimson-joo.github.io/food-akinator-hermes-pilot/
- Completion requires post-deploy live canary.
