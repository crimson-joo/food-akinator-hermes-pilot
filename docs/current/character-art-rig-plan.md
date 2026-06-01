# Character Art/Rig Plan — Akinator-level Benchmark Without Copying

Updated: 2026-05-31

## Verdict

현재 구현된 CSS/DOM `culinary-oracle-theater-v2`는 기능 계약과 상태 훅은 있지만, 사용자가 지적한 것처럼 **원본 Akinator와 비교하면 캐릭터 디자인 밀도·아이덴티티·애니메이션 품질이 아직 낮다.** 다음 단계는 색상/그림자 보정이 아니라 “프로덕션 캐릭터 자산 + 리깅 파이프라인”으로 올리는 것이다.

Akinator 직접 접속은 Cloudflare block으로 이번 브라우저 세션에서 재플레이하지 못했다. 단, 이전 5회 직접 플레이 synthesis와 공개적으로 관찰 가능한 Akinator UX 원리를 기준으로 구조 원리를 추출한다. 보호 자산, 지니/램프/파란 마법사, 동일 포즈/프레임/문구는 사용하지 않는다.

## Why the current character reads low-quality

1. **Silhouette is too toy-like / mascot-like**
   - 단순 도형과 둥근 몸체가 “오뚜기 인형”처럼 읽힌다.
   - 프리미엄 character host가 아니라 placeholder puppet에 가깝다.

2. **Face detail is too low**
   - 눈/입/눈썹이 CSS primitive라 감정의 subtlety가 부족하다.
   - Akinator는 단순해 보여도 얼굴·눈썹·손동작으로 “생각하는 주체”가 강하다.

3. **Costume/prop language is under-designed**
   - 국자/메모장/접시는 의미는 있으나 조형 완성도가 낮다.
   - prop가 캐릭터 개성과 inference 행위로 통합되지 않고 장식처럼 보인다.

4. **Motion lacks animation acting**
   - 지금 motion은 transform/state hook 중심이다.
   - Akinator급 느낌은 idle life, anticipation, follow-through, squash/stretch, gaze change, gesture clarity가 필요하다.

5. **No canonical source art**
   - 현재는 코드로 그린 procedural rig라서 한계가 명확하다.
   - 고품질 캐릭터는 먼저 승인된 turnaround/source art가 있고, 그 위에 rig가 올라가야 한다.

## Reference principles to extract from Akinator

- **Character is the inference engine**: 질문을 읽는 사용자가 아니라 캐릭터가 단서를 해석한다는 느낌.
- **Persistent host identity**: 질문이 바뀌어도 같은 인물이 살아있게 반응한다.
- **Strong readable silhouette**: 작은 화면에서도 머리/몸/손/소품 자세가 한 번에 읽힌다.
- **Expression hierarchy**: 눈썹 → 눈 → 입 → head tilt 순으로 감정이 읽힌다.
- **Answer cadence**: 답변 직후 300–600ms 내 micro reaction, 그 뒤 thinking suspense.
- **Reveal staging**: 단순 결과 카드가 아니라 “내가 맞혔다”는 공연적 선언.
- **Wrong recovery**: 틀림은 dead-end가 아니라 캐릭터가 놀라고 다시 계산하는 장면.

## New canonical design direction

### Name / role

- Working name: **입맛 탐정 보글** 유지.
- Role: “작은 식탁 위의 음식 추리자.” 셰프/요리사보다 **detective-oracle host**.
- Avoid: 지니, 마법 램프, 파란 마법사, Akinator copy pose.

### Art style target

- **2.5D illustrated character**, not flat CSS toy.
- Warm Korean table palette, but with premium contrast and cinematic rim light.
- Face should support nuanced brows/eyes/mouth, not only dot eyes.
- Body should have asymmetric detective posture: one arm for pointer/spoon, one arm for clue notebook.
- Props should be integrated:
  - spoon/pointer: asks and prunes.
  - clue notebook: answer capture and thinking.
  - covered plate: reveal suspense.
  - steam/aura: inference energy, not magic lamp.

## Production asset pipeline recommendation

### 🔶추천: Rive state machine

Use Rive for production-grade character acting.

Required art layers:

1. `body_torso`
2. `head_base`
3. `hair_steam_curl`
4. `brow_left`, `brow_right`
5. `eye_left`, `eye_right`, `pupil_left`, `pupil_right`
6. `mouth_neutral`, `mouth_smile`, `mouth_oops`, `mouth_reveal`
7. `arm_spoon_upper`, `arm_spoon_lower`, `hand_spoon`, `spoon`
8. `arm_note_upper`, `arm_note_lower`, `hand_note`, `note_card`, `note_ink`
9. `plate_base`, `plate_lid`, `dish_glow`
10. `steam_1..3`, `spark_1..3`, `shadow`, `rim_light`

State machine inputs:

- `cue`: `idle | ask | answerAccepted | thinking | confident | surprised | recover | reveal`
- `answerReaction`: `yes | probably | unknown | probably_not | no | none`
- `confidence`: `low | mid | high`
- `reducedMotion`: boolean

State clips:

- `idle_breathe_blink` loop
- `ask_spoon_point`
- `answer_yes_approve_nod`
- `answer_probably_maybe_tilt`
- `answer_unknown_puzzled_shrug`
- `answer_probably_not_narrow_away`
- `answer_no_prune_swipe`
- `thinking_scan_note`
- `confidence_plate_present`
- `wrong_oops_recoil`
- `recover_note_reopen`
- `reveal_lid_lift_celebrate`

### Fallback: Lottie clips

If Rive authoring is unavailable, use Lottie for each state but keep a shared source art file and naming contract. Do not generate separate inconsistent raster poses.

### Temporary web fallback

Until real art exists, the CSS/DOM rig may remain only as a **contract-preserving fallback**. It must expose the same DOM/test hooks so real Rive/Lottie can replace visuals without changing game logic.

## Frontend component contract

Introduce/maintain a boundary like:

```txt
src/ui/character/
  CharacterStage.ts        # stage/rendering boundary
  characterContract.ts     # states, answer reactions, layer names
  characterAssets.ts       # Rive/Lottie/static fallback paths
  characterMotion.ts       # motion token mapping
```

Required DOM hooks:

- app shell:
  - `data-visual-system="culinary-oracle-theater-v3"`
  - `data-character-tier="production-rig-ready"`
  - `data-motion-system="rive-state-machine-or-fallback"`
- stage:
  - `data-testid="character-stage"`
  - `data-character-cue`
  - `data-stage-tone`
- host:
  - `data-character-runtime="rive|lottie|css-fallback"`
  - `data-runtime-status="ready|fallback|failed"`
  - `data-runtime-attempted="rive|lottie"` when the authored runtime is missing or malformed and the CSS fallback is taking over
  - `data-runtime-reason` with a precise fail-closed reason such as `rive-asset-missing`, `rive-manifest-malformed`, or `lottie-manifest-malformed`
  - `data-rig-layer-contract="body-head-face-arms-props-atmosphere"`
  - `data-current-expression`
  - `data-current-prop-motion`
  - `data-answer-reaction` when applicable

Current implementation note: `CharacterStage` now has a manifest/adapter boundary that can select `rive`, `lottie`, or `css-fallback`. The checked-in manifest still marks Rive/Lottie assets as missing, so the live controlled-demo path must expose `data-character-runtime="css-fallback"` + `data-runtime-status="fallback"`; this is not a production visual-quality unlock.

## Acceptance criteria

Pass only if:

1. First screen no longer reads as a simple toy/placeholder.
2. Character has a distinctive silhouette, refined face, costume/prop integration.
3. At least 8 major cues are visibly different: `idle`, `ask`, `answerAccepted`, `thinking`, `confident`, `surprised`, `recover`, `reveal`.
4. Each 5-answer reaction has a distinct gesture and expression.
5. Reveal uses plate/lid staging and character confidence, not just a result card.
6. Wrong guess recovery shows surprise, rejected candidate chip, and a return-to-investigation pose.
7. Reduced motion still exposes state through pose/copy/light, not hidden animation.
8. Tests verify both new contract and absence of old `bogle-*` / `hero-stage` foundation.

## Source art board

The first source-art board is now committed at `docs/current/character-source-art.md` with three generated concept assets under `docs/current/character-art/`.

Decision:

- **Canonical**: Concept A / detective-oracle.
- **Borrow from B**: chef utility-belt density, clean apron contrast, confident food-service posture.
- **Borrow from C only lightly**: warm folk trim and steam swirl language; do not adopt the elderly sage/mustache direction.

## Next build sequence

1. Lock this document as the art/rig contract. ✅
2. Add tests for `v3` DOM hooks and fallback runtime. ✅
3. Refactor current inline character constants into a character module boundary. ✅
4. Keep CSS fallback but rename it honestly as fallback, not final art. ✅
5. Generate/commission canonical character source art. ✅ first source-art board generated
6. Convert Concept A into simplified vector/transparent layer exports. ✅ inline SVG layer rig v1 now exposes 50+ individually addressable `data-layer-id` parts with pivots, z-order, vector roles, and state transforms in `src/ui/character/characterAssets.ts`.
7. Build Rive or Lottie rig and wire it behind the same `CharacterStage` API. ⏳ production web fallback now mirrors the target state-machine contract; external `.riv` authoring can replace the inline SVG without changing app logic.
8. Run browser QA against entry → answer → thinking → guess → wrong recovery → reveal. ⏳ automated and live QA required after merge.
9. Add production vector layer-sheet metadata and multi-beat animation state-machine hooks. ✅ `productionLayerSheet` and `animationStateMachine` now encode source-art quality bar, non-copy boundary, layer export groups, clip names, timings, easing, and per-layer motion beats.

## Production inline vector rig v2 — layer sheet + motion state machine

The latest pass raises the fallback from “static transform contract” to a more production-shaped animation source of truth:

- `productionLayerSheet`
  - `assetKind="brand-vector-layer-sheet"`
  - `qualityBar="public-beta-minimum"`
  - Concept A remains the source identity while explicitly excluding Akinator genie silhouette/costume/copy/layout cloning.
  - Palette, line-art stroke width, shading notes, mobile readability constraints, and export groups are now committed as data, not only prose.
- `animationStateMachine`
  - version: `bogle-motion-v2`
  - inputs remain `cue`, `answerReaction`, `confidence`, `reducedMotion`
  - every major cue maps to a named clip with duration/easing and multiple timeline beats.
  - `thinking` includes repeated head/steam/notebook scan beats; `reveal` includes lid/knob/dish glow/spark payoff beats.
- Runtime SVG hooks
  - `data-layer-sheet`, `data-art-quality`, `data-source-concept-id`
  - `data-motion-state`, `data-motion-clip`, `data-motion-duration-ms`
  - per layer `data-motion-beat-count`
  - SVG `<defs data-layer-sheet-defs="bogle-v2">` gradients for skin, jacket, and dish glow.

This still is not a hand-authored external `.riv` file. It is a stricter web vector layer sheet + motion contract that makes the next Rive/Lottie authoring step lower-risk and testable.

## Production inline vector rig v1

This pass is no longer a list of composite pose images. The app renders one persistent Bogle puppet as a set of independent SVG parts:

- body/costume: torso, cape, jacket panels, scarf, belt, pouch, medallion
- face acting: head, ears, hair masses, steam curl, brows, eyes, pupils, eyelids, cheeks, five mouth shapes
- articulated arms: spoon upper/lower/hand and notebook upper/lower/hand
- props: spoon handle/bowl, clue notebook cover/pages/ink check, plate base/lid/knob/dish glow
- atmosphere: steam strands, sparks, rim light, ground shadow

Runtime hooks:

- `data-puppet-format="inline-svg-layer-rig"`
- every part has `data-layer-id`, `data-layer-group`, `data-vector-role`, `data-pivot`, and transform CSS variables
- every cue has `data-emotion`, `data-confidence-tone`, `data-thought-process`, and `data-visible-signals`

State acting packages:

| Cue | Emotion | Confidence tone | Visible signals |
|---|---|---|---|
| `idle` | `warm-ready` | `open-start` | breathing, blink, idle steam |
| `ask` | `curious-detective` | `gathering-first-clues` | forward lean, spoon point, curious brows |
| `answerAccepted` | `clue-captured` | `signal-updated` | ink check, nod, focused smile |
| `thinking` | `deep-analysis` | `blocked-but-working` | narrowed eyes, note scan, spiraling steam, pulled-in shoulders |
| `confident` | `evidence-lock` | `nearly-solved` | plate forward, spark eyes, upright chest |
| `surprised` | `oops-recoil` | `wrong-turn` | wide mouth, dropped spoon, recoil body |
| `recover` | `calm-reframe` | `finding-new-path` | calm brows, reopened notebook, discarded candidate chip |
| `reveal` | `payoff-joy` | `solved` | lid lift, dish glow, celebration sparks |
