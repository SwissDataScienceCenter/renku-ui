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

BOLD=$(tput bold)
NORMAL=$(tput sgr0)

# script directory
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

CURRENT_CONTEXT=`kubectl config current-context`
WELCOME_MESSAGE="## Welcome to Renku through telepresence
Some deployment-specific information will be read from the your values.yaml file and be displayed as markdown file."
TEMPLATES='{"custom":true,"repositories":
[{"name":"Renku","ref":"master",
"url":"https://github.com/SwissDataScienceCenter/renku-project-template"},
{"name":"Telepresence","ref":"0.2.1",
"url":"https://github.com/SwissDataScienceCenter/renku-project-template"}]}'
PREVIEW_THRESHOLD='{"soft":"1048576","hard":"10485760"}'
UPLOAD_THRESHOLD='{"soft":"104857600"}'
CURRENT_CHART=`grep -oE "(^version: )[.0-9a-f\-]*" ../helm-chart/renku-ui/Chart.yaml | cut -d" " -f2`
CURRENT_COMMIT=`git rev-parse --short HEAD`
# Set HOMEPAGE_PROJECT_PATH with the project's path with namespace to display the project on the landing page.
# E.g.,
#HOMEPAGE_PROJECT_PATH='elisabet.capon/renku-demo-project-machine-learning'
#HOMEPAGE_DATASET_SLUG='f838eb3c50c44be182f5ae5ac36babc2'
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

if [ -z "$STATUSPAGE_ID" ]; then STATUSPAGE_ID="r3j2c84ftq49"; else echo "STATUSPAGE_ID is set to '$STATUSPAGE_ID'"; fi

# Set HOMEPAGE_MAIN_CONTENTMD to some markdown to try out the main content:
# E.g.,
# set HOMEPAGE_MAIN_CONTENTMD '# Yoyodyne\nWelcome to the Yoyodyne Renku instance!'
# set HOMEPAGE_MAIN_BGURL https://eoimages.gsfc.nasa.gov/images/imagerecords/79000/79803/earth_night_rotate_lrg.jpg
if [ -z "$HOMEPAGE_MAIN_CONTENTMD" ]
then
  HOMEPAGE_CUSTOM_ENABLED="false"
  HOMEPAGE_MAIN_CONTENTMD=""
  HOMEPAGE_MAIN_BGURL=""
else
  HOMEPAGE_CUSTOM_ENABLED="true"
  echo "HOMEPAGE_MAIN_CONTENTMD is set to '${HOMEPAGE_MAIN_CONTENTMD}'"
  echo "HOMEPAGE_MAIN_BGURL is set to '${HOMEPAGE_MAIN_BGURL}'"
fi

if [ -z "$HOMEPAGE_TUTORIAL_LINK" ]
then
  HOMEPAGE_TUTORIAL_LINK="https://renku.readthedocs.io/en/latest/tutorials/01_firststeps.html"
else
  echo "HOMEPAGE_TUTORIAL_LINK is set to '${HOMEPAGE_TUTORIAL_LINK}'"
fi

if [ -z "$HOMEPAGE_SHOW_PROJECTS" ]
then
  HOMEPAGE_SHOWCASE='{"enabled": false}'
else
  HOMEPAGE_SHOWCASE=`cat $SCRIPT_DIR/../dev/telepresence-showcase-projects.json`
  echo "HOMEPAGE_SHOWCASE is set to content of '$SCRIPT_DIR/../dev/telepresence-showcase-projects.json'"
fi

# Get the current context
if [[ ! $CURRENT_CONTEXT ]]
then
  echo "No default k8s context found. Please set up your k8s context first, or type here the context you want to use: "
  while [[ ! $CURRENT_CONTEXT ]]; do
    read
    if [[ $REPLY ]]
    then
      CURRENT_CONTEXT=$REPLY
      echo ""
    else
      echo "No valid context provided. Please type a valid string: "
    fi
  done
fi

# Get the namespaces when not set
if [[ ! $NAMESPACE ]]
then
  if [[ ! $DEV_NAMESPACE ]]
  then
    while [[ ! $NAMESPACE ]]; do
      read -p "Enter your k8s namespace. Numbers-only will be converted to the renku-ui PR deployment: "
      NAMESPACE=$REPLY
    done
  else
    echo "You have a legacy default namespace set on your environment: ${DEV_NAMESPACE}"
    echo "Press enter to use it or type a different namespace. Numbers-only will be converted to the renku-ui PR deployment: "
    read
    if [[ $REPLY ]]
    then
      NAMESPACE=$REPLY
      echo ""
    else
      NAMESPACE=$DEV_NAMESPACE
    fi
  fi
fi

if [[ $NAMESPACE =~ ^[0-9]+$ ]]; then
  NAMESPACE=renku-ci-ui-${NAMESPACE}
fi
SERVICE=${NAMESPACE}-ui
BASE_URL=https://${NAMESPACE}.dev.renku.ch
echo "Exchanging k8s deployments for the following context/namespace: "
echo "${BOLD}${CURRENT_CONTEXT}/${NAMESPACE}${NORMAL}"
echo "The deployment URL is expected to be: "
echo "${BOLD}${BASE_URL}${NORMAL}"
echo ""

DASHBOARD_MESSAGE_TEXT=$(echo "# Welcome to Renku! 🐸
You are running **telepresence** on **${NAMESPACE}** 🔗" | node -e "let content = ''; process.stdin.setEncoding('utf-8').on('data', (chunk) => content += chunk).on('end', () => {console.log(JSON.stringify(content))})")

# Set sentry DNS when required
if [[ $SENTRY = 1 ]]
then
  SENTRY_URL="https://4c715ff0b37642618a8b2a048b4da4fd@sentry.dev.renku.ch/3"
  SENTRY_NAMESPACE="${NAMESPACE}"
  SENTRY_SAMPLE_RATE=1.0
else
  echo "Errors won't be sent to sentry by default. To enable Sentry, use 'SENTRY=1 ./run-telepresence.sh'"
  echo ""
fi

tee > ./public/config.json << EOF
{
  "UI_VERSION": "${CURRENT_CHART}-${CURRENT_COMMIT}",
  "RENKU_CHART_VERSION": "${CURRENT_CHART}-telepresence",
  "UI_SHORT_SHA": "development",
  "TELEPRESENCE": "true",
  "BASE_URL": "${BASE_URL}",
  "GATEWAY_URL": "${BASE_URL}/api",
  "UISERVER_URL": "${BASE_URL}/ui-server",
  "KEYCLOAK_REALM": "${KEYCLOAK_REALM:-Renku}",
  "WELCOME_PAGE": "${WELCOME_PAGE}",
  "DASHBOARD_MESSAGE": {
    "enabled": true,
    "text": ${DASHBOARD_MESSAGE_TEXT},
    "style": "info",
    "dismissible": true
  },
  "SENTRY_URL": "${SENTRY_URL}",
  "SENTRY_NAMESPACE": "${SENTRY_NAMESPACE}",
  "SENTRY_SAMPLE_RATE": "${SENTRY_SAMPLE_RATE}",
  "ANONYMOUS_SESSIONS": "true",
  "PRIVACY_BANNER_ENABLED": "false",
  "TERMS_PAGES_ENABLED": "false",
  "TEMPLATES": ${TEMPLATES},
  "PREVIEW_THRESHOLD": ${PREVIEW_THRESHOLD},
  "UPLOAD_THRESHOLD": ${UPLOAD_THRESHOLD},
  "STATUSPAGE_ID": "${STATUSPAGE_ID}",
  "HOMEPAGE": {
    "custom": {
      "enabled":${HOMEPAGE_CUSTOM_ENABLED},
      "main": {
        "contentMd": "${HOMEPAGE_MAIN_CONTENTMD}",
        "backgroundImage": {
          "url": "${HOMEPAGE_MAIN_BGURL}"
        }
      }
    },
    "tutorialLink": "${HOMEPAGE_TUTORIAL_LINK}",
    "showcase": ${HOMEPAGE_SHOWCASE},
    "projectPath": "${HOMEPAGE_PROJECT_PATH}",
    "datasetSlug": "${HOMEPAGE_DATASET_SLUG}"
  },
  "USER_PREFERENCES_MAX_PINNED_PROJECTS": ${USER_PREFERENCES_MAX_PINNED_PROJECTS:-5},
  "SESSION_CLASS_EMAIL_US": { "enabled": false }
}
EOF

./scripts/generate_sitemap.sh "${BASE_URL}" "./public/sitemap.xml"

CURRENT_TELEPRESENCE_NAMESPACE=$( telepresence status | grep "Namespace" | cut -d ":" -f2 | tr -d " " )
if [[ $NAMESPACE != $CURRENT_TELEPRESENCE_NAMESPACE ]]
then
  telepresence quit
  telepresence connect --namespace ${NAMESPACE}
fi

if [[ $SERVICE_CONSOLE_MODE == 1 ]]
then
  BROWSER=none telepresence intercept ${SERVICE} --port 3000:http -- bash
else
  BROWSER=none telepresence intercept ${SERVICE} --port 3000:http -- npm run start:strict-port -- --host
fi
