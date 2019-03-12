FROM node:8.11.1-alpine

WORKDIR /app

#: Use only required files.
COPY package.json package-lock.json /app/
COPY public /app/public
COPY src /app/src/

RUN npm install --silent && \
    npm run-script build

FROM nginxinc/nginx-unprivileged:1.14-alpine

COPY --from=0 /app/build /usr/share/nginx/html
COPY nginx.vh.default.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

# Set up the config file written by docker-entrypoint
USER root
RUN touch /usr/share/nginx/html/config.json
RUN chmod a+r /usr/share/nginx/html/config.json
RUN chown 1001 /usr/share/nginx/html/config.json
USER 1001


HEALTHCHECK --interval=20s --timeout=10s --retries=5 CMD test -e /var/run/nginx.pid

ENTRYPOINT ["/bin/sh", "/app/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
