import { getTraceId } from './trace.context';
import { MAX_SERIALIZE_DEPTH, MAX_STRINGIFIED_LENGTH, SENSITIVE_KEYS, TRACE_ID_FALLBACK } from './winston.constants';

// ----------------------------------------------------------------------------

/** traceId 정규화 */
export function normalizeTraceId(value: unknown): string {
  return typeof value === 'string' && value.length > 0 ? value : (getTraceId() ?? TRACE_ID_FALLBACK);
}

/** context 정규화 */
export function normalizeContext(value: unknown): string {
  if (typeof value === 'string' && value.length > 0) return value;
  return 'Application';
}

export function normalizeMessage(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value instanceof Error) return value.message;
  return safeJsonStringify(value);
}

export function normalizeLatencyMs(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed);
}

export function safeJsonStringify(value: unknown): string {
  try {
    const seen = new WeakSet<object>();
    const serialized = JSON.stringify(value, (_key, nestedValue) => {
      if (typeof nestedValue === 'object' && nestedValue !== null) {
        if (seen.has(nestedValue)) return '[Circular]';
        seen.add(nestedValue);
      }
      return nestedValue;
    });

    if (!serialized) return String(value);
    if (serialized.length > MAX_STRINGIFIED_LENGTH) {
      return `${serialized.slice(0, MAX_STRINGIFIED_LENGTH)}...(truncated)`;
    }
    return serialized;
  } catch {
    return String(value);
  }
}

export function maskSensitiveData(value: unknown, depth = 0): unknown {
  if (depth > MAX_SERIALIZE_DEPTH) return '[TruncatedDepth]';
  if (Array.isArray(value)) {
    return value.map((item) => maskSensitiveData(item, depth + 1));
  }
  if (value && typeof value === 'object') {
    const masked: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive))) {
        masked[key] = '[REDACTED]';
      } else {
        masked[key] = maskSensitiveData(item, depth + 1);
      }
    }
    return masked;
  }
  return value;
}
