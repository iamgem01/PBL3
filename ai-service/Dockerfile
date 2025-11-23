FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

RUN npm install mongoose uuid @types/mongoose @types/uuid --save-dev -y || true


COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
RUN npm ci --only=production

RUN npm install uuid

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env* ./

# RUN npm install --omit=dev

EXPOSE 3001
CMD ["node", "dist/index.js"]