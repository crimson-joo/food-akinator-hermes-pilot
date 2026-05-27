import { stateForSession } from './characterStateMap';
import type { Session } from '../game/session';

export function CharacterController({ session }: { session: Session }) {
  const state = stateForSession(session);
  return (
    <section className="character-stage" data-testid="character-stage" data-acting-pose={state.key} data-silhouette={state.silhouette}>
      <div className="aura" aria-hidden="true" />
      <img src={state.asset} alt={`아무거나 탐정단 캐릭터 - ${state.name}`} />
      <p className="character-line">{state.line}</p>
    </section>
  );
}
