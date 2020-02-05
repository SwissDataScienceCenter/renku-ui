#!/bin/env bash
#
# Copyright 2019 - Swiss Data Science Center (SDSC)
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


function updateVersionInRenku() {
  echo "Updating renku-ui version to $CHART_VERSION in Renku's requirements.yaml"

  # cloning the renku repo
  cd || exit
  git clone https://github.com/SwissDataScienceCenter/renku.git
  cd renku || exit

  # changing the version
  sed -i "/- name: renku-ui/{n;n;n;s/.*/  version: $CHART_VERSION/}" charts/renku/requirements.yaml

  # preparing git config
  git config --global user.name "RenkuBot"
  git config --global user.email "renku@datascience.ch"
  git config credential.helper "store --file=.git/credentials"
  echo "https://${GITHUB_TOKEN}:@github.com" >.git/credentials

  # running helm dep udpate
  cd charts || exit
  helm repo add renku https://swissdatasciencecenter.github.io/helm-charts/
  helm dep update renku
  cd .. || exit

  # pushing to the remote
  git checkout -b auto-update/renku-ui-$CHART_VERSION
  git add charts/renku/requirements.yaml
  git add charts/renku/requirements.lock
  git commit -m "chore: updating renku-ui version to $CHART_VERSION"
  git push --set-upstream origin auto-update/renku-ui-$CHART_VERSION
}
