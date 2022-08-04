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
TEMPLATES='{"custom":true,"repositories":
[{"name":"Renku","ref":"master",
"url":"https://github.com/SwissDataScienceCenter/renku-project-template"},
{"name":"Telepresence","ref":"0.2.1",
"url":"https://github.com/SwissDataScienceCenter/renku-project-template"}]}'
PREVIEW_THRESHOLD='{"soft":"1048576","hard":"10485760"}'
UPLOAD_THRESHOLD='{"soft":"104857600"}'
CURRENT_CHART=`grep -oE "(^version: )[.0-9a-f\-]*" ../helm-chart/renku-ui/Chart.yaml | cut -d" " -f2`
CURRENT_COMMIT=`git rev-parse --short HEAD`
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
  HOMEPAGE_PROJECTS="[]"
  echo "HOMEPAGE_SHOW_PROJECTS is set to '${HOMEPAGE_PROJECTS}'"
else
  HOMEPAGE_PROJECTS='[{"projectPath": "julia/flights-tutorial-julia"}, {"projectPath": "cramakri/covid-19-dashboard"}]'
  echo "HOMEPAGE_SHOW_PROJECTS is set to '${HOMEPAGE_PROJECTS}'"
fi

if [[ -n $PR ]]
then
  DEV_NAMESPACE=renku-ci-ui-${PR}
  SERVICE_NAME=renku-ci-ui-${PR}-ui
  echo "Deploying to environment for PR ${PR}: ($DEV_NAMESPACE.dev.renku.ch)"
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

  if [[ ! $SERVICE_NAME ]]
  then
    SERVICE_NAME=${DEV_NAMESPACE}-renku-ui
  fi
fi

# set sentry dns if explicitly required by the user
if [[ $SENTRY = 1 ]]
then
  SENTRY_URL="https://4c715ff0b37642618a8b2a048b4da4fd@sentry.dev.renku.ch/3"
  SENTRY_NAMESPACE="${DEV_NAMESPACE}"
  # set SENTRY_SAMPLE_RATE as a number between 0 and 1. (For example, to send 20% of transactions, set tracesSampleRate to 0.2.)
  SENTRY_SAMPLE_RATE=1.0
else
  echo "Errors won't be sent to sentry by default. To enable sentry, use 'SENTRY=1 ./run-telepresence.sh'"
fi

tee > ./public/config.json << EOF
{
  "UI_VERSION": "${CURRENT_CHART}-${CURRENT_COMMIT}",
  "UI_SHORT_SHA": "development",
  "TELEPRESENCE": "true",
  "BASE_URL": "${BASE_URL}",
  "GATEWAY_URL": "${BASE_URL}/api",
  "UISERVER_URL": "${BASE_URL}/ui-server",
  "WELCOME_PAGE": "${WELCOME_PAGE}",
  "SENTRY_URL": "${SENTRY_URL}",
  "SENTRY_NAMESPACE": "${SENTRY_NAMESPACE}",
  "SENTRY_SAMPLE_RATE": "${SENTRY_SAMPLE_RATE}",
  "ANONYMOUS_SESSIONS": "true",
  "PRIVACY_ENABLED": "false",
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
    "projects": ${HOMEPAGE_PROJECTS}
  }
}
EOF

tee > "./public/sitemap.xml" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
  </url>
  <url>
    <loc>${BASE_URL}/projects</loc>
  </url>
  <url>
    <loc>${BASE_URL}/datasets</loc>
  </url>
  <url>
    <loc>${BASE_URL}/help</loc>
  </url>
</urlset>
EOF

if [[ $SERVICE_CONSOLE_MODE == 1 ]]
then
  BROWSER=none telepresence intercept ${SERVICE_NAME} --namespace ${DEV_NAMESPACE} --port 3000:http -- bash
else
  BROWSER=none telepresence intercept ${SERVICE_NAME} --namespace ${DEV_NAMESPACE} --port 3000:http -- npm run start
fi
