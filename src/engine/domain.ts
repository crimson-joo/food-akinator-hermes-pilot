export const ANSWER_VALUES = {
  yes: 1,
  probably: 0.5,
  unknown: 0,
  probably_not: -0.5,
  no: -1,
} as const;

export type AnswerKey = keyof typeof ANSWER_VALUES;
export type AnswerValue = (typeof ANSWER_VALUES)[AnswerKey];

export const QUESTION_ROLES = [
  'broad_split',
  'family_lock',
  'sibling_elimination',
  'signature_discriminator',
  'false_path_guardrail',
  'recovery_disambiguation',
  'reveal_check',
] as const;

export type QuestionRole = (typeof QUESTION_ROLES)[number];

export const QUESTION_AXES = [
  'taste',
  'ingredient',
  'form',
  'temperature',
  'cuisine',
  'occasion',
  'cooking',
  'texture',
  'context',
  'visual',
] as const;

export type QuestionAxis = (typeof QUESTION_AXES)[number];
export type Status = 'active' | 'draft' | 'disabled';
export type QuestionId = string;

export type Question = {
  id: string;
  textKo: string;
  axis: QuestionAxis;
  role: QuestionRole;
  clarity: 0 | 1 | 2 | 3;
  revealRisk: 0 | 1 | 2 | 3;
  cost: number;
  animationCue?: string;
  status: Status;
};

export type Candidate = {
  id: string;
  nameKo: string;
  aliases: string[];
  category: string;
  tags: string[];
  attributes: Record<QuestionId, number>;
  prior?: number;
  reveal: {
    oneLiner: string;
    reasonSeeds: string[];
  };
  status: Status;
};

type ValidationResult =
  | { success: true }
  | { success: false; errors: string[] };

const STATUS_VALUES: Status[] = ['active', 'draft', 'disabled'];
const LEVELS = [0, 1, 2, 3];

export function validateQuestion(question: unknown): ValidationResult {
  const errors: string[] = [];
  const record = asRecord(question);

  if (!record) {
    return { success: false, errors: ['question must be an object'] };
  }

  requireString(record, 'id', errors);
  requireString(record, 'textKo', errors);
  if (!QUESTION_AXES.includes(record.axis as QuestionAxis)) {
    errors.push('axis must be a known question axis');
  }
  if (!QUESTION_ROLES.includes(record.role as QuestionRole)) {
    errors.push('role must be a known question role');
  }
  if (!LEVELS.includes(record.clarity as number)) {
    errors.push('clarity must be 0, 1, 2, or 3');
  }
  if (!LEVELS.includes(record.revealRisk as number)) {
    errors.push('revealRisk must be 0, 1, 2, or 3');
  }
  if (typeof record.cost !== 'number' || !Number.isFinite(record.cost)) {
    errors.push('cost must be a finite number');
  }
  if (!STATUS_VALUES.includes(record.status as Status)) {
    errors.push('status must be active, draft, or disabled');
  }

  return errors.length === 0 ? { success: true } : { success: false, errors };
}

export function validateCandidate(candidate: unknown): ValidationResult {
  const errors: string[] = [];
  const record = asRecord(candidate);

  if (!record) {
    return { success: false, errors: ['candidate must be an object'] };
  }

  requireString(record, 'id', errors);
  requireString(record, 'nameKo', errors);
  requireString(record, 'category', errors);
  requireStringArray(record, 'aliases', errors);
  requireStringArray(record, 'tags', errors);
  if (!STATUS_VALUES.includes(record.status as Status)) {
    errors.push('status must be active, draft, or disabled');
  }
  if (record.prior !== undefined && (typeof record.prior !== 'number' || !Number.isFinite(record.prior) || record.prior < 0.7 || record.prior > 1.3)) {
    errors.push('prior must be between 0.7 and 1.3 when present');
  }

  const attributes = asRecord(record.attributes);
  if (!attributes) {
    errors.push('attributes must be an object');
  } else {
    for (const [questionId, value] of Object.entries(attributes)) {
      if (questionId.length === 0) {
        errors.push('attribute question id must not be empty');
      }
      if (typeof value !== 'number' || !Number.isFinite(value) || value < -1 || value > 1) {
        errors.push(`attribute ${questionId} must be between -1 and 1`);
      }
    }
  }

  const reveal = asRecord(record.reveal);
  if (!reveal) {
    errors.push('reveal must be an object');
  } else {
    requireString(reveal, 'oneLiner', errors);
    requireStringArray(reveal, 'reasonSeeds', errors);
    if (Array.isArray(reveal.reasonSeeds) && reveal.reasonSeeds.length === 0) {
      errors.push('reveal.reasonSeeds must include at least one reason');
    }
  }

  return errors.length === 0 ? { success: true } : { success: false, errors };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function requireString(record: Record<string, unknown>, key: string, errors: string[]): void {
  if (typeof record[key] !== 'string' || record[key].length === 0) {
    errors.push(`${key} must be a non-empty string`);
  }
}

function requireStringArray(record: Record<string, unknown>, key: string, errors: string[]): void {
  if (!Array.isArray(record[key]) || !(record[key] as unknown[]).every((item) => typeof item === 'string')) {
    errors.push(`${key} must be a string array`);
  }
}
