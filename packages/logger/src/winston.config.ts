import * as winston from 'winston';
import type { LoggerOptions } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// 커스텀 Winston 설정 옵션
export interface WinstonConfigOptions {
  /** 서비스 이름 (모든 로그에 포함) */
  serviceName?: string;
  /** 파일 로그를 비활성화 (개발 환경용) */
  disableFileLog?: boolean;
  /** 로그 레벨 (기본값: 'info') */
  level?: string;
  /** 로그 파일 디렉토리 (기본값: 'logs') */
  logDir?: string;
  /** 파일 최대 크기 (기본값: '20m') */
  maxSize?: string;
  /** 파일 보관 기간 (기본값: '14d') */
  maxFiles?: string;
}

// 커스텀 로그 포맷
const logFormat = printf(({ level, message, timestamp, context, trace, ...metadata }) => {
  let msg = `${timestamp} [${context || 'Application'}] ${level}: ${message}`;

  // 추가 메타데이터가 있으면 출력
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }

  // 에러 스택 트레이스가 있으면 출력
  if (trace) {
    msg += `\n${trace}`;
  }

  return msg;
});

// 콘솔 출력용 트랜스포트
const consoleTransport = new winston.transports.Console({
  format: combine(
    colorize({ all: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
});

// 에러 로그 파일 저장용 (일별 로테이션)
const errorFileTransport = new DailyRotateFile({
  level: 'error',
  dirname: 'logs',
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), logFormat),
});

// 전체 로그 파일 저장용 (일별 로테이션)
const combinedFileTransport = new DailyRotateFile({
  dirname: 'logs',
  filename: 'combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), logFormat),
});

// Winston 인스턴스 생성
export const winstonConfig: LoggerOptions = {
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), logFormat),
  transports: [consoleTransport, errorFileTransport, combinedFileTransport],
};

// 개발 환경에서는 파일 로그 비활성화 옵션
export const getWinstonConfig = (options?: WinstonConfigOptions): LoggerOptions => {
  const {
    serviceName,
    disableFileLog = false,
    level = process.env.LOG_LEVEL || 'info',
    logDir = 'logs',
    maxSize = '20m',
    maxFiles = '14d',
  } = options || {};

  const transports: winston.transport[] = [consoleTransport];

  if (!disableFileLog && process.env.NODE_ENV !== 'test') {
    // 커스텀 설정으로 파일 트랜스포트 생성
    const customErrorTransport = new DailyRotateFile({
      level: 'error',
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize,
      maxFiles,
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), logFormat),
    });

    const customCombinedTransport = new DailyRotateFile({
      dirname: logDir,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize,
      maxFiles,
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), logFormat),
    });

    transports.push(customErrorTransport, customCombinedTransport);
  }

  // 기본 메타데이터 설정 (serviceName 포함)
  const defaultMeta: Record<string, any> = {};
  if (serviceName) {
    defaultMeta.service = serviceName;
  }

  return {
    level,
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), logFormat),
    defaultMeta,
    transports,
  };
};
