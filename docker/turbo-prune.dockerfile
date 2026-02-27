FROM node:22-alpine AS base

WORKDIR /app

ARG APP_NAME
ENV APP_NAME=${APP_NAME} \
    PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH

RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

FROM base AS installer

RUN apk add --no-cache libc6-compat && \
    apk add --no-cache --virtual .build-deps build-base python3

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY json/ ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile

COPY full/ ./

# Prisma generate
RUN pnpm ${APP_NAME} schema

# build (특정 서비스만)
RUN pnpm --filter ${APP_NAME} run build

FROM node:22-alpine AS runner

WORKDIR /app

ARG APP_NAME
ENV APP_NAME=${APP_NAME} \
    NODE_ENV=production

USER node

COPY --from=installer --chown=node:node /app/apps/${APP_NAME}/package.json ./apps/${APP_NAME}/package.json
COPY --from=installer --chown=node:node /app/apps/${APP_NAME}/dist ./apps/${APP_NAME}/dist
COPY --from=installer --chown=node:node /app/node_modules ./node_modules

WORKDIR /app/apps/${APP_NAME}
CMD ["node", "dist/main.js"]
