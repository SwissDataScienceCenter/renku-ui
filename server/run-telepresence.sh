#!/bin/bash
#
# Copyright 2022 - Swiss Data Science Center (SDSC)
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

COLOR_RED="\033[0;31m"
COLOR_RESET="\033[0m"

echo -e "If you target a CI deployment, you can type the PR number"
if [[ ! $DEV_NAMESPACE ]]
then
    read -p "No dev namespace found. Please specify one: " -r
    DEV_NAMESPACE=$REPLY
else
    echo -e "Your current dev namespace is: ${COLOR_RED}${DEV_NAMESPACE}${COLOR_RESET}"
    read -p "Press enter to use it, or type a different one [skip]: " -r
    if [[ $REPLY ]]
    then
        DEV_NAMESPACE=$REPLY
    fi
fi
if [[ ! $DEV_NAMESPACE ]]
then
    echo "ERROR: you need to provide a namespace"
    exit 1
fi
if [[ $DEV_NAMESPACE =~ ^[0-9]+$ ]]
then
    DEV_NAMESPACE=renku-ci-ui-${DEV_NAMESPACE}
    SERVICE_NAME=${DEV_NAMESPACE}-uiserver
else
    SERVICE_NAME=${DEV_NAMESPACE}-renku-uiserver
fi

echo -e "The service will start by default. You can switch to console mode to manually start the service."
read -p "Do you want to use console mode? [Y/n]: " -r
if [[ $REPLY =~ ^([yY][eE][sS]|[yY])$ ]]
then
    SERVICE_CONSOLE_MODE=1
    SERVICE_CONSOLE_MODE_TEXT="on"
else
    SERVICE_CONSOLE_MODE=0
    SERVICE_CONSOLE_MODE_TEXT="off"
fi

echo -e ""
echo -e "Telepresence will start in the dev namespace ${COLOR_RED}${DEV_NAMESPACE}${COLOR_RESET}"
echo -e "Target service: ${COLOR_RED}${SERVICE_NAME}${COLOR_RESET}"
echo -e "Console mode: ${COLOR_RED}${SERVICE_CONSOLE_MODE_TEXT}${COLOR_RESET}"
if [[ $SERVICE_CONSOLE_MODE == 1 ]]
then
    echo -e "You can start the service and wait for a debugger to attach with:"
    echo -e "${COLOR_RED}> npm run dev-debug${COLOR_RESET}"
fi
echo -e "\U26A0 Please enter the sudo password when asked."

if [[ $SERVICE_CONSOLE_MODE == 1 ]]
then
    telepresence intercept -n ${DEV_NAMESPACE} ${SERVICE_NAME} --port 8080 --mount=true -- bash
else
    telepresence intercept -n ${DEV_NAMESPACE} ${SERVICE_NAME} --port 8080 --mount=true -- npm run dev-debug
fi
