import type { Session } from '../game/session';
import entryAsset from '../assets/characters/food-detective-entry.svg';
import askingAsset from '../assets/characters/food-detective-asking.svg';
import thinkingAsset from '../assets/characters/food-detective-thinking.svg';
import confidenceAsset from '../assets/characters/food-detective-confidence.svg';
import revealAsset from '../assets/characters/food-detective-reveal.svg';
import correctAsset from '../assets/characters/food-detective-correct.svg';
import wrongAsset from '../assets/characters/food-detective-wrong.svg';

export type CharacterState = {
  key: string;
  name: string;
  asset: string;
  silhouette: string;
  line: string;
  prop: string;
  moodColor: string;
  stageLabel: string;
};

export const CHARACTER_STATES: CharacterState[] = [
  { key: 'entry', name: '초대하는 미식 탐정', asset: entryAsset, silhouette: 'notebook-invite', line: '정답은 마음속에만 숨겨두세요.', prop: 'case-file', moodColor: '#fbbd41', stageLabel: 'CASE OPEN' },
  { key: 'asking', name: '질문하는 미식 탐정', asset: askingAsset, silhouette: 'question-spoon', line: '단서 하나만 더 볼게요.', prop: 'magnifier-spoon', moodColor: '#3bd3fd', stageLabel: 'CLUE SCAN' },
  { key: 'thinking', name: '추리 중인 미식 탐정', asset: thinkingAsset, silhouette: 'deduction-board', line: '흠… 맛의 발자국이 보입니다.', prop: 'evidence-board', moodColor: '#c1b0ff', stageLabel: 'DEDUCTION' },
  { key: 'confidence', name: '확신이 오르는 미식 탐정', asset: confidenceAsset, silhouette: 'deduction-spark', line: '이제 꽤 좁혀졌어요.', prop: 'spark-card', moodColor: '#84e7a5', stageLabel: 'CONFIDENCE' },
  { key: 'reveal', name: '공개 직전 미식 탐정', asset: revealAsset, silhouette: 'reveal-cloche', line: '제 추리는 이 메뉴입니다.', prop: 'silver-cloche', moodColor: '#fc7981', stageLabel: 'REVEAL' },
  { key: 'correct', name: '정답을 맞힌 미식 탐정', asset: correctAsset, silhouette: 'victory-spoon', line: '역시 단서는 배신하지 않죠!', prop: 'gold-spoon', moodColor: '#078a52', stageLabel: 'SOLVED' },
  { key: 'wrong', name: '다시 추리하는 미식 탐정', asset: wrongAsset, silhouette: 'recovery-notebook', line: '좋아요. 틀린 후보는 지우고 다시 갑니다.', prop: 'red-string', moodColor: '#43089f', stageLabel: 'REOPEN' },
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
