# ========== BUILD ==========
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_BASE_PATH=/hospital-admissions
# Токен карты Mapbox — подставляется при сборке (CI передаёт из переменных)
ENV NEXT_PUBLIC_MAPBOX_TOKEN=${NEXT_PUBLIC_MAPBOX_TOKEN}
# Сбрасывает кэш слоя сборки при каждом пайплайне (чтобы токен подхватился)
ARG CACHEBUST=1

RUN npm run build

# ========== PRODUCTION ==========
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# standalone server
COPY --from=builder /app/.next/standalone ./
# static assets
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
