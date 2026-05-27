import type { Session } from '../game/session';

export type CharacterState = { key: string; name: string; asset: string; silhouette: string; line: string };
export const CHARACTER_STATES: CharacterState[] = [
  { key: 'entry', name: '초대하는 미식 탐정', asset: 'characters/food-detective-entry.svg', silhouette: 'notebook-invite', line: '정답은 마음속에만 숨겨두세요.' },
  { key: 'asking', name: '질문하는 미식 탐정', asset: 'characters/food-detective-asking.svg', silhouette: 'question-spoon', line: '단서 하나만 더 볼게요.' },
  { key: 'thinking', name: '추리 중인 미식 탐정', asset: 'characters/food-detective-thinking.svg', silhouette: 'deduction-board', line: '흠… 맛의 발자국이 보입니다.' },
  { key: 'confidence', name: '확신이 오르는 미식 탐정', asset: 'characters/food-detective-confidence.svg', silhouette: 'deduction-spark', line: '이제 꽤 좁혀졌어요.' },
  { key: 'reveal', name: '공개 직전 미식 탐정', asset: 'characters/food-detective-reveal.svg', silhouette: 'reveal-cloche', line: '제 추리는 이 메뉴입니다.' },
  { key: 'correct', name: '정답을 맞힌 미식 탐정', asset: 'characters/food-detective-correct.svg', silhouette: 'victory-spoon', line: '역시 단서는 배신하지 않죠!' },
  { key: 'wrong', name: '다시 추리하는 미식 탐정', asset: 'characters/food-detective-wrong.svg', silhouette: 'recovery-notebook', line: '좋아요. 틀린 후보는 지우고 다시 갑니다.' },
];

export function stateForSession(session: Pick<Session, 'phase' | 'answered'>): CharacterState {
  if (session.phase === 'correct') return CHARACTER_STATES[5];
  if (session.phase === 'wrongRecovery') return CHARACTER_STATES[6];
  if (session.phase === 'reveal' || session.phase === 'guessAnticipation') return CHARACTER_STATES[4];
  if (session.phase === 'thinking' || session.answered.length >= 4) return CHARACTER_STATES[2];
  if (session.answered.length > 0) return CHARACTER_STATES[3];
  if (session.phase === 'asking') return CHARACTER_STATES[1];
  return CHARACTER_STATES[0];
}
