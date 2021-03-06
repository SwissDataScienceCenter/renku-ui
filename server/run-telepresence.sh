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

if [[ "$DEBUG" ]] || [[ "$DEBUGBRK" ]]
then
  echo "*** DEBUG MODE ENABLED ***"
  echo "You will be able to attach an external debugger."
  echo "The configuration for the VScode remote debugger for NPM is the following:"
  echo '{ "name": "uiserver", "type": "node", "request": "attach", "address": "localhost",'
  echo '"port": 9229, "protocol": "inspector", "restart": true }'
else
  echo "*** DEBUG MODE DISABLED ***"
  echo "If you want to attach an external debugger (E.G. VScode remote debugger for NPM)"
  echo "set the DEBUG variable to 1. You can use the command: DEBUG=1 ./run-telepresence.sh"
  echo "You can use DEBUGBRK instead if you want breakpoints to temporarily pause node execution."
fi
echo ""

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
  BASE_URL=https://${DEV_NAMESPACE}.dev.renku.ch
  SERVICE_NAME=${DEV_NAMESPACE}-renku-uiserver
fi

# TODO: set sentry dns if explicitly required by the user
# if [[ $SENTRY = 1 ]]
# then
#   SENTRY_URL="https://182290b8e1524dd3b7eb5dd051852f9f@sentry.dev.renku.ch/5"
#   SENTRY_NAMESPACE="${DEV_NAMESPACE}"
# else
#   echo "Errors won't be sent to sentry by default. To enable sentry, use 'SENTRY=1 ./run-telepresence.sh'"
# fi


# The following is necessary if we start telepresence with --run-shell
# echo "================================================================================================================="
# echo "Once telepresence has started, type the following command to start the development server:"
# echo "npm dev"
# echo "================================================================================================================="

# The `inject-tcp` proxying switch helps when running multiple instances of telepresence but creates problems when
# suid bins need to run. Please switch the following two lines when trying to run multiple telepresence.
# to include `--method inject-tcp`
# Reference: https://www.telepresence.io/reference/methods

if [[ "$DEBUG" ]]
then
  telepresence --swap-deployment ${SERVICE_NAME} --namespace ${DEV_NAMESPACE} --expose 8080:8080 --expose 9229:9229 --run npm run dev-debug
elif [[ "$DEBUGBRK" ]]
then
  telepresence --swap-deployment ${SERVICE_NAME} --namespace ${DEV_NAMESPACE} --expose 8080:8080 --expose 9229:9229 --run npm run dev-debug-brk
else
  # if things work in mac delete current and next line
  # telepresence --swap-deployment ${SERVICE_NAME} --namespace ${DEV_NAMESPACE} --expose 8080:8080 --run npm run dev
  # Use the same method on osx since --method inject-tcp does not work on macOS 11.2 (Big Sur)
  # See https://github.com/telepresenceio/telepresence/issues/1487
  telepresence --swap-deployment ${SERVICE_NAME} --namespace ${DEV_NAMESPACE} --expose 3000:8080 --run npm run dev
fi
