# Multi-stage build: React (Node) + Deno

# Stage 1: Build React app
FROM node:22-alpine AS react-build
WORKDIR /react-app
COPY react-app/package.json react-app/yarn.lock react-app/.yarn/ ./
RUN corepack enable && corepack prepare yarn@4.6.0 --activate
RUN yarn install --immutable
COPY react-app/ ./
RUN yarn build

# Stage 2: Deno app
FROM denoland/deno:alpine
WORKDIR /app
COPY . .
# Copy built React app from previous stage
COPY --from=react-build /react-app/build ./react-app/build
RUN deno cache --allow-import server.ts
EXPOSE 8000
CMD ["run", "--allow-all", "server.ts"]
