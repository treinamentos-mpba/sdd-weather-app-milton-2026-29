import { afterEach, describe, expect, it, vi } from 'vitest';
import { getServiceErrorMessage } from '../../src/lib/errors';
import { fetchWithTimeout } from '../../src/services/http';
import type { Result } from '../../src/types/errors';
import type { RequestContext } from '../../src/types/services';

const now = Date.parse('2026-10-29T18:00:00Z');
const url = new URL('https://geocoding-api.open-meteo.com/v1/search?name=Salvador');
const normalize = (data: unknown): Result<unknown> => ({ ok: true, value: data });

function context(): RequestContext {
  return { signal: new AbortController().signal, now: Date.now };
}

function request(options = context()) {
  return fetchWithTimeout(url, 'geocoding', options, normalize);
}

function mockResponse(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('transporte de geocoding', () => {
  it('usa opções seguras de transporte e limpa timer/listener após sucesso', async () => {
    vi.useFakeTimers();
    const options = context();
    const remove = vi.spyOn(options.signal, 'removeEventListener');
    const fetchMock = mockResponse(new Response('{}'));
    await expect(request(options)).resolves.toEqual({ ok: true, value: {} });
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(url.toString(), {
      signal: expect.any(AbortSignal),
      cache: 'no-store',
      credentials: 'omit',
      redirect: 'error',
      referrerPolicy: 'no-referrer',
    });
    expect(remove).toHaveBeenCalledWith('abort', expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([400, 500])('retorna erro HTTP %i sanitizado', async (status) => {
    mockResponse(new Response('diagnóstico privado', { status }));
    await expect(request()).resolves.toEqual({
      ok: false,
      error: { kind: 'http', service: 'geocoding', status, retryAtMs: null },
    });
  });

  it('retorna invalid-response para JSON inválido', async () => {
    mockResponse(new Response('{'));
    await expect(request()).resolves.toMatchObject({
      ok: false,
      error: { kind: 'invalid-response' },
    });
  });

  it('retorna network sem expor URL, corpo ou exceção bruta', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('URL privada')));
    const result = await request();
    expect(result).toEqual({
      ok: false,
      error: { kind: 'network', service: 'geocoding', status: null, retryAtMs: null },
    });
    if (result.ok) throw new Error('Esperada falha de rede.');
    expect(getServiceErrorMessage(result.error)).toBe('Falha de rede.');
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    'fetch',
    'body',
  ])('converte AbortError de %s em timeout com mensagem clara', async (phase) => {
    vi.useFakeTimers();
    const aborted = new DOMException('Diagnóstico privado', 'AbortError');
    const response = new Response('{}');
    if (phase === 'body') vi.spyOn(response, 'json').mockRejectedValue(aborted);
    vi.stubGlobal(
      'fetch',
      phase === 'fetch' ? vi.fn().mockRejectedValue(aborted) : vi.fn().mockResolvedValue(response),
    );
    const result = await request();
    expect(result).toMatchObject({ ok: false, error: { kind: 'timeout' } });
    if (result.ok) throw new Error('Esperado timeout.');
    expect(getServiceErrorMessage(result.error)).toBe('A requisição demorou demais.');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('aborta o fetch aos 10 s e retorna mensagem sem aguardar a rede', async () => {
    vi.useFakeTimers();
    let activeSignal: AbortSignal | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, options: RequestInit) => {
        activeSignal = options.signal ?? undefined;
        return new Promise<Response>((_resolve, reject) => {
          activeSignal?.addEventListener(
            'abort',
            () => {
              reject(new DOMException('Aborted', 'AbortError'));
            },
            { once: true },
          );
        });
      }),
    );
    const pending = request();
    await vi.advanceTimersByTimeAsync(10_000);
    const result = await pending;
    expect(activeSignal?.aborted).toBe(true);
    if (result.ok) throw new Error('Esperado timeout.');
    expect(getServiceErrorMessage(result.error)).toBe('A requisição demorou demais.');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('não disfarça uma exceção inesperada como falha de rede', async () => {
    const error = new Error('Falha inesperada');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));
    await expect(request()).rejects.toBe(error);
  });

  it.each([
    ['30', now + 30_000],
    ['Thu, 29 Oct 2026 18:00:30 GMT', now + 30_000],
    ['0', null],
    ['Thu, 29 Oct 2026 17:59:30 GMT', null],
    ['-1', null],
    ['1.5', null],
    ['inválido', null],
    [null, null],
  ])('interpreta Retry-After %s sem retry automático', async (header, expected) => {
    const headers = new Headers();
    if (header !== null) headers.set('Retry-After', header);
    const fetchMock = mockResponse(new Response('', { status: 429, headers }));
    await expect(request({ ...context(), now: () => now })).resolves.toEqual({
      ok: false,
      error: { kind: 'rate-limit', service: 'geocoding', status: 429, retryAtMs: expected },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    'fetch',
    'body',
  ])('encerra %s pendente aos 10 s, mesmo ignorando abort', async (phase) => {
    vi.useFakeTimers();
    let complete: (() => void) | undefined;
    let response: Response | undefined;
    if (phase === 'body') {
      response = new Response('{}');
      vi.spyOn(response, 'json').mockImplementation(
        () =>
          new Promise((resolve) => {
            complete = () => resolve({});
          }),
      );
    }
    const fetchMock = vi.fn(() =>
      phase === 'body'
        ? Promise.resolve(response)
        : new Promise<Response>((resolve) => {
            complete = () => resolve(new Response('{}'));
          }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const settled = vi.fn();
    const pending = request().then((result) => {
      settled(result);
      return result;
    });
    await vi.advanceTimersByTimeAsync(9_999);
    expect(settled).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await expect(pending).resolves.toMatchObject({
      ok: false,
      error: { kind: 'timeout' },
    });
    complete?.();
    await vi.advanceTimersByTimeAsync(0);
    expect(settled).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('rejeita aceite depois do deadline, incluindo normalização síncrona', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    mockResponse(new Response('{}'));
    const result = await fetchWithTimeout(url, 'geocoding', context(), (data) => {
      vi.setSystemTime(now + 10_000);
      return normalize(data);
    });
    expect(result).toMatchObject({ ok: false, error: { kind: 'timeout' } });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancelamento externo rejeita sem erro notificável e limpa recursos', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const remove = vi.spyOn(controller.signal, 'removeEventListener');
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>(() => {})),
    );
    const pending = request({ signal: controller.signal, now: Date.now });
    const assertion = expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    controller.abort('informação que não deve ser propagada');
    await assertion;
    expect(remove).toHaveBeenCalledWith('abort', expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });

  it('não consulta rede se o sinal já foi cancelado', async () => {
    const controller = new AbortController();
    controller.abort();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(request({ signal: controller.signal, now: Date.now })).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
