import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import { forecastResponse } from '../fixtures/forecast';

async function mockApi(page: Page) {
  let mode = 'success';
  let release: (() => void) | undefined;
  let forecasts = 0;
  await page.route('https://geocoding-api.open-meteo.com/**', async (route) => {
    if (mode === 'loading')
      await new Promise<void>((resolve) => {
        release = resolve;
      });
    if (mode === 'error') {
      await route.fulfill({ status: 500, json: {} });
    } else {
      await route.fulfill({
        json:
          mode === 'empty'
            ? {}
            : {
                results: [
                  {
                    id: 1,
                    name: 'Salvador',
                    admin1: 'Bahia',
                    country: 'Brasil',
                    latitude: -12.97,
                    longitude: -38.49,
                    timezone: 'America/Bahia',
                  },
                ],
              },
      });
    }
  });
  await page.route('https://api.open-meteo.com/**', async (route) => {
    forecasts++;
    await route.fulfill({ json: forecastResponse() });
  });
  return {
    setMode(value: string) {
      mode = value;
    },
    release() {
      release?.();
    },
    pending: () => release !== undefined,
    forecasts: () => forecasts,
  };
}

async function search(page: Page) {
  await page.getByRole('textbox', { name: 'Nome da cidade' }).fill('Salvador');
  await page.getByRole('textbox', { name: 'Nome da cidade' }).press('Enter');
}

for (const width of [320, 390, 768, 1366, 1920]) {
  test(`fluxos acessíveis e sem overflow em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const api = await mockApi(page);
    await page.goto('/');
    const check = async () => {
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
      if (width === 320 || width === 1366) {
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
              .analyze()
          ).violations,
        ).toEqual([]);
      }
    };
    await expect(page.getByRole('status')).toContainText('Qual é o seu próximo destino?');
    await check();
    api.setMode('loading');
    await search(page);
    await expect(page.getByRole('status')).toContainText('Buscando cidades');
    await expect.poll(api.pending).toBe(true);
    await check();
    api.setMode('empty');
    api.release();
    await expect(page.getByRole('status')).toContainText('Nenhuma cidade encontrada');
    await check();
    api.setMode('error');
    await search(page);
    await expect(page.getByRole('alert')).toContainText('O serviço está indisponível');
    await check();
    api.setMode('success');
    await page.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(page.getByRole('main')).toBeFocused();
    await expect(page.getByRole('button', { name: 'Salvador, Bahia, Brasil' })).toBeVisible();
    expect(api.forecasts()).toBe(0);
    await page.getByRole('button', { name: 'Salvador, Bahia, Brasil' }).click();
    await expect(page.getByRole('article')).toHaveCount(5);
    await check();
    const columns = await page
      .getByRole('region', { name: 'Previsão de 5 dias', exact: true })
      .getByRole('list')
      .evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(width >= 1024 ? 5 : width >= 640 ? 3 : 2);
    await page.getByRole('radio', { name: 'Fahrenheit' }).click();
    await expect(page.getByText('Sensação térmica: 50,2 °F')).toBeVisible();
    expect(api.forecasts()).toBe(1);
  });
}

test('skip link, busca e unidade preservam foco por teclado', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  await expect(page.getByRole('textbox', { name: 'Nome da cidade' })).toBeVisible();
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Pular para o conteúdo' });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  const input = page.getByRole('textbox', { name: 'Nome da cidade' });
  await input.focus();
  expect(await input.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('solid');
  await search(page);
  const choice = page.getByRole('button', { name: 'Salvador, Bahia, Brasil' });
  await expect(choice).toBeVisible();
  await expect(input).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Buscar' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('radio', { name: 'Celsius' })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'Fahrenheit' })).toBeChecked();
  await page.keyboard.press('Tab');
  await expect(choice).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('article')).toHaveCount(5);
  await expect(choice).toBeFocused();
});

test('texto a 200% continua sem overflow em 320px durante o fluxo real', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  const api = await mockApi(page);
  await page.goto('/');
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  const check = async () => {
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  };
  await check();
  api.setMode('error');
  await search(page);
  await expect(page.getByRole('alert')).toBeVisible();
  await check();
  api.setMode('success');
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await page.getByRole('button', { name: 'Salvador, Bahia, Brasil' }).click();
  await expect(page.getByRole('article')).toHaveCount(5);
  await check();
});

test.describe('toque mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('busca, seleção e unidade funcionam por toque sem nova consulta', async ({ page }) => {
    const api = await mockApi(page);
    await page.goto('/');
    await expect(page.getByRole('radio')).toHaveCount(2);
    for (const radio of await page.getByRole('radio').all()) {
      const bounds = await radio.boundingBox();
      expect(bounds?.width).toBeGreaterThanOrEqual(44);
      expect(bounds?.height).toBeGreaterThanOrEqual(44);
    }
    await page.getByRole('textbox').fill('Salvador');
    await page.getByRole('button', { name: 'Buscar' }).tap();
    await page.getByRole('button', { name: 'Salvador, Bahia, Brasil' }).tap();
    await expect(page.getByRole('article')).toHaveCount(5);
    await page.getByRole('radio', { name: 'Fahrenheit' }).tap();
    await expect(page.getByText('Sensação térmica: 50,2 °F')).toBeVisible();
    expect(api.forecasts()).toBe(1);
  });
});
