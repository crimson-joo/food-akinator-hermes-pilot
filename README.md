# 아무거나 탐정단

Korean food guessing game rebuilt from first principles.

The player secretly chooses a food. The app asks one short Korean question at a time, updates an original food-detective character state, and reveals a guess within a short game loop.

## Local development

```bash
npm ci
npm run test:run
npm run lint
npm run build
npm run dev
```

## Release

- Branch policy: `feature/*` → `develop` fan-in → `develop` → `main` PR.
- CI gate: `test-lint-build`.
- Deploy target: GitHub Pages at https://crimson-joo.github.io/food-akinator-hermes-pilot/
