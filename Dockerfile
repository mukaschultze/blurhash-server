# Builder
FROM node:lts-alpine AS builder
WORKDIR /var/server

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean

COPY . .

RUN yarn build

# Runner
FROM node:lts-alpine AS runner
WORKDIR /var/server

COPY package.json yarn.lock ./
ARG NODE_ENV=production
ENV NODE_ENV=production

RUN yarn install --frozen-lockfile --production=true && yarn cache clean

COPY --from=builder /var/server/dist/ ./

RUN adduser -S server
USER server

EXPOSE 3000

ENTRYPOINT [ "node", "main.js" ]