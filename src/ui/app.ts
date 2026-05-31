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

const answerOrder: AnswerKey[] = ['yes', 'probably', 'unknown', 'probably_not', 'no'];
const answerLabel: Record<AnswerKey, string> = {
  yes: '네',
  probably: '아마도요',
  unknown: '모르겠어요',
  probably_not: '아마 아닐걸요',
  no: '아니요',
};


export type UiPhase = 'entry' | 'asking' | 'answerAccepted' | 'thinking' | 'guessing' | 'revealed' | 'recovering' | 'exhausted' | 'error';

export type UiModel = {
  phase: UiPhase;
  session?: EngineSession;
  lastAnswer?: AnswerKey;
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
      rejectedCandidateIds: Array.from(new Set([...(model.rejectedCandidateIds ?? []), event.candidateId])),
      rejectedCandidateNames: Array.from(new Set([...(model.rejectedCandidateNames ?? []), event.candidateName])),
    };
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
  return `<div class="oracle-host" aria-hidden="true" data-character-runtime="${CHARACTER_RUNTIME}" data-rig-layer-contract="${RIG_LAYER_CONTRACT}" data-character-cue="${cue}" data-silhouette="${contract.silhouette}" data-expression="${contract.expression}" data-current-expression="${expression}" data-prop-motion="${contract.propMotion}" data-current-prop-motion="${propMotion}" data-stage-tone="${contract.stageTone}" data-joint-rig="shoulder-elbow-wrist">
    ${renderMotionCatalog()}
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

function cueFor(model: UiModel): string {
  if (model.phase === 'entry') return 'idle';
  if (model.phase === 'answerAccepted') return 'answerAccepted';
  if (model.phase === 'thinking') return 'thinking';
  if (model.phase === 'guessing') return 'confident';
  if (model.phase === 'revealed') return 'reveal';
  if (model.phase === 'recovering') return 'surprised';
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
    return `<p class="eyebrow">다시 좁히는 중</p>
<h2>앗, 제가 너무 성급했네요.</h2>
<p class="helper">그 메뉴는 빼고 단서판을 다시 정렬할게요.</p>
${renderRejectedChips(model.rejectedCandidateNames)}
${renderQuestion(model.session, false)}`;
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

function renderRejectedChips(names: string[] = []): string {
  if (names.length === 0) return '';
  return `<div class="rejected-list">${names.map((name) => `<span class="rejected-chip">제외됨: ${escapeHtml(name)}</span>`).join('')}</div>`;
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
.rejected-list { margin: 16px 0; display: flex; flex-wrap: wrap; gap: 8px; } .rejected-chip { border: 1px solid rgba(217,61,39,.28); background: #fff1ee; color: #8d2d20; border-radius: var(--radius-pill); padding: 8px 12px; font-weight: 900; }
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
[data-character-cue='ask'] .spoon-arm { transform: translate(18px,-22px) rotate(-12deg); }
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
@keyframes confidence-rise { 0% { transform: translateY(0) scale(1); } 100% { transform: translateY(-10px) scale(1.04); } }
@keyframes oops-recoil { 0% { transform: translateX(0) rotate(0); } 55% { transform: translateX(-16px) rotate(-7deg); } 100% { transform: translateX(-8px) rotate(-4deg); } }
@keyframes recovery-reset { 0% { transform: rotate(-5deg); } 100% { transform: rotate(.5deg); } }
@keyframes lid-reveal { 0% { transform: translateX(-50%); } 100% { transform: translateX(-50%) translateY(-54px) rotate(-14deg); } }
@media (max-width: 820px) { .app-shell { grid-template-columns: 1fr; padding: 16px 12px 28px; } .oracle-theater { min-height: 410px; } .oracle-host { width: min(310px, 86vw); height: 330px; } .answer-grid { grid-template-columns: 1fr; } .clue-progress { align-items: flex-start; flex-direction: column; } h1 { font-size: clamp(31px, 10vw, 44px); } }
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
        dispatch({ type: 'rejectGuess', candidateId: candidate.id, candidateName: candidate.nameKo });
        window.setTimeout(() => dispatch({ type: 'recovered', session: submitGuessFeedback(model.session!, { candidateId: candidate.id, accepted: false }, foodKnowledgeBase) }), 520);
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
