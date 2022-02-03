#!/bin/bash
#
# Copyright 2020 - Swiss Data Science Center (SDSC)
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

if [[ "$DEBUG" ]]
then
  echo "*** DEBUG MODE ENABLED ***"
  echo "You will be able to attach an external debugger."
  echo "The configuration for the VScode remote debugger for NPM is the following:"
  echo '{ "name": "uiserver", "type": "node", "request": "attach", "address": "localhost",'
  echo '"port": 9229, "protocol": "inspector", "restart": true }'
elif [[ "$CONSOLE" ]]
then
  echo "*** CONSOLE MODE ENABLED ***"
  echo "The ui-server telepresence pod will start in console mode."
else
  echo "*** NO DEBUG ***"
  echo "If you need to debug or attach an external debugger (E.G. VScode remote debugger for NPM),"
  echo "consider starting the ui-server telepresence in debug mode by setting the DEBUG variable to 1."
  echo "DEBUG=1 ./run-telepresence.sh"
  echo "You can use CONSOLE=1 if you prefer full control in the ui-server pod."
  echo "CONSOLE=1 ./run-telepresence.sh"
fi
echo ""

if [[ $CURRENT_CONTEXT == 'minikube' ]]
then
  echo "Exchanging k8s deployments using the following context: ${CURRENT_CONTEXT}"
  echo "WARNING: minikube has not been tested! You may need to adapt the telepresence script file."
  SERVICE_NAME=renku-ui
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
  SERVICE_NAME=${DEV_NAMESPACE}-renku-uiserver
fi


if [[ "$CONSOLE" ]]
then
  echo "***** CONSOLE MODE *****"
  echo "You can start the server in debug mode with:"
  echo "> npm run dev-debug"
  telepresence --swap-deployment ${SERVICE_NAME} --namespace ${DEV_NAMESPACE} --expose 8080:8080 --expose 9229:9229 --run-shell
elif [[ "$DEBUG" ]]
then
  echo "***** CONSOLE MODE *****"
  telepresence --swap-deployment ${SERVICE_NAME} --namespace ${DEV_NAMESPACE} --expose 8080:8080 --expose 9229:9229 --run npm run dev-debug
elif [[ "$SENTRY" ]]
then
  SENTRY_ENABLED=true
  SENTRY_URL="https://14558ba28035458ba9c7d206b7a48cb5@sentry.dev.renku.ch/4"
  SENTRY_NAMESPACE="${DEV_NAMESPACE}"
  SENTRY_TRACE_RATE=1.0
  SENTRY_DEBUG_MODE=true
  echo "***** SENTRY ENABLED *****"
  echo "SENTRY_ENABLED=${SENTRY_ENABLED}"
  echo "SENTRY_URL=${SENTRY_URL}"
  echo "SENTRY_NAMESPACE=${SENTRY_NAMESPACE}"
  echo "SENTRY_TRACE_RATE=${SENTRY_TRACE_RATE}"
  echo "TELEPRESENCE=true"
  echo "DEBUG_MODE=${SENTRY_DEBUG_MODE}"
  echo ""
  SENTRY_ENABLED=${SENTRY_ENABLED} SENTRY_URL=${SENTRY_URL} SENTRY_NAMESPACE=${SENTRY_NAMESPACE} SENTRY_TRACE_RATE=${SENTRY_TRACE_RATE} SENTRY_DEBUG=${SENTRY_DEBUG_MODE} TELEPRESENCE=true telepresence --swap-deployment ${SERVICE_NAME} --namespace ${DEV_NAMESPACE} --expose 8080:8080 --run npm run dev
else
  telepresence --swap-deployment ${SERVICE_NAME} --namespace ${DEV_NAMESPACE} --expose 8080:8080 --run npm run dev
fi
