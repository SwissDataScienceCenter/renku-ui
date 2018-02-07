#!/usr/bin/env bash

docker-compose stop
docker network rm review
echo "Stopped. Run start.sh to start again."
