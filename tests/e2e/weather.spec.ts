import { expect, type Page, test } from '@playwright/test';
import { forecastResponse } from '../fixtures/forecast';

async function expectWeatherFlow(page: Page) {
  let geocodingRequests = 0;
  let forecastRequests = 0;
  const forecast = forecastResponse();
  forecast.current.temperature_2m = 0;

  await page.route('https://geocoding-api.open-meteo.com/**', async (route) => {
    geocodingRequests++;
    await route.fulfill({
      json: {
        results: [
          {
            id: 2950159,
            name: 'Berlim',
            admin1: 'Berlim',
            country: 'Alemanha',
            latitude: 52.52,
            longitude: 13.42,
            timezone: 'Europe/Berlin',
          },
        ],
      },
    });
  });
  await page.route('https://api.open-meteo.com/**', async (route) => {
    forecastRequests++;
    await route.fulfill({ json: forecast });
  });

  await page.goto('/');
  await page.getByRole('textbox', { name: 'Nome da cidade' }).fill('Berlim');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  const city = page.getByRole('button', { name: 'Berlim, Berlim, Alemanha', exact: true });
  await expect(city).toBeVisible();
  expect(forecastRequests).toBe(0);
  await city.click();

  const current = page.getByRole('region', { name: 'Clima em Berlim', exact: true });
  await expect(current).toBeVisible();
  await expect(current.getByText('0 °C', { exact: false })).toBeVisible();
  const daily = page.getByRole('region', { name: 'Previsão de 5 dias', exact: true });
  await expect(daily).toBeVisible();
  await expect(daily.getByRole('article')).toHaveCount(5);

  await page.getByRole('radio', { name: 'Fahrenheit', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Fahrenheit', exact: true })).toBeChecked();
  await expect(current.getByText('32 °F', { exact: false })).toBeVisible();
  await expect(current.getByText(/°C/)).toHaveCount(0);
  expect(geocodingRequests).toBe(1);
  expect(forecastRequests).toBe(1);
}

test('busca cidade, apresenta cinco dias e converte a temperatura sem nova consulta', async ({
  page,
}) => {
  await expectWeatherFlow(page);
});

test('mostra estado vazio quando o geocoding não retorna results', async ({ page }) => {
  let forecastRequests = 0;
  await page.route('https://geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({ json: {} });
  });
  await page.route('https://api.open-meteo.com/**', async (route) => {
    forecastRequests++;
    await route.fulfill({ json: forecastResponse() });
  });

  await page.goto('/');
  await page.getByRole('textbox', { name: 'Nome da cidade' }).fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  await expect(page.getByRole('status')).toContainText('Nenhuma cidade encontrada');
  await expect(page.getByRole('region', { name: 'Escolha uma cidade' })).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toHaveCount(0);
  expect(forecastRequests).toBe(0);
});

test.describe('mobile 375×812', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test('renderiza clima e previsão durante o fluxo principal', async ({ page }) => {
    await expectWeatherFlow(page);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
});
