FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Production Server using Nginx
FROM nginx:alpine

# Copy the built React app from the builder stage
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Copy our custom Nginx config to handle React Router and PWA caching
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
