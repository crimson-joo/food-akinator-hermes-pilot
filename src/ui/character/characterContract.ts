import type { AnswerKey } from '../../engine/domain.js';

export const VISUAL_SYSTEM = 'culinary-oracle-theater-v3';
export const CHARACTER_TIER = 'production-rig-ready';
export const MOTION_SYSTEM = 'rive-state-machine-or-fallback';
export const CHARACTER_RUNTIME = 'css-fallback';
export const RIG_LAYER_CONTRACT = 'body-head-face-arms-props-atmosphere';

export const answerReaction: Record<AnswerKey, { sentiment: string; motion: string; expression: string; copy: string }> = {
  yes: { sentiment: 'positive', motion: 'approve-nod', expression: 'soft-smile', copy: '좋아요, 방향이 꽤 선명해졌어요.' },
  probably: { sentiment: 'soft-positive', motion: 'maybe-tilt', expression: 'maybe-smirk', copy: '아마도군요. 그쪽 후보를 살짝 올려볼게요.' },
  unknown: { sentiment: 'uncertain', motion: 'puzzled-shrug', expression: 'puzzled-open', copy: '모르겠으면 괜찮아요. 애매한 단서는 잠시 보류할게요.' },
  probably_not: { sentiment: 'soft-negative', motion: 'narrow-away', expression: 'skeptical-narrow', copy: '아마 아니군요. 그 후보군은 조금 낮춰볼게요.' },
  no: { sentiment: 'negative', motion: 'prune-swipe', expression: 'decisive-prune', copy: '아니군요. 그 길은 과감히 지워둘게요.' },
};

export const animationNames = [
  'idle-breath',
  'blink-gaze',
  'spoon-point',
  'approve-nod',
  'maybe-tilt',
  'puzzled-shrug',
  'narrow-away',
  'prune-swipe',
  'thinking-scan',
  'confidence-rise',
  'oops-recoil',
  'recovery-reset',
  'lid-reveal',
] as const;

export const expressionNames = [
  'warm-blink',
  'curious-focus',
  'focused-smile',
  'soft-smile',
  'maybe-smirk',
  'puzzled-open',
  'skeptical-narrow',
  'decisive-prune',
  'narrow-thinking',
  'spark-confidence',
  'oops-open',
  'calm-detective',
  'bright-payoff',
] as const;

export const cueLabel: Record<string, string> = {
  idle: '대기 중 · 마음속 메뉴를 고르는 시간',
  ask: '질문 중 · 단서를 비추는 시간',
  answerAccepted: '단서 기록 · 메모장에 잉크가 번지는 시간',
  thinking: '추리 중 · 향과 단서가 도는 시간',
  confident: '감이 왔어요 · 접시를 앞으로 내미는 시간',
  surprised: '놀람 · 성급함을 인정하는 시간',
  recover: '회복 중 · 후보를 다시 정렬하는 시간',
  reveal: '접시 공개 · 한 메뉴를 선언하는 시간',
  exhausted: '단서 부족 · 다시 시작하는 시간',
};

export const cueContract: Record<string, { silhouette: string; expression: string; propMotion: string; stageTone: string }> = {
  idle: { silhouette: 'soft-idle', expression: 'warm-blink', propMotion: 'steam-orbit', stageTone: 'warm-table' },
  ask: { silhouette: 'lean-forward', expression: 'curious-focus', propMotion: 'spoon-point', stageTone: 'question-spotlight' },
  answerAccepted: { silhouette: 'note-capture', expression: 'focused-smile', propMotion: 'ink-check', stageTone: 'clue-captured' },
  thinking: { silhouette: 'analysis-huddle', expression: 'narrow-thinking', propMotion: 'steam-spiral', stageTone: 'suspense' },
  confident: { silhouette: 'reveal-ready', expression: 'spark-confidence', propMotion: 'plate-present', stageTone: 'golden-reveal' },
  surprised: { silhouette: 'recoil-reset', expression: 'oops-open', propMotion: 'spoon-drop', stageTone: 'correction' },
  recover: { silhouette: 'steady-reframe', expression: 'calm-detective', propMotion: 'note-reopen', stageTone: 'recovery-focus' },
  reveal: { silhouette: 'celebration-open', expression: 'bright-payoff', propMotion: 'lid-lift', stageTone: 'celebration' },
};
