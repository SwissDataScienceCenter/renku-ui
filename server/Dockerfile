FROM node:22 AS builder

RUN apt-get update && \
	apt-get upgrade --quiet --assume-yes && \
	rm -rf /var/lib/apt/lists/*

WORKDIR /app

#: Use only required files.
COPY package.json package-lock.json tsconfig.json /app/
COPY src /app/src/

RUN npm install --silent && \
    npm run-script build

FROM node:22-slim

USER root
RUN apt-get update && \
	apt-get upgrade --quiet --assume-yes && \
	apt-get install tini && \
	rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist app/dist
COPY --from=builder /app/node_modules app/node_modules
COPY --from=builder /app/package.json app/package.json

USER node

ARG SHORT_SHA
ENV RENKU_UI_SHORT_SHA=$SHORT_SHA

ENTRYPOINT ["tini", "-g", "--"]
CMD ["node", "--use-openssl-ca", "app"]
