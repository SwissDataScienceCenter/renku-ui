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
"""Server entrypoint."""

import app
import os
from bs4 import BeautifulSoup

# Add the env variable SENTRY_UI_DSN to the base.html header from where it's picked up by
# the vue application.

if os.environ.get('SENTRY_UI_DSN'):

    with open('/app/server/app/templates/base.html', 'r') as f:
        soup = BeautifulSoup(f, 'html.parser')

    sentry_header = soup.new_tag('meta')
    sentry_header['name'] = 'sentry_ui_dsn'
    sentry_header['content'] = os.environ.get('SENTRY_UI_DSN')
    soup.head.append(sentry_header)

    with open('/app/server/app/templates/base.html', 'w') as f:
        f.write(soup.prettify())

if __name__ == "__main__":
    app.app.run(host='0.0.0.0')
