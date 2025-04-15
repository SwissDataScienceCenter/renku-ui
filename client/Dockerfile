# syntax=docker/dockerfile:1
FROM node:22 AS builder

RUN <<EOT bash
    set -ex
    apt-get update
    apt-get upgrade --quiet --assume-yes
EOT

WORKDIR /app

#? Use only required files.
COPY package.json package-lock.json /app/
RUN npm ci

COPY index.html tsconfig.json tsconfig.node.json vite.config.ts /app/
COPY public /app/public
COPY src /app/src/

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm run-script build

COPY .storybook /app/.storybook

RUN npm run storybook-build -- -o storybook-static

FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY --from=builder --chown=root:root /app/build /usr/share/nginx/html
COPY --from=builder --chown=root:root /app/storybook-static /usr/share/nginx/html/storybook
COPY --chown=nginx:root nginx.vh.default.conf /etc/nginx/conf.d/default.conf
COPY --chown=root:root --chmod=755 docker-entrypoint.sh /app/docker-entrypoint.sh
COPY --chown=root:root --chmod=755 scripts/generate_sitemap.sh /app/scripts/generate_sitemap.sh

# Set up the config files written by docker-entrypoint
USER root

RUN <<EOT ash
  set -ex

  touch /usr/share/nginx/html/config.json
  chown nginx:root /usr/share/nginx/html/config.json
  chmod a+rw /usr/share/nginx/html/config.json

  touch /usr/share/nginx/html/robots.txt
  chown nginx:root /usr/share/nginx/html/robots.txt
  chmod a+rw /usr/share/nginx/html/robots.txt

  touch /usr/share/nginx/html/sitemap.xml
  chown nginx:root /usr/share/nginx/html/sitemap.xml
  chmod a+rw /usr/share/nginx/html/sitemap.xml

  touch /usr/share/nginx/html/privacy-statement.md
  chown nginx:root /usr/share/nginx/html/privacy-statement.md
  chmod a+rw /usr/share/nginx/html/privacy-statement.md

  touch /usr/share/nginx/html/terms-of-use.md
  chown nginx:root /usr/share/nginx/html/terms-of-use.md
  chmod a+rw /usr/share/nginx/html/terms-of-use.md
EOT

USER nginx

HEALTHCHECK --interval=20s --timeout=10s --retries=5 CMD test -e /tmp/nginx.pid

ARG SHORT_SHA
ENV RENKU_UI_SHORT_SHA=$SHORT_SHA

ENTRYPOINT ["/bin/sh", "/app/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
