import { expect, type Page, test } from '@playwright/test';
import { forecastResponse } from '../fixtures/forecast';

const geocodingResponse = {
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
};

async function selectBerlin(page: Page) {
  await page.route('https://geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({ json: geocodingResponse });
  });
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Nome da cidade' }).fill('Berlim');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await page.getByRole('button', { name: 'Berlim, Berlim, Alemanha', exact: true }).click();
}

async function expectWeatherFlow(page: Page) {
  let geocodingRequests = 0;
  let forecastRequests = 0;
  const forecast = forecastResponse();
  forecast.current.temperature_2m = 0;

  await page.route('https://geocoding-api.open-meteo.com/**', async (route) => {
    geocodingRequests++;
    await route.fulfill({ json: geocodingResponse });
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

for (const failure of ['http', 'network', 'json', 'incomplete'] as const) {
  test(`forecast com falha ${failure} permite recuperação manual sem repetir geocoding (EC-06/13)`, async ({
    page,
  }) => {
    let requests = 0;
    await page.route('https://api.open-meteo.com/**', async (route) => {
      requests++;
      if (requests > 1) {
        await route.fulfill({ json: forecastResponse() });
      } else if (failure === 'network') {
        await route.abort('failed');
      } else if (failure === 'http') {
        await route.fulfill({ status: 503, body: 'diagnóstico interno do provedor' });
      } else if (failure === 'json') {
        await route.fulfill({ contentType: 'application/json', body: '{' });
      } else {
        await route.fulfill({ json: {} });
      }
    });
    let searches = 0;
    page.on('request', (request) => {
      if (request.url().startsWith('https://geocoding-api.open-meteo.com/')) searches++;
    });
    await selectBerlin(page);

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByText('Carregando o clima…')).toHaveCount(0);
    await expect(page.getByText('Nenhuma cidade encontrada')).toHaveCount(0);
    await expect(page.getByText('diagnóstico interno do provedor')).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toHaveCount(0);
    expect(requests).toBe(1);
    await page.getByRole('button', { name: 'Tentar novamente' }).click();

    const current = page.getByRole('region', { name: 'Clima em Berlim' });
    await expect(current.getByText('12,3 °C', { exact: false })).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Previsão de 5 dias' }).getByRole('article'),
    ).toHaveCount(5);
    await expect(page.getByRole('alert')).toHaveCount(0);
    expect(requests).toBe(2);
    expect(searches).toBe(1);
  });
}

for (const section of ['current', 'daily'] as const) {
  test(`preserva ${section} utilizável com ausências sem fabricar zeros (EC-10/36)`, async ({
    page,
  }) => {
    const body = forecastResponse();
    await page.route('https://api.open-meteo.com/**', async (route) => {
      await route.fulfill({
        json: {
          ...body,
          current: section === 'current' ? { temperature_2m: 12.34 } : undefined,
          daily:
            section === 'daily'
              ? { time: body.daily.time, temperature_2m_max: [12.34, null, null, null, null] }
              : undefined,
        },
      });
    });
    await selectBerlin(page);
    await expect(page.getByText(/Dados parcialmente disponíveis/)).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
    const current = page.getByRole('region', { name: 'Clima em Berlim' });
    const daily = page.getByRole('region', { name: 'Previsão de 5 dias' });
    const available = section === 'current' ? current : daily;
    await expect(available.getByText('12,3 °C', { exact: false })).toBeVisible();
    if (section === 'current') {
      await expect(current.getByText('Sem dados', { exact: true })).toHaveCount(4);
      await expect(daily.getByText('Previsão indisponível.')).toBeVisible();
      await expect(daily.getByRole('article')).toHaveCount(0);
    } else {
      await expect(current.getByText('Condições atuais indisponíveis.')).toBeVisible();
      await expect(daily.getByRole('article')).toHaveCount(5);
      await expect(
        daily.getByRole('article').nth(1).getByText('Sem dados', { exact: true }),
      ).toHaveCount(5);
    }
    await page.getByRole('radio', { name: 'Fahrenheit' }).click();
    await expect(available.getByText('54,2 °F', { exact: false })).toBeVisible();
    await expect(available.getByText(/°C/)).toHaveCount(0);
  });
}

test.describe('mobile 375×812', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test('renderiza clima e previsão durante o fluxo principal', async ({ page }) => {
    await expectWeatherFlow(page);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  });
});
