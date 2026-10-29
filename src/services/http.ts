import type { ErrorKind, Result, ServiceName } from '../types/errors';
import type { RequestContext } from '../types/services';

function retryAt(value: string | null, now: number): number | null {
  if (value === null) return null;
  const text = value.trim();
  let deadline: number;
  if (/^\d+$/.test(text)) {
    deadline = now + Number(text) * 1000;
  } else if (
    /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(
      text,
    )
  ) {
    deadline = Date.parse(text);
  } else {
    return null;
  }
  return Number.isSafeInteger(deadline) && deadline > now ? deadline : null;
}

export async function requestJson<T>(
  url: URL,
  service: ServiceName,
  context: RequestContext,
  normalize: (data: unknown) => Result<T>,
): Promise<Result<T>> {
  if (
    url.protocol !== 'https:' ||
    !['geocoding-api.open-meteo.com', 'api.open-meteo.com'].includes(url.host) ||
    url.username ||
    url.password
  ) {
    throw new TypeError('Endpoint meteorológico não permitido.');
  }

  const failure = (
    kind: ErrorKind,
    status: number | null = null,
    retryAtMs: number | null = null,
  ): Result<T> => ({
    ok: false,
    error: { kind, service, status, retryAtMs },
  });
  const cancelled = () => new DOMException('Operação cancelada.', 'AbortError');
  if (context.signal.aborted) throw cancelled();

  const deadline = context.now() + 10_000;
  const controller = new AbortController();
  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let onAbort = () => {};
  const interrupted = new Promise<Result<T>>((resolve, reject) => {
    onAbort = () => {
      controller.abort();
      reject(cancelled());
    };
    context.signal.addEventListener('abort', onAbort, { once: true });
    timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
      resolve(failure('timeout'));
    }, 10_000);
  });

  const execute = async (): Promise<Result<T>> => {
    let response: Response;
    try {
      response = await fetch(url.toString(), {
        signal: controller.signal,
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'error',
        referrerPolicy: 'no-referrer',
      });
    } catch (error) {
      if (context.signal.aborted) throw cancelled();
      if (timedOut) return failure('timeout');
      if (error instanceof TypeError) return failure('network');
      throw error;
    }

    if (response.status === 429) {
      return failure(
        'rate-limit',
        429,
        retryAt(response.headers.get('Retry-After'), context.now()),
      );
    }
    if (!response.ok) return failure('http', response.status);

    let data: unknown;
    try {
      data = await response.json();
    } catch (error) {
      if (context.signal.aborted) throw cancelled();
      if (timedOut) return failure('timeout');
      if (error instanceof SyntaxError) return failure('invalid-response');
      if (error instanceof TypeError) return failure('network');
      throw error;
    }
    if (context.signal.aborted) throw cancelled();
    if (timedOut) return failure('timeout');
    return normalize(data);
  };

  try {
    const result = await Promise.race([execute(), interrupted]);
    if (context.signal.aborted) throw cancelled();
    if (timedOut || context.now() >= deadline) {
      controller.abort();
      return failure('timeout');
    }
    return result;
  } finally {
    clearTimeout(timer);
    context.signal.removeEventListener('abort', onAbort);
  }
}
