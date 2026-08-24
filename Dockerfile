FROM node:20-alpine AS builder

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

ENV DATABASE_URL="file:./dev.db"

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV DATABASE_URL="file:./dev.db"
ENV LLM_PROVIDER="gemini"
ENV JWT_SECRET="super-secret-jwt-key-change-in-production-12345"

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["sh", "-c", "export DATABASE_URL=file:./dev.db; npx prisma db push && node dist/server/seed.js && node dist/server/index.js"]
