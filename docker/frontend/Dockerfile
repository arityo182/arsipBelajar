# ================================================================
# docker/frontend/Dockerfile
# SIPLOK Frontend: Next.js Multi-Stage Build (Node 20 Alpine)
# ================================================================

# --- STAGE 1: Dependencies & Builder ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependensi sistem yang dibutuhkan untuk build native
RUN apk add --no-cache libc6-compat

# Salin package.json & lockfile
COPY package*.json ./

# Install dependensi persis sesuai package-lock.json jika ada
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Salin seluruh source code frontend
COPY . .

# Hapus folder Laravel backend agar Next.js mendeteksi src/app dengan tepat
RUN rm -rf app bootstrap config database routes tests vendor artisan composer.*

# Nonaktifkan telemetri Next.js saat build
ENV NEXT_TELEMETRY_DISABLED=1

# Injeksi base API URL saat build (default /api agar kompatibel dengan Nginx reverse proxy)
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Jalankan build produksi Next.js
RUN npm run build

# --- STAGE 2: Production Runner ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Buat non-root user demi standar keamanan
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Salin public static assets & standalone build dari stage builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Jalankan Next.js server standalone jika server.js ada, atau fallback ke node server
CMD ["node", "server.js"]
