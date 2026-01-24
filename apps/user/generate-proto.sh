#!/bin/bash

# Proto에서 TypeScript 타입 자동 생성 스크립트
# 
# 사용법: ./generate-proto.sh

echo "🔄 Generating TypeScript types from proto files..."

# protoc 설치 확인
if ! command -v protoc &> /dev/null; then
    echo "❌ protoc not found. Install it first:"
    echo "   brew install protobuf  # macOS"
    echo "   apt-get install protobuf-compiler  # Ubuntu"
    exit 1
fi

# ts-proto로 TypeScript 생성
protoc \
  --plugin=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=./src/generated \
  --ts_proto_opt=nestJs=true \
  --ts_proto_opt=addGrpcMetadata=true \
  --ts_proto_opt=addNestjsRestParameter=true \
  --ts_proto_opt=outputServices=grpc-js \
  --proto_path=./proto \
  ./proto/*.proto

echo "✅ TypeScript types generated in src/generated/"

