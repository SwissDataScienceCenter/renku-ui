FROM node:10.22-alpine as builder

WORKDIR /app

#: Use only required files.
COPY package.json package-lock.json tsconfig.json /app/
COPY src /app/src/

# ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm install --silent && \
    npm run-script build

FROM mhart/alpine-node:slim-10.22

COPY --from=builder /app/dist app/dist
COPY --from=builder /app/node_modules app/node_modules
COPY --from=builder /app/package.json app/package.json
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

# HEALTHCHECK --interval=20s --timeout=10s --retries=5 CMD test -e /var/run/nginx.pid

ENTRYPOINT ["/bin/sh", "/app/docker-entrypoint.sh"]
CMD ["node", "app"]
