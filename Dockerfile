FROM node:16-alpine  as builder

WORKDIR /source

COPY . .
RUN  yarn install
RUN  yarn build

FROM node:16-alpine as final
WORKDIR /app

COPY --from=builder /source/package.json ./
COPY --from=builder /source/dist ./dist
COPY --from=builder /source/node_modules ./node_modules

ENV NODE_ENV=production

CMD [ "node","dist/main" ]

