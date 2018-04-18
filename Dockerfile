FROM node:alpine

WORKDIR /app
COPY . /app
RUN npm install --silent && \
    npm run-script build

FROM nginx:1.13-alpine

COPY --from=0 /app/build /usr/share/nginx/html
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

ENTRYPOINT ["/bin/sh", "/app/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
