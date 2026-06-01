import { expect, test, type Page } from '@playwright/test';

declare const process: { env: Record<string, string | undefined> };

const forbiddenUserVisibleMarkers = [/score/i, /probability/i, /top1/i, /top3/i, /attribute/i, /clue:/i, /q-[a-z-]+/i];
const appUrl = process.env.BASE_URL ?? '/';

async function expectNoConsoleErrors(page: Page): Promise<void> {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.waitForTimeout(100);
  expect(errors).toEqual([]);
}

async function expectNoForbiddenVisibleMarkers(page: Page): Promise<void> {
  const visibleText = await page.locator('body').innerText();
  for (const marker of forbiddenUserVisibleMarkers) {
    expect(visibleText).not.toMatch(marker);
  }
}

async function answer(page: Page, answerKey: string): Promise<void> {
  await page.locator(`[data-answer-key="${answerKey}"]`).click();
  await expect(page.locator('.app-shell')).toHaveAttribute('data-ui-state', 'answerAccepted');
  await expectNoForbiddenVisibleMarkers(page);

  await page.waitForFunction(() => {
    const state = document.querySelector('.app-shell')?.getAttribute('data-ui-state');
    return Boolean(state) && state !== 'answerAccepted';
  });

  if ((await page.locator('.app-shell').getAttribute('data-ui-state')) === 'thinking') {
    await expect(page.locator('.app-shell')).toHaveAttribute('data-character-cue', 'thinking');
    await expectNoForbiddenVisibleMarkers(page);
    await page.waitForFunction(() => {
      const state = document.querySelector('.app-shell')?.getAttribute('data-ui-state');
      return state !== 'thinking';
    });
  }

  await expectNoForbiddenVisibleMarkers(page);
}

async function answerUntilGuess(page: Page, sequence: string[]): Promise<void> {
  for (const key of sequence) {
    const state = await page.locator('.app-shell').getAttribute('data-ui-state');
    if (state === 'guessing' || state === 'revealed' || state === 'exhausted') return;
    await answer(page, key);
  }
}

test('minimal scaffold supports entry → adaptive answers → wrong recovery → reveal without console errors', async ({ page }) => {
  await page.goto(appUrl);
  await expect(page.locator('.app-shell')).toHaveAttribute('data-ui-state', 'entry');
  await expectNoForbiddenVisibleMarkers(page);
  await expect(page.locator('[data-testid="character-stage"]')).toHaveAttribute('data-character-cue', 'idle');
  await expect(page.locator('[data-testid="character-stage"] [data-character-runtime]')).toHaveAttribute('data-character-runtime', 'lottie');
  await expect(page.locator('[data-testid="character-stage"] [data-character-runtime]')).toHaveAttribute('data-runtime-status', 'ready');
  await expect(page.locator('[data-testid="character-stage"] [data-character-runtime]')).toHaveAttribute('data-runtime-attempted', 'lottie');
  await expect(page.locator('[data-testid="character-stage"] [data-character-runtime]')).toHaveAttribute('data-lottie-rendered', 'true');
  await expect(page.getByRole('heading', { name: '오늘 뭐 먹을지 제가 맞혀볼게요.' })).toBeVisible();

  await page.getByRole('button', { name: '시작하기' }).click();
  await expect(page.locator('.app-shell')).toHaveAttribute('data-ui-state', 'asking');
  await expectNoForbiddenVisibleMarkers(page);
  await expect(page.locator('[data-answer-key]')).toHaveCount(5);
  await expect(page.locator('article.question-card')).toHaveCount(1);

  await answerUntilGuess(page, ['yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes']);
  await expect(page.locator('.app-shell')).toHaveAttribute('data-ui-state', 'guessing');
  await expectNoForbiddenVisibleMarkers(page);
  await expect(page.getByRole('button', { name: '아니에요' })).toBeVisible();

  await page.getByRole('button', { name: '아니에요' }).click();
  await expect(page.locator('.app-shell')).toHaveAttribute('data-ui-state', 'recovering');
  await expectNoForbiddenVisibleMarkers(page);
  await expect(page.locator('.app-shell')).toHaveAttribute('data-character-cue', 'surprised');
  await expect(page.locator('.rejected-chip')).toContainText('제외됨:');

  await page.waitForFunction(() => document.querySelector('.app-shell')?.getAttribute('data-ui-state') === 'asking');
  await expectNoForbiddenVisibleMarkers(page);
  await expect(page.locator('.app-shell')).toHaveAttribute('data-rejected-candidate-ids', /.+/);

  await answerUntilGuess(page, ['yes', 'probably', 'no', 'unknown', 'yes', 'probably', 'yes', 'no', 'probably', 'yes', 'probably_not', 'yes', 'no', 'yes']);
  await expect(page.locator('.app-shell')).toHaveAttribute('data-ui-state', /guessing|revealed|exhausted/);
  if ((await page.locator('.app-shell').getAttribute('data-ui-state')) === 'guessing') {
    await page.getByRole('button', { name: '맞아요' }).click();
  }
  await expect(page.locator('.app-shell')).toHaveAttribute('data-ui-state', 'revealed');
  await expectNoForbiddenVisibleMarkers(page);
  await expect(page.locator('.app-shell')).toHaveAttribute('data-character-cue', 'reveal');
  await expect(page.getByText('제가 이렇게 본 이유는요.')).toBeVisible();

  const visibleText = await page.locator('body').innerText();
  for (const marker of forbiddenUserVisibleMarkers) {
    expect(visibleText).not.toMatch(marker);
  }
  await expectNoConsoleErrors(page);
});

test('mobile asking stage keeps the spoon bowl inside safe area at 360, 390, and 412px', async ({ page }) => {
  const cases = [
    { width: 360, safeArea: 16 },
    { width: 390, safeArea: 20 },
    { width: 412, safeArea: 24 },
  ];

  for (const item of cases) {
    await page.setViewportSize({ width: item.width, height: 640 });
    await page.goto(appUrl);
    await page.getByRole('button', { name: '시작하기' }).click();
    await expect(page.locator('.app-shell')).toHaveAttribute('data-ui-state', 'asking');
    await expect(page.locator('[data-answer-key]')).toHaveCount(5);

    const geometry = await page.evaluate(() => {
      const stage = document.querySelector<HTMLElement>('[data-testid="character-stage"]');
      const spoonBowl = document.querySelector<SVGGraphicsElement>('[data-layer-id="spoon_bowl"]');
      const answerButtons = [...document.querySelectorAll<HTMLElement>('[data-answer-key]')];
      if (!stage || !spoonBowl || answerButtons.length === 0) throw new Error('missing mobile geometry target');
      const stageRect = stage.getBoundingClientRect();
      const spoonRect = spoonBowl.getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        viewportHeight: window.innerHeight,
        stageLeft: stageRect.left,
        stageRight: stageRect.right,
        spoonLeft: spoonRect.left,
        spoonRight: spoonRect.right,
        spoonRightSafeArea: stageRect.right - spoonRect.right,
        firstAnswerTop: Math.min(...answerButtons.map((button) => button.getBoundingClientRect().top)),
        lastAnswerBottom: Math.max(...answerButtons.map((button) => button.getBoundingClientRect().bottom)),
        minAnswerHeight: Math.min(...answerButtons.map((button) => button.getBoundingClientRect().height)),
      };
    });

    expect(geometry.overflow, `${item.width}px overflow`).toBeLessThanOrEqual(1);
    expect(geometry.spoonLeft, `${item.width}px spoon left`).toBeGreaterThanOrEqual(geometry.stageLeft);
    expect(geometry.spoonRight, `${item.width}px spoon right`).toBeLessThanOrEqual(geometry.stageRight);
    expect(geometry.spoonRightSafeArea, `${item.width}px spoon right safe area`).toBeGreaterThanOrEqual(item.safeArea);
    expect(geometry.firstAnswerTop, `${item.width}px answer controls should start on first screen`).toBeLessThan(geometry.viewportHeight);
    expect(geometry.lastAnswerBottom, `${item.width}px full answer set should be reachable on first screen`).toBeLessThanOrEqual(geometry.viewportHeight + 1);
    expect(geometry.minAnswerHeight, `${item.width}px answer height`).toBeGreaterThanOrEqual(44);
  }

  await expectNoConsoleErrors(page);
});

test('wrong recovery exposes surprise, remove, and refocus beats before normal asking resumes', async ({ page }) => {
  await driveToWrongRecovery(page);
  await expectRecoveryBeatSequence(page);
});

test('reduced-motion wrong recovery still exposes semantic surprise, remove, and refocus beats', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await driveToWrongRecovery(page);
  await expectRecoveryBeatSequence(page);
});

async function driveToWrongRecovery(page: Page): Promise<void> {
  await page.goto(appUrl);
  await page.getByRole('button', { name: '시작하기' }).click();
  await answerUntilGuess(page, ['yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes']);
  await expect(page.locator('.app-shell')).toHaveAttribute('data-ui-state', 'guessing');
  await page.getByRole('button', { name: '아니에요' }).click();
}

async function expectRecoveryBeatSequence(page: Page): Promise<void> {
  await expect(page.locator('.app-shell')).toHaveAttribute('data-ui-state', 'recovering');
  await expect(page.locator('.app-shell')).toHaveAttribute('data-recovery-beat', 'surprise');
  await expect(page.locator('.app-shell')).toHaveAttribute('data-character-cue', 'surprised');
  await expect(page.getByRole('heading', { name: '앗, 제가 너무 성급했네요.' })).toBeVisible();
  await expect(page.locator('article.question-card')).toHaveCount(0);

  await expect(page.locator('.app-shell')).toHaveAttribute('data-recovery-beat', 'remove');
  await expect(page.locator('[data-testid="rejected-candidate-list"]')).toBeVisible();
  await expect(page.locator('[data-testid="rejected-candidate-chip"]')).toHaveAttribute('data-removal-treatment', 'crossed-off');
  await expect(page.getByText('그 메뉴는 후보에서 뺄게요.')).toBeVisible();
  await expect(page.locator('article.question-card')).toHaveCount(0);

  await expect(page.locator('.app-shell')).toHaveAttribute('data-recovery-beat', 'refocus');
  await expect(page.locator('.app-shell')).toHaveAttribute('data-character-cue', 'recover');
  await expect(page.getByRole('heading', { name: '다시 단서를 좁혀볼게요.' })).toBeVisible();
  await expect(page.locator('[data-testid="rejected-candidate-chip"]')).toBeVisible();
  await expect(page.locator('[data-answer-key]')).toHaveCount(5);

  await page.waitForFunction(() => document.querySelector('.app-shell')?.getAttribute('data-ui-state') === 'asking');
  await expect(page.locator('.app-shell')).toHaveAttribute('data-rejected-candidate-ids', /.+/);
  await expectNoForbiddenVisibleMarkers(page);
  await expectNoConsoleErrors(page);
}
