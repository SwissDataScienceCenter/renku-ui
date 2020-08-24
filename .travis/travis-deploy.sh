#!/bin/env bash
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
# limitations under the License.

set -e

source $(dirname "$0")/travis-functions.sh

# generate ssh key to use for docker hub login
openssl aes-256-cbc -K "${encrypted_5c6845b5ee69_key}" -iv "${encrypted_5c6845b5ee69_iv}" -in github_deploy_key.enc -out github_deploy_key -d
chmod 600 github_deploy_key
eval $(ssh-agent -s)
ssh-add github_deploy_key
make login

# build charts/images and push
helm repo add bitnami https://charts.bitnami.com/bitnami
cd helm-chart
chartpress --push --publish-chart
git diff


# if it's a tag, push the tagged chart
if [[ -n $TRAVIS_TAG ]]; then
    git clean -dffx
    chartpress --tag $TRAVIS_TAG --push --publish-chart
fi

export CHART_VERSION=$(awk '/^version/{print $2}' renku-ui/Chart.yaml)

# push also images tagged with "latest"
chartpress --tag latest --push

# We need to wait a bit to make sure the published chart is
# available on github...
sleep 60

# Update the renku-ui version in the requirements.yaml file
# of the main Renku chart.
updateVersionInRenku

cd ..
