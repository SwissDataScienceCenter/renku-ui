# -*- coding: utf-8 -*-
#
# Copyright 2018 - Swiss Data Science Center (SDSC)
# A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
# Eidgenössische Technische Hochschule Zürich (ETHZ).
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License..PHONY: build-docker-images push-docker-images login

ifeq ($(OS),Windows_NT)
    detected_OS := Windows
else
    detected_OS := $(shell sh -c 'uname -s 2>/dev/null || echo not')
endif

DOCKER_REPOSITORY?=rengahub/
DOCKER_PREFIX:=${DOCKER_REGISTRY}$(DOCKER_REPOSITORY)
DOCKER_LABEL?=$(or ${TRAVIS_BRANCH},${TRAVIS_BRANCH},$(shell git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/^* //'))

ifeq ($(detected_OS), Darwin)
	DOCKER_DOMAIN?=docker.for.mac.localhost
else
	DOCKER_DOMAIN?=localhost
endif

ifeq ($(DOCKER_LABEL), master)
	DOCKER_LABEL=latest
endif

IMAGES=incubator-renga-ui

GIT_MASTER_HEAD_SHA:=$(shell git rev-parse --short=12 --verify HEAD)

GITLAB_URL?=http://$(DOCKER_DOMAIN):5080
GITLAB_DIRS=config logs git-data lfs-data runner

DOCKER_COMPOSE_ENV=\
	DOCKER_DOMAIN=$(DOCKER_DOMAIN) \
	GITLAB_URL=$(GITLAB_URL) \
	DOCKER_PREFIX=$(DOCKER_PREFIX) \
	DOCKER_LABEL=$(DOCKER_LABEL)

start: docker-network $(GITLAB_DIRS:%=gitlab/%) unregister-runners
ifeq (${GITLAB_SECRET_TOKEN}, )
	@echo "[Warning] Renga UI will not work until you acquire and set GITLAB_SECRET_TOKEN"
	@echo
endif
	$(DOCKER_COMPOSE_ENV) docker-compose up --build -d ${DOCKER_SCALE}
	@echo
	@echo "[Success] Renga UI should be under http://$(DOCKER_DOMAIN):5000 and GitLab under $(GITLAB_URL)"
	@echo
	@echo "[Info] Register GitLab runners using:"
	@echo "         make register-runners"
ifeq (${DOCKER_SCALE},)
	@echo
	@echo "[Info] You can configure scale parameters: DOCKER_SCALE=\"--scale gitlab-runner=4\" make start"
endif

stop: unregister-runners
	$(DOCKER_COMPOSE_ENV) docker-compose stop
ifneq ($(shell docker network ls -q -f name=review), )
	@docker network rm review
endif

clean:
	@rm -rf gitlab

build-docker-images: $(IMAGES:%=build/%)

build/incubator-renga-ui: Dockerfile
	docker build --rm --force-rm -t rengahub/$(notdir $@):$(GIT_MASTER_HEAD_SHA) -f $< .

push-docker-images: $(IMAGES:%=push/%)

tag/%: build/%
	docker tag $(DOCKER_PREFIX)$(notdir $@):$(GIT_MASTER_HEAD_SHA) $(DOCKER_PREFIX)$(notdir $@):$(DOCKER_LABEL)

push/%: tag/%
	docker push $(DOCKER_PREFIX)$(notdir $@):$(DOCKER_LABEL)
	docker push $(DOCKER_PREFIX)$(notdir $@):$(GIT_MASTER_HEAD_SHA)

login:
	@docker login -u="${DOCKER_USERNAME}" -p="${DOCKER_PASSWORD}" ${DOCKER_REGISTRY}

gitlab/%:
	@mkdir -p $@

docker-network:
ifeq ($(shell docker network ls -q -f name=review), )
	@docker network create review
endif
	@echo "[Info] Using Docker network: review=$(shell docker network ls -q -f name=review)"

register-runners: unregister-runners
ifeq (${RUNNER_TOKEN},)
	@echo "[Error] RUNNER_TOKEN needs to be configured. Check $(GITLAB_URL)/admin/runners"
	@exit 1
endif
	@for container in $(shell $(DOCKER_COMPOSE_ENV) docker-compose ps -q gitlab-runner) ; do \
		docker exec -ti $$container gitlab-runner register \
			-n -u $(GITLAB_URL) \
			--name $$container-shell \
			-r ${RUNNER_TOKEN} \
			--executor shell \
			--locked=false \
			--run-untagged=false \
			--tag-list notebook \
			--docker-image $(DOCKER_PREFIX)renga-python:$(DOCKER_LABEL) \
			--docker-pull-policy "if-not-present"; \
		docker exec -ti $$container gitlab-runner register \
			-n -u $(GITLAB_URL) \
			--name $$container-docker \
			-r ${RUNNER_TOKEN} \
			--executor docker \
			--locked=false \
			--run-untagged=false \
			--tag-list cwl \
			--docker-image $(DOCKER_PREFIX)renga-python:$(DOCKER_LABEL) \
			--docker-pull-policy "if-not-present"; \
	done

unregister-runners:
ifeq (${RUNNER_TOKEN},)
	@echo "[Error] RUNNER_TOKEN needs to be configured. Check $(GITLAB_URL)/admin/runners"
	@exit 1
endif
	@for container in $(shell $(DOCKER_COMPOSE_ENV) docker-compose ps -q gitlab-runner) ; do \
		docker exec -ti $$container gitlab-runner unregister \
			--name $$container-shell || echo ok; \
		docker exec -ti $$container gitlab-runner unregister \
			--name $$container-docker || echo ok; \
	done
