# Changelog

## 2026-05-30 — Threshold / golden paths / minimal UI scaffold pilot local progress

- Added threshold/reveal/wrong-recovery session state machine and golden Korean food scenario acceptance fixtures.
- Added minimal Vite browser scaffold with Entry → Asking → Answer accepted → Thinking → Guessing → Reveal → Wrong recovery states.
- Added visible CSS/DOM character stage placeholder with QA hooks for `idle`, `ask`, `thinking`, `confident`, `surprised`, `recover`, and `reveal` cues.
- Added UI render/transition tests that verify fixed 5-answer controls, Korean question/reveal/recovery copy, no internal score/probability copy, reduced-motion CSS, and recovered `recover` cue preservation.
- Not done: PR, merge, deploy, live canary, final mascot/brand polish, large catalogue expansion.


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
