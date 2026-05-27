import { describe, expect, it } from 'vitest';
import { createSession, answerCurrentQuestion, markGuessWrong, markGuessCorrect, restartSession } from './session';

describe('finite food detective session', () => {
  it('starts with a secret target prompt then advances through answering and reveal states', () => {
    let session = createSession();
    expect(session.phase).toBe('entry');
    session = answerCurrentQuestion(session, 'yes');
    expect(['asking', 'guessAnticipation', 'reveal']).toContain(session.phase);
    expect(session.answered.length).toBe(1);
  });

  it('suppresses a wrong guess and recovers with another question', () => {
    let session = createSession();
    for (let i = 0; i < 12 && session.phase !== 'reveal'; i += 1) {
      session = answerCurrentQuestion(session, 'yes');
    }
    const guessed = session.guess?.food.id;
    expect(guessed).toBeTruthy();
    session = markGuessWrong(session);
    expect(session.phase).toBe('wrongRecovery');
    expect(session.suppressedFoodIds).toContain(guessed);
    session = answerCurrentQuestion(session, 'no');
    expect(session.guess?.food.id).not.toBe(guessed);
  });

  it('supports correct and restart states', () => {
    const correct = markGuessCorrect(createSession());
    expect(correct.phase).toBe('correct');
    expect(restartSession(correct).phase).toBe('entry');
  });
});
