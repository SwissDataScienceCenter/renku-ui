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
"""Flask initialization."""

import logging
import os

import pkg_resources
from flask import Flask
from flask_webpack import Webpack
from werkzeug.contrib.fixers import ProxyFix
from .utils import ReverseProxied

try:
    pkg_resources.get_distribution('raven')
    from raven.contrib.flask import Sentry
except pkg_resources.DistributionNotFound:  # pragma: no cover
    Sentry = None

logging.basicConfig(level=logging.DEBUG)

webpack = Webpack()

app = Flask(__name__, static_folder='../../dist', static_url_path='/static')
app.config['WEBPACK_MANIFEST_PATH'] = os.getenv('WEBPACK_MANIFEST_PATH', '../../dist/manifest.json')
app.secret_key = os.getenv('APPLICATION_SECRET_KEY', b',\x99@uyF\x94p\xc8\xa9\x0e\xa7,rT\xbe\xe8\xa0C0\xd54\x89-')
app.config['APPLICATION_ROOT'] = os.getenv('APPLICATION_ROOT', None)
app.wsgi_app = ProxyFix(ReverseProxied(app.wsgi_app))


webpack.init_app(app)

# Setup Sentry service:
if Sentry and os.environ.get('SENTRY_DSN'):  # pragma: no cover
    Sentry(app, dsn=os.environ['SENTRY_DSN'])


@app.after_request
def add_header(r):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r

from .controllers import home, proxy, tokens
