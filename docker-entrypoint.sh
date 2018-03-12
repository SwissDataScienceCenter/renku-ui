# -*- coding: utf-8 -*-
#
# Copyright 2017 - Swiss Data Science Center (SDSC)
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
echo " KEYCLOAK_URL=$KEYCLOAK_URL"
echo " GITLAB_URL=$GITLAB_URL"
echo " RENGA_UI_URL=$RENGA_UI_URL"
echo "==================================================="

# Optimized production build
npm run-script build

# Add the script tag which loads the keycloak js adapter from the keycloak server
ESCAPED_KEYCLOAK_URL=$(echo $KEYCLOAK_URL | sed -e 's/\//\\\//g')
sed -i -e "s/<head>/<head><script src=\"$ESCAPED_KEYCLOAK_URL\/auth\/js\/keycloak.js\"><\/script>/" /app/build/index.html

cat /app/build/index.html

exec -- $@
