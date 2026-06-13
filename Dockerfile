FROM node:20-alpine AS frontend-builder
WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine
ENV NODE_ENV=production
RUN apk add --no-cache openssl
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/ ./
RUN npx prisma generate
COPY --from=frontend-builder /build/frontend/dist ./public
EXPOSE 5000
CMD ["sh", "-c", "npx prisma db push && node prisma/seed.js && node server.js"]
