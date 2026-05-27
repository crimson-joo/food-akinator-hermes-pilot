import { stateForSession } from './characterStateMap';
import type { Session } from '../game/session';
import type { CSSProperties } from 'react';

export function CharacterController({ session }: { session: Session }) {
  const state = stateForSession(session);
  return (
    <section
      className="character-stage"
      data-testid="character-stage"
      data-acting-pose={state.key}
      data-silhouette={state.silhouette}
      style={{ '--mood': state.moodColor } as CSSProperties}
    >
      <div className="aura" aria-hidden="true" />
      <div className={`character-prop ${state.prop}`} data-testid="character-prop" aria-hidden="true">
        <span />
      </div>
      <img src={state.asset} alt={`아무거나 탐정단 캐릭터 - ${state.name}`} />
      <span className="stage-label">{state.stageLabel}</span>
      <p className="character-line">{state.line}</p>
    </section>
  );
}
