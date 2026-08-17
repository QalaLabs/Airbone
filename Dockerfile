# ├── deps ──────────────────────────────────────────────────────────────
FROM node:20-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ├── build ─────────────────────────────────────────────────────────────
FROM node:20-slim AS build
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Standalone output (output: "standalone" in next.config.js)
RUN npm run build

# ├── runner ────────────────────────────────────────────────────────────
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# The standalone server needs its minified .next output.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

# Run as an unprivileged user.
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 nextjs \
  && chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
