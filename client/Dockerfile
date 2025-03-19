FROM node:22 AS builder

RUN apt-get update && apt-get upgrade --quiet --assume-yes

WORKDIR /app

#? Use only required files.
COPY package.json package-lock.json /app/
RUN npm ci
# COPY package.json /app/
# RUN npm i

COPY index.html tsconfig.json tsconfig.node.json vite.config.ts /app/
COPY public /app/public
COPY app /app/app/

ENV NODE_OPTIONS="--max-old-space-size=4096"

# RUN npm run-script build
RUN npm run-script remix:build

# TODO: make storybook work
# COPY .storybook /app/.storybook

# RUN npm run storybook-build -- -o storybook-static

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/build /app/build
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
COPY scripts/generate_sitemap.sh /app/scripts/generate_sitemap.sh

# Set up the config files written by docker-entrypoint
USER root
RUN touch /app/build/client/static/public/config.json
RUN chmod a+r /app/build/client/static/public/config.json
RUN chown node /app/build/client/static/public/config.json

RUN touch /app/build/client/static/public/robots.txt
RUN chmod a+r /app/build/client/static/public/robots.txt
RUN chown node /app/build/client/static/public/robots.txt

RUN touch /app/build/client/static/public/sitemap.xml
RUN chmod a+r /app/build/client/static/public/sitemap.xml
RUN chown node /app/build/client/static/public/sitemap.xml

RUN touch /app/build/client/static/public/privacy-statement.md
RUN chmod a+r /app/build/client/static/public/privacy-statement.md
RUN chown node /app/build/client/static/public/privacy-statement.md

RUN touch /app/build/client/static/public/terms-of-use.md
RUN chmod a+r /app/build/client/static/public/terms-of-use.md
RUN chown node /app/build/client/static/public/terms-of-use.md

USER node

ARG SHORT_SHA
ENV RENKU_UI_SHORT_SHA=$SHORT_SHA

ENTRYPOINT ["/bin/sh", "/app/docker-entrypoint.sh"]
CMD ["npm", "run-script", "remix:start", "/app/build/server/index.js"]

# FROM nginxinc/nginx-unprivileged:1.27-alpine

# COPY --from=builder /app/build /app/build/client/static/public
# COPY --from=builder /app/storybook-static /app/build/client/static/public/storybook
# COPY nginx.vh.default.conf /etc/nginx/conf.d/default.conf
# COPY docker-entrypoint.sh /app/docker-entrypoint.sh
# COPY scripts/generate_sitemap.sh /app/scripts/generate_sitemap.sh

# # Set up the config files written by docker-entrypoint
# USER root
# RUN touch /app/build/client/static/public/config.json
# RUN chmod a+r /app/build/client/static/public/config.json
# RUN chown nginx /app/build/client/static/public/config.json

# RUN touch /app/build/client/static/public/robots.txt
# RUN chmod a+r /app/build/client/static/public/robots.txt
# RUN chown nginx /app/build/client/static/public/robots.txt

# RUN touch /app/build/client/static/public/sitemap.xml
# RUN chmod a+r /app/build/client/static/public/sitemap.xml
# RUN chown nginx /app/build/client/static/public/sitemap.xml

# RUN touch /app/build/client/static/public/privacy-statement.md
# RUN chmod a+r /app/build/client/static/public/privacy-statement.md
# RUN chown nginx /app/build/client/static/public/privacy-statement.md

# RUN touch /app/build/client/static/public/terms-of-use.md
# RUN chmod a+r /app/build/client/static/public/terms-of-use.md
# RUN chown nginx /app/build/client/static/public/terms-of-use.md

# USER nginx


# HEALTHCHECK --interval=20s --timeout=10s --retries=5 CMD test -e /var/run/nginx.pid

# ARG SHORT_SHA
# ENV RENKU_UI_SHORT_SHA=$SHORT_SHA

# ENTRYPOINT ["/bin/sh", "/app/docker-entrypoint.sh"]
# CMD ["nginx", "-g", "daemon off;"]
