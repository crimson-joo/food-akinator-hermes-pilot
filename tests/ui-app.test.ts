import { describe, expect, it } from 'vitest';
import type { EngineSession } from '../src/engine/session.js';
import { createDemoSession, renderApp, transitionUi, type UiModel } from '../src/ui/app.js';

const answerLabels = ['네', '아마도요', '모르겠어요', '아마 아닐걸요', '아니요'];
const answerKeys = ['yes', 'probably', 'unknown', 'probably_not', 'no'];

describe('minimal browser UI scaffold', () => {
  it('renders entry as a character-led game start, not a recommendation form', () => {
    const html = renderApp({ phase: 'entry' });

    expect(html).toContain('data-ui-state="entry"');
    expect(html).toContain('data-character-cue="idle"');
    expect(html).toContain('대기 중 · 메뉴를 떠올리는 시간');
    expect(html).toContain('오늘 뭐 먹을지 제가 맞혀볼게요.');
    expect(html).toContain('시작하기');
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

  it('renders answerAccepted and thinking as visible disabled transition states', () => {
    const session = createDemoSession();
    const accepted = renderApp({ phase: 'answerAccepted', session, lastAnswer: 'unknown' });
    const thinking = renderApp({ phase: 'thinking', session, lastAnswer: 'unknown' });

    expect(accepted).toContain('data-ui-state="answerAccepted"');
    expect(accepted).toContain('data-last-answer="unknown"');
    expect(accepted).toContain('괜찮아요. 애매한 단서는 건너뛰고 볼게요.');
    expect((accepted.match(/disabled/g) ?? []).length).toBeGreaterThanOrEqual(5);
    expect(thinking).toContain('data-ui-state="thinking"');
    expect(thinking).toContain('data-character-cue="thinking"');
    expect(thinking).toContain('추리 중');
    expect(thinking).not.toContain('상태: thinking');
    expect(thinking).toContain('aria-live="polite"');
  });

  it('renders guessing before reveal, then a reveal card with Korean reasons and no internal scores', () => {
    const guessingSession = fakeGuessingSession();
    const guessing = renderApp({ phase: 'guessing', session: guessingSession });
    const revealed = renderApp({ phase: 'revealed', session: { ...guessingSession, status: 'revealed', characterCue: 'reveal' } });

    expect(guessing).toContain('data-ui-state="guessing"');
    expect(guessing).toContain('data-character-cue="confident"');
    expect(guessing).toContain('data-guess-candidate-id="kimchi-jjigae"');
    expect(guessing).toContain('혹시… 김치찌개인가요?');
    expect(guessing).toContain('맞아요');
    expect(guessing).toContain('아니에요');
    expect(revealed).toContain('data-ui-state="revealed"');
    expect(revealed).toContain('data-character-cue="reveal"');
    expect(revealed).toContain('data-result-candidate-id="kimchi-jjigae"');
    expect(revealed).toContain('제가 이렇게 본 이유는요.');
    expect(revealed).toContain('국물');
    expect(revealed).toContain('김치 단서');
    expect(revealed).not.toMatch(/score|probability|top1|top3|attribute|clue:/i);
  });

  it('renders wrong recovery with surprised cue, rejected chip, and recovery question controls', () => {
    const session = createDemoSession();
    const recovering = renderApp({
      phase: 'recovering',
      session,
      rejectedCandidateIds: ['kimchi-jjigae'],
      rejectedCandidateNames: ['김치찌개'],
    });

    expect(recovering).toContain('data-ui-state="recovering"');
    expect(recovering).toContain('data-character-cue="surprised"');
    expect(recovering).toContain('data-rejected-candidate-ids="kimchi-jjigae"');
    expect(recovering).toContain('앗, 제가 너무 성급했네요.');
    expect(recovering).toContain('제외됨: 김치찌개');
    expect((recovering.match(/data-answer-key=/g) ?? [])).toHaveLength(5);
  });

  it('keeps the recovered asking screen on the recover character cue when engine marks recovery', () => {
    const session = { ...createDemoSession(), characterCue: 'recover' as const };
    const html = renderApp({ phase: 'asking', session, rejectedCandidateIds: ['kimchi-jjigae'] });

    expect(html).toContain('data-ui-state="asking"');
    expect(html).toContain('data-character-cue="recover"');
    expect(html).toContain('회복 중');
    expect(html).not.toContain('상태: recover');
  });

  it('exposes a reduced-motion CSS hook and deterministic UI transitions for browser QA', () => {
    const session = createDemoSession();
    const afterAnswer = transitionUi({ phase: 'asking', session }, { type: 'answer', answer: 'yes' });
    const afterThinking = transitionUi(afterAnswer, { type: 'thinking' });

    expect(afterAnswer.phase).toBe('answerAccepted');
    expect(afterAnswer.lastAnswer).toBe('yes');
    expect(afterThinking.phase).toBe('thinking');
    expect(renderApp(afterThinking)).toContain('prefers-reduced-motion: reduce');
  });

  it('exposes a distinct 보글 character cue contract for the required product states', () => {
    const askingSession = createDemoSession();
    const recoveringSession = { ...askingSession, characterCue: 'recover' as const };
    const guessingSession = fakeGuessingSession();
    const cases: Array<{
      name: string;
      model: UiModel;
      cue: string;
      pose: string;
      face: string;
      prop: string;
      copy: string;
    }> = [
      { name: 'idle', model: { phase: 'entry' }, cue: 'idle', pose: 'breathing', face: 'soft-blink', prop: 'steam', copy: '마음속으로 지금 끌리는 메뉴' },
      { name: 'ask', model: { phase: 'asking', session: askingSession }, cue: 'ask', pose: 'question-lean', face: 'curious', prop: 'ladle-point', copy: askingSession.currentQuestion!.textKo },
      { name: 'answerAccepted', model: { phase: 'answerAccepted', session: askingSession, lastAnswer: 'yes' }, cue: 'answerAccepted', pose: 'note-check', face: 'focused', prop: 'notebook-check', copy: '단서는 적어둘게요' },
      { name: 'thinking', model: { phase: 'thinking', session: askingSession, lastAnswer: 'yes' }, cue: 'thinking', pose: 'notebook-forward', face: 'narrow-eyes', prop: 'steam-pulse', copy: '단서를 맞춰보는 중' },
      { name: 'confident', model: { phase: 'guessing', session: guessingSession }, cue: 'confident', pose: 'plate-forward', face: 'spark', prop: 'ladle-plate', copy: '혹시… 김치찌개인가요?' },
      { name: 'surprised', model: { phase: 'recovering', session: askingSession, rejectedCandidateIds: ['kimchi-jjigae'], rejectedCandidateNames: ['김치찌개'] }, cue: 'surprised', pose: 'recoil', face: 'o-mouth', prop: 'ladle-down', copy: '너무 성급했네요' },
      { name: 'recover', model: { phase: 'asking', session: recoveringSession, rejectedCandidateIds: ['kimchi-jjigae'] }, cue: 'recover', pose: 'steady-reset', face: 'calm', prop: 'notebook-open', copy: '회복 중' },
      { name: 'reveal', model: { phase: 'revealed', session: { ...guessingSession, characterCue: 'reveal' } }, cue: 'reveal', pose: 'celebrate', face: 'smile', prop: 'plate-lift', copy: '접시 공개' },
    ];

    const seenCues = new Set<string>();
    const seenContracts = new Set<string>();

    for (const item of cases) {
      const html = renderApp(item.model);
      seenCues.add(item.cue);
      seenContracts.add(`${item.pose}/${item.face}/${item.prop}`);
      expect(html, item.name).toContain(`data-character-cue="${item.cue}"`);
      expect(html, item.name).toContain(`data-bogle-pose="${item.pose}"`);
      expect(html, item.name).toContain(`data-bogle-face="${item.face}"`);
      expect(html, item.name).toContain(`data-bogle-prop="${item.prop}"`);
      expect(html, item.name).toContain(item.copy);
    }

    expect(seenCues.size).toBe(cases.length);
    expect(seenContracts.size).toBe(cases.length);
  });

  it('renders a visible host rig and non-numeric clue progress instead of a static placeholder', () => {
    const session = createDemoSession();
    const html = renderApp({ phase: 'asking', session });

    expect(html).toContain('class="bogle-figure"');
    expect(html).toContain('class="bogle-arm ladle-arm"');
    expect(html).toContain('class="bogle-arm notebook-arm"');
    expect(html).toContain('class="bogle-note-mark"');
    expect(html).toContain('class="plate-lid"');
    expect(html).toContain('class="clue-progress" aria-label="단서 진행"');
    expect(html).toContain('data-progress-tone="early"');
    expect(html).toContain('큰 갈래는 잡혔어요.');
    const visibleHtml = html.replace(/<style>[\s\S]*?<\/style>/, '');
    expect(visibleHtml).not.toMatch(/\b\d+%|score|probability|top1|top3|attribute|clue:/i);
  });

  it('defines at least two cue-specific visible style changes for every required host state', () => {
    const html = renderApp({ phase: 'entry' });
    const requiredCues = ['idle', 'ask', 'answerAccepted', 'thinking', 'confident', 'surprised', 'recover', 'reveal'];

    for (const cue of requiredCues) {
      const matches = html.match(new RegExp(`\\[data-character-cue='${cue}'\\]`, 'g')) ?? [];
      expect(matches.length, `${cue} should have multiple visible CSS selectors`).toBeGreaterThanOrEqual(2);
    }

    expect(html).toContain('@media (prefers-reduced-motion: reduce)');
    expect(html).toContain('[data-reduced-motion-note]');
  });

  it('keeps subtle breathing from overriding cue-specific transform poses', () => {
    const html = renderApp({ phase: 'entry' });
    const breatheKeyframes = html.match(/@keyframes bogle-breathe \{[\s\S]*?\}\s*\}/)?.[0] ?? '';

    expect(html).toContain("[data-character-cue='ask'] .bogle-figure { transform: translateY(-4px) rotate(-2deg); }");
    expect(html).toContain("[data-character-cue='confident'] .bogle-figure { transform: scale(1.04);");
    expect(breatheKeyframes).not.toContain('transform:');
  });

  it('covers exhausted and error as recover-family cue contracts instead of silent ask fallback', () => {
    const exhaustedSession = { ...createDemoSession(), status: 'exhausted' as const, characterCue: 'exhausted' as const };
    const exhausted = renderApp({ phase: 'exhausted', session: exhaustedSession });
    const error = renderApp({ phase: 'error', errorMessage: 'Question q-broth is already answered; Unknown answer key for current question' });

    expect(exhausted).toContain('data-ui-state="exhausted"');
    expect(exhausted).toContain('data-character-cue="recover"');
    expect(exhausted).toContain('data-bogle-pose="steady-reset"');
    expect(exhausted).toContain('정직한 멈춤');
    expect(error).toContain('data-ui-state="error"');
    expect(error).toContain('data-character-cue="recover"');
    expect(error).toContain('data-bogle-pose="steady-reset"');
  });

  it('keeps implementation cue tokens out of visible character labels', () => {
    const askingSession = createDemoSession();
    const guessingSession = fakeGuessingSession();
    const models: UiModel[] = [
      { phase: 'entry' },
      { phase: 'asking', session: askingSession },
      { phase: 'answerAccepted', session: askingSession, lastAnswer: 'yes' },
      { phase: 'thinking', session: askingSession, lastAnswer: 'yes' },
      { phase: 'guessing', session: guessingSession },
      { phase: 'recovering', session: askingSession, rejectedCandidateIds: ['kimchi-jjigae'], rejectedCandidateNames: ['김치찌개'] },
      { phase: 'revealed', session: { ...guessingSession, characterCue: 'reveal' } },
      { phase: 'error', errorMessage: 'raw q-id should stay hidden' },
    ];

    for (const model of models) {
      const html = renderApp(model);
      const label = html.match(/<p data-testid="character-state-label" class="state-label">([^<]+)<\/p>/)?.[1] ?? '';
      expect(label).not.toMatch(/idle|ask|answerAccepted|thinking|confident|surprised|recover|reveal|error|exhausted/);
      expect(label).toMatch(/보글|단서|추리|접시|회복|대기|질문|공개|놀람/);
    }
  });

  it('keeps breathing animation from overriding cue-specific posture transforms', () => {
    const html = renderApp({ phase: 'entry' });
    const breatheKeyframes = html.match(/@keyframes bogle-breathe \{[\s\S]*?\n\}/)?.[0] ?? '';

    expect(breatheKeyframes).toContain('box-shadow');
    expect(breatheKeyframes).not.toContain('transform');
    expect(html).toContain("[data-character-cue='ask'] .bogle-figure { transform:");
  });

  it('renders safe Korean recovery copy for errors without leaking raw engine messages', () => {
    const html = renderApp({ phase: 'error', errorMessage: 'Question q-broth is already answered; Unknown answer key for current question' });

    expect(html).toContain('data-ui-state="error"');
    expect(html).toContain('단서가 잠깐 엉켰어요. 다시 시도해볼게요.');
    expect(html).toContain('다시 시작하기');
    expect(html).not.toMatch(/Question q-|q-broth|already answered|current question|Unknown answer key/i);
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
