import { ANSWER_VALUES, type AnswerKey, type Candidate } from './domain.js';

export type AnsweredQuestion = {
  questionId: string;
  answer: AnswerKey;
};

export type CandidateScore = {
  candidate: Candidate;
  score: number;
};

export function scoreCandidates(
  candidates: Candidate[],
  answers: AnsweredQuestion[],
): CandidateScore[] {
  return candidates
    .map((candidate, index) => ({
      candidate,
      score: scoreCandidate(candidate, answers),
      index,
    }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ candidate, score }) => ({ candidate, score }));
}

function scoreCandidate(candidate: Candidate, answers: AnsweredQuestion[]): number {
  const prior = candidate.prior ?? 1;
  let score = Math.log(prior);

  for (const answered of answers) {
    const expected = candidate.attributes[answered.questionId];
    if (expected === undefined) {
      continue;
    }

    const answerValue = ANSWER_VALUES[answered.answer];
    const confidence = Math.abs(answerValue);
    score += answerValue * expected * confidence;
  }

  return score;
}
