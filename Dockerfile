# Stage 1: BUILD
FROM node:22-slim AS build-stage

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./

RUN npm install -D 

COPY . .

#RUN apt-get update -y && apt-get install -y openssl

ARG LISTEN_ADDRESS="0.0.0.0"
ARG LISTEN_PORT=8000

ENV LISTEN_ADDRESS=${LISTEN_ADDRESS}
ENV LISTEN_PORT=${LISTEN_PORT}
#ENV NODE_EXTRA_CA_CERTS=/setup/server.crt
#ENV NODE_TLS_REJECT_UNAUTHORIZED=0

RUN npm run build:server

# Stage 2: FIGHT (production)
FROM node:22-slim AS production

WORKDIR /app

COPY --from=build-stage /app/package*.json ./

RUN npm install --only=production

COPY --from=build-stage /app/dist ./dist

CMD ["npm", "run", "start"]


# Stage 2: EXPERIMENT (development)
FROM build-stage AS development


CMD ["npm", "run", "dev:full"]
