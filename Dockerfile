FROM node:alpine

WORKDIR /app
COPY . /app
RUN npm install --silent && \
    npm run-script build

FROM nginx

COPY --from=0 /app/build /usr/share/nginx/html
