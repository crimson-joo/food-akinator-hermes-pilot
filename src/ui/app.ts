import type { AnswerKey } from '../engine/domain.js';
import { foodKnowledgeBase } from '../data/food-knowledge-base.js';
import { startSession, submitAnswer, submitGuessFeedback, type EngineSession } from '../engine/session.js';
import {
  CHARACTER_RUNTIME,
  CHARACTER_TIER,
  MOTION_SYSTEM,
  RIG_LAYER_CONTRACT,
  VISUAL_SYSTEM,
  animationNames,
  answerReaction,
  cueContract,
  cueLabel,
  expressionNames,
} from './character/characterContract.js';
import { animationStateMachine, productionLayerSheet, productionRigLayers, productionStateActing, type ProductionLayerTransform } from './character/characterAssets.js';

const answerOrder: AnswerKey[] = ['yes', 'probably', 'unknown', 'probably_not', 'no'];
const answerLabel: Record<AnswerKey, string> = {
  yes: '네',
  probably: '아마도요',
  unknown: '모르겠어요',
  probably_not: '아마 아닐걸요',
  no: '아니요',
};


export type UiPhase = 'entry' | 'asking' | 'answerAccepted' | 'thinking' | 'guessing' | 'revealed' | 'recovering' | 'exhausted' | 'error';
export type RecoveryBeat = 'surprise' | 'remove' | 'refocus';

export type UiModel = {
  phase: UiPhase;
  session?: EngineSession;
  lastAnswer?: AnswerKey;
  recoveryBeat?: RecoveryBeat;
  rejectedCandidateIds?: string[];
  rejectedCandidateNames?: string[];
  errorMessage?: string;
};

export type UiEvent =
  | { type: 'start'; session?: EngineSession }
  | { type: 'answer'; answer: AnswerKey }
  | { type: 'thinking' }
  | { type: 'engineReady'; session: EngineSession }
  | { type: 'confirmGuess' }
  | { type: 'rejectGuess'; candidateId: string; candidateName: string }
  | { type: 'advanceRecoveryBeat'; beat: RecoveryBeat; session?: EngineSession }
  | { type: 'recovered'; session: EngineSession }
  | { type: 'restart' }
  | { type: 'error'; message: string };

export function createDemoSession(): EngineSession {
  return startSession(foodKnowledgeBase);
}

export function transitionUi(model: UiModel, event: UiEvent): UiModel {
  if (event.type === 'restart') return { phase: 'entry' };
  if (event.type === 'start') return { phase: 'asking', session: event.session ?? createDemoSession() };
  if (event.type === 'answer' && model.session) return { ...model, phase: 'answerAccepted', lastAnswer: event.answer };
  if (event.type === 'thinking') return { ...model, phase: 'thinking' };
  if (event.type === 'engineReady') return mapSessionToUi(event.session, model);
  if (event.type === 'confirmGuess' && model.session) return { ...model, phase: 'revealed', session: { ...model.session, characterCue: 'reveal' } };
  if (event.type === 'rejectGuess') {
    return {
      ...model,
      phase: 'recovering',
      recoveryBeat: 'surprise',
      rejectedCandidateIds: Array.from(new Set([...(model.rejectedCandidateIds ?? []), event.candidateId])),
      rejectedCandidateNames: Array.from(new Set([...(model.rejectedCandidateNames ?? []), event.candidateName])),
    };
  }
  if (event.type === 'advanceRecoveryBeat') {
    if (event.session) return { ...model, phase: 'recovering', recoveryBeat: event.beat, session: event.session };
    return { ...model, phase: 'recovering', recoveryBeat: event.beat };
  }
  if (event.type === 'recovered') return mapSessionToUi(event.session, model);
  if (event.type === 'error') return { phase: 'error', errorMessage: event.message };
  return model;
}

function mapSessionToUi(session: EngineSession, previous: UiModel = { phase: 'entry' }): UiModel {
  if (session.status === 'exhausted') return { ...previous, phase: 'exhausted', session };
  if (session.guess) return { ...previous, phase: 'guessing', session };
  return { ...previous, phase: 'asking', session };
}

export function renderApp(model: UiModel): string {
  const session = model.session;
  const uiState = model.phase;
  const cue = cueFor(model);
  const contract = cueContract[cue] ?? cueContract.ask!;
  const attrs = [
    'class="app-shell"',
    `data-ui-state="${uiState}"`,
    `data-character-cue="${cue}"`,
    `data-visual-system="${VISUAL_SYSTEM}"`,
    `data-character-tier="${CHARACTER_TIER}"`,
    `data-motion-system="${MOTION_SYSTEM}"`,
    `data-stage-tone="${contract.stageTone}"`,
  ];
  if (model.lastAnswer) {
    const reaction = answerReaction[model.lastAnswer];
    attrs.push(`data-last-answer="${model.lastAnswer}"`);
    attrs.push(`data-answer-reaction="${model.lastAnswer}"`);
    attrs.push(`data-answer-sentiment="${reaction.sentiment}"`);
    attrs.push(`data-reaction-motion="${reaction.motion}"`);
  }
  if (model.rejectedCandidateIds?.length) attrs.push(`data-rejected-candidate-ids="${escapeAttr(model.rejectedCandidateIds.join(','))}"`);
  if (uiState === 'recovering') attrs.push(`data-recovery-beat="${model.recoveryBeat ?? 'surprise'}"`);
  if (uiState === 'guessing' && session?.guess) attrs.push(`data-guess-candidate-id="${escapeAttr(session.guess.candidate.id)}"`);
  if (uiState === 'revealed' && session?.guess) attrs.push(`data-result-candidate-id="${escapeAttr(session.guess.candidate.id)}"`);

  return `${styleBlock()}
<main ${attrs.join(' ')}>
  <div class="cinematic-backdrop" aria-hidden="true"><span></span><span></span><span></span></div>
  <section class="oracle-theater" aria-label="입맛 탐정 보글 상태" data-testid="character-stage" data-character-cue="${cue}" data-stage-tone="${contract.stageTone}">
    ${renderOracleHost(cue, contract, model.lastAnswer)}
    <p data-testid="character-state-label" class="state-label">보글 상태 · ${escapeHtml(cueLabel[cue] ?? '상태 확인 중')}</p>
    <span class="reduced-motion-note" data-reduced-motion-note>움직임을 줄여도 표정·소품·조명으로 상태가 읽혀요.</span>
  </section>
  <section class="dialogue-card" aria-live="polite">
    ${renderClueProgress(session)}
    ${renderPanel(model)}
  </section>
</main>`;
}

function renderOracleHost(cue: string, contract: { silhouette: string; expression: string; propMotion: string; stageTone: string }, lastAnswer?: AnswerKey): string {
  const reaction = lastAnswer ? answerReaction[lastAnswer] : undefined;
  const expression = reaction?.expression ?? contract.expression;
  const propMotion = reaction?.motion ?? contract.propMotion;
  const acting = productionStateActing[cue] ?? productionStateActing.ask!;
  const clip = animationStateMachine.states[cue as keyof typeof animationStateMachine.states] ?? animationStateMachine.states.ask;
  return `<div class="oracle-host" aria-hidden="true" data-character-runtime="${CHARACTER_RUNTIME}" data-rig-layer-contract="${RIG_LAYER_CONTRACT}" data-character-cue="${cue}" data-silhouette="${contract.silhouette}" data-expression="${contract.expression}" data-current-expression="${expression}" data-prop-motion="${contract.propMotion}" data-current-prop-motion="${propMotion}" data-stage-tone="${contract.stageTone}" data-joint-rig="shoulder-elbow-wrist" data-puppet-format="inline-svg-layer-rig" data-layer-sheet="${productionLayerSheet.assetKind}" data-art-quality="${productionLayerSheet.qualityBar}" data-source-concept-id="${productionLayerSheet.sourceConceptId}" data-motion-state="${cue}" data-motion-clip="${clip.name}" data-motion-duration-ms="${clip.durationMs}" data-emotion="${acting.emotion}" data-confidence-tone="${acting.confidenceTone}" data-thought-process="${escapeAttr(acting.thoughtProcessCopy)}" data-visible-signals="${escapeAttr(acting.visibleSignals.join('|'))}">
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

function cueFor(model: UiModel): string {
  if (model.phase === 'entry') return 'idle';
  if (model.phase === 'answerAccepted') return 'answerAccepted';
  if (model.phase === 'thinking') return 'thinking';
  if (model.phase === 'guessing') return 'confident';
  if (model.phase === 'revealed') return 'reveal';
  if (model.phase === 'recovering') return model.recoveryBeat === 'refocus' ? 'recover' : 'surprised';
  if (model.phase === 'exhausted') return 'recover';
  if (model.phase === 'error') return 'recover';
  return model.session?.characterCue ?? 'ask';
}

function renderPanel(model: UiModel): string {
  if (model.phase === 'entry') {
    return `<p class="eyebrow">오늘의 입맛 탐정 보글</p>
<h1>오늘 뭐 먹을지 제가 맞혀볼게요.</h1>
<p class="helper">마음속 메뉴를 하나 정하고, 보글에게 단서를 주세요. 보글은 설문지가 아니라 작은 식탁 무대 위 추리자처럼 질문할 거예요.</p>
<button class="primary" data-action="start" type="button">시작하기</button>
<p class="small-help">정답이 없어도 괜찮아요. 애매하면 “모르겠어요”를 눌러도 돼요.</p>`;
  }
  if (model.phase === 'answerAccepted') {
    return `<p class="eyebrow">단서 기록</p>
<h2>${model.lastAnswer === 'unknown' ? '괜찮아요. 애매한 단서는 건너뛰고 볼게요.' : '좋아요, 그 단서는 적어둘게요.'}</h2>
${renderAnswerFeedback(model.lastAnswer)}
${renderQuestion(model.session, true, model.lastAnswer)}`;
  }
  if (model.phase === 'thinking') {
    return `<p class="eyebrow">보글이 메모장을 보는 중</p>
<h2>흠… 단서를 맞춰보는 중이에요.</h2>
<p class="helper">${progressCopy(model.session)}</p>
<div class="interaction-feedback thinking-feedback" data-interaction-feedback="thinking" data-reaction-motion="thinking-scan"><strong>단서들을 다시 섞어보는 중이에요.</strong><span>질문이 점점 구체적으로 좁혀질 거예요.</span></div>
${renderAnswerButtons(true, model.lastAnswer)}`;
  }
  if (model.phase === 'guessing' && model.session?.guess) {
    const name = model.session.guess.candidate.nameKo;
    return `<p class="eyebrow">제가 맞혀볼게요</p>
<h2>혹시… ${escapeHtml(name)}인가요?</h2>
<p class="helper">뚜껑을 열기 전에 먼저 확인할게요. 틀려도 바로 다시 좁혀볼 수 있어요.</p>
<div class="guess-actions"><button class="primary" data-action="confirm-guess" type="button">맞아요</button><button class="secondary" data-action="reject-guess" type="button">아니에요</button></div>`;
  }
  if (model.phase === 'revealed' && model.session?.guess) {
    const candidate = model.session.guess.candidate;
    return `<p class="eyebrow">접시 공개</p>
<h2>오늘은 ${escapeHtml(candidate.nameKo)} 쪽이에요.</h2>
<p class="helper">${escapeHtml(candidate.reveal.oneLiner)}</p>
<h3>제가 이렇게 본 이유는요.</h3>
<ul class="reason-list">${candidate.reveal.reasonSeeds.slice(0, 3).map((reason) => `<li>${escapeHtml(reason)}</li>`).join('')}</ul>
<div class="guess-actions"><button class="primary" data-action="restart" type="button">다시 맞혀보기</button><button class="secondary" data-action="reject-guess" type="button">아닌데요</button></div>`;
  }
  if (model.phase === 'recovering') {
    const beat = model.recoveryBeat ?? 'surprise';
    if (beat === 'remove') {
      return `<p class="eyebrow">후보 정리</p>
<h2>그 메뉴는 후보에서 뺄게요.</h2>
<p class="helper">단서판에서 틀린 접시를 지우고 있어요.</p>
${renderRejectedChips(model.rejectedCandidateNames, beat)}`;
    }
    if (beat === 'refocus') {
      return `<p class="eyebrow">다시 좁히는 중</p>
<h2>다시 단서를 좁혀볼게요.</h2>
<p class="helper">제외한 후보는 옆에 남겨두고, 더 안전한 질문으로 이어갈게요.</p>
${renderRejectedChips(model.rejectedCandidateNames, beat)}
${renderQuestion(model.session, false)}`;
    }
    return `<p class="eyebrow">앗, 바로잡는 중</p>
<h2>앗, 제가 너무 성급했네요.</h2>
<p class="helper">잠깐 멈추고 틀린 추측부터 인정할게요.</p>`;
  }
  if (model.phase === 'exhausted') {
    return `<p class="eyebrow">정직한 멈춤</p>
<h2>${escapeHtml(model.session?.copy.headlineKo ?? '단서가 부족해요.')}</h2>
<p class="helper">${escapeHtml(model.session?.copy.helperKo ?? '찍지 않고 다시 시작해볼게요.')}</p>
<button class="primary" data-action="restart" type="button">다시 시작하기</button>`;
  }
  if (model.phase === 'error') {
    return `<p class="eyebrow">단서 오류</p>
<h2>단서가 잠깐 엉켰어요. 다시 시도해볼게요.</h2>
<p class="helper">보글이 다시 안전하게 시작할 수 있게 준비했어요.</p>
<button class="primary" data-action="restart" type="button">다시 시작하기</button>`;
  }
  return renderQuestion(model.session, false);
}

function renderAnswerFeedback(answer?: AnswerKey): string {
  if (!answer) return '';
  const reaction = answerReaction[answer];
  return `<div class="interaction-feedback answer-feedback" data-interaction-feedback="answer" data-answer-reaction="${answer}" data-answer-sentiment="${reaction.sentiment}" data-reaction-motion="${reaction.motion}"><strong>${escapeHtml(reaction.copy)}</strong><span>보글이 표정과 관절 움직임으로 이 단서를 반영하고 있어요.</span></div>`;
}

function renderQuestion(session: EngineSession | undefined, disabled: boolean, selected?: AnswerKey): string {
  if (!session?.currentQuestion) return '';
  return `<article class="question-card" data-question-id="${escapeAttr(session.currentQuestion.id)}" data-question-role="${escapeAttr(session.currentQuestion.role)}">
    <p class="turn-label">${session.turn}번째 질문</p>
    <h2>${escapeHtml(session.currentQuestion.textKo)}</h2>
    ${renderAnswerButtons(disabled, selected)}
  </article>`;
}

function renderAnswerButtons(disabled: boolean, selected?: AnswerKey): string {
  return `<div class="answer-grid">${answerOrder.map((key) => `<button class="answer${selected === key ? ' selected' : ''}" data-answer-key="${key}" type="button"${disabled ? ' disabled' : ''}>${answerLabel[key]}</button>`).join('')}</div>`;
}

function renderRejectedChips(names: string[] = [], beat: RecoveryBeat = 'surprise'): string {
  if (names.length === 0) return '';
  return `<div class="rejected-list" data-testid="rejected-candidate-list" data-recovery-beat="${beat}">${names.map((name) => `<span class="rejected-chip" data-testid="rejected-candidate-chip" data-rejected-candidate-name="${escapeAttr(name)}" data-removal-treatment="crossed-off"><span class="rejected-chip-label">제외됨: ${escapeHtml(name)}</span><span class="rejected-chip-mark" aria-hidden="true">지움</span></span>`).join('')}</div>`;
}

function renderClueProgress(session?: EngineSession): string {
  if (!session) return '';
  const tone = progressTone(session);
  const label = progressCopy(session);
  const filledDots = tone === 'confident' ? 4 : tone === 'mid' ? 3 : 2;
  const dots = Array.from({ length: 4 }, (_, index) => `<span class="clue-dot${index < filledDots ? ' active' : ''}" aria-hidden="true"></span>`).join('');
  return `<div class="clue-progress" aria-label="단서 진행" data-progress-tone="${tone}"><span class="clue-progress-label">${label}</span><span class="clue-dots">${dots}</span></div>`;
}

function progressTone(session?: EngineSession): 'early' | 'mid' | 'confident' {
  if (!session) return 'early';
  if (session.guess || session.turn >= 5) return 'confident';
  if (session.turn >= 3) return 'mid';
  return 'early';
}

function progressCopy(session?: EngineSession): string {
  const tone = progressTone(session);
  if (tone === 'confident') return '감이 왔어요.';
  if (tone === 'mid') return '후보가 둘로 갈리네요.';
  return '큰 갈래는 잡혔어요.';
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]!));
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/'/g, '&#39;');
}

function styleBlock(): string {
  return `<style>
:root { color-scheme: light; --bg: #120d09; --paper: #fff7e8; --paper-strong: #fffaf1; --ink: #26170f; --muted: #755f4c; --line: rgba(88, 51, 26, .22); --saffron: #f6b34f; --gochu: #d93d27; --gochu-dark: #9f2418; --miso: #7b4b28; --leaf: #2f7d46; --focus: #1469ff; --glow: rgba(255, 190, 92, .42); --radius-xl: 34px; --radius-lg: 26px; --radius-pill: 999px; --motion-snap: 170ms cubic-bezier(.2,.8,.2,1); --motion-suspense: 680ms cubic-bezier(.2,.9,.15,1); --shadow-card: 0 24px 70px rgba(39, 20, 8, .20), 0 1px 0 rgba(255,255,255,.7) inset; font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', system-ui, sans-serif; }
* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; min-height: 100vh; color: var(--ink); background: radial-gradient(circle at 12% 12%, rgba(246,179,79,.50), transparent 30%), radial-gradient(circle at 85% 15%, rgba(217,61,39,.28), transparent 24%), linear-gradient(135deg, #20110b, #5f2a16 48%, #f2c06a); }
button { min-height: 48px; border: 1px solid var(--line); border-radius: var(--radius-pill); padding: 13px 18px; font-weight: 900; color: var(--ink); background: linear-gradient(#fffdf8, #fff1df); cursor: pointer; transition: transform var(--motion-snap), box-shadow var(--motion-snap), background var(--motion-snap); }
button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(97,49,20,.14); }
button:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
button:disabled { cursor: not-allowed; opacity: .62; }
.primary { color: #fff; border-color: var(--gochu); background: linear-gradient(135deg, #f2683f, var(--gochu) 58%, var(--gochu-dark)); box-shadow: 0 16px 36px rgba(217,61,39,.30); }
.secondary { background: rgba(255,255,255,.76); }
.app-shell { position: relative; min-height: 100vh; width: min(1180px, 100%); margin: 0 auto; padding: clamp(18px, 4vw, 44px); display: grid; grid-template-columns: minmax(320px, .92fr) minmax(0, 1.08fr); gap: clamp(20px, 4vw, 42px); align-items: center; overflow: hidden; }
.cinematic-backdrop { position: fixed; inset: 0; pointer-events: none; overflow: hidden; } .cinematic-backdrop span { position: absolute; border-radius: 999px; filter: blur(6px); opacity: .28; background: #fff5c9; animation: particle-drift 9s ease-in-out infinite; } .cinematic-backdrop span:nth-child(1) { width: 120px; height: 120px; left: 6%; top: 70%; } .cinematic-backdrop span:nth-child(2) { width: 70px; height: 70px; right: 8%; top: 12%; animation-delay: -2s; } .cinematic-backdrop span:nth-child(3) { width: 92px; height: 92px; right: 20%; bottom: 10%; animation-delay: -5s; }
.oracle-theater, .dialogue-card { position: relative; border: 1px solid rgba(255,255,255,.42); border-radius: var(--radius-xl); background: linear-gradient(145deg, rgba(255,250,241,.92), rgba(255,239,213,.82)); box-shadow: var(--shadow-card); backdrop-filter: blur(14px); }
.oracle-theater { min-height: 520px; padding: clamp(22px, 4vw, 38px); display: grid; align-content: center; justify-items: center; overflow: hidden; isolation: isolate; }
.oracle-theater::before { content: ''; position: absolute; inset: 18px; border-radius: 30px; background: radial-gradient(circle at 50% 18%, rgba(255,255,255,.86), transparent 34%), radial-gradient(circle at 52% 72%, var(--glow), transparent 34%); z-index: -2; }
.oracle-theater::after { content: ''; position: absolute; left: 12%; right: 12%; bottom: 76px; height: 82px; border-radius: 50%; background: radial-gradient(ellipse, rgba(74,35,13,.22), transparent 66%); z-index: -1; }
.dialogue-card { padding: clamp(24px, 4vw, 48px); }
.eyebrow, .turn-label { margin: 0 0 10px; color: var(--gochu-dark); font-weight: 950; letter-spacing: .03em; text-transform: none; }
h1, h2 { margin: 8px 0 16px; line-height: 1.08; letter-spacing: -.04em; font-size: clamp(32px, 5vw, 58px); text-wrap: pretty; }
h2 { font-size: clamp(26px, 3.8vw, 42px); }
h3 { margin: 24px 0 10px; font-size: 1.06rem; }
.helper, .small-help { color: var(--muted); font-size: clamp(1rem, 1.4vw, 1.12rem); line-height: 1.75; }
.small-help { font-size: .92rem; }
.answer-grid { display: grid; grid-template-columns: repeat(5, minmax(92px, 1fr)); gap: 10px; margin-top: 24px; }
.answer { min-height: 54px; } .answer.selected { border-color: rgba(217,61,39,.7); background: linear-gradient(#fff7e9, #ffe0bf); box-shadow: inset 0 0 0 2px rgba(217,61,39,.16); }
.guess-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
.reason-list { display: grid; gap: 10px; padding-left: 22px; font-weight: 800; line-height: 1.55; }
.rejected-list { margin: 16px 0; display: flex; flex-wrap: wrap; gap: 8px; } .rejected-chip { position: relative; display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(217,61,39,.28); background: #fff1ee; color: #8d2d20; border-radius: var(--radius-pill); padding: 8px 12px; font-weight: 900; overflow: hidden; } .rejected-chip[data-removal-treatment='crossed-off']::after { content: ''; position: absolute; left: 10px; right: 10px; top: 50%; height: 2px; border-radius: 999px; background: rgba(159,36,24,.78); transform: rotate(-3deg); } .rejected-chip-mark { position: relative; z-index: 1; padding: 2px 7px; border-radius: 999px; color: #fff7ef; background: var(--gochu); font-size: .72rem; } .rejected-chip-label { position: relative; z-index: 1; }
.clue-progress { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 20px; padding: 12px 14px; border: 1px solid var(--line); border-radius: 20px; background: rgba(255,255,255,.58); color: var(--muted); font-weight: 900; }
.clue-dots { display: inline-flex; gap: 7px; } .clue-dot { width: 10px; height: 10px; border-radius: 999px; background: rgba(123,75,40,.22); } .clue-dot.active { background: var(--gochu); box-shadow: 0 0 0 5px rgba(217,61,39,.10); }
.interaction-feedback { margin: 16px 0 18px; padding: 13px 15px; border: 1px solid rgba(103,57,30,.20); border-radius: 20px; background: rgba(255,255,255,.66); box-shadow: 0 10px 24px rgba(75,38,15,.08); display: grid; gap: 4px; }
.interaction-feedback strong { font-size: 1.02rem; } .interaction-feedback span { color: var(--muted); font-size: .9rem; line-height: 1.55; }
[data-answer-sentiment='positive'] .answer-feedback { background: linear-gradient(135deg, rgba(244,255,237,.82), rgba(255,248,226,.86)); border-color: rgba(47,125,70,.26); }
[data-answer-sentiment='soft-positive'] .answer-feedback { background: linear-gradient(135deg, rgba(255,250,226,.88), rgba(255,239,213,.84)); }
[data-answer-sentiment='uncertain'] .answer-feedback { background: linear-gradient(135deg, rgba(245,241,255,.82), rgba(255,248,231,.86)); }
[data-answer-sentiment='soft-negative'] .answer-feedback { background: linear-gradient(135deg, rgba(255,244,231,.88), rgba(255,255,255,.72)); }
[data-answer-sentiment='negative'] .answer-feedback { background: linear-gradient(135deg, rgba(255,237,233,.88), rgba(255,246,236,.78)); border-color: rgba(217,61,39,.28); }
.oracle-host { position: relative; width: min(350px, 82vw); height: 390px; transform-origin: 50% 80%; transition: transform var(--motion-suspense), filter var(--motion-suspense); }
.oracle-aura, .oracle-shadow, .oracle-body, .oracle-head, .oracle-arm, .oracle-spoon, .oracle-note-card, .oracle-plate-stage, .oracle-lid, .oracle-particle, .oracle-dish-glow, .oracle-hair, .oracle-brow, .oracle-eye, .oracle-cheek, .oracle-mouth, .chef-jacket-line, .apron-medallion, .note-line, .note-ink, .oracle-joint { position: absolute; display: block; transition: transform var(--motion-suspense), opacity var(--motion-snap), background var(--motion-snap), border-radius var(--motion-snap), filter var(--motion-suspense); }
.motion-catalog { position: absolute; width: 1px; height: 1px; overflow: hidden; opacity: 0; pointer-events: none; }
.production-puppet { position: absolute; inset: -4px -6px 0; width: 100%; height: 100%; overflow: visible; filter: drop-shadow(0 20px 22px rgba(84,39,14,.18)); z-index: 4; }
.puppet-layer { transform-box: fill-box; transform-origin: center; transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(var(--sx), var(--sy)); opacity: var(--opacity); transition: transform var(--motion-suspense), opacity var(--motion-snap), filter var(--motion-suspense); }
.puppet-atmosphere { mix-blend-mode: screen; }
.puppet-props, .puppet-arms, .puppet-face, .puppet-body { filter: drop-shadow(0 2px 0 rgba(255,255,255,.12)); }
.production-puppet + .oracle-aura, .production-puppet ~ .oracle-shadow, .production-puppet ~ .oracle-particle, .production-puppet ~ .oracle-body, .production-puppet ~ .oracle-head, .production-puppet ~ .oracle-arm, .production-puppet ~ .oracle-plate-stage { opacity: .08; }
[data-character-cue='thinking'] .production-puppet .puppet-atmosphere { animation: thinking-scan 1.2s ease-in-out infinite; }
[data-character-cue='thinking'] [data-layer-id='head_base'] { animation: puppet-thinking-breath var(--motion-duration) var(--motion-easing) infinite; }
[data-character-cue='thinking'] [data-layer-id='note_pages'] { animation: puppet-note-scan var(--motion-duration) var(--motion-easing) infinite; }
[data-character-cue='reveal'] .production-puppet .puppet-atmosphere { animation: particle-drift 1.1s ease-in-out infinite; }
[data-character-cue='reveal'] [data-layer-id='dish_glow'], [data-character-cue='reveal'] [data-layer-id^='spark_'] { animation: puppet-reveal-spark var(--motion-duration) var(--motion-easing) infinite; }
[data-character-cue='answerAccepted'] [data-layer-id='note_ink_check'] { animation: note-ink .7s ease both; }
.oracle-joint { width: 10px; height: 10px; border: 2px solid rgba(101,55,31,.62); border-radius: 999px; background: #ffe7bd; box-shadow: 0 0 0 3px rgba(255,255,255,.28); }
.oracle-joint.shoulder.left { left: 62px; top: 8px; } .oracle-joint.elbow.left { left: 35px; top: 28px; } .oracle-joint.wrist.left { left: 4px; top: 44px; }
.oracle-joint.shoulder.right { right: 56px; top: 7px; } .oracle-joint.elbow.right { right: 27px; top: 25px; } .oracle-joint.wrist.right { right: -2px; top: 41px; }
.oracle-aura { inset: 34px 28px 40px; border-radius: 45% 55% 48% 52%; background: radial-gradient(circle at 50% 28%, rgba(255,255,255,.92), rgba(255,203,111,.34) 46%, rgba(217,61,39,.16) 70%, transparent); animation: aura-breathe 3.6s ease-in-out infinite; }
.oracle-shadow { left: 50%; bottom: 30px; width: 230px; height: 42px; border-radius: 50%; transform: translateX(-50%); background: rgba(62,31,12,.24); filter: blur(7px); }
.oracle-body { left: 50%; bottom: 62px; width: 178px; height: 184px; transform: translateX(-50%); border: 3px solid #67391e; border-radius: 44% 44% 28% 28%; background: linear-gradient(145deg, #fff8ec 0 52%, #ffd18d 53% 100%); box-shadow: 0 18px 34px rgba(91,44,15,.16); }
.chef-jacket-line { left: 50%; top: 18px; width: 3px; height: 120px; background: rgba(103,57,30,.28); transform: rotate(8deg); } .apron-medallion { left: 50%; bottom: 34px; width: 34px; height: 34px; border-radius: 999px; transform: translateX(-50%); background: linear-gradient(#ffcf63, #f59d2c); border: 3px solid #67391e; }
.oracle-head { left: 50%; top: 62px; width: 158px; height: 148px; transform: translateX(-50%); border: 3px solid #67391e; border-radius: 50% 50% 44% 44%; background: linear-gradient(#ffe5b8, #ffc378); box-shadow: inset 0 10px 0 rgba(255,255,255,.32); }
.oracle-hair { left: 18px; right: 18px; top: -38px; height: 62px; border: 3px solid #67391e; border-radius: 55% 55% 30% 30%; background: linear-gradient(#fff, #fff4e8); }
.oracle-brow { top: 47px; width: 28px; height: 5px; border-radius: 999px; background: #4d2d1b; } .oracle-brow.left { left: 36px; } .oracle-brow.right { right: 36px; }
.oracle-eye { top: 62px; width: 14px; height: 22px; border-radius: 999px; background: #21150e; animation: oracle-blink 4.4s linear infinite; } .oracle-eye.left { left: 45px; } .oracle-eye.right { right: 45px; }
.oracle-cheek { top: 87px; width: 22px; height: 10px; border-radius: 999px; background: rgba(217,61,39,.20); } .oracle-cheek.left { left: 27px; } .oracle-cheek.right { right: 27px; }
.oracle-mouth { left: 50%; bottom: 25px; width: 38px; height: 16px; transform: translateX(-50%); border-bottom: 5px solid #21150e; border-radius: 0 0 999px 999px; }
.oracle-arm { top: 206px; width: 98px; height: 62px; transform-origin: center center; } .spoon-arm { right: 16px; } .note-arm { left: 10px; }
.oracle-spoon { right: -5px; top: 15px; width: 92px; height: 13px; border-radius: 999px; background: #65371f; transform: rotate(-34deg); box-shadow: 0 2px 0 rgba(255,255,255,.28) inset; } .oracle-spoon::after { content: ''; position: absolute; right: -14px; top: -13px; width: 34px; height: 34px; border: 5px solid #65371f; border-radius: 50%; background: radial-gradient(circle, #fff7e8 20%, #f2b85a); }
.oracle-note-card { left: 6px; top: 4px; width: 72px; height: 58px; border-radius: 14px; border: 3px solid #65371f; background: linear-gradient(#fffef8, #ffeecb); transform: rotate(9deg); } .note-line { left: 13px; height: 4px; border-radius: 999px; background: rgba(101,55,31,.28); } .note-line.first { top: 18px; width: 42px; } .note-line.second { top: 31px; width: 32px; } .note-ink { right: 9px; bottom: 5px; color: var(--leaf); font-weight: 950; opacity: 0; transform: scale(.7); }
.oracle-plate-stage { left: 50%; bottom: 18px; width: 172px; height: 58px; transform: translateX(-50%); border: 3px solid #65371f; border-radius: 50%; background: linear-gradient(#fff, #ffe6bf); } .oracle-dish-glow { left: 32px; right: 32px; top: 8px; height: 30px; border-radius: 50%; background: rgba(246,179,79,.34); opacity: .35; } .oracle-lid { left: 50%; bottom: 29px; width: 96px; height: 42px; transform: translateX(-50%); border: 3px solid #65371f; border-radius: 999px 999px 16px 16px; background: linear-gradient(#fff8e8, #f6c064); }
.oracle-particle { width: 12px; height: 12px; border-radius: 999px; background: rgba(255,255,255,.86); animation: particle-drift 3.4s ease-in-out infinite; } .oracle-particle.one { left: 70px; top: 70px; } .oracle-particle.two { right: 60px; top: 108px; animation-delay: -.8s; } .oracle-particle.three { left: 112px; bottom: 82px; animation-delay: -1.8s; }
[data-character-cue='idle'] .oracle-host { transform: translateY(0) scale(1); }
[data-character-cue='idle'] .oracle-aura { opacity: .86; }
[data-character-cue='idle'] .oracle-particle { opacity: .72; }
[data-character-cue='idle'] .oracle-spoon { transform: rotate(-34deg); }
[data-character-cue='ask'] .oracle-host { transform: translateY(-6px) rotate(-1.5deg); }
[data-character-cue='ask'] .spoon-arm { transform: translate(-8px,-22px) rotate(-12deg); }
[data-character-cue='ask'] .oracle-brow.left { transform: translateY(-4px) rotate(-10deg); }
[data-character-cue='ask'] .oracle-aura { filter: saturate(1.12); }
[data-character-cue='answerAccepted'] .oracle-host { transform: translateY(-3px) rotate(1deg); }
[data-character-cue='answerAccepted'] .note-arm { transform: translate(24px,-18px) rotate(-12deg); }
[data-character-cue='answerAccepted'] .note-ink { opacity: 1; transform: scale(1.24); animation: note-ink .7s ease both; }
[data-character-cue='answerAccepted'] .oracle-eye { height: 16px; }
[data-character-cue='thinking'] .oracle-host { transform: translateY(-2px) rotate(2deg) scale(.99); filter: saturate(.92); }
[data-character-cue='thinking'] .oracle-aura { animation-duration: 1.4s; }
[data-character-cue='thinking'] .oracle-particle { animation-duration: 1.2s; }
[data-character-cue='thinking'] .oracle-brow { transform: translateY(-3px) rotate(8deg); }
[data-character-cue='confident'] .oracle-host { transform: translateY(-10px) scale(1.04); filter: drop-shadow(0 0 24px rgba(255,196,72,.44)); }
[data-character-cue='confident'] .oracle-plate-stage { transform: translateX(-50%) translateY(-13px) scale(1.08); }
[data-character-cue='confident'] .oracle-lid { transform: translateX(-50%) translateY(-7px); }
[data-character-cue='confident'] .oracle-mouth { width: 46px; }
[data-character-cue='surprised'] .oracle-host { transform: translateX(-14px) translateY(-4px) rotate(-5deg); }
[data-character-cue='surprised'] .oracle-mouth { width: 25px; height: 28px; border: 5px solid #21150e; border-radius: 50%; }
[data-character-cue='surprised'] .spoon-arm { transform: translate(18px, 24px) rotate(28deg); }
[data-character-cue='surprised'] .oracle-aura { filter: hue-rotate(-14deg) saturate(1.2); }
[data-character-cue='recover'] .oracle-host { transform: translateY(-3px) rotate(.5deg); filter: saturate(.96); }
[data-character-cue='recover'] .note-arm { transform: translate(20px,-12px) rotate(-4deg); }
[data-character-cue='recover'] .oracle-brow { transform: translateY(2px); }
[data-character-cue='recover'] .oracle-aura { opacity: .68; }
[data-character-cue='reveal'] .oracle-host { transform: translateY(-16px) scale(1.06); filter: drop-shadow(0 0 30px rgba(255,211,92,.56)); }
[data-character-cue='reveal'] .oracle-lid { transform: translateX(-50%) translateY(-54px) rotate(-14deg); }
[data-character-cue='reveal'] .oracle-dish-glow { opacity: 1; transform: scale(1.45); }
[data-character-cue='reveal'] .oracle-particle { opacity: 1; animation-duration: 1.1s; }
[data-current-prop-motion='approve-nod'] .oracle-host { animation: approve-nod .72s ease both; }
[data-current-prop-motion='approve-nod'] .spoon-arm { animation: joint-approve .72s ease both; }
[data-current-prop-motion='maybe-tilt'] .oracle-host { animation: maybe-tilt .78s ease both; }
[data-current-prop-motion='maybe-tilt'] .oracle-brow.right { transform: translateY(-6px) rotate(12deg); }
[data-current-prop-motion='puzzled-shrug'] .note-arm { animation: puzzled-shrug .78s ease both; }
[data-current-prop-motion='puzzled-shrug'] .oracle-mouth { width: 26px; height: 20px; border: 4px solid #21150e; border-radius: 50%; }
[data-current-prop-motion='narrow-away'] .oracle-eye { height: 9px; transform: translateY(5px); }
[data-current-prop-motion='narrow-away'] .spoon-arm { animation: narrow-away .72s ease both; }
[data-current-prop-motion='prune-swipe'] .spoon-arm { animation: prune-swipe .72s ease both; }
[data-current-prop-motion='prune-swipe'] .oracle-aura { filter: hue-rotate(-12deg) saturate(1.2); }
[data-current-expression='soft-smile'] .oracle-mouth { width: 46px; }
[data-current-expression='maybe-smirk'] .oracle-mouth { width: 34px; transform: translateX(-50%) rotate(-5deg); }
[data-current-expression='skeptical-narrow'] .oracle-brow { transform: translateY(3px) rotate(-5deg); }
[data-current-expression='decisive-prune'] .oracle-mouth { width: 30px; border-bottom-width: 6px; }
.state-label { margin: 22px 0 0; text-align: center; font-weight: 950; color: var(--miso); }
.reduced-motion-note { display: block; margin-top: 8px; font-size: .80rem; color: var(--muted); text-align: center; }
@keyframes aura-breathe { 0%,100% { transform: scale(.98); opacity: .78; } 50% { transform: scale(1.04); opacity: 1; } }
@keyframes particle-drift { 0%,100% { transform: translate3d(0, 6px, 0) scale(.92); opacity: .32; } 50% { transform: translate3d(8px, -12px, 0) scale(1.08); opacity: .86; } }
@keyframes note-ink { 0% { transform: scale(.6) rotate(-20deg); opacity: 0; } 65% { transform: scale(1.35) rotate(4deg); opacity: 1; } 100% { transform: scale(1.1); opacity: 1; } }
@keyframes oracle-blink { 0%, 92%, 100% { transform: scaleY(1); } 94%, 96% { transform: scaleY(.12); } }
@keyframes idle-breath { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-5px) scale(1.012); } }
@keyframes blink-gaze { 0%,80%,100% { transform: translateX(0) scaleY(1); } 86% { transform: translateX(3px) scaleY(.14); } 92% { transform: translateX(-2px) scaleY(1); } }
@keyframes spoon-point { 0% { transform: rotate(-34deg); } 50% { transform: translate(7px,-6px) rotate(-50deg); } 100% { transform: rotate(-34deg); } }
@keyframes approve-nod { 0%,100% { transform: translateY(-3px) rotate(1deg); } 38% { transform: translateY(5px) rotate(1deg) scale(1.015); } 72% { transform: translateY(-8px) rotate(-1deg); } }
@keyframes joint-approve { 0%,100% { transform: translate(0,0) rotate(0); } 50% { transform: translate(13px,-16px) rotate(-18deg); } }
@keyframes maybe-tilt { 0%,100% { transform: translateY(-3px) rotate(1deg); } 50% { transform: translateY(-4px) rotate(-7deg); } }
@keyframes puzzled-shrug { 0%,100% { transform: translate(24px,-18px) rotate(-12deg); } 50% { transform: translate(4px,-5px) rotate(17deg); } }
@keyframes narrow-away { 0%,100% { transform: translate(0,0) rotate(0); } 50% { transform: translate(14px,2px) rotate(22deg); } }
@keyframes prune-swipe { 0% { transform: translate(0,0) rotate(0); } 45% { transform: translate(-34px,8px) rotate(38deg); } 100% { transform: translate(10px,2px) rotate(-10deg); } }
@keyframes thinking-scan { 0%,100% { filter: saturate(.92); } 50% { filter: saturate(1.16) drop-shadow(0 0 18px rgba(255,196,72,.30)); } }
@keyframes puppet-thinking-breath { 0%,100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(var(--sx), var(--sy)); } 50% { transform: translate(calc(var(--tx) - 1px), calc(var(--ty) - 4px)) rotate(calc(var(--rot) + 1deg)) scale(var(--sx), var(--sy)); } }
@keyframes puppet-note-scan { 0%,100% { filter: brightness(1); } 48% { filter: brightness(1.12) drop-shadow(0 0 10px rgba(255,211,92,.42)); } }
@keyframes puppet-reveal-spark { 0% { opacity: 0; transform: translate(var(--tx), calc(var(--ty) + 8px)) rotate(var(--rot)) scale(.75); } 52% { opacity: 1; transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(1.18); } 100% { opacity: var(--opacity); transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(var(--sx), var(--sy)); } }
@keyframes confidence-rise { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(-10px) scale(1.04); } }
@keyframes oops-recoil { 0% { transform: translateX(0) rotate(0); } 55% { transform: translateX(-16px) rotate(-7deg); } 100% { transform: translateX(-8px) rotate(-4deg); } }
@keyframes recovery-reset { 0% { transform: rotate(-5deg); } 100% { transform: rotate(.5deg); } }
@keyframes lid-reveal { 0% { transform: translateX(-50%); } 100% { transform: translateX(-50%) translateY(-54px) rotate(-14deg); } }
@media (max-width: 820px) { .app-shell { grid-template-columns: 1fr; padding: 16px 12px 28px; } .oracle-theater { min-height: 410px; } .oracle-host { width: min(300px, 82vw); height: 330px; } .answer-grid { grid-template-columns: 1fr; } .clue-progress { align-items: flex-start; flex-direction: column; } h1 { font-size: clamp(31px, 10vw, 44px); } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; } [data-reduced-motion-note] { display: inline; } .oracle-host { transform: none !important; } }
</style>`;
}

export const demoDataset = foodKnowledgeBase;

export function mountApp(root: HTMLElement): void {
  let model: UiModel = { phase: 'entry' };
  const render = () => { root.innerHTML = renderApp(model); };
  const dispatch = (event: UiEvent) => { model = transitionUi(model, event); render(); };

  root.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest('button') as HTMLButtonElement | null;
    if (!button) return;
    try {
      if (button.dataset.action === 'start') { dispatch({ type: 'start' }); return; }
      if (button.dataset.action === 'restart') { dispatch({ type: 'restart' }); return; }
      if (button.dataset.action === 'confirm-guess') { dispatch({ type: 'confirmGuess' }); return; }
      if (button.dataset.action === 'reject-guess' && model.session?.guess) {
        const candidate = model.session.guess.candidate;
        const guessingSession = model.session;
        dispatch({ type: 'rejectGuess', candidateId: candidate.id, candidateName: candidate.nameKo });
        window.setTimeout(() => dispatch({ type: 'advanceRecoveryBeat', beat: 'remove' }), 520);
        window.setTimeout(() => dispatch({ type: 'advanceRecoveryBeat', beat: 'refocus', session: submitGuessFeedback(guessingSession, { candidateId: candidate.id, accepted: false }, foodKnowledgeBase) }), 1040);
        window.setTimeout(() => {
          if (model.phase === 'recovering' && model.recoveryBeat === 'refocus' && model.session) dispatch({ type: 'recovered', session: model.session });
        }, 1760);
        return;
      }
      const answer = button.dataset.answerKey as AnswerKey | undefined;
      if (answer && model.session?.currentQuestion) {
        const questionId = model.session.currentQuestion.id;
        dispatch({ type: 'answer', answer });
        window.setTimeout(() => dispatch({ type: 'thinking' }), 700);
        window.setTimeout(() => dispatch({ type: 'engineReady', session: submitAnswer(model.session!, { questionId, answer }, foodKnowledgeBase) }), 1550);
      }
    } catch (error) {
      dispatch({ type: 'error', message: error instanceof Error ? error.message : '알 수 없는 오류' });
    }
  });

  render();
}

if (typeof document !== 'undefined') {
  const root = document.querySelector<HTMLElement>('#app');
  if (root) mountApp(root);
}
