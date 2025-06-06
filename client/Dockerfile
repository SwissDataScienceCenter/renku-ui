FROM node:22 AS builder

RUN apt-get update && apt-get upgrade --quiet --assume-yes

WORKDIR /app

#? Use only required files.
COPY package.json package-lock.json /app/
RUN npm ci

COPY index.html tsconfig.json tsconfig.node.json vite.config.ts /app/
COPY public /app/public
COPY app /app/app/

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm run-script build

COPY vite.storybook.config.ts /app/
COPY .storybook /app/.storybook

RUN npm run storybook-build -- -o storybook-static

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/build /app/build
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
COPY scripts/generate_sitemap.sh /app/scripts/generate_sitemap.sh

# Set up the config files written by docker-entrypoint
USER root
RUN touch /app/build/client/config.json
RUN chmod a+r /app/build/client/config.json
RUN chown node /app/build/client/config.json

RUN touch /app/build/client/robots.txt
RUN chmod a+r /app/build/client/robots.txt
RUN chown node /app/build/client/robots.txt

RUN touch /app/build/client/sitemap.xml
RUN chmod a+r /app/build/client/sitemap.xml
RUN chown node /app/build/client/sitemap.xml

RUN touch /app/build/client/privacy-statement.md
RUN chmod a+r /app/build/client/privacy-statement.md
RUN chown node /app/build/client/privacy-statement.md

RUN touch /app/build/client/terms-of-use.md
RUN chmod a+r /app/build/client/terms-of-use.md
RUN chown node /app/build/client/terms-of-use.md

USER node

ARG SHORT_SHA
ENV RENKU_UI_SHORT_SHA=$SHORT_SHA

ARG PORT="3000"
ENV PORT=$PORT

ENTRYPOINT ["/bin/sh", "/app/docker-entrypoint.sh"]
CMD ["npm", "run-script", "serve", "/app/build/server/index.js"]
