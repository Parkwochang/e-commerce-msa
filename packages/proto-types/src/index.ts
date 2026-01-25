/**
 * @repo/proto-types
 * 
 * 모든 gRPC 서비스의 Protocol Buffer 정의와 생성된 TypeScript 타입을 제공합니다.
 * 
 * @example
 * ```typescript
 * import { UserServiceClient, CreateUserRequest } from '@repo/proto-types';
 * ```
 */

// Re-export all types from generated files
export * from './generated/user';
export * from './generated/order';
export * from './generated/product';
