import { describe, expect, it } from 'vitest';
import type { QuestionRole } from '../src/engine/domain.js';
import type { EngineSession } from '../src/engine/session.js';
import { createDemoSession, renderApp, transitionUi, type UiModel } from '../src/ui/app.js';

const answerLabels = ['네', '아마도요', '모르겠어요', '아마 아닐걸요', '아니요'];
const answerKeys = ['yes', 'probably', 'unknown', 'probably_not', 'no'];

describe('premium culinary oracle UI', () => {
  it('renders a production-grade visual-system contract and explicitly removes the old low-tier mascot foundation', () => {
    const html = renderApp({ phase: 'entry' });

    expect(html).toContain('data-ui-state="entry"');
    expect(html).toContain('data-visual-system="culinary-oracle-theater-v3"');
    expect(html).toContain('data-character-tier="production-rig-ready"');
    expect(html).toContain('data-motion-system="rive-state-machine-or-fallback"');
    expect(html).toContain('오늘 뭐 먹을지 제가 맞혀볼게요.');
    expect(html).toContain('마음속 메뉴를 하나 정하고, 보글에게 단서를 주세요.');
    expect(html).toContain('class="oracle-theater"');
    expect(html).toContain('class="lottie-character-host"');
    expect(html).toContain('data-character-runtime="lottie"');
    expect(html).toContain('data-runtime-status="ready"');
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

  it('uses the authored Lottie vector rig with visible state parts, prop parts, and atmosphere layers', () => {
    const session = createDemoSession();
    const html = renderApp({ phase: 'asking', session });

    const requiredLayers = [
      'body_torso',
      'head_base',
      'brow_left',
      'brow_right',
      'pupil_left',
      'pupil_right',
      'mouth_smile',
      'arm_spoon_lower',
      'spoon_bowl',
      'note_pages',
      'plate_lid',
      'dish_glow',
      'steam_1',
      'spark_1',
    ];
    for (const layer of requiredLayers) {
      expect(html).toContain(layer);
    }
    expect(html).toContain('data-character-runtime="lottie"');
    expect(html).toContain('data-lottie-rendered="true"');
    expect(html).toContain('data-lottie-layer-contract="concept-a-bogle-rig-v1"');
    expect(html).toContain('data-lottie-marker="ask-spoon-point-v2"');
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
      expect(html, item.name).toContain('data-character-runtime="lottie"');
      expect(html, item.name).toContain('data-lottie-rendered="true"');
      expect(html, item.name).toContain('data-lottie-layer-contract="concept-a-bogle-rig-v1"');
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
    expect(accepted).toContain('data-answer-reaction="unknown"');
    expect(accepted).toContain('모르겠으면 괜찮아요');
    expect((accepted.match(/disabled/g) ?? []).length).toBeGreaterThanOrEqual(5);
    expect(accepted).toContain('data-micro-reaction-beat="answer-captured"');
    expect(accepted).toContain('class="answer-reaction-badge"');
    expect(accepted).toContain('방금 누른 답변을 크게 표시하고 있어요.');
    expect(accepted).toContain('aria-busy="true"');
    expect(thinking).toContain('data-ui-state="thinking"');
    expect(thinking).toContain('data-character-cue="thinking"');
    expect(thinking).toContain('보글이 메모장을 보는 중');
    expect(thinking).toContain('data-interaction-feedback="thinking"');
    expect(thinking).toContain('단서들을 다시 섞어보는 중이에요.');
    expect(thinking).toContain('aria-live="polite"');
    expect(thinking).toContain('aria-busy="true"');
  });

  it('exposes the canonical progress-stage contract for every reasoning tension stage', () => {
    const cases = [
      { role: 'broad_split', stage: 'orienting', copy: '처음엔 입맛의 큰 방향을 열어볼게요.' },
      { role: 'family_lock', stage: 'narrowing', copy: '후보 묶음을 한 식탁 안으로 좁히고 있어요.' },
      { role: 'sibling_elimination', stage: 'fork', copy: '비슷한 후보 둘의 갈림길을 비교하고 있어요.' },
      { role: 'false_path_guardrail', stage: 'guardrail', copy: '성급한 추측을 막는 안전 단서를 확인해요.' },
      { role: 'signature_discriminator', stage: 'lock', copy: '마지막 결정 단서를 잠그는 중이에요.' },
      { role: 'recovery_disambiguation', stage: 'recovery', copy: '빗나간 접시는 빼고 다시 맞춰보고 있어요.' },
    ] as const;

    for (const item of cases) {
      const session = sessionWithQuestionRole(item.role);
      const html = renderApp({ phase: 'asking', session });
      expect(html, item.role).toContain(`data-progress-stage="${item.stage}"`);
      expect(html, item.role).toContain(item.copy);
    }
  });

  it('uses role-aware reasoning bridge copy instead of repeated generic progress labels during thinking', () => {
    const session = sessionWithQuestionRole('false_path_guardrail');
    const html = renderApp({ phase: 'thinking', session, lastAnswer: 'no' });
    const visibleHtml = html.replace(/<style>[\s\S]*?<\/style>/, '');

    expect(html).toContain('data-progress-stage="guardrail"');
    expect(html).toContain('아니요 답변을 반영해서, 성급한 추측을 막는 안전 단서를 확인해요.');
    expect(visibleHtml).not.toMatch(/큰 갈래는 잡혔어요|후보가 둘로 갈리네요|감이 왔어요/);
  });

  it('does not show rejected-dish recovery progress before an actual rejected guess exists', () => {
    const session = {
      ...sessionWithQuestionRole('recovery_disambiguation'),
      characterCue: 'ask' as const,
      rejectedCandidateIds: [],
    };
    const html = renderApp({ phase: 'asking', session });

    expect(html).not.toContain('data-progress-stage="recovery"');
    expect(html).not.toContain('빗나간 접시는 빼고 다시 맞춰보고 있어요.');
    expect(html).toContain('data-progress-stage="orienting"');
  });

  it('does not let stale rejected candidates override the active question progress stage', () => {
    const session = {
      ...sessionWithQuestionRole('signature_discriminator'),
      rejectedCandidateIds: ['kimchi-jjigae'],
    };
    const html = renderApp({ phase: 'asking', session, rejectedCandidateIds: ['kimchi-jjigae'] });

    expect(html).toContain('data-progress-stage="lock"');
    expect(html).toContain('마지막 결정 단서를 잠그는 중이에요.');
    expect(html).not.toContain('data-progress-stage="recovery"');
  });

  it('renders distinct answer-click feedback for all five answer choices', () => {
    const session = createDemoSession();
    const expected: Record<string, { sentiment: string; copy: string; motion: string }> = {
      yes: { sentiment: 'positive', copy: '좋아요, 방향이 꽤 선명해졌어요.', motion: 'approve-nod' },
      probably: { sentiment: 'soft-positive', copy: '아마도군요. 그쪽 후보를 살짝 올려볼게요.', motion: 'maybe-tilt' },
      unknown: { sentiment: 'uncertain', copy: '모르겠으면 괜찮아요. 애매한 단서는 잠시 보류할게요.', motion: 'puzzled-shrug' },
      probably_not: { sentiment: 'soft-negative', copy: '아마 아니군요. 그 후보군은 조금 낮춰볼게요.', motion: 'narrow-away' },
      no: { sentiment: 'negative', copy: '아니군요. 그 길은 과감히 지워둘게요.', motion: 'prune-swipe' },
    };

    for (const key of answerKeys) {
      const html = renderApp({ phase: 'answerAccepted', session, lastAnswer: key as never });
      expect(html, key).toContain(`data-answer-reaction="${key}"`);
      expect(html, key).toContain(`data-answer-sentiment="${expected[key]!.sentiment}"`);
      expect(html, key).toContain(`data-reaction-motion="${expected[key]!.motion}"`);
      expect(html, key).toContain(expected[key]!.copy);
    }
  });

  it('exposes named Lottie markers and authored layers for articulated motion', () => {
    const html = renderApp({ phase: 'entry' });
    const lottieLayers = html.match(/data-lottie-layers="([^"]+)"/)?.[1]?.split(',') ?? [];
    const keyframes = [...html.matchAll(/@keyframes ([a-z0-9-]+)/g)].map((match) => match[1]);

    expect(html).toContain('data-lottie-marker="idle-life-v2"');
    expect(html).toContain('data-lottie-src="src/ui/character/assets/bogle-concept-a.lottie.json"');
    expect(new Set(lottieLayers).size).toBeGreaterThanOrEqual(50);
    expect(lottieLayers).toEqual(expect.arrayContaining(['body_torso', 'head_base', 'brow_left', 'brow_right', 'pupil_left', 'pupil_right', 'arm_spoon_lower', 'spoon_bowl', 'note_pages', 'plate_lid', 'dish_glow', 'steam_1', 'spark_1']));
    expect(new Set(keyframes).size).toBeGreaterThanOrEqual(10);
  });

  it('renders the authored Lottie as one shared vector asset with state-specific markers and visible thought status', () => {
    const session = createDemoSession();
    const thinking = renderApp({ phase: 'thinking', session, lastAnswer: 'probably_not' });
    const reveal = renderApp({ phase: 'revealed', session: fakeGuessingSession() });
    const layerMatches = thinking.match(/data-lottie-layers="([^"]+)"/)?.[1]?.split(',') ?? [];

    expect(thinking).toContain('data-character-runtime="lottie"');
    expect(thinking).toContain('data-runtime-status="ready"');
    expect(thinking).toContain('data-lottie-marker="thinking-scan-v2"');
    expect(thinking).toContain('data-lottie-confidence="mid"');
    expect(thinking).toContain('data-lottie-rendered-svg="true"');
    expect(layerMatches.length).toBeGreaterThanOrEqual(50);
    expect(new Set(layerMatches).size).toBe(layerMatches.length);
    expect(layerMatches).toEqual(expect.arrayContaining(['head_base', 'brow_left', 'brow_right', 'pupil_left', 'mouth_thinking', 'arm_spoon_lower', 'spoon_bowl', 'note_pages', 'note_ink_check', 'plate_lid', 'steam_1']));
    expect(reveal).toContain('data-lottie-marker="lid-reveal-payoff-v2"');
  });

  it('renders Lottie marker hooks and the visible SVG poster for the upgraded vector asset', () => {
    const session = createDemoSession();
    const thinking = renderApp({ phase: 'thinking', session, lastAnswer: 'probably_not' });
    const reveal = renderApp({ phase: 'revealed', session: fakeGuessingSession() });

    expect(thinking).toContain('data-lottie-layer-contract="concept-a-bogle-rig-v1"');
    expect(thinking).toContain('data-lottie-marker="thinking-scan-v2"');
    expect(thinking).toContain('data-lottie-rendered-svg="true"');
    expect(thinking).toContain('aria-label="보글이 단서를 추리하는 Lottie 벡터 포스터"');
    expect(thinking).toContain('head_base');
    expect(thinking).toContain('steam_1');
    expect(thinking).toContain('note_pages');
    expect(reveal).toContain('data-lottie-marker="lid-reveal-payoff-v2"');
    expect(reveal).toContain('dish_glow');
  });

  it('renders guessing, reveal, wrong recovery, and safe errors without internal scoring leakage', () => {
    const guessingSession = fakeGuessingSession();
    const guessing = renderApp({ phase: 'guessing', session: guessingSession });
    const revealed = renderApp({ phase: 'revealed', session: { ...guessingSession, status: 'revealed', characterCue: 'reveal' } });
    const recovering = renderApp({ phase: 'recovering', recoveryBeat: 'remove', session: createDemoSession(), rejectedCandidateIds: ['kimchi-jjigae'], rejectedCandidateNames: ['김치찌개'] });
    const error = renderApp({ phase: 'error', errorMessage: 'Question q-broth is already answered; Unknown answer key for current question' });

    expect(guessing).toContain('data-guess-candidate-id="kimchi-jjigae"');
    expect(guessing).toContain('혹시… 김치찌개인가요?');
    expect(guessing).toContain('맞아요');
    expect(guessing).toContain('아니에요');
    expect(revealed).toContain('data-result-candidate-id="kimchi-jjigae"');
    expect(revealed).toContain('제가 이렇게 본 이유는요.');
    expect(revealed).toContain('국물이 당긴다고 답한 단서');
    expect(revealed).toContain('매콤한 쪽이라고 답한 단서');
    expect(revealed).toContain('data-reason-source="answer-trail"');
    expect(recovering).toContain('data-character-cue="surprised"');
    expect(recovering).toContain('제외됨: 김치찌개');
    expect(error).toContain('단서가 잠깐 엉켰어요. 다시 시도해볼게요.');
    for (const html of [guessing, revealed, recovering, error]) {
      const visibleHtml = html.replace(/<style>[\s\S]*?<\/style>/, '');
      expect(visibleHtml).not.toMatch(/score|probability|top1|top3|clue:|Question q-|current question|Unknown answer key/i);
    }
  });

  it('stages wrong recovery as surprise, removal, then refocus before returning to normal asking', () => {
    const session = createDemoSession();
    const rejected = transitionUi(
      { phase: 'guessing', session: fakeGuessingSession() },
      { type: 'rejectGuess', candidateId: 'kimchi-jjigae', candidateName: '김치찌개' },
    );
    const removal = transitionUi(rejected, { type: 'advanceRecoveryBeat', beat: 'remove' });
    const refocus = transitionUi(removal, { type: 'advanceRecoveryBeat', beat: 'refocus', session });

    expect(rejected).toMatchObject({ phase: 'recovering', recoveryBeat: 'surprise' });
    expect(removal).toMatchObject({ phase: 'recovering', recoveryBeat: 'remove' });
    expect(refocus).toMatchObject({ phase: 'recovering', recoveryBeat: 'refocus' });

    const surpriseHtml = renderApp(rejected);
    expect(surpriseHtml).toContain('data-ui-state="recovering"');
    expect(surpriseHtml).toContain('data-recovery-beat="surprise"');
    expect(surpriseHtml).toContain('data-character-cue="surprised"');
    expect(surpriseHtml).toContain('앗, 제가 너무 성급했네요.');
    expect(surpriseHtml).not.toContain('class="question-card"');

    const removalHtml = renderApp(removal);
    expect(removalHtml).toContain('data-recovery-beat="remove"');
    expect(removalHtml).toContain('data-testid="rejected-candidate-list"');
    expect(removalHtml).toContain('data-testid="rejected-candidate-chip"');
    expect(removalHtml).toContain('data-rejected-candidate-name="김치찌개"');
    expect(removalHtml).toContain('data-removal-treatment="crossed-off"');
    expect(removalHtml).toContain('그 메뉴는 후보에서 뺄게요.');
    expect(removalHtml).not.toContain('class="question-card"');

    const refocusHtml = renderApp(refocus);
    expect(refocusHtml).toContain('data-recovery-beat="refocus"');
    expect(refocusHtml).toContain('data-character-cue="recover"');
    expect(refocusHtml).toContain('다시 단서를 좁혀볼게요.');
    expect(refocusHtml).toContain('class="question-card"');
    expect([...refocusHtml.matchAll(/data-answer-key="/g)]).toHaveLength(5);
    expect(refocusHtml).toContain('data-testid="rejected-candidate-list"');
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
      answerTrace: ['국물이 당긴다고 답한 단서', '매콤한 쪽이라고 답한 단서', '밥이 떠오른다고 답한 단서'],
    },
    canAnswer: false,
    canConfirmGuess: true,
    canRejectGuess: true,
  };
}

function sessionWithQuestionRole(role: QuestionRole): EngineSession {
  const session = createDemoSession();
  return {
    ...session,
    currentQuestion: session.currentQuestion ? { ...session.currentQuestion, role } : undefined,
    characterCue: role === 'recovery_disambiguation' ? 'recover' : session.characterCue,
    rejectedCandidateIds: role === 'recovery_disambiguation' ? ['kimchi-jjigae'] : session.rejectedCandidateIds,
  };
}

const _satisfiesUiModel: UiModel = { phase: 'entry' };
