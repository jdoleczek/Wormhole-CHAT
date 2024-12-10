FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
COPY . .

RUN npm install && npm run build

FROM node:20 AS runner

RUN npm install -g pm2

WORKDIR /app
COPY --from=builder /app/.output ./
COPY pm2.config.js /app/pm2.config.js

CMD ["pm2-runtime", "pm2.config.js"]
