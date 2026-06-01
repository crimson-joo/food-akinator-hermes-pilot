import { describe, expect, it } from 'vitest';
import { characterAssetManifest } from '../src/ui/character/characterAssetManifest.js';
import type { CharacterAssetManifest } from '../src/ui/character/characterAssetManifest.js';
import bogleConceptALottie from '../src/ui/character/assets/bogle-concept-a.lottie.json' with { type: 'json' };
import { renderCharacterRuntime, selectCharacterRuntime } from '../src/ui/character/characterRuntime.js';

describe('character runtime manifest selection', () => {
  it('selects the authored Concept A Lottie runtime only after the repo-local JSON asset is loaded and renderable', () => {
    expect(characterAssetManifest.version).toBe('bogle-character-runtime-v1');
    expect(characterAssetManifest.preferredRuntime).toBe('lottie');
    expect(characterAssetManifest.runtimes.rive?.status).toBe('missing');
    expect(characterAssetManifest.runtimes.lottie?.status).toBe('available');
    expect(characterAssetManifest.runtimes.cssFallback.status).toBe('available');

    const runtime = selectCharacterRuntime(characterAssetManifest);
    expect(runtime.kind).toBe('lottie');
    expect(runtime.status).toBe('ready');
    expect(runtime.attemptedRuntime).toBe('lottie');
    expect(runtime.reason).toBe('lottie-asset-rendered');

    const html = renderCharacterRuntime({ cue: 'thinking', lastAnswer: 'unknown', confidence: 'low', reducedMotion: true }, characterAssetManifest);
    expect(html).toContain('data-character-runtime="lottie"');
    expect(html).toContain('data-runtime-status="ready"');
    expect(html).toContain('data-runtime-attempted="lottie"');
    expect(html).toContain('data-runtime-reason="lottie-asset-rendered"');
    expect(html).toContain('data-lottie-src="src/ui/character/assets/bogle-concept-a.lottie.json"');
    expect(html).toContain('data-lottie-marker="thinking-scan-v2"');
    expect(html).toContain('data-lottie-rendered="true"');
    expect(html).toContain('data-lottie-renderer="inline-lottie-json"');
    expect(html).toContain(`data-lottie-layer-count="${bogleConceptALottie.layers.length}"`);
    for (const layer of bogleConceptALottie.layers) {
      expect(html).toContain(`data-layer-id="${layer.nm}"`);
    }
    expect(html).toContain('data-lottie-layer-contract="concept-a-bogle-rig-v1"');
    expect(html).not.toContain('data-character-runtime="rive"');
    expect(html).not.toContain('data-character-runtime="css-fallback"');
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

  it('renders each persistent Lottie cue with a distinct visible SVG state, not only marker metadata', () => {
    const cues = ['idle', 'ask', 'answerAccepted', 'thinking', 'confident', 'surprised', 'recover', 'reveal'] as const;
    const fingerprints = new Set<string>();

    for (const cue of cues) {
      const html = renderCharacterRuntime({ cue, confidence: cue === 'confident' ? 'high' : 'mid' }, characterAssetManifest);
      expect(html).toContain('data-character-runtime="lottie"');
      expect(html).toContain('data-runtime-status="ready"');
      expect(html).toContain(`data-lottie-state-cue="${cue}"`);
      const stateFingerprint = html.match(/data-lottie-state-fingerprint="([^"]+)"/)?.[1];
      expect(stateFingerprint, cue).toBeTruthy();
      fingerprints.add(stateFingerprint!);
    }

    expect(fingerprints.size).toBe(cues.length);
  });

  it('does not fake-ready when any persistent Lottie cue is missing a marker mapping', () => {
    const manifest = {
      ...characterAssetManifest,
      preferredRuntime: 'lottie' as const,
      runtimes: {
        ...characterAssetManifest.runtimes,
        rive: { ...characterAssetManifest.runtimes.rive!, status: 'missing' as const },
        lottie: {
          ...characterAssetManifest.runtimes.lottie!,
          markerByCue: {
            ...characterAssetManifest.runtimes.lottie!.markerByCue,
            recover: undefined,
          },
        },
      },
    };

    const runtime = selectCharacterRuntime(manifest);
    const html = renderCharacterRuntime({ cue: 'recover' }, manifest);

    expect(runtime.kind).toBe('css-fallback');
    expect(runtime.status).toBe('failed');
    expect(runtime.attemptedRuntime).toBe('lottie');
    expect(runtime.reason).toBe('lottie-manifest-malformed');
    expect(html).toContain('data-character-runtime="css-fallback"');
    expect(html).not.toContain('data-runtime-status="ready"');
  });

  it('does not fake-ready when persistent Lottie cue markers are duplicated', () => {
    const manifest = {
      ...characterAssetManifest,
      preferredRuntime: 'lottie' as const,
      runtimes: {
        ...characterAssetManifest.runtimes,
        rive: { ...characterAssetManifest.runtimes.rive!, status: 'missing' as const },
        lottie: {
          ...characterAssetManifest.runtimes.lottie!,
          markerByCue: {
            ...characterAssetManifest.runtimes.lottie!.markerByCue,
            ask: characterAssetManifest.runtimes.lottie!.markerByCue!.idle,
          },
        },
      },
    };

    const runtime = selectCharacterRuntime(manifest);
    const html = renderCharacterRuntime({ cue: 'ask' }, manifest);

    expect(runtime.kind).toBe('css-fallback');
    expect(runtime.status).toBe('failed');
    expect(runtime.attemptedRuntime).toBe('lottie');
    expect(runtime.reason).toBe('lottie-manifest-malformed');
    expect(html).not.toContain('data-character-runtime="lottie"');
    expect(html).not.toContain('data-runtime-status="ready"');
  });

  it('does not fake-ready when a persistent Lottie marker has a malformed segment window', () => {
    const malformedMarkers = bogleConceptALottie.markers.map((marker) => marker.cm === characterAssetManifest.runtimes.lottie!.markerByCue!.recover
      ? { ...marker, tm: Number.NaN, dr: 0 }
      : marker);
    const manifest = {
      ...characterAssetManifest,
      preferredRuntime: 'lottie' as const,
      runtimes: {
        ...characterAssetManifest.runtimes,
        rive: { ...characterAssetManifest.runtimes.rive!, status: 'missing' as const },
        lottie: {
          ...characterAssetManifest.runtimes.lottie!,
          asset: { ...bogleConceptALottie, markers: malformedMarkers },
        },
      },
    } as unknown as CharacterAssetManifest;

    const runtime = selectCharacterRuntime(manifest);
    const html = renderCharacterRuntime({ cue: 'recover' }, manifest);

    expect(runtime.kind).toBe('css-fallback');
    expect(runtime.status).toBe('failed');
    expect(runtime.attemptedRuntime).toBe('lottie');
    expect(runtime.reason).toBe('lottie-manifest-malformed');
    expect(html).not.toContain('data-character-runtime="lottie"');
    expect(html).not.toContain('data-runtime-status="ready"');
  });

  it('does not fake-ready when the Lottie asset contains duplicate marker names', () => {
    const duplicateMarkers = [
      ...bogleConceptALottie.markers,
      { ...bogleConceptALottie.markers[0] },
    ];
    const manifest = {
      ...characterAssetManifest,
      preferredRuntime: 'lottie' as const,
      runtimes: {
        ...characterAssetManifest.runtimes,
        rive: { ...characterAssetManifest.runtimes.rive!, status: 'missing' as const },
        lottie: {
          ...characterAssetManifest.runtimes.lottie!,
          asset: { ...bogleConceptALottie, markers: duplicateMarkers },
        },
      },
    } as unknown as CharacterAssetManifest;

    const runtime = selectCharacterRuntime(manifest);
    const html = renderCharacterRuntime({ cue: 'recover' }, manifest);

    expect(runtime.kind).toBe('css-fallback');
    expect(runtime.status).toBe('failed');
    expect(runtime.attemptedRuntime).toBe('lottie');
    expect(runtime.reason).toBe('lottie-manifest-malformed');
    expect(html).not.toContain('data-character-runtime="lottie"');
    expect(html).not.toContain('data-runtime-status="ready"');
  });

  it('does not fake-ready an available Lottie manifest when the JSON contract is malformed', () => {
    const manifest = {
      ...characterAssetManifest,
      preferredRuntime: 'lottie' as const,
      runtimes: {
        ...characterAssetManifest.runtimes,
        rive: { ...characterAssetManifest.runtimes.rive!, status: 'missing' as const },
        lottie: {
          src: 'src/ui/character/assets/bogle-concept-a.lottie.json',
          markerByCue: { idle: 'idle-life-v2' },
          requiredLayers: ['head_base', 'spoon_bowl'],
          layerContract: 'concept-a-bogle-rig-v1',
          asset: { v: '5.12.2', fr: 24, ip: 0, op: 10, w: 320, h: 360, markers: [], layers: [] },
          status: 'available' as const,
        },
      },
    };

    const runtime = selectCharacterRuntime(manifest);
    const html = renderCharacterRuntime({ cue: 'reveal' }, manifest);

    expect(runtime.kind).toBe('css-fallback');
    expect(runtime.status).toBe('failed');
    expect(runtime.attemptedRuntime).toBe('lottie');
    expect(runtime.reason).toBe('lottie-manifest-malformed');
    expect(html).toContain('data-character-runtime="css-fallback"');
    expect(html).toContain('data-runtime-status="failed"');
    expect(html).not.toContain('data-character-runtime="lottie"');
    expect(html).not.toContain('data-runtime-status="ready"');
  });


  it('fails closed instead of throwing when available Lottie JSON has malformed primitive types', () => {
    const manifest = {
      ...characterAssetManifest,
      preferredRuntime: 'lottie' as const,
      runtimes: {
        ...characterAssetManifest.runtimes,
        rive: { ...characterAssetManifest.runtimes.rive!, status: 'missing' as const },
        lottie: {
          src: 'src/ui/character/assets/bogle-concept-a.lottie.json',
          markerByCue: { idle: 'idle-life-v2', ask: 'ask-spoon-point-v2', thinking: 'thinking-scan-v2', reveal: 'lid-reveal-payoff-v2', recover: 'reframe-reset-v2', surprised: 'oops-recoil-v2' },
          requiredLayers: ['head_base', 'spoon_bowl', 'note_pages'],
          layerContract: 'concept-a-bogle-rig-v1',
          asset: { v: null, fr: Number.NaN, ip: 0, op: 10, w: 320, h: 360, markers: null, layers: null },
          status: 'available' as const,
        },
      },
    } as unknown as CharacterAssetManifest;

    expect(() => selectCharacterRuntime(manifest)).not.toThrow();
    const runtime = selectCharacterRuntime(manifest);
    expect(runtime.kind).toBe('css-fallback');
    expect(runtime.status).toBe('failed');
    expect(runtime.reason).toBe('lottie-manifest-malformed');
  });

  it('does not report Lottie ready when the renderer boundary cannot render the loaded asset', () => {
    const runtime = selectCharacterRuntime(characterAssetManifest, { lottieRenderer: { canRender: () => false, render: () => '' } });
    const html = renderCharacterRuntime({ cue: 'ask' }, characterAssetManifest, { lottieRenderer: { canRender: () => false, render: () => '' } });

    expect(runtime.kind).toBe('css-fallback');
    expect(runtime.status).toBe('failed');
    expect(runtime.attemptedRuntime).toBe('lottie');
    expect(runtime.reason).toBe('lottie-render-failed');
    expect(html).toContain('data-character-runtime="css-fallback"');
    expect(html).toContain('data-runtime-status="failed"');
    expect(html).not.toContain('data-character-runtime="lottie"');
    expect(html).not.toContain('data-runtime-status="ready"');
  });

  it('fails closed instead of throwing when the Lottie renderer boundary throws', () => {
    const lottieRenderer = {
      canRender: () => true,
      render: () => {
        throw new Error('renderer unavailable');
      },
    };

    expect(() => selectCharacterRuntime(characterAssetManifest, { lottieRenderer })).not.toThrow();
    const runtime = selectCharacterRuntime(characterAssetManifest, { lottieRenderer });
    const html = renderCharacterRuntime({ cue: 'ask' }, characterAssetManifest, { lottieRenderer });

    expect(runtime.kind).toBe('css-fallback');
    expect(runtime.status).toBe('failed');
    expect(runtime.attemptedRuntime).toBe('lottie');
    expect(runtime.reason).toBe('lottie-render-failed');
    expect(html).toContain('data-character-runtime="css-fallback"');
    expect(html).not.toContain('data-runtime-status="ready"');
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
