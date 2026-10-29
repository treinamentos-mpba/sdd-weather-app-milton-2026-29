import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const states = ['success', 'idle', 'loading', 'empty', 'error'];

for (const width of [320, 390, 768, 1366, 1920]) {
  test(`estados acessíveis e sem overflow em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    const selector = page.getByRole('combobox', { name: 'Estado da demonstração' });
    for (const state of states) {
      await selector.selectOption(state);
      await expect(page.getByRole('main')).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
      if (state === 'success') {
        await expect(page.getByRole('article')).toHaveCount(5);
        const columns = await page
          .locator('main ul')
          .evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length);
        expect(columns).toBe(width >= 1024 ? 5 : width >= 640 ? 3 : 2);
      } else {
        await expect(page.getByRole('article')).toHaveCount(0);
        await expect(page.getByRole(state === 'error' ? 'alert' : 'status')).toHaveCount(1);
      }
      if (width === 320 || width === 1366) {
        const result = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(result.violations).toEqual([]);
      }
    }
  });
}

test('skip link, unidades e recuperação por teclado mantêm foco visível', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Pular para o conteúdo' });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();

  const input = page.getByRole('textbox', { name: 'Nome da cidade' });
  await input.focus();
  expect(await input.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('solid');
  await input.fill('Recife');
  await page.keyboard.press('Enter');
  await expect(input).toBeFocused();
  await expect(page.getByRole('status')).toContainText('Nenhuma cidade encontrada');

  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Buscar' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('radio', { name: 'Celsius' })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  const fahrenheit = page.getByRole('radio', { name: 'Fahrenheit' });
  await expect(fahrenheit).toBeChecked();
  expect(
    await fahrenheit.evaluate((element) => {
      const indicator = element.nextElementSibling;
      if (!indicator) throw new Error('Indicador da unidade ausente.');
      return getComputedStyle(indicator).outlineStyle;
    }),
  ).toBe('solid');
  await page.keyboard.press('Tab');
  const selector = page.getByRole('combobox', { name: 'Estado da demonstração' });
  await expect(selector).toBeFocused();
  await selector.selectOption('error');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page.getByText('Sensação térmica: 86,4 °F')).toBeVisible();
});

test('texto a 200% continua legível e sem rolagem horizontal em 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/');
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  for (const state of states) {
    await page.getByRole('combobox', { name: 'Estado da demonstração' }).selectOption(state);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
});

test.describe('toque mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('unidades e recuperação têm alvos acionáveis', async ({ page }) => {
    await page.goto('/');
    for (const radio of await page.getByRole('radio').all()) {
      const bounds = await radio.boundingBox();
      expect(bounds?.width).toBeGreaterThanOrEqual(44);
      expect(bounds?.height).toBeGreaterThanOrEqual(44);
    }
    await page.getByRole('radio', { name: 'Fahrenheit' }).tap();
    await expect(page.getByText('Sensação térmica: 86,4 °F')).toBeVisible();
    await page.getByRole('combobox', { name: 'Estado da demonstração' }).selectOption('error');
    await page.getByRole('button', { name: 'Tentar novamente' }).tap();
    await expect(page.getByRole('article')).toHaveCount(5);
    await expect(page.getByRole('main')).toBeFocused();
  });
});
