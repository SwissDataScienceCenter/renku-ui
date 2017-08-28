#!/bin/bash

docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD" $DOCKER_REGISTRY
docker build .. -t "${DOCKER_REGISTRY}${DOCKER_REPOSITORY}renga-web-frontend:$(node -p "require('./package.json').version")"
