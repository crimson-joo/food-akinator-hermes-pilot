import { describe, expect, it } from 'vitest';
import { CHARACTER_STATES, stateForSession } from './characterStateMap';
import { createSession, answerCurrentQuestion } from '../game/session';

describe('original character state pipeline', () => {
  it('has at least 7 non-genie asset-backed states', () => {
    expect(CHARACTER_STATES.length).toBeGreaterThanOrEqual(7);
    for (const state of CHARACTER_STATES) {
      expect(state.asset).toMatch(/^characters\/food-detective-/);
      expect(`${state.name} ${state.asset}`).not.toMatch(/genie|lamp|turban|blue/i);
    }
  });

  it('maps gameplay phases to visible silhouette states', () => {
    const entry = createSession();
    const asking = answerCurrentQuestion(entry, 'unknown');
    expect(stateForSession(entry).silhouette).toBe('notebook-invite');
    expect(stateForSession(asking).silhouette).toMatch(/question|deduction|reveal/);
  });
});
