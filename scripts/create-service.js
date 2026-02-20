#!/usr/bin/env node

/**
 * 새로운 마이크로서비스 생성 스크립트
 *
 * 사용법:
 *   node scripts/create-service.js
 *   또는
 *   pnpm create-service
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

// 서비스 타입 옵션
const SERVICE_TYPES = {
  1: {
    name: 'Gateway (REST API)',
    type: 'gateway',
    description: 'HTTP REST API 서버 (클라이언트용)',
    port: 3000,
  },
  2: {
    name: 'Microservice (gRPC)',
    type: 'grpc-microservice',
    description: 'gRPC 마이크로서비스 (내부 통신용, 고성능)',
    port: 5000,
  },
  3: {
    name: 'Microservice (TCP)',
    type: 'tcp-microservice',
    description: 'TCP 마이크로서비스 (내부 통신용, 간단)',
    port: 4000,
  },
};

// 템플릿 생성 함수들
function createPackageJson(serviceName, serviceType) {
  const isGrpc = serviceType === 'grpc-microservice';
  const isMicroservice = serviceType !== 'gateway';

  const dependencies = {
    '@nestjs/common': 'catalog:nestjs',
    '@nestjs/core': 'catalog:nestjs',
    '@nestjs/platform-express': 'catalog:nestjs',
    'reflect-metadata': 'catalog:nestjs',
    rxjs: 'catalog:',
  };

  if (isMicroservice) {
    dependencies['@nestjs/microservices'] = 'catalog:nestjs';
    dependencies['@nestjs/config'] = 'catalog:nestjs';
  }

  if (isGrpc) {
    dependencies['@grpc/grpc-js'] = 'catalog:grpc';
    dependencies['@grpc/proto-loader'] = 'catalog:grpc';
  }

  return {
    name: serviceName,
    version: '0.0.1',
    description: `${serviceName} microservice`,
    author: '',
    private: true,
    license: 'UNLICENSED',
    scripts: {
      build: 'nest build',
      format: 'prettier --write "src/**/*.ts" "test/**/*.ts"',
      start: 'nest start',
      'start:dev': 'nest start --watch',
      'start:debug': 'nest start --debug --watch',
      'start:prod': 'node dist/main',
      lint: 'eslint "{src,apps,libs,test}/**/*.ts" --fix',
      test: 'jest',
      'test:watch': 'jest --watch',
      'test:cov': 'jest --coverage',
      'test:debug':
        'node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand',
      'test:e2e': 'jest --config ./test/jest-e2e.json',
    },
    dependencies,
    devDependencies: {
      '@eslint/eslintrc': '^3.2.0',
      '@eslint/js': '^9.18.0',
      '@nestjs/cli': '^11.0.0',
      '@nestjs/schematics': '^11.0.0',
      '@nestjs/testing': '^11.0.1',
      '@swc/cli': '^0.6.0',
      '@swc/core': '^1.10.7',
      '@types/express': '^5.0.0',
      '@types/jest': '^29.5.14',
      '@types/node': '^22.10.7',
      '@types/supertest': '^6.0.2',
      eslint: '^9.18.0',
      'eslint-config-prettier': '^10.0.1',
      'eslint-plugin-prettier': '^5.2.2',
      globals: '^16.0.0',
      jest: '^29.7.0',
      prettier: '^3.4.2',
      'source-map-support': '^0.5.21',
      supertest: '^7.0.0',
      'ts-jest': '^29.2.5',
      'ts-loader': '^9.5.2',
      'ts-node': '^10.9.2',
      'tsconfig-paths': '^4.2.0',
      typescript: 'catalog:typescript',
      'typescript-eslint': '^8.20.0',
    },
    jest: {
      moduleFileExtensions: ['js', 'json', 'ts'],
      rootDir: 'src',
      testRegex: '.*\\.spec\\.ts$',
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      collectCoverageFrom: ['**/*.(t|j)s'],
      coverageDirectory: '../coverage',
      testEnvironment: 'node',
    },
  };
}

function createMainTs(serviceType, port) {
  if (serviceType === 'gateway') {
    return `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS 설정
  app.enableCors();
  
  const port = process.env.PORT || ${port};
  await app.listen(port);
  
  console.log(\`🚀 Gateway is running on: http://localhost:\${port}\`);
}
bootstrap();
`;
  }

  if (serviceType === 'grpc-microservice') {
    return `import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'service',
        protoPath: join(__dirname, '../proto/service.proto'),
        url: process.env.SERVICE_URL || '0.0.0.0:${port}',
        maxReceiveMessageLength: 1024 * 1024 * 10, // 10MB
        maxSendMessageLength: 1024 * 1024 * 10,
      },
    },
  );

  await app.listen();
  console.log(\`🚀 gRPC Microservice is running on port ${port}\`);
}
bootstrap();
`;
  }

  // TCP Microservice
  return `import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.SERVICE_HOST || '0.0.0.0',
        port: parseInt(process.env.SERVICE_PORT) || ${port},
      },
    },
  );

  await app.listen();
  console.log(\`🚀 TCP Microservice is running on port ${port}\`);
}
bootstrap();
`;
}

function createAppModule(serviceType) {
  return `import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
`;
}

function createAppController(serviceType) {
  if (serviceType === 'gateway') {
    return `import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
`;
  }

  if (serviceType === 'grpc-microservice') {
    return `import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('ServiceName', 'GetMessage')
  getMessage(data: any) {
    return this.appService.getMessage(data);
  }

  @GrpcMethod('ServiceName', 'HealthCheck')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
`;
  }

  // TCP Microservice
  return `import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('get_message')
  getMessage(data: any) {
    return this.appService.getMessage(data);
  }

  @MessagePattern('health_check')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
`;
}

function createAppService(serviceType) {
  if (serviceType === 'gateway') {
    return `import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello from Gateway!';
  }
}
`;
  }

  return `import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getMessage(data: any) {
    return {
      message: 'Hello from Microservice!',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
`;
}

function createAppControllerSpec() {
  return `import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });
  });
});
`;
}

function createE2ETest(serviceName) {
  return `import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200);
  });
});
`;
}

function createJestE2EJson() {
  return {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testEnvironment: 'node',
    testRegex: '.e2e-spec.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
  };
}

function createTsConfig() {
  return {
    compilerOptions: {
      module: 'commonjs',
      declaration: true,
      removeComments: true,
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      allowSyntheticDefaultImports: true,
      target: 'ES2023',
      sourceMap: true,
      outDir: './dist',
      baseUrl: './',
      incremental: true,
      skipLibCheck: true,
      strictNullChecks: true,
      forceConsistentCasingInFileNames: true,
      noImplicitAny: false,
      strictBindCallApply: false,
      noFallthroughCasesInSwitch: false,
    },
  };
}

function createTsConfigBuild() {
  return {
    extends: './tsconfig.json',
    exclude: ['node_modules', 'test', 'dist', '**/*spec.ts'],
  };
}

function createNestCliJson() {
  return {
    $schema: 'https://json.schemastore.org/nest-cli',
    collection: '@nestjs/schematics',
    sourceRoot: 'src',
    compilerOptions: {
      deleteOutDir: true,
    },
  };
}

function createEslintConfig() {
  return `import eslintJs from '@eslint/js';
import tsEslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  eslintJs.configs.recommended,
  ...tsEslint.configs.recommended,
  prettierConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
`;
}

function createProtoFile(serviceName) {
  return `syntax = "proto3";

package service;

service ServiceName {
  rpc GetMessage (MessageRequest) returns (MessageResponse);
  rpc HealthCheck (Empty) returns (HealthResponse);
}

message Empty {}

message MessageRequest {
  string id = 1;
  string message = 2;
}

message MessageResponse {
  string message = 1;
  string timestamp = 2;
}

message HealthResponse {
  string status = 1;
  string timestamp = 2;
}
`;
}

function createReadme(serviceName, serviceType, port) {
  const typeInfo = SERVICE_TYPES[Object.keys(SERVICE_TYPES).find((k) => SERVICE_TYPES[k].type === serviceType)];

  return `# ${serviceName}

${typeInfo.description}

## 설명

이 서비스는 ${typeInfo.name} 타입으로 생성되었습니다.

## 실행 방법

\`\`\`bash
# 개발 모드
pnpm start:dev

# 프로덕션 빌드
pnpm build

# 프로덕션 실행
pnpm start:prod
\`\`\`

## 테스트

\`\`\`bash
# 단위 테스트
pnpm test

# e2e 테스트
pnpm test:e2e

# 테스트 커버리지
pnpm test:cov
\`\`\`

## 환경 변수

${serviceType === 'gateway' ? `- \`PORT\`: 서버 포트 (기본값: ${port})` : ''}
${serviceType === 'grpc-microservice' ? `- \`SERVICE_URL\`: gRPC 서비스 URL (기본값: 0.0.0.0:${port})` : ''}
${serviceType === 'tcp-microservice' ? `- \`SERVICE_HOST\`: TCP 호스트 (기본값: 0.0.0.0)\n- \`SERVICE_PORT\`: TCP 포트 (기본값: ${port})` : ''}

## 포트

- ${serviceType === 'gateway' ? 'HTTP' : serviceType === 'grpc-microservice' ? 'gRPC' : 'TCP'} 포트: ${port}
`;
}

function createEnvFile(serviceType, port) {
  if (serviceType === 'gateway') {
    return `PORT=${port}
NODE_ENV=development
`;
  }

  if (serviceType === 'grpc-microservice') {
    return `SERVICE_URL=0.0.0.0:${port}
NODE_ENV=development
`;
  }

  return `SERVICE_HOST=0.0.0.0
SERVICE_PORT=${port}
NODE_ENV=development
`;
}

async function createService() {
  log('\n🚀 NestJS 마이크로서비스 생성기\n', 'bright');

  // 1. 서비스 이름 입력
  const serviceName = await question(colors.cyan + '서비스 이름을 입력하세요 (예: user-service): ' + colors.reset);

  if (!serviceName || serviceName.trim() === '') {
    log('❌ 서비스 이름을 입력해주세요.', 'red');
    rl.close();
    return;
  }

  // 서비스 이름 검증 (kebab-case)
  if (!/^[a-z][a-z0-9-]*$/.test(serviceName)) {
    log('❌ 서비스 이름은 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다. (예: user-service)', 'red');
    rl.close();
    return;
  }

  // 2. 서비스 타입 선택
  log('\n서비스 타입을 선택하세요:', 'cyan');
  Object.entries(SERVICE_TYPES).forEach(([key, value]) => {
    log(`  ${key}. ${value.name} - ${value.description}`, 'yellow');
  });

  const typeChoice = await question(colors.cyan + '\n선택 (1-3): ' + colors.reset);

  const selectedType = SERVICE_TYPES[typeChoice];
  if (!selectedType) {
    log('❌ 올바른 선택지를 입력해주세요 (1-3)', 'red');
    rl.close();
    return;
  }

  // 3. 포트 번호 입력
  const defaultPort = selectedType.port;
  const portInput = await question(colors.cyan + `포트 번호 (기본값: ${defaultPort}): ` + colors.reset);
  const port = portInput.trim() === '' ? defaultPort : parseInt(portInput);

  if (isNaN(port) || port < 1 || port > 65535) {
    log('❌ 올바른 포트 번호를 입력해주세요 (1-65535)', 'red');
    rl.close();
    return;
  }

  // 4. 확인
  log('\n📋 설정 확인:', 'bright');
  log(`  서비스 이름: ${serviceName}`, 'green');
  log(`  서비스 타입: ${selectedType.name}`, 'green');
  log(`  포트: ${port}`, 'green');
  log(`  경로: apps/${serviceName}\n`, 'green');

  const confirm = await question(colors.cyan + '생성하시겠습니까? (y/n): ' + colors.reset);

  if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
    log('❌ 취소되었습니다.', 'yellow');
    rl.close();
    return;
  }

  // 5. 서비스 생성
  try {
    log('\n🔨 서비스 생성 중...\n', 'bright');

    const projectRoot = path.join(__dirname, '..');
    const servicePath = path.join(projectRoot, 'apps', serviceName);

    // 디렉토리 존재 확인
    if (fs.existsSync(servicePath)) {
      log(`❌ 서비스가 이미 존재합니다: apps/${serviceName}`, 'red');
      rl.close();
      return;
    }

    // 디렉토리 생성
    log('📁 디렉토리 생성 중...', 'blue');
    fs.mkdirSync(servicePath, { recursive: true });
    fs.mkdirSync(path.join(servicePath, 'src'), { recursive: true });
    fs.mkdirSync(path.join(servicePath, 'test'), { recursive: true });

    if (selectedType.type === 'grpc-microservice') {
      fs.mkdirSync(path.join(servicePath, 'proto'), { recursive: true });
    }

    // 파일 생성
    log('📝 파일 생성 중...', 'blue');

    // package.json
    fs.writeFileSync(
      path.join(servicePath, 'package.json'),
      JSON.stringify(createPackageJson(serviceName, selectedType.type), null, 2),
    );

    // tsconfig.json
    fs.writeFileSync(path.join(servicePath, 'tsconfig.json'), JSON.stringify(createTsConfig(), null, 2));

    // tsconfig.build.json
    fs.writeFileSync(path.join(servicePath, 'tsconfig.build.json'), JSON.stringify(createTsConfigBuild(), null, 2));

    // nest-cli.json
    fs.writeFileSync(path.join(servicePath, 'nest-cli.json'), JSON.stringify(createNestCliJson(), null, 2));

    // eslint.config.mjs
    fs.writeFileSync(path.join(servicePath, 'eslint.config.mjs'), createEslintConfig());

    // .env
    fs.writeFileSync(path.join(servicePath, '.env'), createEnvFile(selectedType.type, port));

    // README.md
    fs.writeFileSync(path.join(servicePath, 'README.md'), createReadme(serviceName, selectedType.type, port));

    // src/main.ts
    fs.writeFileSync(path.join(servicePath, 'src', 'main.ts'), createMainTs(selectedType.type, port));

    // src/app.module.ts
    fs.writeFileSync(path.join(servicePath, 'src', 'app.module.ts'), createAppModule(selectedType.type));

    // src/app.controller.ts
    fs.writeFileSync(path.join(servicePath, 'src', 'app.controller.ts'), createAppController(selectedType.type));

    // src/app.service.ts
    fs.writeFileSync(path.join(servicePath, 'src', 'app.service.ts'), createAppService(selectedType.type));

    // src/app.controller.spec.ts
    fs.writeFileSync(path.join(servicePath, 'src', 'app.controller.spec.ts'), createAppControllerSpec());

    // test/app.e2e-spec.ts
    fs.writeFileSync(path.join(servicePath, 'test', 'app.e2e-spec.ts'), createE2ETest(serviceName));

    // test/jest-e2e.json
    fs.writeFileSync(path.join(servicePath, 'test', 'jest-e2e.json'), JSON.stringify(createJestE2EJson(), null, 2));

    // proto 파일 (gRPC인 경우)
    if (selectedType.type === 'grpc-microservice') {
      fs.writeFileSync(path.join(servicePath, 'proto', 'service.proto'), createProtoFile(serviceName));
      log('📄 Proto 파일 생성 완료', 'green');
    }

    log('\n✅ 서비스 생성 완료!', 'bright');
    log('\n다음 단계:', 'cyan');
    log(`  1. cd apps/${serviceName}`, 'yellow');
    log(`  2. pnpm install`, 'yellow');
    log(`  3. pnpm start:dev`, 'yellow');
    log(`\n또는 루트에서:`, 'cyan');
    log(`  turbo run dev --filter=${serviceName}`, 'yellow');

    if (selectedType.type === 'grpc-microservice') {
      log(`\n⚠️  gRPC 서비스는 proto 파일을 수정해야 합니다:`, 'yellow');
      log(`  apps/${serviceName}/proto/service.proto`, 'yellow');
    }

    log(`\n포트: ${port}`, 'green');
  } catch (error) {
    log(`\n❌ 에러 발생: ${error.message}`, 'red');
    console.error(error);
  }

  rl.close();
}

// 스크립트 실행
createService();
