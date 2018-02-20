FROM node:alpine

WORKDIR /app
COPY package.json ./
COPY ./src /app/src
COPY ./public /app/public
RUN npm install --silent
EXPOSE 3000
CMD [ "npm", "start" ]


