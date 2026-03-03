export const TRACE_ID_FALLBACK = '-';
export const MAX_STRINGIFIED_LENGTH = 4000;
export const MAX_SERIALIZE_DEPTH = 6;

export const SENSITIVE_KEYS = [
  'password',
  'passwd',
  'pwd',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'cookie',
  'set-cookie',
];

export const customColors = {
  error: 'bold red',
  warn: 'bold yellow',
  info: 'bold cyan',
  http: 'bold magenta',
  verbose: 'bold white',
  debug: 'bold blue',
  silly: 'bold gray',
};

export const levelEmoji: Record<string, string> = {
  error: '❌',
  warn: '⚠️ ',
  info: '📘',
  http: '🌐',
  verbose: '💬',
  debug: '🐛',
  silly: '🎭',
};
