import * as winston from 'winston';
import type { LoggerOptions } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { getRequestContext, getTraceId } from './trace.context';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

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

// 개발 환경용 읽기 쉬운 로그 포맷
const developmentFormat = printf(({ level, message, timestamp, context, trace, service, ...metadata }) => {
  const traceId = getTraceId();
  const traceIdStr = traceId ? `[${traceId.substring(0, 8)}]` : '';
  const requestCtx = getRequestContext();

  // traceId는 별도로 표시하므로 제외
  const ctxInfo = requestCtx
    ? Object.entries(requestCtx)
        .filter(([key]) => key !== 'traceId')
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')
    : '';

  let msg = `${timestamp} [${service}] [${context || 'Application'}] ${traceIdStr} ${level}: ${message}`;

  // Request Context 정보 추가
  if (ctxInfo) {
    msg += ` (${ctxInfo})`;
  }

  // 추가 메타데이터가 있으면 출력 (service, traceId 제외)
  const metaKeys = Object.keys(metadata).filter((key) => key !== 'service' && key !== 'traceId');
  if (metaKeys.length > 0) {
    const filteredMeta = metaKeys.reduce((acc, key) => ({ ...acc, [key]: metadata[key] }), {});
    msg += ` ${JSON.stringify(filteredMeta)}`;
  }

  // 에러 스택 트레이스가 있으면 출력
  if (trace) {
    msg += `\n${trace}`;
  }

  return msg;
});

// Winston 설정 생성 함수
export const createWinstonConfig = (options: WinstonConfigOptions): LoggerOptions => {
  const {
    serviceName,
    disableFileLog = false,
    level = process.env.LOG_LEVEL || 'info',
    logDir = 'logs',
    maxSize = '100m',
    maxFiles = '14d',
  } = options;

  const isDevelopment = process.env.NODE_ENV !== 'production';

  // 콘솔 트랜스포트
  const consoleTransport = new winston.transports.Console({
    format: isDevelopment
      ? combine(
          colorize({ all: true }),
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          errors({ stack: true }),
          developmentFormat
        )
      : undefined,
  });

  const transports: winston.transport[] = [consoleTransport];

  // 파일 로그 (프로덕션 또는 명시적 활성화 시)
  if (!disableFileLog && process.env.NODE_ENV !== 'test') {
    // 일반 로그 파일 (서비스별)
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
    format: combine(
      timestamp(),
      errors({ stack: true }),
      // Request Context를 자동으로 메타데이터에 추가
      winston.format((info) => {
        const requestCtx = getRequestContext();
        if (requestCtx) {
          // 모든 컨텍스트 정보를 로그에 추가
          Object.entries(requestCtx).forEach(([key, value]) => {
            info[key] = value;
          });
        }
        return info;
      })(),
      json()
    ),
    defaultMeta: {
      service: serviceName,
      env: process.env.NODE_ENV || 'development',
    },
    transports,
  };
};
