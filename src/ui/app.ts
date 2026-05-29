import type { AnswerKey, Candidate, Question } from '../engine/domain.js';
import { startSession, submitAnswer, submitGuessFeedback, type EngineSession } from '../engine/session.js';

const answerOrder: AnswerKey[] = ['yes', 'probably', 'unknown', 'probably_not', 'no'];
const answerLabel: Record<AnswerKey, string> = {
  yes: '네',
  probably: '아마도요',
  unknown: '모르겠어요',
  probably_not: '아마 아닐걸요',
  no: '아니요',
};

const cueLabel: Record<string, string> = {
  idle: '대기 중 · 메뉴를 떠올리는 시간',
  ask: '질문 중 · 단서를 건네는 시간',
  thinking: '추리 중',
  confident: '감이 왔어요',
  surprised: '놀람 · 성급함을 인정하는 시간',
  recover: '회복 중 · 후보를 다시 좁히는 시간',
  reveal: '공개 · 접시를 여는 시간',
  exhausted: '단서 부족 · 다시 시작하는 시간',
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
  return startSession(demoDataset);
}

export function transitionUi(model: UiModel, event: UiEvent): UiModel {
  if (event.type === 'restart') {
    return { phase: 'entry' };
  }
  if (event.type === 'start') {
    return { phase: 'asking', session: event.session ?? createDemoSession() };
  }
  if (event.type === 'answer' && model.session) {
    return { ...model, phase: 'answerAccepted', lastAnswer: event.answer };
  }
  if (event.type === 'thinking') {
    return { ...model, phase: 'thinking' };
  }
  if (event.type === 'engineReady') {
    return mapSessionToUi(event.session, model);
  }
  if (event.type === 'confirmGuess' && model.session) {
    return { ...model, phase: 'revealed', session: { ...model.session, characterCue: 'reveal' } };
  }
  if (event.type === 'rejectGuess') {
    return {
      ...model,
      phase: 'recovering',
      rejectedCandidateIds: Array.from(new Set([...(model.rejectedCandidateIds ?? []), event.candidateId])),
      rejectedCandidateNames: Array.from(new Set([...(model.rejectedCandidateNames ?? []), event.candidateName])),
    };
  }
  if (event.type === 'recovered') {
    return mapSessionToUi(event.session, model);
  }
  if (event.type === 'error') {
    return { phase: 'error', errorMessage: event.message };
  }
  return model;
}

function mapSessionToUi(session: EngineSession, previous: UiModel = { phase: 'entry' }): UiModel {
  if (session.status === 'exhausted') {
    return { ...previous, phase: 'exhausted', session };
  }
  if (session.guess) {
    return { ...previous, phase: 'guessing', session };
  }
  return { ...previous, phase: 'asking', session };
}

export function renderApp(model: UiModel): string {
  const session = model.session;
  const uiState = model.phase;
  const cue = cueFor(model);
  const attrs = [
    `class="app-shell"`,
    `data-ui-state="${uiState}"`,
    `data-character-cue="${cue}"`,
  ];
  if (model.lastAnswer) attrs.push(`data-last-answer="${model.lastAnswer}"`);
  if (model.rejectedCandidateIds?.length) attrs.push(`data-rejected-candidate-ids="${escapeAttr(model.rejectedCandidateIds.join(','))}"`);
  if (uiState === 'guessing' && session?.guess) attrs.push(`data-guess-candidate-id="${escapeAttr(session.guess.candidate.id)}"`);
  if (uiState === 'revealed' && session?.guess) attrs.push(`data-result-candidate-id="${escapeAttr(session.guess.candidate.id)}"`);

  return `${styleBlock()}
<main ${attrs.join(' ')}>
  <section class="hero-stage" aria-label="입맛 탐정 보글 상태" data-testid="character-stage" data-character-cue="${cue}">
    <div class="bogle-figure" aria-hidden="true">
      <span class="bogle-hat"></span>
      <span class="bogle-face"><span class="bogle-eye left"></span><span class="bogle-eye right"></span><span class="bogle-mouth"></span></span>
      <span class="bogle-ladle"></span>
      <span class="bogle-notebook"></span>
      <span class="bogle-plate"></span>
      <span class="steam one"></span><span class="steam two"></span><span class="steam three"></span>
    </div>
    <p data-testid="character-state-label" class="state-label">상태: ${cue} · ${escapeHtml(cueLabel[cue] ?? '상태 확인 중')}</p>
  </section>
  <section class="dialogue-card" aria-live="polite">
    ${renderPanel(model)}
  </section>
</main>`;
}

function cueFor(model: UiModel): string {
  if (model.phase === 'entry') return 'idle';
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
<p class="helper">마음속으로 지금 끌리는 메뉴를 하나 떠올려 주세요. 저는 질문 몇 개로 좁혀볼게요.</p>
<button class="primary" data-action="start" type="button">시작하기</button>
<p class="small-help">정답이 없어도 괜찮아요. 애매하면 “모르겠어요”를 눌러도 돼요.</p>`;
  }

  if (model.phase === 'answerAccepted') {
    return `<p class="eyebrow">단서 기록</p>
<h2>${model.lastAnswer === 'unknown' ? '괜찮아요. 애매한 단서는 건너뛰고 볼게요.' : '좋아요, 그 단서는 적어둘게요.'}</h2>
${renderQuestion(model.session, true, model.lastAnswer)}`;
  }

  if (model.phase === 'thinking') {
    return `<p class="eyebrow">보글이 메모장을 보는 중</p>
<h2>흠… 단서를 맞춰보는 중이에요.</h2>
<p class="helper">${progressCopy(model.session)}</p>
${renderAnswerButtons(true, model.lastAnswer)}`;
  }

  if (model.phase === 'guessing' && model.session?.guess) {
    const name = model.session.guess.candidate.nameKo;
    return `<p class="eyebrow">제가 맞혀볼게요</p>
<h2>혹시… ${escapeHtml(name)}인가요?</h2>
<p class="helper">성급하게 단정하지 않고, 맞는지 먼저 확인할게요.</p>
<div class="guess-actions">
  <button class="primary" data-action="confirm-guess" type="button">맞아요</button>
  <button class="secondary" data-action="reject-guess" type="button">아니에요</button>
</div>`;
  }

  if (model.phase === 'revealed' && model.session?.guess) {
    const candidate = model.session.guess.candidate;
    return `<p class="eyebrow">접시 공개</p>
<h2>오늘은 ${escapeHtml(candidate.nameKo)} 쪽이에요.</h2>
<p class="helper">${escapeHtml(candidate.reveal.oneLiner)}</p>
<h3>제가 이렇게 본 이유는요.</h3>
<ul class="reason-list">${candidate.reveal.reasonSeeds.slice(0, 3).map((reason) => `<li>${escapeHtml(reason)}</li>`).join('')}</ul>
<div class="guess-actions">
  <button class="primary" data-action="restart" type="button">다시 맞혀보기</button>
  <button class="secondary" data-action="reject-guess" type="button">아닌데요</button>
</div>`;
  }

  if (model.phase === 'recovering') {
    return `<p class="eyebrow">다시 좁히는 중</p>
<h2>앗, 제가 너무 성급했네요.</h2>
<p class="helper">그 메뉴는 빼고 다시 좁혀볼게요.</p>
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
<p class="helper">${escapeHtml(model.errorMessage ?? '')}</p>
<button class="primary" data-action="restart" type="button">다시 시작하기</button>`;
  }

  return renderQuestion(model.session, false);
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

function progressCopy(session?: EngineSession): string {
  if (!session) return '조금 더 물어볼게요.';
  if (session.turn >= 5) return '감이 왔어요.';
  if (session.turn >= 3) return '후보가 둘로 갈리네요.';
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
:root { --fa-bg: #fff7ea; --fa-surface: #ffffff; --fa-surface-warm: #fff1d8; --fa-ink: #2b2118; --fa-muted: #6f5948; --fa-border: #ead7bd; --fa-accent: #d9422b; --fa-accent-strong: #ad2d1c; --fa-focus: #1d6fd8; --fa-radius-lg: 28px; --fa-radius-pill: 999px; --fa-shadow-card: 0 1px 0 rgba(43, 33, 24, 0.05), 0 10px 30px rgba(80, 48, 20, 0.10); --fa-shadow-stage: 0 18px 50px rgba(115, 66, 22, 0.16); font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', system-ui, sans-serif; }
* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; background: radial-gradient(circle at 20% 10%, #ffe7bb 0, transparent 30%), var(--fa-bg); color: var(--fa-ink); }
.app-shell { min-height: 100vh; width: min(1080px, 100%); margin: 0 auto; padding: 32px 18px; display: grid; grid-template-columns: minmax(280px, 0.9fr) minmax(0, 1.1fr); gap: 28px; align-items: center; }
.hero-stage, .dialogue-card { background: rgba(255,255,255,0.86); border: 1px solid var(--fa-border); border-radius: var(--fa-radius-lg); box-shadow: var(--fa-shadow-card); }
.hero-stage { min-height: 300px; padding: 24px; display: grid; align-content: center; justify-items: center; box-shadow: var(--fa-shadow-stage); overflow: hidden; }
.dialogue-card { padding: clamp(22px, 4vw, 42px); }
.eyebrow, .turn-label { color: var(--fa-accent-strong); font-weight: 800; letter-spacing: 0.02em; }
h1, h2 { margin: 8px 0 16px; line-height: 1.15; font-size: clamp(28px, 4vw, 42px); }
h2 { font-size: clamp(24px, 3.4vw, 36px); }
.helper, .small-help { color: var(--fa-muted); font-size: 1.04rem; line-height: 1.7; }
button { min-height: 46px; border: 2px solid var(--fa-border); border-radius: var(--fa-radius-pill); padding: 12px 18px; font-weight: 800; background: #fffaf2; color: var(--fa-ink); cursor: pointer; }
button:focus-visible { outline: 3px solid var(--fa-focus); outline-offset: 3px; }
button:disabled { cursor: not-allowed; opacity: 0.64; }
.primary { background: var(--fa-accent); border-color: var(--fa-accent); color: #fff; }
.secondary { background: #fff; }
.answer-grid { display: grid; grid-template-columns: repeat(5, minmax(96px, 1fr)); gap: 10px; margin-top: 22px; }
.answer.selected { border-color: var(--fa-accent-strong); background: var(--fa-surface-warm); box-shadow: inset 0 0 0 2px rgba(217, 66, 43, 0.2); }
.guess-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 22px; }
.reason-list { display: grid; gap: 8px; padding-left: 22px; font-weight: 700; }
.rejected-list { margin: 14px 0; display: flex; flex-wrap: wrap; gap: 8px; }
.rejected-chip { border: 1px solid #e5b6ac; background: #fff1ee; color: #8d2d20; border-radius: var(--fa-radius-pill); padding: 8px 12px; font-weight: 800; }
.bogle-figure { position: relative; width: 210px; height: 210px; border-radius: 50% 50% 45% 45%; background: linear-gradient(#ffd98f, #ffb86a); transform-origin: bottom center; transition: transform 220ms ease, filter 220ms ease; }
.bogle-face { position: absolute; inset: 64px 45px 44px; border-radius: 48% 48% 42% 42%; background: #fff4dc; border: 3px solid #75452a; }
.bogle-hat { position: absolute; left: 50px; top: 16px; width: 110px; height: 54px; border-radius: 50% 50% 22px 22px; background: #fff; border: 3px solid #75452a; }
.bogle-eye { position: absolute; top: 34px; width: 12px; height: 18px; border-radius: 50%; background: #2b2118; } .bogle-eye.left { left: 36px; } .bogle-eye.right { right: 36px; }
.bogle-mouth { position: absolute; left: 50%; bottom: 22px; width: 34px; height: 14px; transform: translateX(-50%); border-bottom: 4px solid #2b2118; border-radius: 0 0 999px 999px; }
.bogle-ladle, .bogle-notebook, .bogle-plate { position: absolute; transition: transform 220ms ease, opacity 220ms ease; }
.bogle-ladle { right: -10px; top: 88px; width: 54px; height: 12px; background: #75452a; border-radius: 999px; transform: rotate(-28deg); }
.bogle-notebook { left: -10px; top: 118px; width: 52px; height: 42px; border-radius: 8px; background: #fff; border: 3px solid #75452a; }
.bogle-plate { left: 65px; bottom: -8px; width: 88px; height: 28px; border-radius: 50%; background: #fff; border: 3px solid #75452a; opacity: 0.25; }
.steam { position: absolute; top: -8px; width: 8px; height: 30px; border-radius: 999px; background: rgba(255,255,255,.8); animation: steam 1.8s ease-in-out infinite; } .steam.one { left: 75px; } .steam.two { left: 101px; animation-delay: .25s; } .steam.three { left: 127px; animation-delay: .5s; }
[data-character-cue='ask'] .bogle-figure { transform: translateY(-4px) rotate(-2deg); }
[data-character-cue='thinking'] .bogle-figure { transform: rotate(2deg); filter: saturate(0.95); } [data-character-cue='thinking'] .bogle-notebook { transform: translate(10px, -8px) rotate(-8deg); }
[data-character-cue='confident'] .bogle-figure { transform: scale(1.04); filter: drop-shadow(0 0 18px rgba(230,75,47,.22)); }
[data-character-cue='surprised'] .bogle-figure { transform: translateX(-8px) rotate(-4deg); } [data-character-cue='surprised'] .bogle-mouth { height: 22px; border: 4px solid #2b2118; border-radius: 50%; }
[data-character-cue='recover'] .bogle-notebook { transform: translate(8px, -6px); opacity: 1; }
[data-character-cue='reveal'] .bogle-plate { opacity: 1; transform: translateY(-10px) scale(1.08); }
.state-label { margin: 18px 0 0; font-weight: 800; color: var(--fa-muted); }
@keyframes steam { 0%, 100% { opacity: .25; transform: translateY(4px); } 50% { opacity: .85; transform: translateY(-8px); } }
@media (max-width: 760px) { .app-shell { grid-template-columns: 1fr; padding: 18px 14px; } .hero-stage { min-height: 30vh; } .answer-grid { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms; animation-iteration-count: 1; transition-duration: 0.01ms; scroll-behavior: auto; } }
</style>`;
}

const demoQuestions: Question[] = [
  q('q-broth', '국물이 있는 음식인가요?', { role: 'broad_split', axis: 'form', clarity: 3, cost: 0 }),
  q('q-crispy', '바삭하게 씹히는 게 좋나요?', { role: 'broad_split', axis: 'texture', clarity: 3, cost: 0 }),
  q('q-spicy', '매콤한 맛이 오늘 끌리나요?', { role: 'family_lock', axis: 'taste', clarity: 3 }),
  q('q-rice', '밥이 같이 있어야 든든할 것 같나요?', { role: 'family_lock', axis: 'form', clarity: 3 }),
  q('q-kimchi', '김치의 새콤하고 빨간 국물이 핵심인가요?', { role: 'signature_discriminator', axis: 'ingredient', clarity: 3, revealRisk: 2 }),
  q('q-recovery-nonkimchi', '그럼 김치찌개는 빼고, 구수한 국물 쪽으로 다시 볼까요?', { role: 'recovery_disambiguation', axis: 'taste', clarity: 3, revealRisk: 0 }),
];

const demoCandidates: Candidate[] = [
  c('kimchi-jjigae', '김치찌개', { 'q-broth': 1, 'q-crispy': -1, 'q-spicy': 1, 'q-rice': 0.8, 'q-kimchi': 1, 'q-recovery-nonkimchi': -1 }, ['국물', '매콤함', '김치 단서']),
  c('doenjang-jjigae', '된장찌개', { 'q-broth': 1, 'q-crispy': -1, 'q-spicy': -0.8, 'q-rice': 0.8, 'q-kimchi': -1, 'q-recovery-nonkimchi': 1 }, ['구수한 국물', '밥과 어울림', '뜨끈한 위로감']),
  c('fried-chicken', '치킨', { 'q-broth': -1, 'q-crispy': 1, 'q-spicy': -0.2, 'q-rice': -1, 'q-kimchi': -1, 'q-recovery-nonkimchi': -1 }, ['국물 아님', '바삭함', '야식 보상감']),
];

export const demoDataset = { candidates: demoCandidates, questions: demoQuestions };

function q(id: string, textKo: string, overrides: Partial<Question>): Question {
  return { id, textKo, axis: 'form', role: 'family_lock', clarity: 2, revealRisk: 0, cost: 1, status: 'active', ...overrides };
}

function c(id: string, nameKo: string, attributes: Record<string, number>, reasonSeeds: string[]): Candidate {
  return { id, nameKo, aliases: [], category: 'demo', tags: ['demo'], attributes, prior: 1, reveal: { oneLiner: `${nameKo} 쪽으로 볼게요.`, reasonSeeds }, status: 'active' };
}

export function mountApp(root: HTMLElement): void {
  let model: UiModel = { phase: 'entry' };
  const render = () => { root.innerHTML = renderApp(model); };
  const dispatch = (event: UiEvent) => { model = transitionUi(model, event); render(); };

  root.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest('button') as HTMLButtonElement | null;
    if (!button) return;
    try {
      if (button.dataset.action === 'start') {
        dispatch({ type: 'start' });
        return;
      }
      if (button.dataset.action === 'restart') {
        dispatch({ type: 'restart' });
        return;
      }
      if (button.dataset.action === 'confirm-guess') {
        dispatch({ type: 'confirmGuess' });
        return;
      }
      if (button.dataset.action === 'reject-guess' && model.session?.guess) {
        const candidate = model.session.guess.candidate;
        dispatch({ type: 'rejectGuess', candidateId: candidate.id, candidateName: candidate.nameKo });
        window.setTimeout(() => dispatch({ type: 'recovered', session: submitGuessFeedback(model.session!, { candidateId: candidate.id, accepted: false }, demoDataset) }), 520);
        return;
      }
      const answer = button.dataset.answerKey as AnswerKey | undefined;
      if (answer && model.session?.currentQuestion) {
        const questionId = model.session.currentQuestion.id;
        dispatch({ type: 'answer', answer });
        window.setTimeout(() => dispatch({ type: 'thinking' }), 220);
        window.setTimeout(() => dispatch({ type: 'engineReady', session: submitAnswer(model.session!, { questionId, answer }, demoDataset) }), 680);
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
