import * as winston from 'winston';

import { getRequestContext } from './trace.context';
import { levelEmoji } from './winston.constants';
import {
  maskSensitiveData,
  normalizeContext,
  normalizeLatencyMs,
  normalizeMessage,
  normalizeTraceId,
  safeJsonStringify,
} from './winston.utils';

// ----------------------------------------------------------------------------

/**
 * 개발 환경 포맷
 * - traceId
 * - context
 * - message
 * - latencyMs
 * - errorCode
 * - statusCode
 */
export const developmentFormat = winston.format.printf(
  ({ level, message, timestamp, context, trace, service, ...metadata }) => {
    const traceId = typeof metadata.traceId === 'string' ? metadata.traceId : normalizeTraceId(undefined);
    const traceIdStr = `\x1b[90m[${traceId.substring(0, 8)}]\x1b[0m`;
    const requestCtx = getRequestContext();

    const plainLevel = level.replace(/\x1b\[\d+m/g, '');
    const emoji = levelEmoji[plainLevel] || '📝';

    const ctxInfo = requestCtx
      ? Object.entries(requestCtx)
          .filter(([key]) => key !== 'traceId')
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')
      : '';

    const coloredTimestamp = `\x1b[90m${timestamp}\x1b[0m`;
    const coloredService = `\x1b[1;92m[${service}]\x1b[0m`;
    const coloredContext = `\x1b[1;94m[${normalizeContext(context)}]\x1b[0m`;

    let msg = `${coloredTimestamp} ${emoji} ${coloredService} ${coloredContext} ${traceIdStr} ${level} ${normalizeMessage(message)}`;

    if (ctxInfo) {
      msg += ` \x1b[90m(${ctxInfo})\x1b[0m`;
    }

    const metaKeys = Object.keys(metadata).filter((key) => !['service', 'traceId', 'context'].includes(key));

    if (metaKeys.length > 0) {
      const filteredMeta = metaKeys.reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = metadata[key];
        return acc;
      }, {});

      msg += ` \x1b[90m${safeJsonStringify(maskSensitiveData(filteredMeta))}\x1b[0m`;
    }

    if (trace) {
      msg += `\n\x1b[31m${trace}\x1b[0m`;
    }

    return msg;
  },
);

/**
 * 공통 필드 추가
 * - traceId
 * - context
 * - message
 * - latencyMs
 * - errorCode
 * - statusCode
 */
export const enrichCommonFields = winston.format((info) => {
  const requestCtx = getRequestContext();
  if (requestCtx) {
    for (const [key, value] of Object.entries(requestCtx)) {
      if (typeof info[key] === 'undefined') {
        info[key] = value;
      }
    }
  }

  info.traceId = normalizeTraceId(info.traceId);
  info.context = normalizeContext(info.context);
  info.message = normalizeMessage(info.message);

  if (typeof info.latencyMs !== 'undefined') {
    info.latencyMs = normalizeLatencyMs(info.latencyMs);
  }

  if (typeof info.error_code !== 'undefined' && typeof info.errorCode === 'undefined') {
    info.errorCode = info.error_code;
    delete info.error_code;
  }
  if (typeof info.status_code !== 'undefined' && typeof info.statusCode === 'undefined') {
    info.statusCode = info.status_code;
    delete info.status_code;
  }

  const masked = maskSensitiveData(info);
  if (masked && typeof masked === 'object') {
    Object.assign(info, masked);
  }

  return info;
})();
