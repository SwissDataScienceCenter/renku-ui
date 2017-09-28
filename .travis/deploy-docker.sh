#!/bin/bash

docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD" $DOCKER_REGISTRY

docker-compose build
docker-compose push

export DOCKER_LABEL=$(node -p "require('./package.json').version")
docker-compose push
