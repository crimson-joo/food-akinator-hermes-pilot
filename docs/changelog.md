# Changelog

## 2026-05-29 — Adaptive selector pilot local PASS

- Added local engine foundation: domain validation, candidate scoring, and adaptive selector MVP.
- Fixed validator finite-number gaps for non-finite candidate/question numeric values.
- Fixed adaptive selector unknown recovery blocker: after an `unknown` answer, turn 4+ avoids high `revealRisk` direct questions when a clear low-risk alternative exists.
- Added regression and QA probes for branch divergence, marginal cost behavior, and unknown turn-4 low-risk recovery.
- Updated architecture/release docs and Graphify outputs.
- Final local gates passed: reviewer re-review, QA rerun, `npm test`, `npm run typecheck`, focused QA acceptance probe.
- Not done: PR, merge, deploy, browser QA, live canary.

Notes:
- Canonical remediation path: `t_26ede10d` + HEAD `c5f1981`.
- Duplicate remediation card `t_43ed9e23` is coordination noise for the same blocker.
- Graphify output freshness can churn on graph-only commits; decide a repo policy before release automation.
