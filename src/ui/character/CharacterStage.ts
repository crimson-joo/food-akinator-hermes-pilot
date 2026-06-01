import { cueContract, cueLabel } from './characterContract.js';
import { renderCharacterRuntime, type CharacterStageInput } from './characterRuntime.js';

export function renderCharacterStage(input: CharacterStageInput): string {
  const cue = input.cue;
  const contract = cueContract[cue] ?? cueContract.ask!;
  const reducedMotion = input.reducedMotion ? ' data-reduced-motion="true"' : '';
  return `<section class="oracle-theater" aria-label="입맛 탐정 보글 상태" data-testid="character-stage" data-character-cue="${cue}" data-stage-tone="${contract.stageTone}"${reducedMotion}>
    ${renderCharacterRuntime(input)}
    <p data-testid="character-state-label" class="state-label">보글 상태 · ${escapeHtml(cueLabel[cue] ?? '상태 확인 중')}</p>
    <span class="reduced-motion-note" data-reduced-motion-note>움직임을 줄여도 표정·소품·조명으로 상태가 읽혀요.</span>
  </section>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]!);
}
