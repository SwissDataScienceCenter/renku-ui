FROM node:alpine

COPY package.json /code/renga-ui/package.json
WORKDIR /code/renga-ui

RUN npm install

COPY . /code/renga-ui
RUN npm run build

VOLUME ["/code/renga-ui/dist"]
