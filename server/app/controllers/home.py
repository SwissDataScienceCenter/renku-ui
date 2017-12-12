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
"""Home controller."""

from flask import render_template

from .. import app
from ..settings import settings


@app.route('/')
def index():
    g = settings()
    return render_template(
        'index.html',
        DEPLOY_DEFAULT_BACKEND=g['DEPLOY_DEFAULT_BACKEND'],
        STORAGE_DEFAULT_BACKEND=g['STORAGE_DEFAULT_BACKEND'],
        SENTRY_UI_DSN=g['SENTRY_UI_DSN'],
    )
