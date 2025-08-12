FROM node:22 AS builder

RUN apt-get update && apt-get upgrade --quiet --assume-yes

WORKDIR /app

#? Use only required files.
COPY package.json package-lock.json /app/
RUN npm ci

COPY react-router.config.ts tsconfig.json tsconfig.node.json vite.config.ts /app/
COPY public /app/public
COPY src /app/src
COPY server /app/server

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm run-script build

COPY storybook-vite.config.ts /app/
COPY .storybook /app/.storybook

RUN npm run storybook-build -- -o storybook-static

FROM node:22 AS dependencies

RUN apt-get update && apt-get upgrade --quiet --assume-yes

WORKDIR /app

#? Use only required files.
COPY package.json package-lock.json /app/
RUN npm ci --omit=dev

FROM node:22-slim

RUN apt-get update && \
	apt-get upgrade --quiet --assume-yes && \
	apt-get install tini && \
	rm -rf /var/lib/apt/lists/*

USER node

WORKDIR /app

COPY package.json package-lock.json server.js /app/
COPY --from=dependencies /app/node_modules /app/node_modules
COPY --from=builder /app/build /app/build
COPY --from=builder /app/storybook-static /app/storybook-static

USER node

ENV PORT=8080

ARG SHORT_SHA
ENV RENKU_UI_SHORT_SHA=$SHORT_SHA

# NOTE: Without tini the node process does not respond to interrupt signals to stop
ENTRYPOINT ["tini", "-g", "--"]
CMD ["node", "/app/server.js"]
