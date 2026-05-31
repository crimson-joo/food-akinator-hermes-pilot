import { describe, expect, it } from 'vitest';
import { renderCharacterStage } from '../src/ui/character/CharacterStage.js';

describe('CharacterStage runtime boundary', () => {
  it('renders the css fallback character stage with existing production rig hooks and no dialogue shell', () => {
    const html = renderCharacterStage({ cue: 'thinking', lastAnswer: 'unknown' });

    expect(html).toContain('data-testid="character-stage"');
    expect(html).toContain('data-character-cue="thinking"');
    expect(html).toContain('data-character-runtime="css-fallback"');
    expect(html).toContain('data-current-expression="puzzled-open"');
    expect(html).toContain('data-current-prop-motion="puzzled-shrug"');
    expect(html).toContain('data-layer-id="head_base"');
    expect(html).toContain('data-motion-clip="thinking-scan-v2"');
    expect(html).toContain('보글 상태 · 추리 중 · 향과 단서가 도는 시간');
    expect(html).not.toContain('class="dialogue-card"');
    expect(html).not.toContain('data-answer-key=');
    expect(html).not.toContain('class="question-card"');
  });
});
