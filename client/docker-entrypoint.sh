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
echo " RENKU_CHART_VERSION=${RENKU_CHART_VERSION}"
echo " UI_SHORT_SHA=${RENKU_UI_SHORT_SHA}"
echo " GATEWAY_URL=${GATEWAY_URL:-http://gateway.renku.build}"
echo " UISERVER_URL=${UISERVER_URL:-http://uiserver.renku.build}"
echo " BASE_URL=${BASE_URL:-http://renku.build}"
echo " KEYCLOAK_REALM=${KEYCLOAK_REALM:-Renku}"
echo " DASHBOARD_MESSAGE=${DASHBOARD_MESSAGE}"
echo " SENTRY_URL=${SENTRY_URL}"
echo " SENTRY_NAMESPACE=${SENTRY_NAMESPACE}"
echo " SENTRY_SAMPLE_RATE=${SENTRY_SAMPLE_RATE}"
echo " MAINTENANCE=${MAINTENANCE}"
echo " ANONYMOUS_SESSIONS=${ANONYMOUS_SESSIONS}"
echo " PRIVACY_ENABLED=${PRIVACY_ENABLED}"
echo " PRIVACY_BANNER_CONTENT=${PRIVACY_BANNER_CONTENT}"
echo " PRIVACY_BANNER_LAYOUT=${PRIVACY_BANNER_LAYOUT}"
echo " TEMPLATES=${TEMPLATES}"
echo " TERMS_ENABLED=${TERMS_ENABLED}"
echo " PREVIEW_THRESHOLD=${PREVIEW_THRESHOLD}"
echo " UPLOAD_THRESHOLD=${UPLOAD_THRESHOLD}"
echo " HOMEPAGE=${HOMEPAGE}"
echo " CORE_API_VERSION_CONFIG=${CORE_API_VERSION_CONFIG}"
echo " USER_PREFERENCES_MAX_PINNED_PROJECTS=${USER_PREFERENCES_MAX_PINNED_PROJECTS}"
echo "==================================================="

echo "Privacy file contains the following markdown (first 5 lines):"
echo "==================================================="
echo "$(head -5 /config-privacy/statement.md)"
echo "==================================================="

tee > "${NGINX_PATH}/config.json" << EOF
{
  "UI_VERSION": "${UI_VERSION}",
  "RENKU_CHART_VERSION": "${RENKU_CHART_VERSION}",
  "UI_SHORT_SHA": "${RENKU_UI_SHORT_SHA}",
  "BASE_URL": "${BASE_URL:-http://renku.build}",
  "GATEWAY_URL": "${GATEWAY_URL:-http://gateway.renku.build}",
  "UISERVER_URL": "${UISERVER_URL:-http://uiserver.renku.build}",
  "KEYCLOAK_REALM": "${KEYCLOAK_REALM:-Renku}",
  "DASHBOARD_MESSAGE": ${DASHBOARD_MESSAGE},
  "SENTRY_URL": "${SENTRY_URL}",
  "SENTRY_NAMESPACE": "${SENTRY_NAMESPACE}",
  "SENTRY_SAMPLE_RATE": "${SENTRY_SAMPLE_RATE}",
  "MAINTENANCE": "${MAINTENANCE}",
  "ANONYMOUS_SESSIONS": "${ANONYMOUS_SESSIONS}",
  "PRIVACY_ENABLED": "${PRIVACY_ENABLED}",
  "PRIVACY_BANNER_CONTENT": "${PRIVACY_BANNER_CONTENT}",
  "PRIVACY_BANNER_LAYOUT": ${PRIVACY_BANNER_LAYOUT},
  "TEMPLATES": ${TEMPLATES},
  "TERMS_ENABLED": "${TERMS_ENABLED}",
  "PREVIEW_THRESHOLD": ${PREVIEW_THRESHOLD},
  "UPLOAD_THRESHOLD": ${UPLOAD_THRESHOLD},
  "STATUSPAGE_ID": "${STATUSPAGE_ID}",
  "HOMEPAGE": ${HOMEPAGE},
  "CORE_API_VERSION_CONFIG": ${CORE_API_VERSION_CONFIG},
  "USER_PREFERENCES_MAX_PINNED_PROJECTS": ${USER_PREFERENCES_MAX_PINNED_PROJECTS}
}
EOF
echo "config.json created in ${NGINX_PATH}"

/app/scripts/generate_sitemap.sh "${BASE_URL}" "${NGINX_PATH}/sitemap.xml"
echo "sitemap.xml created in ${NGINX_PATH}"

tee > "${NGINX_PATH}/robots.txt" << EOF
Sitemap: ${BASE_URL}/sitemap.xml
EOF
echo "robots.txt created in ${NGINX_PATH}"

FILE=/config-privacy/statement.md
if [ -f "$FILE" ]; then
  cp /config-privacy/statement.md "${NGINX_PATH}/privacy-statement.md"
  echo "privacy-statement.md copied to ${NGINX_PATH}"
else
  echo "No privacy-statement.md"
fi

FILE=/config-terms/statement.md
if [ -f "$FILE" ]; then
  cp /config-terms/statement.md "${NGINX_PATH}/terms-of-use.md"
  echo "terms-of-use.md created in ${NGINX_PATH}"
else
  echo "No terms-of-use.md"
fi

exec -- "$@"
