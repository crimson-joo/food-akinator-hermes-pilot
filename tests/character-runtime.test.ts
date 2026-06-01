import { describe, expect, it } from 'vitest';
import { characterAssetManifest } from '../src/ui/character/characterAssetManifest.js';
import { renderCharacterRuntime, selectCharacterRuntime } from '../src/ui/character/characterRuntime.js';

describe('character runtime manifest selection', () => {
  it('keeps Rive preferred but exposes explicit fallback status while authored assets are missing', () => {
    expect(characterAssetManifest.version).toBe('bogle-character-runtime-v1');
    expect(characterAssetManifest.preferredRuntime).toBe('rive');
    expect(characterAssetManifest.runtimes.rive?.status).toBe('missing');
    expect(characterAssetManifest.runtimes.lottie?.status).toBe('missing');
    expect(characterAssetManifest.runtimes.cssFallback.status).toBe('available');

    const runtime = selectCharacterRuntime(characterAssetManifest);
    expect(runtime.kind).toBe('css-fallback');
    expect(runtime.status).toBe('fallback');
    expect(runtime.attemptedRuntime).toBe('rive');
    expect(runtime.reason).toBe('rive-asset-missing');

    const html = renderCharacterRuntime({ cue: 'ask', reducedMotion: true }, characterAssetManifest);
    expect(html).toContain('data-character-runtime="css-fallback"');
    expect(html).toContain('data-runtime-status="fallback"');
    expect(html).toContain('data-runtime-attempted="rive"');
    expect(html).toContain('data-runtime-reason="rive-asset-missing"');
    expect(html).toContain('data-character-cue="ask"');
    expect(html).toContain('data-reduced-motion="true"');
    expect(html).not.toContain('data-character-runtime="rive"');
    expect(html).not.toContain('broken-rive');
  });

  it('fails closed when an available Rive manifest points at an absent authored asset', () => {
    const manifest = {
      ...characterAssetManifest,
      runtimes: {
        ...characterAssetManifest.runtimes,
        rive: {
          src: '/assets/character/bogle-runtime-v1.riv',
          stateMachineName: 'BogleRuntime',
          inputs: ['cue', 'answerReaction', 'confidence', 'reducedMotion'] as const,
          status: 'available' as const,
        },
      },
    };

    const runtime = selectCharacterRuntime(manifest);
    const html = renderCharacterRuntime({ cue: 'thinking', confidence: 'high' }, manifest);

    expect(runtime.kind).toBe('css-fallback');
    expect(runtime.status).toBe('failed');
    expect(runtime.attemptedRuntime).toBe('rive');
    expect(runtime.reason).toBe('rive-asset-load-failed');
    expect(html).toContain('data-character-runtime="css-fallback"');
    expect(html).toContain('data-runtime-status="failed"');
    expect(html).toContain('data-runtime-attempted="rive"');
    expect(html).toContain('data-runtime-reason="rive-asset-load-failed"');
    expect(html).not.toContain('data-runtime-status="ready"');
    expect(html).not.toContain('data-character-runtime="rive"');
  });

  it('selects the Rive adapter only when a local .riv asset, required inputs, and loader probe succeed', () => {
    const manifest = {
      ...characterAssetManifest,
      runtimes: {
        ...characterAssetManifest.runtimes,
        rive: {
          src: '/assets/character/bogle-runtime-v1.riv',
          stateMachineName: 'BogleRuntime',
          inputs: ['cue', 'answerReaction', 'confidence', 'reducedMotion'] as const,
          status: 'available' as const,
        },
      },
    };

    const runtime = selectCharacterRuntime(manifest, { assetLoader: { canLoad: () => true } });
    const html = renderCharacterRuntime(
      { cue: 'thinking', lastAnswer: 'no', confidence: 'high', reducedMotion: true },
      manifest,
      { assetLoader: { canLoad: () => true } },
    );

    expect(runtime.kind).toBe('rive');
    expect(runtime.status).toBe('ready');
    expect(html).toContain('data-character-runtime="rive"');
    expect(html).toContain('data-runtime-status="ready"');
    expect(html).toContain('data-rive-src="/assets/character/bogle-runtime-v1.riv"');
    expect(html).toContain('data-rive-state-machine="BogleRuntime"');
    expect(html).toContain('data-rive-input-cue="thinking"');
    expect(html).toContain('data-rive-input-answer-reaction="no"');
    expect(html).toContain('data-rive-input-confidence="high"');
    expect(html).toContain('data-rive-input-reduced-motion="true"');
  });

  it('fails closed to playable css fallback when an available Rive manifest is malformed', () => {
    const manifest = {
      ...characterAssetManifest,
      runtimes: {
        ...characterAssetManifest.runtimes,
        rive: {
          src: '/assets/character/bogle-runtime-v1.png',
          stateMachineName: '',
          inputs: ['cue'] as const,
          status: 'available' as const,
        },
      },
    };

    const runtime = selectCharacterRuntime(manifest);
    const html = renderCharacterRuntime({ cue: 'reveal' }, manifest);

    expect(runtime.kind).toBe('css-fallback');
    expect(runtime.status).toBe('failed');
    expect(runtime.attemptedRuntime).toBe('rive');
    expect(runtime.reason).toBe('rive-manifest-malformed');
    expect(runtime.supports({ cue: 'reveal' })).toBe(true);
    expect(html).toContain('data-character-runtime="css-fallback"');
    expect(html).toContain('data-runtime-status="failed"');
    expect(html).toContain('data-runtime-attempted="rive"');
    expect(html).toContain('data-runtime-reason="rive-manifest-malformed"');
    expect(html).not.toContain('data-character-runtime="rive"');
  });

  it('fails closed when an available Lottie manifest clip cannot be loaded', () => {
    const manifest = {
      ...characterAssetManifest,
      runtimes: {
        ...characterAssetManifest.runtimes,
        rive: { ...characterAssetManifest.runtimes.rive!, status: 'missing' as const },
        lottie: {
          clips: {
            idle: '/assets/character/lottie/idle.json',
            ask: '/assets/character/lottie/ask.json',
            thinking: '/assets/character/lottie/thinking.json',
          },
          status: 'available' as const,
        },
      },
    };

    const runtime = selectCharacterRuntime(manifest);
    const html = renderCharacterRuntime({ cue: 'ask', lastAnswer: 'probably' }, manifest);

    expect(runtime.kind).toBe('css-fallback');
    expect(runtime.status).toBe('failed');
    expect(runtime.attemptedRuntime).toBe('lottie');
    expect(runtime.reason).toBe('lottie-asset-load-failed');
    expect(html).toContain('data-character-runtime="css-fallback"');
    expect(html).toContain('data-runtime-status="failed"');
    expect(html).toContain('data-runtime-attempted="lottie"');
    expect(html).toContain('data-runtime-reason="lottie-asset-load-failed"');
    expect(html).not.toContain('data-character-runtime="lottie"');
  });

  it('can choose a loadable manifest-valid Lottie adapter as the secondary authored runtime', () => {
    const manifest = {
      ...characterAssetManifest,
      runtimes: {
        ...characterAssetManifest.runtimes,
        rive: { ...characterAssetManifest.runtimes.rive!, status: 'missing' as const },
        lottie: {
          clips: {
            idle: '/assets/character/lottie/idle.json',
            ask: '/assets/character/lottie/ask.json',
            thinking: '/assets/character/lottie/thinking.json',
          },
          status: 'available' as const,
        },
      },
    };

    const runtime = selectCharacterRuntime(manifest, { assetLoader: { canLoad: () => true } });
    const html = renderCharacterRuntime(
      { cue: 'ask', lastAnswer: 'probably' },
      manifest,
      { assetLoader: { canLoad: () => true } },
    );

    expect(runtime.kind).toBe('lottie');
    expect(runtime.status).toBe('ready');
    expect(html).toContain('data-character-runtime="lottie"');
    expect(html).toContain('data-runtime-status="ready"');
    expect(html).toContain('data-lottie-clip-src="/assets/character/lottie/ask.json"');
    expect(html).toContain('data-lottie-fallback-clip="idle"');
  });
});
