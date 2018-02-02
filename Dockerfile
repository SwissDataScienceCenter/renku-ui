FROM node:alpine

WORKDIR /app
COPY package.json ./
RUN npm install --silent
EXPOSE 3000
CMD [ "npm", "start" ]


