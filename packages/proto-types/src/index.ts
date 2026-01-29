/**
 * @repo/proto-types
 *
 * 모든 gRPC 서비스의 Protocol Buffer 정의와 생성된 TypeScript 타입을 제공합니다.
 *
 * @example
 * ```typescript
 * import { User, PROTO_PATHS } from '@repo/proto-types';
 * ```
 */

// Export type namespaces
export * as User from './generated/user';
export * as Order from './generated/order';
export * as Product from './generated/product';

// Export proto file paths
export { PROTO_PATHS, getProtoPath } from './proto-paths';
