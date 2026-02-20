#!/usr/bin/env node

/**
 * 새로운 패키지 생성 스크립트
 *
 * 사용법:
 *   node scripts/create-package.js
 *   또는
 *   pnpm create-package
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

// 패키지 타입 옵션
const PACKAGE_TYPES = {
  1: {
    name: 'Common (유틸리티)',
    type: 'common',
    description: '공통 유틸리티, 타입, 헬퍼 함수',
    dependencies: {},
  },
  2: {
    name: 'Config (설정)',
    type: 'config',
    description: '설정 모듈 (Auth, gRPC 등)',
    dependencies: {
      '@nestjs/common': 'catalog:nestjs',
      '@nestjs/core': 'catalog:nestjs',
    },
  },
  3: {
    name: 'NestJS Module (모듈)',
    type: 'module',
    description: 'NestJS 모듈 패키지 (Logger, Database 등)',
    dependencies: {
      '@nestjs/common': 'catalog:nestjs',
      '@nestjs/core': 'catalog:nestjs',
    },
  },
  4: {
    name: 'Custom (커스텀)',
    type: 'custom',
    description: '커스텀 패키지 (수동 설정)',
    dependencies: {},
  },
};

// 템플릿 생성 함수들
function createPackageJson(packageName, packageType, packageDescription) {
  const packageTypeConfig = PACKAGE_TYPES[packageType];
  const baseDeps = packageTypeConfig.dependencies || {};

  const devDependencies = {
    '@repo/typescript-config': 'workspace:*',
    '@types/node': '^22.10.7',
    typescript: 'catalog:',
  };

  // NestJS 모듈인 경우 peerDependencies 추가
  const peerDependencies =
    packageTypeConfig.type === 'module' || packageTypeConfig.type === 'config'
      ? {
          '@nestjs/common': '^11.0.0',
          '@nestjs/core': '^11.0.0',
        }
      : {};

  return {
    name: `@repo/${packageName}`,
    version: '0.0.0',
    private: true,
    description: packageDescription || `${packageName} package`,
    main: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': {
        types: './dist/index.d.ts',
        default: './dist/index.js',
        require: './dist/index.js',
      },
    },
    scripts: {
      build: 'tsc --build',
      dev: 'tsc --build --watch',
      clean: 'rm -rf dist',
      'check-types': 'tsc --noEmit',
    },
    dependencies: baseDeps,
    devDependencies,
    ...(Object.keys(peerDependencies).length > 0 && { peerDependencies }),
  };
}

function createTsConfig() {
  return {
    extends: '@repo/typescript-config/nestjs',
    compilerOptions: {
      composite: true,
      rootDir: './src',
      outDir: './dist',
    },
    include: ['src/**/*'],
    exclude: ['dist', 'build', 'node_modules'],
  };
}

function createIndexTs(packageName, packageType) {
  const packageTypeConfig = PACKAGE_TYPES[packageType];

  if (packageTypeConfig.type === 'common') {
    return `/**
 * @repo/${packageName}
 * 
 * 공통으로 사용되는 유틸리티, 타입, 헬퍼 함수들을 제공합니다.
 */

export * from './types';
export * from './utils';
`;
  }

  if (packageTypeConfig.type === 'module') {
    return `/**
 * @repo/${packageName}
 * 
 * NestJS 모듈 패키지
 */

export * from './${packageName}.module';
`;
  }

  return `/**
 * @repo/${packageName}
 * 
 * ${packageTypeConfig.description}
 */

// Export your modules here
export * from './index';
`;
}

function createTypesIndex() {
  return `/**
 * 공통 타입 정의
 */

// Add your types here
export type ExampleType = {
  id: string;
  name: string;
};
`;
}

function createUtilsIndex() {
  return `/**
 * 공통 유틸리티 함수
 */

// Add your utility functions here
export function exampleUtil() {
  return 'example';
}
`;
}

function createModuleFile(packageName) {
  return `import { Module, Global } from '@nestjs/common';

@Global()
@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class ${toPascalCase(packageName)}Module {
  static forRoot(options?: any) {
    return {
      module: ${toPascalCase(packageName)}Module,
      providers: [
        // Add your providers here
      ],
      exports: [
        // Add your exports here
      ],
    };
  }
}
`;
}

function toPascalCase(str) {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-');
}

async function main() {
  try {
    log('\n📦 패키지 생성 스크립트', 'bright');
    log('='.repeat(50), 'cyan');

    // 패키지 이름 입력
    const packageNameInput = await question('\n패키지 이름을 입력하세요 (예: database, auth-utils): ');
    const packageName = toKebabCase(packageNameInput.trim());

    if (!packageName) {
      log('❌ 패키지 이름이 필요합니다.', 'red');
      process.exit(1);
    }

    // 패키지 설명 입력
    const packageDescription = await question('패키지 설명을 입력하세요 (선택사항): ');

    // 패키지 타입 선택
    log('\n패키지 타입을 선택하세요:', 'yellow');
    Object.entries(PACKAGE_TYPES).forEach(([key, value]) => {
      log(`  ${key}. ${value.name} - ${value.description}`, 'cyan');
    });

    const packageTypeInput = await question('\n선택 (1-4): ');
    const packageType = packageTypeInput.trim();

    if (!PACKAGE_TYPES[packageType]) {
      log('❌ 유효하지 않은 선택입니다.', 'red');
      process.exit(1);
    }

    const packageTypeConfig = PACKAGE_TYPES[packageType];

    // 패키지 디렉토리 경로
    const packagesDir = path.join(process.cwd(), 'packages');
    const packageDir = path.join(packagesDir, packageName);

    // 디렉토리 존재 확인
    if (fs.existsSync(packageDir)) {
      log(`❌ 패키지 '${packageName}'가 이미 존재합니다.`, 'red');
      process.exit(1);
    }

    log(`\n📁 패키지 생성 중: ${packageName}`, 'green');
    log(`   타입: ${packageTypeConfig.name}`, 'cyan');
    log(`   경로: ${packageDir}`, 'cyan');

    // 디렉토리 생성
    fs.mkdirSync(packageDir, { recursive: true });
    fs.mkdirSync(path.join(packageDir, 'src'), { recursive: true });

    // package.json 생성
    const packageJson = createPackageJson(packageName, packageType, packageDescription);
    fs.writeFileSync(path.join(packageDir, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n');

    // tsconfig.json 생성
    const tsConfig = createTsConfig();
    fs.writeFileSync(path.join(packageDir, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2) + '\n');

    // src/index.ts 생성
    const indexContent = createIndexTs(packageName, packageType);
    fs.writeFileSync(path.join(packageDir, 'src', 'index.ts'), indexContent);

    // 타입별 추가 파일 생성
    if (packageTypeConfig.type === 'common') {
      fs.mkdirSync(path.join(packageDir, 'src', 'types'), { recursive: true });
      fs.mkdirSync(path.join(packageDir, 'src', 'utils'), { recursive: true });

      fs.writeFileSync(path.join(packageDir, 'src', 'types', 'index.ts'), createTypesIndex());
      fs.writeFileSync(path.join(packageDir, 'src', 'utils', 'index.ts'), createUtilsIndex());
    }

    if (packageTypeConfig.type === 'module') {
      const moduleFileName = `${packageName}.module.ts`;
      fs.writeFileSync(path.join(packageDir, 'src', moduleFileName), createModuleFile(packageName));
    }

    // .gitignore 생성
    const gitignore = `node_modules
dist
*.tsbuildinfo
.DS_Store
`;
    fs.writeFileSync(path.join(packageDir, '.gitignore'), gitignore);

    // README.md 생성
    const readme = `# @repo/${packageName}

${packageDescription || packageTypeConfig.description}

## 설치

\`\`\`bash
pnpm add @repo/${packageName}
\`\`\`

## 사용법

\`\`\`typescript
import { ... } from '@repo/${packageName}';
\`\`\`

## 개발

\`\`\`bash
# 빌드
pnpm build

# 개발 모드 (watch)
pnpm dev

# 타입 체크
pnpm check-types
\`\`\`
`;
    fs.writeFileSync(path.join(packageDir, 'README.md'), readme);

    log('\n✅ 패키지가 성공적으로 생성되었습니다!', 'green');
    log(`\n📝 다음 단계:`, 'yellow');
    log(`   1. cd packages/${packageName}`, 'cyan');
    log(`   2. pnpm install`, 'cyan');
    log(`   3. 코드 작성 후 pnpm build`, 'cyan');
    log(`   4. 다른 서비스에서 사용: pnpm add @repo/${packageName}`, 'cyan');

    // pnpm install 실행 여부 확인
    const shouldInstall = await question('\n지금 의존성을 설치하시겠습니까? (y/n): ');
    if (shouldInstall.toLowerCase() === 'y' || shouldInstall.toLowerCase() === 'yes') {
      log('\n📦 의존성 설치 중...', 'yellow');
      try {
        execSync('pnpm install', {
          cwd: packageDir,
          stdio: 'inherit',
        });
        log('✅ 의존성 설치 완료!', 'green');
      } catch (error) {
        log('⚠️  의존성 설치 중 오류가 발생했습니다. 수동으로 설치해주세요.', 'yellow');
      }
    }

    log('\n🎉 완료!', 'green');
  } catch (error) {
    log(`\n❌ 오류 발생: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// 스크립트 실행
main();
