#!/bin/bash
#
# Copyright 2024 - Swiss Data Science Center (SDSC)
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

CURRENT_CONTEXT=`kubectl config current-context`

if [[ -n $PR ]]
then
  DEV_NAMESPACE=renku-ci-ui-${PR}
  SERVICE_NAME=renku-ci-ui-${PR}-uiserver
  echo "Deploying to environment for PR ${PR}: ($DEV_NAMESPACE.dev.renku.ch)"
elif [[ -n $NAMESPACE ]]
then
  DEV_NAMESPACE=${NAMESPACE}
  SERVICE_NAME=${NAMESPACE}-uiserver
  echo "Deploying to environment for namespace ${NAMESPACE}: ($DEV_NAMESPACE.dev.renku.ch)"
fi

if [[ $CURRENT_CONTEXT == 'minikube' ]]
then
  echo "Exchanging k8s deployments using the following context: ${CURRENT_CONTEXT}"
  if [[ $RENKU_DOMAIN ]]
  then
    # if using localhost.run, it should be http://<some-name>.localhost.run
    BASE_URL=http://${RENKU_DOMAIN}
  else
    MINIKUBE_IP=`minikube ip`
    BASE_URL=http://${MINIKUBE_IP}
  fi
  SERVICE_NAME=renku-uiserver
  DEV_NAMESPACE=renku
else
  # if the target context is not dev, have the user confirm
  if [[ $CURRENT_CONTEXT != 'switch-dev' ]]
  then
    echo "You are going to exchange k8s deployments using the following context/namespace: ${CURRENT_CONTEXT}/${DEV_NAMESPACE}"
    read -p "Do you want to proceed? [y/n]"
    if [[ ! $REPLY =~ ^[Yy]$ ]]
    then
        exit 1
    fi
  fi

  if [[ ! $DEV_NAMESPACE ]]
  then
    read -p "enter your k8s namespace: "
    DEV_NAMESPACE=$REPLY
  else
    echo "Exchanging k8s deployments for the following context/namespace: ${CURRENT_CONTEXT}/${DEV_NAMESPACE}"
  fi
  BASE_URL=https://${DEV_NAMESPACE}.dev.renku.ch

  if [[ ! $SERVICE_NAME ]]
  then
    SERVICE_NAME=${DEV_NAMESPACE}-renku-uiserver
  fi
fi

CURRENT_TELEPRESENCE_NAMESPACE=$( telepresence status | grep "Namespace" | cut -d ":" -f2 | tr -d " " )
if [[ $DEV_NAMESPACE != $CURRENT_TELEPRESENCE_NAMESPACE ]]
then
  telepresence quit
  telepresence connect --namespace ${DEV_NAMESPACE}
fi

if [[ $SERVICE_CONSOLE_MODE == 1 ]]
then
    telepresence intercept ${SERVICE_NAME} --port 8080 --mount=true -- bash
else
    telepresence intercept ${SERVICE_NAME} --port 8080 --mount=true -- npm run dev-debug
fi
