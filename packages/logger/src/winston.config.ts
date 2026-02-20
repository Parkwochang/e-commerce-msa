import * as winston from 'winston';
import type { LoggerOptions } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { getRequestContext, getTraceId } from './trace.context';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// 커스텀 색상 설정
const customColors = {
  error: 'bold red',
  warn: 'bold yellow',
  info: 'bold cyan',
  http: 'bold magenta',
  verbose: 'bold white',
  debug: 'bold blue',
  silly: 'bold gray',
};

winston.addColors(customColors);

// 커스텀 Winston 설정 옵션
export interface WinstonConfigOptions {
  /** 서비스 이름 (필수) */
  serviceName: string;
  /** 파일 로그를 비활성화 (개발 환경용) */
  disableFileLog?: boolean;
  /** 로그 레벨 (기본값: 'info') */
  level?: string;
  /** 로그 파일 디렉토리 (기본값: 'logs') */
  logDir?: string;
  /** 파일 최대 크기 (기본값: '100m') */
  maxSize?: string;
  /** 파일 보관 기간 (기본값: '14d') */
  maxFiles?: string;
}

// 로그 레벨별 이모지
const levelEmoji: Record<string, string> = {
  error: '❌',
  warn: '⚠️ ',
  info: '📘',
  http: '🌐',
  verbose: '💬',
  debug: '🐛',
  silly: '🎭',
};

// 개발 환경용 읽기 쉬운 로그 포맷
const developmentFormat = printf(({ level, message, timestamp, context, trace, service, ...metadata }) => {
  const traceId = getTraceId();
  const traceIdStr = traceId ? `\x1b[90m[${traceId.substring(0, 8)}]\x1b[0m` : '';
  const requestCtx = getRequestContext();

  // 로그 레벨에서 색상 코드 제거하여 순수 레벨명 추출
  const plainLevel = level.replace(/\x1b\[\d+m/g, '');
  const emoji = levelEmoji[plainLevel] || '📝';

  // traceId는 별도로 표시하므로 제외
  const ctxInfo = requestCtx
    ? Object.entries(requestCtx)
        .filter(([key]) => key !== 'traceId')
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')
    : '';

  // 타임스탬프 색상
  const coloredTimestamp = `\x1b[90m${timestamp}\x1b[0m`;
  // 서비스명 색상 (밝은 녹색)
  const coloredService = `\x1b[1;92m[${service}]\x1b[0m`;
  // 컨텍스트 색상 (밝은 파란색)
  const coloredContext = `\x1b[1;94m[${context || 'Application'}]\x1b[0m`;

  let msg = `${coloredTimestamp} ${emoji} ${coloredService} ${coloredContext} ${traceIdStr} ${level} ${message}`;

  // Request Context 정보 추가
  if (ctxInfo) {
    msg += ` \x1b[90m(${ctxInfo})\x1b[0m`;
  }

  // 추가 메타데이터가 있으면 출력 (service, traceId 제외)
  const metaKeys = Object.keys(metadata).filter((key) => key !== 'service' && key !== 'traceId');
  if (metaKeys.length > 0) {
    const filteredMeta = metaKeys.reduce((acc, key) => ({ ...acc, [key]: metadata[key] }), {});
    msg += ` \x1b[90m${JSON.stringify(filteredMeta)}\x1b[0m`;
  }

  // 에러 스택 트레이스가 있으면 출력
  if (trace) {
    msg += `\n\x1b[31m${trace}\x1b[0m`;
  }

  return msg;
});

// Winston 설정 생성 함수
export const createWinstonConfig = (options: WinstonConfigOptions): LoggerOptions => {
  const {
    serviceName,
    disableFileLog = true,
    level = process.env.LOG_LEVEL || 'info',
    logDir = 'logs',
    maxSize = '100m',
    maxFiles = '14d',
  } = options;

  const isDevelopment = process.env.NODE_ENV !== 'production';

  // 콘솔 트랜스포트 - 환경별 분리
  const consoleTransport = new winston.transports.Console({
    format: isDevelopment
      ? // 개발: 사람이 읽기 좋은 포맷 (색상 포함)
        combine(
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          errors({ stack: true }),
          colorize({ level: true }), // 색상 적용
          developmentFormat,
        )
      : // 프로덕션: Fluent Bit을 위한 순수 JSON (색상 제거)
        combine(
          timestamp(),
          errors({ stack: true }),
          winston.format((info) => {
            const requestCtx = getRequestContext();
            if (requestCtx) {
              Object.entries(requestCtx).forEach(([key, value]) => {
                info[key] = value;
              });
            }
            return info;
          })(),
          json(),
        ),
  });

  const transports: winston.transport[] = [consoleTransport];

  // 파일 로그 (로컬 개발용 - Fluent Bit 없을 때만)
  // Kubernetes 환경: stdout만 출력 → Fluent Bit이 자동 수집 → Elasticsearch
  // 로컬 개발: 파일로 저장 (디버깅 편의)

  if (!disableFileLog) {
    const combinedFileTransport = new DailyRotateFile({
      dirname: logDir,
      filename: `${serviceName}.%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize,
      maxFiles,
      level: 'info',
    });

    // 에러 로그 파일 (서비스별)
    const errorFileTransport = new DailyRotateFile({
      dirname: logDir,
      filename: `${serviceName}.error.%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '50m',
      maxFiles: '30d',
      level: 'error',
    });

    transports.push(combinedFileTransport, errorFileTransport);
  }

  return {
    level,
    // 전역 format은 파일 로그용 (JSON)
    format: !disableFileLog
      ? combine(
          timestamp(),
          errors({ stack: true }),
          winston.format((info) => {
            const requestCtx = getRequestContext();
            if (requestCtx) {
              Object.entries(requestCtx).forEach(([key, value]) => {
                info[key] = value;
              });
            }
            return info;
          })(),
          json(),
        )
      : undefined, // console transport가 자체 format 사용
    defaultMeta: {
      service: serviceName,
      env: process.env.NODE_ENV || 'development',
    },
    transports,
  };
};
