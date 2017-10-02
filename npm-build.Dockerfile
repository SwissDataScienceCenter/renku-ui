FROM node:6

COPY package.json /code/renga-ui/package.json
COPY package-lock.json /code/renga-ui/package-lock.json
WORKDIR /code/renga-ui

RUN npm install

COPY . /code/renga-ui
RUN npm run build
