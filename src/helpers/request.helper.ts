export function isTimeoutError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;

  const typedError: { code?: unknown } = err;

  return typedError.code === 'ECONNABORTED';
}
