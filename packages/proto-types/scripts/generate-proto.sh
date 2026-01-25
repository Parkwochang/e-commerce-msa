#!/bin/bash

# Proto에서 TypeScript 타입 자동 생성 스크립트
# 사용법: pnpm generate

set -e

echo "🔄 Generating TypeScript types from proto files..."

# protoc 설치 확인
if ! command -v protoc &> /dev/null; then
    echo "❌ protoc not found. Install it first:"
    echo ""
    echo "  macOS:    brew install protobuf"
    echo "  Ubuntu:   sudo apt-get install -y protobuf-compiler"
    echo "  Windows:  choco install protoc"
    echo ""
    echo "Or download from: https://github.com/protocolbuffers/protobuf/releases"
    exit 1
fi

PROTOC_VERSION=$(protoc --version)
echo "📦 Using $PROTOC_VERSION"

# 출력 디렉토리 생성
mkdir -p src/generated

# ts-proto로 TypeScript 생성
protoc \
  --plugin=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=./src/generated \
  --ts_proto_opt=nestJs=true \
  --ts_proto_opt=addGrpcMetadata=true \
  --ts_proto_opt=addNestjsRestParameter=true \
  --ts_proto_opt=outputServices=grpc-js \
  --ts_proto_opt=esModuleInterop=true \
  --ts_proto_opt=usePrototypeForDefaults=true \
  --ts_proto_opt=useDate=false \
  --ts_proto_opt=stringEnums=false \
  --ts_proto_opt=unrecognizedEnum=false \
  --proto_path=./proto \
  ./proto/*.proto

echo "✅ TypeScript types generated in src/generated/"

