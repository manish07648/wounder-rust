# Stage 1: Build Stage
FROM node:21 AS backend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Final Light Image
FROM node:21-slim
WORKDIR /app
COPY --from=backend-builder /app .

# .env.docker ko asli .env ki jagah set karo
COPY .env.docker .env

ENV NODE_ENV=production
EXPOSE 8080

CMD ["npm", "start"]
