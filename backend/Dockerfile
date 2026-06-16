FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies including native builds
RUN npm install --legacy-peer-deps

COPY . .

# Prune dev dependencies for a smaller production image
# RUN npm prune --production --legacy-peer-deps

FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app .

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "src/server.js"]
