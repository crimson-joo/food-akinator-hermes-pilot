import { describe, expect, it } from 'vitest';
import { renderCharacterStage } from '../src/ui/character/CharacterStage.js';

describe('CharacterStage runtime boundary', () => {
  it('renders the authored Lottie character stage with a truthful ready runtime and no dialogue shell', () => {
    const html = renderCharacterStage({ cue: 'thinking', lastAnswer: 'unknown' });

    expect(html).toContain('data-testid="character-stage"');
    expect(html).toContain('data-character-cue="thinking"');
    expect(html).toContain('data-character-runtime="lottie"');
    expect(html).toContain('data-runtime-status="ready"');
    expect(html).toContain('data-runtime-attempted="lottie"');
    expect(html).toContain('data-runtime-reason="lottie-asset-rendered"');
    expect(html).toContain('data-lottie-src="src/ui/character/assets/bogle-concept-a.lottie.json"');
    expect(html).toContain('data-lottie-marker="thinking-scan-v2"');
    expect(html).toContain('data-lottie-layer-contract="concept-a-bogle-rig-v1"');
    expect(html).toContain('data-lottie-layers=');
    expect(html).toContain('보글 상태 · 추리 중 · 향과 단서가 도는 시간');
    expect(html).not.toContain('class="dialogue-card"');
    expect(html).not.toContain('data-answer-key=');
    expect(html).not.toContain('class="question-card"');
  });
});
