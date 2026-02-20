export const REDIS_CLIENT = 'REDIS_CLIENT';

export const getRedisToken = (name: string) => `${REDIS_CLIENT}_${name}`;
