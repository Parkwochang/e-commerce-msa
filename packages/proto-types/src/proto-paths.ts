/**
 * Proto 파일 경로를 제공하는 유틸리티
 *
 * @example
 * ```typescript
 * import { getProtoPath } from '@repo/proto-types/paths';
 *
 * const protoPath = getProtoPath('user.proto');
 * ```
 */

import { join } from 'path';

/**
 * Proto 파일의 절대 경로를 반환합니다.
 *
 * @param filename - Proto 파일명 (예: 'user.proto')
 * @returns Proto 파일의 절대 경로
 */
export function getProtoPath(filename: string): string {
  // 이 파일이 컴파일되면 dist/proto-paths.js가 됨
  // proto 파일은 dist/../proto/ 위치
  return join(__dirname, '../proto', filename);
}

/**
 * 사용 가능한 모든 proto 파일 경로
 */
export const PROTO_PATHS = {
  USER: getProtoPath('user.proto'),
  ORDER: getProtoPath('order.proto'),
  PRODUCT: getProtoPath('product.proto'),
} as const;
