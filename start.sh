#!/usr/bin/env bash

docker network create review

# Create gitlab folders if necessary
if [ ! -d "./gitlab" ]; then
  mkdir ./gitlab
  if [ ! -d "./gitlab/config" ]; then
    mkdir ./gitlab/config
  fi
  if [ ! -d "./gitlab/logs" ]; then
    mkdir ./gitlab/logs
  fi
  if [ ! -d "./gitlab/git-data" ]; then
    mkdir ./gitlab/git-data
  fi
  if [ ! -d "./gitlab/lfs-data" ]; then
    mkdir ./gitlab/lfs-data
  fi
fi

# Check that the variables we need are set
[ -z "$GITLAB_SECRET_TOKEN" ] && { echo "The Renga UI will not work until you acquire and set GITLAB_SECRET_TOKEN"; }

docker-compose up --build -d
echo "Started. Renga UI should be under http://localhost:5000 and GitLab under http://localhost:5080"
