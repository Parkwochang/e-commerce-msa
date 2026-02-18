// packages/proto/src/generate-proto.ts
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const PROTO_DIR = path.join(__dirname, '../proto');
const OUTPUT_DIR = path.join(__dirname, './generated');

async function generateProto() {
  console.log('🔄 Generating TypeScript types from proto files...');

  // protoc 설치 확인
  try {
    const version = execSync('protoc --version', { encoding: 'utf-8' });
    console.log(`📦 Using ${version.trim()}`);
  } catch (error) {
    console.error('❌ protoc not found. Install it first:');
    console.error('');
    console.error('  macOS:    brew install protobuf');
    console.error('  Ubuntu:   sudo apt-get install -y protobuf-compiler');
    console.error('  Windows:  choco install protoc');
    console.error('');
    console.error('Or download from: https://github.com/protocolbuffers/protobuf/releases');
    process.exit(1);
  }

  // 출력 디렉토리 생성
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // proto 파일 목록
  const protoFiles = fs.readdirSync(PROTO_DIR).filter((file) => file.endsWith('.proto'));

  if (protoFiles.length === 0) {
    console.warn('⚠️  No .proto files found in', PROTO_DIR);
    return;
  }

  console.log(`📝 Found ${protoFiles.length} proto files: ${protoFiles.join(', ')}`);

  // ts-proto 플러그인 경로
  const pluginPath = path.join(__dirname, '../node_modules/.bin/protoc-gen-ts_proto');

  // protoc 명령어 구성
  const command = [
    'protoc',
    `--plugin=${pluginPath}`,
    `--ts_proto_out=${OUTPUT_DIR}`,
    '--ts_proto_opt=nestJs=true',
    '--ts_proto_opt=addGrpcMetadata=true',
    '--ts_proto_opt=addNestjsRestParameter=true',
    '--ts_proto_opt=outputServices=grpc-js',
    '--ts_proto_opt=esModuleInterop=true',
    '--ts_proto_opt=usePrototypeForDefaults=true',
    '--ts_proto_opt=useDate=false',
    '--ts_proto_opt=stringEnums=false',
    '--ts_proto_opt=unrecognizedEnum=false',
    `--proto_path=${PROTO_DIR}`,
    ...protoFiles.map((file) => path.join(PROTO_DIR, file)),
  ];

  try {
    console.log('🔨 Running protoc with ts-proto...');
    execSync(command.join(' '), {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    console.log('✅ TypeScript types generated in src/generated/');
  } catch (error) {
    console.error('❌ Failed to generate proto types:', error);
    process.exit(1);
  }
}

// 실행
generateProto().catch((error) => {
  console.error(error);
  process.exit(1);
});
