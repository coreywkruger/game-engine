FROM node:10-alpine as dev
WORKDIR /home/node/gameroom-frontend
RUN apk add -U curl make git bind-tools

FROM dev as builder
COPY package.json package-lock.json ./
RUN npm --pure-lockfile
COPY . .
RUN npm run build
