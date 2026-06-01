import type { AnswerKey } from '../../engine/domain.js';
import { RIG_LAYER_CONTRACT, answerReaction, cueContract, animationNames, expressionNames } from './characterContract.js';
import { animationStateMachine, productionLayerSheet, productionRigLayers, productionStateActing, type ProductionLayerTransform } from './characterAssets.js';
import type { CharacterRuntimeKind, CharacterRuntimeRenderMeta, CharacterStageInput } from './characterRuntime.js';

export function renderCssFallbackRuntime(input: CharacterStageInput, runtimeKind: CharacterRuntimeKind = 'css-fallback', runtimeMeta: CharacterRuntimeRenderMeta = { status: 'fallback' }): string {
  const cue = input.cue;
  const contract = cueContract[cue] ?? cueContract.ask!;
  const lastAnswer = input.lastAnswer;
  const reducedMotion = input.reducedMotion ? 'true' : 'false';
  const reaction = lastAnswer ? answerReaction[lastAnswer] : undefined;
  const expression = reaction?.expression ?? contract.expression;
  const propMotion = reaction?.motion ?? contract.propMotion;
  const acting = productionStateActing[cue] ?? productionStateActing.ask!;
  const clip = animationStateMachine.states[cue as keyof typeof animationStateMachine.states] ?? animationStateMachine.states.ask;
  const statusAttrs = `data-runtime-status="${escapeAttr(runtimeMeta.status)}"${runtimeMeta.attemptedRuntime ? ` data-runtime-attempted="${escapeAttr(runtimeMeta.attemptedRuntime)}"` : ''}${runtimeMeta.reason ? ` data-runtime-reason="${escapeAttr(runtimeMeta.reason)}"` : ''}`;
  return `<div class="oracle-host" aria-hidden="true" data-character-runtime="${runtimeKind}" ${statusAttrs} data-reduced-motion="${reducedMotion}" data-rig-layer-contract="${RIG_LAYER_CONTRACT}" data-character-cue="${cue}" data-silhouette="${contract.silhouette}" data-expression="${contract.expression}" data-current-expression="${expression}" data-prop-motion="${contract.propMotion}" data-current-prop-motion="${propMotion}" data-stage-tone="${contract.stageTone}" data-joint-rig="shoulder-elbow-wrist" data-puppet-format="inline-svg-layer-rig" data-layer-sheet="${productionLayerSheet.assetKind}" data-art-quality="${productionLayerSheet.qualityBar}" data-source-concept-id="${productionLayerSheet.sourceConceptId}" data-motion-state="${cue}" data-motion-clip="${clip.name}" data-motion-duration-ms="${clip.durationMs}" data-emotion="${acting.emotion}" data-confidence-tone="${acting.confidenceTone}" data-thought-process="${escapeAttr(acting.thoughtProcessCopy)}" data-visible-signals="${escapeAttr(acting.visibleSignals.join('|'))}">
    ${renderMotionCatalog()}
    ${renderProductionPuppet(cue, expression)}
    <span class="oracle-aura"></span>
    <span class="oracle-shadow"></span>
    <span class="oracle-particle one"></span><span class="oracle-particle two"></span><span class="oracle-particle three"></span>
    <span class="oracle-body"><span class="chef-jacket-line"></span><span class="apron-medallion"></span></span>
    <span class="oracle-head"><span class="oracle-hair steam-curl"></span><span class="oracle-brow left"></span><span class="oracle-brow right"></span><span class="oracle-eye left"></span><span class="oracle-eye right"></span><span class="oracle-cheek left"></span><span class="oracle-cheek right"></span><span class="oracle-mouth"></span></span>
    <span class="oracle-arm spoon-arm"><span class="oracle-joint shoulder right"></span><span class="oracle-joint elbow right"></span><span class="oracle-joint wrist right"></span><span class="oracle-spoon"></span></span>
    <span class="oracle-arm note-arm"><span class="oracle-joint shoulder left"></span><span class="oracle-joint elbow left"></span><span class="oracle-joint wrist left"></span><span class="oracle-note-card"><span class="note-line first"></span><span class="note-line second"></span><span class="note-ink">✓</span></span></span>
    <span class="oracle-plate-stage"><span class="oracle-dish-glow"></span><span class="oracle-lid"></span></span>
  </div>`;
}

function renderMotionCatalog(): string {
  return `<span class="motion-catalog" aria-hidden="true">${animationNames.map((name) => `<i data-animation-name="${name}"></i>`).join('')}${expressionNames.map((name) => `<i data-expression-name="${name}"></i>`).join('')}</span>`;
}

function renderProductionPuppet(cue: string, expression: string): string {
  const acting = productionStateActing[cue] ?? productionStateActing.ask!;
  const clip = animationStateMachine.states[cue as keyof typeof animationStateMachine.states] ?? animationStateMachine.states.ask;
  const activeMouthLayer = mouthLayerFor(expression);
  const transformMap = new Map<string, ProductionLayerTransform>();
  for (const transform of acting.layerTransforms) transformMap.set(transform.layerId, transform);
  const layers = [...productionRigLayers]
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((layer) => {
      const defaultOpacity = layer.id.startsWith('spark_') || (layer.id.startsWith('mouth_') && layer.id !== activeMouthLayer) ? 0 : 1;
      const transform = transformMap.get(layer.id) ?? { layerId: layer.id, tx: 0, ty: 0, rot: 0, sx: 1, sy: 1, opacity: defaultOpacity };
      const opacity = layer.id.startsWith('mouth_') && layer.id !== activeMouthLayer ? 0 : (transform.opacity ?? defaultOpacity);
      const style = `--tx:${transform.tx}px;--ty:${transform.ty}px;--rot:${transform.rot}deg;--sx:${transform.sx ?? 1};--sy:${transform.sy ?? 1};--opacity:${opacity};--z:${layer.zIndex};--motion-duration:${clip.durationMs}ms;--motion-easing:${clip.easing};`;
      const beatCount = clip.timeline.filter((step) => step.layerId === layer.id).length;
      return `<g class="puppet-layer puppet-${layer.group}" data-layer-id="${layer.id}" data-layer-group="${layer.group}" data-vector-role="${escapeAttr(layer.vectorRole)}" data-pivot="${escapeAttr(layer.pivot)}" data-motion-beat-count="${beatCount}" style="${style}">${renderLayerShape(layer.id)}</g>`;
    })
    .join('');
  return `<svg class="production-puppet" viewBox="0 0 320 340" role="img" aria-label="입맛 탐정 보글 파츠 리깅" data-puppet-format="inline-svg-layer-rig" data-layer-sheet="${productionLayerSheet.assetKind}" data-art-quality="${productionLayerSheet.qualityBar}" data-source-concept-id="${productionLayerSheet.sourceConceptId}" data-motion-state="${cue}" data-motion-clip="${clip.name}" data-motion-duration-ms="${clip.durationMs}" data-puppet-state="${cue}" data-emotion="${acting.emotion}" data-confidence-tone="${acting.confidenceTone}" data-thought-process="${escapeAttr(acting.thoughtProcessCopy)}" data-visible-signals="${escapeAttr(acting.visibleSignals.join('|'))}">${renderLayerSheetDefs()}${layers}</svg>`;
}

function renderLayerSheetDefs(): string {
  return `<defs data-layer-sheet-defs="bogle-v2"><linearGradient id="bogle-skin-warmth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe5b8"/><stop offset="1" stop-color="#ffc378"/></linearGradient><linearGradient id="bogle-jacket-cream" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffaf1"/><stop offset="1" stop-color="#ffd18d"/></linearGradient><radialGradient id="bogle-dish-glow"><stop offset="0" stop-color="#fff2a4" stop-opacity=".95"/><stop offset="1" stop-color="#ffc64b" stop-opacity=".34"/></radialGradient></defs>`;
}

function mouthLayerFor(expression: string): string {
  if (expression === 'soft-smile' || expression === 'maybe-smirk' || expression === 'focused-smile') return 'mouth_smile';
  if (expression === 'puzzled-open' || expression === 'oops-open') return 'mouth_oops';
  if (expression === 'narrow-thinking' || expression === 'skeptical-narrow' || expression === 'decisive-prune') return 'mouth_thinking';
  if (expression === 'bright-payoff' || expression === 'spark-confidence') return 'mouth_reveal';
  return 'mouth_neutral';
}

function renderLayerShape(id: string): string {
  switch (id) {
    case 'ground_shadow': return '<ellipse cx="160" cy="314" rx="96" ry="18" fill="rgba(77,39,15,.22)"/>';
    case 'rim_light': return '<ellipse cx="160" cy="176" rx="128" ry="142" fill="rgba(255,219,134,.16)"/>';
    case 'steam_1': return '<path d="M116 78 C96 58,130 44,112 24" fill="none" stroke="#fff3d3" stroke-width="8" stroke-linecap="round"/>';
    case 'steam_2': return '<path d="M160 66 C140 44,178 35,162 14" fill="none" stroke="#fff5db" stroke-width="7" stroke-linecap="round"/>';
    case 'steam_3': return '<path d="M204 80 C226 56,188 46,210 24" fill="none" stroke="#fff0ca" stroke-width="8" stroke-linecap="round"/>';
    case 'body_torso': return '<path d="M96 198 C112 174,208 174,224 198 L236 292 C208 314,112 314,84 292 Z" fill="url(#bogle-jacket-cream)" stroke="#5c321d" stroke-width="4"/>';
    case 'cape_left': return '<path d="M104 194 C64 216,58 270,88 310 C100 276,110 234,128 198 Z" fill="#7b3a2b" stroke="#5c321d" stroke-width="3"/>';
    case 'cape_right': return '<path d="M216 194 C256 216,262 270,232 310 C220 276,210 234,192 198 Z" fill="#7b3a2b" stroke="#5c321d" stroke-width="3"/>';
    case 'jacket_front': return '<path d="M138 190 L160 286 L184 190" fill="none" stroke="#d9b879" stroke-width="5" stroke-linecap="round"/>';
    case 'scarf_knot': return '<circle cx="160" cy="188" r="14" fill="#d9422b" stroke="#5c321d" stroke-width="3"/>';
    case 'scarf_tail_left': return '<path d="M151 195 L118 222 L143 229 Z" fill="#ef6241" stroke="#5c321d" stroke-width="3"/>';
    case 'scarf_tail_right': return '<path d="M169 195 L202 220 L176 230 Z" fill="#ef6241" stroke="#5c321d" stroke-width="3"/>';
    case 'belt': return '<rect x="110" y="252" width="100" height="18" rx="9" fill="#744628" stroke="#5c321d" stroke-width="3"/>';
    case 'pouch': return '<rect x="121" y="248" width="22" height="28" rx="6" fill="#f2b65a" stroke="#5c321d" stroke-width="3"/>';
    case 'medallion': return '<circle cx="160" cy="266" r="13" fill="#f9c44f" stroke="#5c321d" stroke-width="3"/>';
    case 'arm_note_upper': return '<path d="M112 202 C94 210,82 218,72 231" fill="none" stroke="#ffe0ad" stroke-width="18" stroke-linecap="round"/>';
    case 'arm_note_lower': return '<path d="M72 230 C62 238,59 248,61 260" fill="none" stroke="#ffe0ad" stroke-width="16" stroke-linecap="round"/>';
    case 'hand_note': return '<circle cx="63" cy="261" r="11" fill="#ffd291" stroke="#5c321d" stroke-width="3"/>';
    case 'note_cover': return '<rect x="49" y="225" width="58" height="62" rx="9" fill="#6c3e2a" stroke="#5c321d" stroke-width="3" transform="rotate(-9 78 256)"/>';
    case 'note_pages': return '<rect x="56" y="229" width="58" height="62" rx="8" fill="#fff8df" stroke="#5c321d" stroke-width="3" transform="rotate(-9 85 260)"/><path d="M68 248 L101 244 M69 262 L96 259" stroke="#b58a55" stroke-width="3" stroke-linecap="round"/>';
    case 'note_ink_check': return '<path d="M83 269 L91 276 L105 254" fill="none" stroke="#2f7d46" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>';
    case 'arm_spoon_upper': return '<path d="M207 200 C230 204,246 214,254 229" fill="none" stroke="#ffe0ad" stroke-width="18" stroke-linecap="round"/>';
    case 'arm_spoon_lower': return '<path d="M254 229 C272 218,284 203,294 188" fill="none" stroke="#ffe0ad" stroke-width="16" stroke-linecap="round"/>';
    case 'hand_spoon': return '<circle cx="256" cy="230" r="11" fill="#ffd291" stroke="#5c321d" stroke-width="3"/>';
    case 'spoon_handle': return '<path d="M253 225 L292 190" stroke="#b9822d" stroke-width="8" stroke-linecap="round"/>';
    case 'spoon_bowl': return '<ellipse cx="296" cy="185" rx="18" ry="24" fill="#f3bd55" stroke="#5c321d" stroke-width="3" transform="rotate(42 296 185)"/>';
    case 'plate_base': return '<ellipse cx="160" cy="304" rx="72" ry="24" fill="#fff9ed" stroke="#5c321d" stroke-width="4"/>';
    case 'dish_shadow': return '<ellipse cx="160" cy="298" rx="45" ry="12" fill="rgba(84,44,20,.18)"/>';
    case 'dish_glow': return '<ellipse cx="160" cy="292" rx="44" ry="17" fill="url(#bogle-dish-glow)"/>';
    case 'plate_lid': return '<path d="M108 284 C116 246,204 246,212 284 Z" fill="#ffe1a3" stroke="#5c321d" stroke-width="4"/>';
    case 'lid_knob': return '<circle cx="160" cy="250" r="10" fill="#f6b34f" stroke="#5c321d" stroke-width="3"/>';
    case 'head_base': return '<path d="M102 120 C105 74,215 74,218 120 C222 174,198 196,160 198 C122 196,98 174,102 120 Z" fill="url(#bogle-skin-warmth)" stroke="#5c321d" stroke-width="4"/>';
    case 'ear_left': return '<circle cx="102" cy="139" r="13" fill="#ffc987" stroke="#5c321d" stroke-width="3"/>';
    case 'ear_right': return '<circle cx="218" cy="139" r="13" fill="#ffc987" stroke="#5c321d" stroke-width="3"/>';
    case 'hair_back_mass': return '<path d="M109 104 C124 48,198 48,213 104 C185 91,135 91,109 104 Z" fill="#fff7ec" stroke="#5c321d" stroke-width="4"/>';
    case 'hair_front_1': return '<path d="M121 86 C128 116,150 113,148 83 Z" fill="#ffffff" stroke="#5c321d" stroke-width="3"/>';
    case 'hair_front_2': return '<path d="M150 75 C148 112,180 112,174 76 Z" fill="#ffffff" stroke="#5c321d" stroke-width="3"/>';
    case 'hair_front_3': return '<path d="M181 84 C172 116,200 116,201 91 Z" fill="#ffffff" stroke="#5c321d" stroke-width="3"/>';
    case 'steam_hair_curl': return '<path d="M194 62 C214 46,184 34,204 18" fill="none" stroke="#fff7ec" stroke-width="8" stroke-linecap="round"/>';
    case 'brow_left': return '<path d="M126 126 L151 121" stroke="#3b2317" stroke-width="6" stroke-linecap="round"/>';
    case 'brow_right': return '<path d="M169 121 L194 126" stroke="#3b2317" stroke-width="6" stroke-linecap="round"/>';
    case 'eye_left_white': return '<ellipse cx="140" cy="140" rx="13" ry="15" fill="#fffaf1"/>';
    case 'eye_right_white': return '<ellipse cx="180" cy="140" rx="13" ry="15" fill="#fffaf1"/>';
    case 'pupil_left': return '<circle cx="141" cy="142" r="6" fill="#22150e"/>';
    case 'pupil_right': return '<circle cx="179" cy="142" r="6" fill="#22150e"/>';
    case 'eyelid_left': return '<path d="M127 135 Q140 129 153 135" fill="none" stroke="#5c321d" stroke-width="3"/>';
    case 'eyelid_right': return '<path d="M167 135 Q180 129 193 135" fill="none" stroke="#5c321d" stroke-width="3"/>';
    case 'cheek_left': return '<ellipse cx="123" cy="158" rx="13" ry="7" fill="rgba(217,61,39,.22)"/>';
    case 'cheek_right': return '<ellipse cx="197" cy="158" rx="13" ry="7" fill="rgba(217,61,39,.22)"/>';
    case 'mouth_neutral': return '<path d="M146 171 Q160 176 174 171" fill="none" stroke="#22150e" stroke-width="4" stroke-linecap="round"/>';
    case 'mouth_smile': return '<path d="M143 169 Q160 184 178 169" fill="none" stroke="#22150e" stroke-width="5" stroke-linecap="round"/>';
    case 'mouth_oops': return '<ellipse cx="160" cy="171" rx="10" ry="16" fill="#22150e"/>';
    case 'mouth_thinking': return '<path d="M147 172 Q160 166 173 172" fill="none" stroke="#22150e" stroke-width="4" stroke-linecap="round"/>';
    case 'mouth_reveal': return '<path d="M141 168 Q160 188 181 168" fill="none" stroke="#22150e" stroke-width="6" stroke-linecap="round"/>';
    case 'spark_1': return '<path d="M118 92 L124 105 L138 108 L125 114 L122 128 L114 115 L100 111 L113 104 Z" fill="#ffd75a"/>';
    case 'spark_2': return '<path d="M208 94 L214 106 L227 110 L215 116 L211 129 L204 117 L191 113 L203 106 Z" fill="#ffd75a"/>';
    case 'spark_3': return '<path d="M160 42 L166 55 L180 58 L167 65 L163 78 L156 65 L141 61 L154 55 Z" fill="#fff2a4"/>';
    default: return '<circle cx="160" cy="170" r="4" fill="#d9422b"/>';
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]!));
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/'/g, '&#39;');
}
