# Release contract

## Branch policy

Medium/develop integration flow for this public pilot:

- feature branches start from `develop`
- feature work is squash-fanned into `develop`
- shipping uses one `develop` → `main` PR
- `develop` → `main` should use a normal merge commit unless repo policy changes

## CI

Required quality gate name: `test-lint-build` from `.github/workflows/ci.yml`.

The gate runs:

- `npm ci`
- `npm run lint`
- `npm run test:run`
- `npm run build`

## Deploy

GitHub Pages deploys on push to `main` through `.github/workflows/deploy-pages.yml`. Artifact path: `dist`.

Live URL: https://crimson-joo.github.io/food-akinator-hermes-pilot/

## Canary

After deploy, verify:

- canonical URL returns 200
- cache-busted URL serves the new app shell
- first screen says the user should secretly choose a food
- one question plus five answer controls appears after start
- character state changes after an answer
- browser console has no app errors
- no visible Akinator/genie/lamp/turban/blue-skin motif

Rollback: revert or merge a fix commit to `main`, then watch Pages deploy again.
