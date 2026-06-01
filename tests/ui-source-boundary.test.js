import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('UI source boundaries', () => {
  it('keeps character rendering and motion timing out of the app shell', () => {
    const appSource = readFileSync(new URL('../src/ui/app.ts', import.meta.url), 'utf8');

    expect(appSource).toContain("from './character/CharacterStage.js'");
    expect(appSource).toContain("from './motionScheduler.js'");
    expect(appSource).not.toMatch(/function renderProductionPuppet|function renderLayerShape|function renderOracleHost/);
    expect(appSource).not.toMatch(/setTimeout\([^\n]*(700|1550|520|1040|1760)/);
  });
});
