FROM node:22 AS builder

RUN apt-get update && apt-get upgrade --quiet --assume-yes

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
ARG UID=65543
ARG GID=65543

COPY nginx.vh.default.conf /etc/nginx/conf.d/default.conf

USER $UID:$GID
COPY --from=builder --chown=$UID:$GID --chmod=a+rwx /app/build /tmp/nginx/html
COPY --from=builder --chown=$UID:$GID --chmod=a+rwx /app/storybook-static /tmp/nginx/html/storybook
COPY docker-entrypoint.sh /tmp/docker-entrypoint.sh
COPY scripts/generate_sitemap.sh /tmp/scripts/generate_sitemap.sh

# Set up the config files written by docker-entrypoint
RUN touch /tmp/nginx/html/config.json && \
	touch /tmp/nginx/html/robots.txt && \
	touch /tmp/nginx/html/sitemap.xml && \
	touch /tmp/nginx/html/privacy-statement.md && \
	touch /tmp/nginx/html/terms-of-use.md && \
	chmod a+rw -R /tmp/nginx/html

HEALTHCHECK --interval=20s --timeout=10s --retries=5 CMD test -e /tmp/nginx.pid

ARG SHORT_SHA
ENV RENKU_UI_SHORT_SHA=$SHORT_SHA

ENTRYPOINT ["/bin/sh", "/tmp/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
