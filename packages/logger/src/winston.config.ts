import * as winston from 'winston';
import type { LoggerOptions } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

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
  let msg = `${timestamp} [${service}] [${context || 'Application'}] ${level}: ${message}`;

  // 추가 메타데이터가 있으면 출력 (service 제외)
  const metaKeys = Object.keys(metadata).filter((key) => key !== 'service');
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
    format: combine(timestamp(), errors({ stack: true }), json()),
    defaultMeta: {
      service: serviceName,
      env: process.env.NODE_ENV || 'development',
    },
    transports,
  };
};
