import { describe, expect, it } from 'vitest';
import type { EngineSession } from '../src/engine/session.js';
import { createDemoSession, renderApp, transitionUi, type UiModel } from '../src/ui/app.js';

const answerLabels = ['네', '아마도요', '모르겠어요', '아마 아닐걸요', '아니요'];
const answerKeys = ['yes', 'probably', 'unknown', 'probably_not', 'no'];

describe('premium culinary oracle UI', () => {
  it('renders a production-grade visual-system contract and explicitly removes the old low-tier mascot foundation', () => {
    const html = renderApp({ phase: 'entry' });

    expect(html).toContain('data-ui-state="entry"');
    expect(html).toContain('data-visual-system="culinary-oracle-theater-v2"');
    expect(html).toContain('data-character-tier="premium-oracle-host"');
    expect(html).toContain('data-motion-system="layered-oracle-rig"');
    expect(html).toContain('오늘 뭐 먹을지 제가 맞혀볼게요.');
    expect(html).toContain('마음속 메뉴를 하나 정하고, 보글에게 단서를 주세요.');
    expect(html).toContain('class="oracle-theater"');
    expect(html).toContain('class="oracle-host"');
    expect(html).toContain('class="cinematic-backdrop"');
    expect(html).not.toMatch(/bogle-figure|bogle-hat|bogle-face|bogle-arm|bogle-ladle|hero-stage/);
    expect(html).not.toMatch(/추천해드릴게요|TOP 3|확률|score|probability|attribute|clue:/i);
  });

  it('renders one visible Korean question and the fixed five answer controls in order', () => {
    const session = createDemoSession();
    const html = renderApp({ phase: 'asking', session });

    expect(html).toContain('data-ui-state="asking"');
    expect(html).toContain('data-character-cue="ask"');
    expect(html).toContain(`data-question-id="${session.currentQuestion?.id}"`);
    expect(html).toContain(session.currentQuestion?.textKo);
    const buttonMatches = [...html.matchAll(/<button class="answer[^>]*data-answer-key="([^"]+)"[^>]*>([^<]+)<\/button>/g)];
    expect(buttonMatches).toHaveLength(5);
    expect(buttonMatches.map((match) => match[1])).toEqual(answerKeys);
    expect(buttonMatches.map((match) => match[2])).toEqual(answerLabels);
  });

  it('uses a layered character rig with visible state parts, expression parts, prop parts, and atmosphere layers', () => {
    const session = createDemoSession();
    const html = renderApp({ phase: 'asking', session });

    const requiredLayers = [
      'oracle-aura',
      'oracle-shadow',
      'oracle-body',
      'oracle-head',
      'oracle-eye left',
      'oracle-eye right',
      'oracle-brow left',
      'oracle-brow right',
      'oracle-mouth',
      'oracle-arm spoon-arm',
      'oracle-arm note-arm',
      'oracle-spoon',
      'oracle-note-card',
      'oracle-plate-stage',
      'oracle-lid',
      'oracle-particle one',
      'oracle-particle two',
      'oracle-particle three',
    ];
    for (const layer of requiredLayers) {
      expect(html).toContain(`class="${layer}`);
    }
    expect(html).toContain('data-silhouette="lean-forward"');
    expect(html).toContain('data-expression="curious-focus"');
    expect(html).toContain('data-prop-motion="spoon-point"');
  });

  it('maps every required product state to a distinct premium silhouette, expression, prop motion, stage tone, and visible copy', () => {
    const askingSession = createDemoSession();
    const recoveringSession = { ...askingSession, characterCue: 'recover' as const };
    const guessingSession = fakeGuessingSession();
    const cases: Array<{
      name: string;
      model: UiModel;
      cue: string;
      silhouette: string;
      expression: string;
      propMotion: string;
      stageTone: string;
      copy: string;
    }> = [
      { name: 'idle', model: { phase: 'entry' }, cue: 'idle', silhouette: 'soft-idle', expression: 'warm-blink', propMotion: 'steam-orbit', stageTone: 'warm-table', copy: '마음속 메뉴를 하나 정하고' },
      { name: 'ask', model: { phase: 'asking', session: askingSession }, cue: 'ask', silhouette: 'lean-forward', expression: 'curious-focus', propMotion: 'spoon-point', stageTone: 'question-spotlight', copy: askingSession.currentQuestion!.textKo },
      { name: 'answerAccepted', model: { phase: 'answerAccepted', session: askingSession, lastAnswer: 'yes' }, cue: 'answerAccepted', silhouette: 'note-capture', expression: 'focused-smile', propMotion: 'ink-check', stageTone: 'clue-captured', copy: '단서는 적어둘게요' },
      { name: 'thinking', model: { phase: 'thinking', session: askingSession, lastAnswer: 'yes' }, cue: 'thinking', silhouette: 'analysis-huddle', expression: 'narrow-thinking', propMotion: 'steam-spiral', stageTone: 'suspense', copy: '단서를 맞춰보는 중' },
      { name: 'confident', model: { phase: 'guessing', session: guessingSession }, cue: 'confident', silhouette: 'reveal-ready', expression: 'spark-confidence', propMotion: 'plate-present', stageTone: 'golden-reveal', copy: '혹시… 김치찌개인가요?' },
      { name: 'surprised', model: { phase: 'recovering', session: askingSession, rejectedCandidateIds: ['kimchi-jjigae'], rejectedCandidateNames: ['김치찌개'] }, cue: 'surprised', silhouette: 'recoil-reset', expression: 'oops-open', propMotion: 'spoon-drop', stageTone: 'correction', copy: '너무 성급했네요' },
      { name: 'recover', model: { phase: 'asking', session: recoveringSession, rejectedCandidateIds: ['kimchi-jjigae'] }, cue: 'recover', silhouette: 'steady-reframe', expression: 'calm-detective', propMotion: 'note-reopen', stageTone: 'recovery-focus', copy: '회복 중' },
      { name: 'reveal', model: { phase: 'revealed', session: { ...guessingSession, characterCue: 'reveal' } }, cue: 'reveal', silhouette: 'celebration-open', expression: 'bright-payoff', propMotion: 'lid-lift', stageTone: 'celebration', copy: '접시 공개' },
    ];

    const contracts = new Set<string>();
    for (const item of cases) {
      const html = renderApp(item.model);
      contracts.add(`${item.silhouette}/${item.expression}/${item.propMotion}/${item.stageTone}`);
      expect(html, item.name).toContain(`data-character-cue="${item.cue}"`);
      expect(html, item.name).toContain(`data-silhouette="${item.silhouette}"`);
      expect(html, item.name).toContain(`data-expression="${item.expression}"`);
      expect(html, item.name).toContain(`data-prop-motion="${item.propMotion}"`);
      expect(html, item.name).toContain(`data-stage-tone="${item.stageTone}"`);
      expect(html, item.name).toContain(item.copy);
    }
    expect(contracts.size).toBe(cases.length);
  });

  it('renders answerAccepted and thinking as disabled suspense states instead of jumping like a form', () => {
    const session = createDemoSession();
    const accepted = renderApp({ phase: 'answerAccepted', session, lastAnswer: 'unknown' });
    const thinking = renderApp({ phase: 'thinking', session, lastAnswer: 'unknown' });

    expect(accepted).toContain('data-ui-state="answerAccepted"');
    expect(accepted).toContain('data-last-answer="unknown"');
    expect(accepted).toContain('괜찮아요. 애매한 단서는 건너뛰고 볼게요.');
    expect((accepted.match(/disabled/g) ?? []).length).toBeGreaterThanOrEqual(5);
    expect(thinking).toContain('data-ui-state="thinking"');
    expect(thinking).toContain('data-character-cue="thinking"');
    expect(thinking).toContain('보글이 메모장을 보는 중');
    expect(thinking).toContain('aria-live="polite"');
  });

  it('renders guessing, reveal, wrong recovery, and safe errors without internal scoring leakage', () => {
    const guessingSession = fakeGuessingSession();
    const guessing = renderApp({ phase: 'guessing', session: guessingSession });
    const revealed = renderApp({ phase: 'revealed', session: { ...guessingSession, status: 'revealed', characterCue: 'reveal' } });
    const recovering = renderApp({ phase: 'recovering', session: createDemoSession(), rejectedCandidateIds: ['kimchi-jjigae'], rejectedCandidateNames: ['김치찌개'] });
    const error = renderApp({ phase: 'error', errorMessage: 'Question q-broth is already answered; Unknown answer key for current question' });

    expect(guessing).toContain('data-guess-candidate-id="kimchi-jjigae"');
    expect(guessing).toContain('혹시… 김치찌개인가요?');
    expect(guessing).toContain('맞아요');
    expect(guessing).toContain('아니에요');
    expect(revealed).toContain('data-result-candidate-id="kimchi-jjigae"');
    expect(revealed).toContain('제가 이렇게 본 이유는요.');
    expect(revealed).toContain('국물');
    expect(revealed).toContain('김치 단서');
    expect(recovering).toContain('data-character-cue="surprised"');
    expect(recovering).toContain('제외됨: 김치찌개');
    expect(error).toContain('단서가 잠깐 엉켰어요. 다시 시도해볼게요.');
    for (const html of [guessing, revealed, recovering, error]) {
      const visibleHtml = html.replace(/<style>[\s\S]*?<\/style>/, '');
      expect(visibleHtml).not.toMatch(/score|probability|top1|top3|clue:|Question q-|current question|Unknown answer key/i);
    }
  });

  it('includes high-fidelity motion tokens, reduced-motion fallback, and multiple cue-specific visual selectors', () => {
    const html = renderApp({ phase: 'entry' });
    const requiredCues = ['idle', 'ask', 'answerAccepted', 'thinking', 'confident', 'surprised', 'recover', 'reveal'];

    expect(html).toContain('--motion-snap');
    expect(html).toContain('--motion-suspense');
    expect(html).toContain('@keyframes aura-breathe');
    expect(html).toContain('@keyframes particle-drift');
    expect(html).toContain('@keyframes note-ink');
    expect(html).toContain('@media (prefers-reduced-motion: reduce)');
    expect(html).toContain('[data-reduced-motion-note]');
    for (const cue of requiredCues) {
      const matches = html.match(new RegExp(`\\[data-character-cue='${cue}'\\]`, 'g')) ?? [];
      expect(matches.length, `${cue} should have rich cue-specific styling`).toBeGreaterThanOrEqual(4);
    }
  });

  it('keeps deterministic UI transitions for browser QA', () => {
    const session = createDemoSession();
    const afterAnswer = transitionUi({ phase: 'asking', session }, { type: 'answer', answer: 'yes' });
    const afterThinking = transitionUi(afterAnswer, { type: 'thinking' });

    expect(afterAnswer.phase).toBe('answerAccepted');
    expect(afterAnswer.lastAnswer).toBe('yes');
    expect(afterThinking.phase).toBe('thinking');
  });
});

function fakeGuessingSession(): EngineSession {
  const session = createDemoSession();
  const candidate = session.candidateScores[0]!.candidate;
  return {
    ...session,
    status: 'revealed',
    characterCue: 'reveal',
    currentQuestion: undefined,
    guess: {
      candidate,
      reasonSeeds: candidate.reveal.reasonSeeds,
    },
    canAnswer: false,
    canConfirmGuess: true,
    canRejectGuess: true,
  };
}

const _satisfiesUiModel: UiModel = { phase: 'entry' };
