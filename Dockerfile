# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --chown=node:node . .
USER node

EXPOSE 3000

CMD ["node", "server.js"]
