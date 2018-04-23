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
echo " GITLAB_URL=${GITLAB_URL:-http://gitlab.renga.build}"
echo " GITLAB_CLIENT_ID=${GITLAB_CLIENT_ID:-renga-ui}"
echo " BASE_URL=${BASE_URL:-http://renga.build}"
echo "==================================================="

tee > /usr/share/nginx/html/config.json << EOF
{
  "BASE_URL": "${BASE_URL:-http://renga.build}",
  "GITLAB_URL": "${GITLAB_URL:-http://gitlab.renga.build}",
  "GITLAB_CLIENT_ID": "${GITLAB_CLIENT_ID:-renga-ui}"
}
EOF

exec -- "$@"
