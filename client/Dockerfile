FROM node:16.14.2-alpine

RUN apk update && apk add python3 make g++

WORKDIR /app

#: Use only required files.
COPY package.json package-lock.json tsconfig.json /app/
COPY public /app/public
COPY src /app/src/
COPY craco.config.js /app/craco.config.js

ENV NODE_OPTIONS="--max-old-space-size=4096"
ARG SHORT_SHA
ENV RENKU_UI_SHORT_SHA=$SHORT_SHA

# Delete this after reactstrap is released
RUN apk update && apk upgrade && \
    apk add --no-cache git

# There is some incompatibility between craco and react-scripts >4
# that causes problems with linting. Lint errors should have been
# caught before we get here, so we can turn this off.
# But look into https://github.com/gsoft-inc/craco/pull/219 for a better fix
ENV DISABLE_ESLINT_PLUGIN=true
RUN npm ci && \
    npm run-script build

FROM nginxinc/nginx-unprivileged:1.20-alpine

COPY --from=0 /app/build /usr/share/nginx/html
COPY nginx.vh.default.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

# Set up the config files written by docker-entrypoint
USER root
RUN touch /usr/share/nginx/html/config.json
RUN chmod a+r /usr/share/nginx/html/config.json
RUN chown nginx /usr/share/nginx/html/config.json

RUN touch /usr/share/nginx/html/robots.txt
RUN chmod a+r /usr/share/nginx/html/robots.txt
RUN chown nginx /usr/share/nginx/html/robots.txt

RUN touch /usr/share/nginx/html/sitemap.xml
RUN chmod a+r /usr/share/nginx/html/sitemap.xml
RUN chown nginx /usr/share/nginx/html/sitemap.xml

RUN touch /usr/share/nginx/html/privacy-statement.md
RUN chmod a+r /usr/share/nginx/html/privacy-statement.md
RUN chown nginx /usr/share/nginx/html/privacy-statement.md
USER nginx


HEALTHCHECK --interval=20s --timeout=10s --retries=5 CMD test -e /var/run/nginx.pid

ARG SHORT_SHA
ENV RENKU_UI_SHORT_SHA=$SHORT_SHA

ENTRYPOINT ["/bin/sh", "/app/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
