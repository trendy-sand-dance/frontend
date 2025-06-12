# Stage 1: BUILD
FROM node:22-slim AS build-stage

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./

RUN npm install -D 

COPY . .

ARG LISTEN_ADDRESS="0.0.0.0"
ARG LISTEN_PORT=8000

ENV LISTEN_ADDRESS=${LISTEN_ADDRESS}
ENV LISTEN_PORT=${LISTEN_PORT}


ARG GOOGLE_CLIENT_SECRET
ARG GOOGLE_CLIENT_ID

ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}

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
