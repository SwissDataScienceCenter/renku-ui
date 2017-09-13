#!/bin/bash

docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD" $DOCKER_REGISTRY
docker build . -t "${DOCKER_REGISTRY}${DOCKER_REPOSITORY}renga-ui:$(node -p "require('./package.json').version")"
docker push "${DOCKER_REGISTRY}${DOCKER_REPOSITORY}renga-ui:$(node -p "require('./package.json').version")"
docker tag "${DOCKER_REGISTRY}${DOCKER_REPOSITORY}renga-ui:$(node -p "require('./package.json').version")" "${DOCKER_REGISTRY}${DOCKER_REPOSITORY}renga-ui:latest"
docker push "${DOCKER_REGISTRY}${DOCKER_REPOSITORY}renga-ui:latest"

