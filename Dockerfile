FROM node:alpine

WORKDIR /app
COPY . /app
RUN npm install --silent && \
    npm install -g serve

EXPOSE 3000
ENTRYPOINT ["/bin/sh", "/app/docker-entrypoint.sh"]
CMD ["/usr/local/bin/serve", "-s", "-p", "3000", "./build/"]
