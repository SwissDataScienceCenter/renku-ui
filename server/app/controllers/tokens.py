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
"""Authentication controller."""

import logging
import urllib
import hashlib

from flask import session, request, redirect, jsonify, url_for

from .. import app
from ..keycloak import with_tokens

logger = logging.getLogger(__name__)


@app.route('/login')
@with_tokens
def login():
    if 'redirect-to' in session:
        redir = session['redirect-to']
        logger.debug('Found session redirect: {}'.format(redir))
        del session['redirect-to']
    else:
        redir = request.args.get('redir', None)
        logger.debug('Found query redirect: {}'.format(redir))
    if redir:
        logging.debug('Redirecting to: {}'.format(redir))
        return redirect(redir)
    return ''


@app.route('/user_info')
def user_info():
    if 'tokens' in session:
        userinfo = session['tokens']['userinfo']
        email_hash = hashlib.md5(userinfo['email'].lower().encode()).hexdigest()
        options = urllib.parse.urlencode({'d': 'identicon', 's': '64'})
        userinfo['picture'] = "https://www.gravatar.com/avatar/" + email_hash + "?" + options
        return jsonify(dict(logged_in=True, data=userinfo))
    else:
        return jsonify(dict(logged_in=False))


@app.route('/offline_token')
@with_tokens
def offline_token():
    return ''


@app.route('/tokens')
@with_tokens
def tokens():
    return '{}'.format(session['tokens'])


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))
