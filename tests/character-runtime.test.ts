import { describe, expect, it } from 'vitest';
import { characterAssetManifest } from '../src/ui/character/characterAssetManifest.js';
import { renderCharacterRuntime, selectCharacterRuntime } from '../src/ui/character/characterRuntime.js';

describe('character runtime manifest selection', () => {
  it('keeps Rive preferred but selects css fallback while authored assets are missing', () => {
    expect(characterAssetManifest.version).toBe('bogle-character-runtime-v1');
    expect(characterAssetManifest.preferredRuntime).toBe('rive');
    expect(characterAssetManifest.runtimes.rive?.status).toBe('missing');
    expect(characterAssetManifest.runtimes.lottie?.status).toBe('missing');
    expect(characterAssetManifest.runtimes.cssFallback.status).toBe('available');

    const runtime = selectCharacterRuntime(characterAssetManifest);
    expect(runtime.kind).toBe('css-fallback');

    const html = renderCharacterRuntime({ cue: 'ask', reducedMotion: true }, characterAssetManifest);
    expect(html).toContain('data-character-runtime="css-fallback"');
    expect(html).toContain('data-character-cue="ask"');
    expect(html).toContain('data-reduced-motion="true"');
    expect(html).not.toContain('data-character-runtime="rive"');
    expect(html).not.toContain('broken-rive');
  });

  it('does not claim available Rive/Lottie runtimes until real adapters exist', () => {
    const manifest = {
      ...characterAssetManifest,
      runtimes: {
        ...characterAssetManifest.runtimes,
        rive: { ...characterAssetManifest.runtimes.rive!, status: 'available' as const },
      },
    };

    const runtime = selectCharacterRuntime(manifest);
    const html = renderCharacterRuntime({ cue: 'reveal' }, manifest);

    expect(runtime.kind).toBe('css-fallback');
    expect(runtime.supports({ cue: 'reveal' })).toBe(true);
    expect(html).toContain('data-character-runtime="css-fallback"');
    expect(html).not.toContain('data-character-runtime="rive"');
  });
});
