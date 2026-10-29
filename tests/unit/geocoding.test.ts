import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchCities } from '../../src/services/weatherService';
import type { RequestContext } from '../../src/types/services';

const city = {
  id: 3450554,
  name: 'Salvador',
  admin1: 'Bahia',
  country: 'Brasil',
  latitude: -12.9714,
  longitude: -38.5014,
  timezone: 'America/Bahia',
};

function context(): RequestContext {
  return { signal: new AbortController().signal, now: Date.now };
}

function mockResponse(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('searchCities', () => {
  it.each(['', ' \n\t '])('não chama a rede com entrada vazia %j', async (name) => {
    const fetchMock = mockResponse({});
    await expect(searchCities(name, context())).resolves.toEqual({
      ok: true,
      value: { cities: [], partial: false },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('mapeia Salvador para City e codifica o nome sem injetar parâmetros', async () => {
    const fetchMock = mockResponse({ results: [city] });
    await expect(searchCities(' Salvador & São? ', context())).resolves.toEqual({
      ok: true,
      value: {
        cities: [
          {
            id: city.id,
            name: 'Salvador',
            region: 'Bahia',
            country: 'Brasil',
            coordinates: { latitude: city.latitude, longitude: city.longitude },
            timeZone: 'America/Bahia',
          },
        ],
        partial: false,
      },
    });
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe('https://geocoding-api.open-meteo.com/v1/search');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      name: 'Salvador & São?',
      count: '10',
      language: 'pt',
      format: 'json',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('preserva ordem, limita aos dez primeiros válidos e sinaliza descartes', async () => {
    mockResponse({
      results: [
        { ...city, latitude: 91 },
        ...Array.from({ length: 12 }, (_, index) => ({
          id: index + 1,
          name: `Cidade ${index + 1}`,
          latitude: 0,
          longitude: 0,
          timezone: 'Invalid/Zone',
        })),
      ],
    });
    const result = await searchCities('Cidade', context());
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Esperado sucesso de geocoding.');
    expect(result.value.partial).toBe(true);
    expect(result.value.cities.map(({ id }) => id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(result.value.cities[0]).toMatchObject({
      region: null,
      country: null,
      timeZone: null,
      coordinates: { latitude: 0, longitude: 0 },
    });
  });

  it('limitar resultados não indica descarte por invalidez', async () => {
    mockResponse({ results: Array.from({ length: 12 }, (_, id) => ({ ...city, id: id + 1 })) });
    const result = await searchCities('Cidade', context());
    expect(result).toMatchObject({ ok: true, value: { partial: false } });
    if (!result.ok) throw new Error('Esperado sucesso de geocoding.');
    expect(result.value.cities).toHaveLength(10);
  });

  it.each([{}, { results: [] }])('aceita vazio documentado %j', async (body) => {
    mockResponse(body);
    await expect(searchCities('Sem correspondência', context())).resolves.toEqual({
      ok: true,
      value: { cities: [], partial: false },
    });
  });

  it.each([400, 500, 429])('retorna erro para HTTP %i, nunca lista vazia', async (status) => {
    const fetchMock = mockResponse({}, status);
    await expect(searchCities('Salvador', context())).resolves.toEqual({
      ok: false,
      error: {
        kind: status === 429 ? 'rate-limit' : 'http',
        service: 'geocoding',
        status,
        retryAtMs: null,
      },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    null,
    [],
    { error: true },
    { results: null },
    { results: 'inválido' },
    { results: [{ ...city, latitude: 91 }] },
    { results: [{ ...city, longitude: -181 }] },
    { results: [{ ...city, name: ' ' }] },
    { results: [{ ...city, id: 1.5 }] },
    { results: [{ ...city, id: null }] },
  ])('retorna falha para resposta inválida, nunca lista vazia: %j', async (body) => {
    mockResponse(body);
    await expect(searchCities('Salvador', context())).resolves.toEqual({
      ok: false,
      error: {
        kind: 'invalid-response',
        service: 'geocoding',
        status: null,
        retryAtMs: null,
      },
    });
  });
});
