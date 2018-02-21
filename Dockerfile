FROM node:alpine

WORKDIR /app
COPY package.json ./
COPY ./src /app/src
COPY ./public /app/public
RUN npm install --silent
EXPOSE 3000
CMD sed -i -e "s|{{RENGA_ENDPOINT}}|${RENGA_ENDPOINT}|" public/index.html && npm start
