import { expect, test, type Page } from '@playwright/test';

const forbiddenUserVisibleMarkers = [/score/i, /probability/i, /top1/i, /top3/i, /attribute/i, /clue:/i, /q-[a-z-]+/i];

async function expectNoConsoleErrors(page: Page): Promise<void> {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.waitForTimeout(100);
  expect(errors).toEqual([]);
}

async function answer(page: Page, answerKey: string): Promise<void> {
  await page.locator(`[data-answer-key="${answerKey}"]`).click();
  await expect(page.locator('.app-shell')).toHaveAttribute('data-ui-state', /answerAccepted|thinking|asking|guessing|revealed|exhausted/);
  await page.waitForFunction(() => {
    const state = document.querySelector('.app-shell')?.getAttribute('data-ui-state');
    return state !== 'answerAccepted' && state !== 'thinking';
  });
}

async function answerUntilGuess(page: Page, sequence: string[]): Promise<void> {
  for (const key of sequence) {
    const state = await page.locator('.app-shell').getAttribute('data-ui-state');
    if (state === 'guessing' || state === 'revealed' || state === 'exhausted') return;
    await answer(page, key);
  }
}

test('minimal scaffold supports entry → adaptive answers → wrong recovery → reveal without console errors', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.app-shell')).toHaveAttribute('data-ui-state', 'entry');
  await expect(page.locator('[data-testid="character-stage"]')).toHaveAttribute('data-character-cue', 'idle');
  await expect(page.getByRole('heading', { name: '오늘 뭐 먹을지 제가 맞혀볼게요.' })).toBeVisible();

  await page.getByRole('button', { name: '시작하기' }).click();
  await expect(page.locator('.app-shell')).toHaveAttribute('data-ui-state', 'asking');
  await expect(page.locator('[data-answer-key]')).toHaveCount(5);
  await expect(page.locator('article.question-card')).toHaveCount(1);

  await answerUntilGuess(page, ['yes', 'yes', 'yes', 'yes', 'yes']);
  await expect(page.locator('.app-shell')).toHaveAttribute('data-ui-state', 'guessing');
  await expect(page.getByRole('button', { name: '아니에요' })).toBeVisible();

  await page.getByRole('button', { name: '아니에요' }).click();
  await expect(page.locator('.app-shell')).toHaveAttribute('data-ui-state', 'recovering');
  await expect(page.locator('.app-shell')).toHaveAttribute('data-character-cue', 'surprised');
  await expect(page.locator('.rejected-chip')).toContainText('제외됨:');

  await page.waitForFunction(() => document.querySelector('.app-shell')?.getAttribute('data-ui-state') === 'asking');
  await expect(page.locator('.app-shell')).toHaveAttribute('data-rejected-candidate-ids', /.+/);

  await answerUntilGuess(page, ['yes', 'probably', 'no', 'unknown', 'yes']);
  await expect(page.locator('.app-shell')).toHaveAttribute('data-ui-state', /guessing|revealed|exhausted/);
  if ((await page.locator('.app-shell').getAttribute('data-ui-state')) === 'guessing') {
    await page.getByRole('button', { name: '맞아요' }).click();
  }
  await expect(page.locator('.app-shell')).toHaveAttribute('data-ui-state', 'revealed');
  await expect(page.locator('.app-shell')).toHaveAttribute('data-character-cue', 'reveal');
  await expect(page.getByText('제가 이렇게 본 이유는요.')).toBeVisible();

  const visibleText = await page.locator('body').innerText();
  for (const marker of forbiddenUserVisibleMarkers) {
    expect(visibleText).not.toMatch(marker);
  }
  await expectNoConsoleErrors(page);
});

test('mobile viewport remains usable without horizontal overflow', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.getByRole('button', { name: '시작하기' }).click();
  await expect(page.locator('[data-answer-key]')).toHaveCount(5);
  await expectNoConsoleErrors(page);
});
