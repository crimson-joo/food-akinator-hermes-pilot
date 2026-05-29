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
    expect(thinking).toContain('상태: thinking · 추리 중');
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
    expect(html).toContain('상태: recover · 회복 중');
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
