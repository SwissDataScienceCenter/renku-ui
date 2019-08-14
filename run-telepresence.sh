#!/bin/bash
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


CURRENT_CONTEXT=`kubectl config current-context`
WELCOME_MESSAGE="## Welcome to Renku through telepresence
Some deployment-specific information will be read from the your values.yaml file and be displayed as markdown file."
if [[ "$OSTYPE" == "linux-gnu" ]]
then
  WELCOME_PAGE=`echo "${WELCOME_MESSAGE}" | base64 -w 0`
elif [[ "$OSTYPE" == "darwin"* ]]
then
  WELCOME_PAGE=`echo "${WELCOME_MESSAGE}" | base64`
else
  WELCOME_PAGE=`echo "${WELCOME_MESSAGE}" | base64`
  echo "Warning! your OS has not been tested yet"
fi

if [[ $CURRENT_CONTEXT == 'minikube' ]]
then
  echo "Exchanging k8s deployments using the following context: ${CURRENT_CONTEXT}"
  MINIKUBE_IP=`minikube ip`
  BASE_URL=http://${MINIKUBE_IP}
  SERVICE_NAME=renku-ui
  DEV_NAMESPACE=renku
else
  echo "You are going to exchange k8s deployments using the following context/namespace: ${CURRENT_CONTEXT}/${DEV_NAMESPACE}"
  read -p "Do you want to proceed? [y/n]"
  if [[ ! $REPLY =~ ^[Yy]$ ]]
  then
      exit 1
  fi

  if [[ ! $DEV_NAMESPACE ]]
  then
    read -p "enter your k8s namespace: "
    DEV_NAMESPACE=$REPLY
  fi
  BASE_URL=https://${DEV_NAMESPACE}.dev.renku.ch
  SERVICE_NAME=${DEV_NAMESPACE}-renku-ui
fi

tee > ./public/config.json << EOF
{
  "BASE_URL": "${BASE_URL}",
  "GATEWAY_URL": "${BASE_URL}/api",
  "WELCOME_PAGE": "${WELCOME_PAGE}",
  "RENKU_VERSION": "latest",
  "RENKU_TEMPLATES_URL": "https://github.com/SwissDataScienceCenter/renku-project-template",
  "RENKU_TEMPLATES_REF": "master"
}
EOF

# The following is necessary if we start telepresence with --run-shell
# echo "================================================================================================================="
# echo "Once telepresence has started, type the following command to start the development server:"
# echo "BROWSER=none npm start"
# echo "================================================================================================================="

# The `inject-tcp` proxying switch helps when running multiple instances of telepresence but creates problems when
# suid bins need to run. Please switch the following two lines when trying to run multiple telepresence.
# Reference: https://www.telepresence.io/reference/methods

if [[ "$OSTYPE" == "linux-gnu" ]]
then
  BROWSER=none telepresence --swap-deployment ${SERVICE_NAME} --namespace ${DEV_NAMESPACE} --expose 3000:8080 --run npm start
else
  BROWSER=none telepresence --swap-deployment ${SERVICE_NAME} --namespace ${DEV_NAMESPACE} --method inject-tcp --expose 3000:8080 --run npm start
fi
