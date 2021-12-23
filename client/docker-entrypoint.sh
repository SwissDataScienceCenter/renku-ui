# -*- coding: utf-8 -*-
#
# Copyright 2017-2018 - Swiss Data Science Center (SDSC)
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

export NGINX_PATH=/usr/share/nginx/html

echo "Config file contains the following settings:"
echo "==================================================="
echo " UI_VERSION=${UI_VERSION}"
echo " UI_SHORT_SHA=${RENKU_UI_SHORT_SHA}"
echo " GATEWAY_URL=${GATEWAY_URL:-http://gateway.renku.build}"
echo " UISERVER_URL=${UISERVER_URL:-http://uiserver.renku.build}"
echo " BASE_URL=${BASE_URL:-http://renku.build}"
echo " SENTRY_URL=${SENTRY_URL}"
echo " SENTRY_NAMESPACE=${SENTRY_NAMESPACE}"
echo " MAINTENANCE=${MAINTENANCE}"
echo " ANONYMOUS_SESSIONS=${ANONYMOUS_SESSIONS}"
echo " PRIVACY_ENABLED=${PRIVACY_ENABLED}"
echo " PRIVACY_BANNER_CONTENT=${PRIVACY_BANNER_CONTENT}"
echo " PRIVACY_BANNER_LAYOUT=${PRIVACY_BANNER_LAYOUT}"
echo " TEMPLATES=${TEMPLATES}"
echo " PREVIEW_THRESHOLD=${PREVIEW_THRESHOLD}"
echo " UPLOAD_THRESHOLD=${UPLOAD_THRESHOLD}"
echo " CORE_API_VERSION=${CORE_API_VERSION}"
echo " HOMEPAGE": "${HOMEPAGE}"
echo "==================================================="

echo "Privacy file contains the following markdown (first 5 lines):"
echo "==================================================="
echo "$(head -5 /config-privacy/statement.md)"
echo "==================================================="

tee > "${NGINX_PATH}/config.json" << EOF
{
  "UI_VERSION": "${UI_VERSION}",
  "UI_SHORT_SHA": "${RENKU_UI_SHORT_SHA}",
  "BASE_URL": "${BASE_URL:-http://renku.build}",
  "GATEWAY_URL": "${GATEWAY_URL:-http://gateway.renku.build}",
  "UISERVER_URL": "${UISERVER_URL:-http://uiserver.renku.build}",
  "WELCOME_PAGE": "${WELCOME_PAGE}",
  "SENTRY_URL": "${SENTRY_URL}",
  "SENTRY_NAMESPACE": "${SENTRY_NAMESPACE}",
  "MAINTENANCE": "${MAINTENANCE}",
  "ANONYMOUS_SESSIONS": "${ANONYMOUS_SESSIONS}",
  "PRIVACY_ENABLED": "${PRIVACY_ENABLED}",
  "PRIVACY_BANNER_CONTENT": "${PRIVACY_BANNER_CONTENT}",
  "PRIVACY_BANNER_LAYOUT": ${PRIVACY_BANNER_LAYOUT},
  "TEMPLATES": ${TEMPLATES},
  "PREVIEW_THRESHOLD": ${PREVIEW_THRESHOLD},
  "UPLOAD_THRESHOLD": ${UPLOAD_THRESHOLD},
  "CORE_API_VERSION": "${CORE_API_VERSION}",
  "STATUSPAGE_ID": "${STATUSPAGE_ID}",
  "HOMEPAGE": ${HOMEPAGE}
}
EOF
echo "config.json created in ${NGINX_PATH}"

FILE=/config-privacy/statement.md
if [ -f "$FILE" ]; then
  more /config-privacy/statement.md | base64 | tr -d \\n > "${NGINX_PATH}/privacy-statement.md"
  echo "privacy-statement.md created in ${NGINX_PATH}"
else
  echo "privacy-statement.md created in ${NGINX_PATH}"
fi

exec -- "$@"
