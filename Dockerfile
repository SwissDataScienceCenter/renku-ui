FROM node:alpine

WORKDIR /app
COPY . /app
# We rename index.html so we can add the right source for the keyckoak apdaptor into the script tag
# inside the entrypoint and rename it back to index.html. This will allow to change RENGA_ENDPOINT without
# rebuilding the image.
RUN npm install --silent && mv public/index.html public/index-template.html
EXPOSE 3000
ENTRYPOINT ["/bin/sh", "/app/docker-entrypoint.sh"]
CMD ["/usr/local/bin/npm",  "start"]
