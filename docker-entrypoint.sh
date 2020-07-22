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

echo "==================================================="
echo " Configuration:"
echo " GATEWAY_URL=${GATEWAY_URL:-http://gateway.renku.build}"
echo " BASE_URL=${BASE_URL:-http://renku.build}"
echo " SENTRY_URL=${SENTRY_URL}"
echo " SENTRY_NAMESPACE=${SENTRY_NAMESPACE}"
echo " RENKU_TEMPLATES_URL=${RENKU_TEMPLATES_URL}"
echo " RENKU_TEMPLATES_REF=${RENKU_TEMPLATES_REF}"
echo " MAINTENANCE=${MAINTENANCE}"
echo " ANONYMOUS_SESSIONS=${ANONYMOUS_SESSIONS}"
echo " PRIVACY_STATEMENT=${PRIVACY_STATEMENT}"
echo " PRIVACY_BANNER_CONTENT=${PRIVACY_BANNER_CONTENT}"
echo " PRIVACY_BANNER_LAYOUT=${PRIVACY_BANNER_LAYOUT}"
echo "==================================================="

tee > /usr/share/nginx/html/config.json << EOF
{
  "BASE_URL": "${BASE_URL:-http://renku.build}",
  "GATEWAY_URL": "${GATEWAY_URL:-http://gateway.renku.build}",
  "WELCOME_PAGE": "${WELCOME_PAGE}",
  "SENTRY_URL": "${SENTRY_URL}",
  "SENTRY_NAMESPACE": "${SENTRY_NAMESPACE}",
  "RENKU_TEMPLATES_URL": "${RENKU_TEMPLATES_URL}",
  "RENKU_TEMPLATES_REF": "${RENKU_TEMPLATES_REF}",
  "MAINTENANCE": "${MAINTENANCE}",
  "ANONYMOUS_SESSIONS": "${ANONYMOUS_SESSIONS}",
  "PRIVACY_STATEMENT": "$(echo "$PRIVACY_STATEMENT" | base64 | tr -d \\n)",
  "PRIVACY_BANNER_CONTENT": "${PRIVACY_BANNER_CONTENT}",
  "PRIVACY_BANNER_LAYOUT": ${PRIVACY_BANNER_LAYOUT}
}
EOF

exec -- "$@"
