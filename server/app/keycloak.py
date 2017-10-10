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
"""Keycloak sub-module."""
import requests
import time
from urllib.parse import urlparse
from functools import wraps

from flask import redirect, request, session
from jose import jwt
from openid_connect import OpenIDClient
from openid_connect._oidc import TokenResponse
from requests.auth import HTTPBasicAuth
from .settings import settings


class KeycloakClient(OpenIDClient):
    def get_id(self, token_response):
        return jwt.decode(
            token_response.id_token,
            self.keys,
            algorithms=['RS256'],
            options={'verify_at_hash': False},
            audience=self.client_id,
            issuer=self.issuer,
            access_token=token_response.access_token, )

    def get_userinfo(self, access_token):
        g = settings()
        r = requests.get(self.userinfo_endpoint, headers=dict(
            Authorization="Bearer " + access_token,
            HOST=urlparse(g['KEYCLOAK_REDIRECT_URL']).netloc
        ))
        r.raise_for_status()
        data = r.json()
        return self.translate_userinfo(data)

    @property
    def auth(self):
        if self.client_secret:
            return HTTPBasicAuth(self.client_id, self.client_secret)
        else:
            return None

    @property
    def authorization_endpoint(self):
        g = settings()
        endpoint = self._configuration["authorization_endpoint"]
        return endpoint.replace(g['KEYCLOAK_URL'], g['KEYCLOAK_REDIRECT_URL'], 1)

    @property
    def issuer(self):
        issuer = self._configuration["issuer"]
        g = settings()
        k_url = g['KEYCLOAK_URL'][:-1] if g['KEYCLOAK_URL'].endswith('/') else g['KEYCLOAK_URL']
        r_url = g['KEYCLOAK_REDIRECT_URL'][:-1] if g['KEYCLOAK_REDIRECT_URL'].endswith('/') else g['KEYCLOAK_REDIRECT_URL']
        return issuer.replace(k_url, r_url, 1)

    def decode(self, token):
        return jwt.decode(
            token,
            self.keys,
            algorithms=['RS256'],
            options={'verify_at_hash': False},
            audience=self.client_id,
            issuer=self.issuer,
        )

    def refresh_token(self, redirect_uri, refresh_token):
        r = requests.post(self.token_endpoint, auth=self.auth, data=dict(
            grant_type="refresh_token",
            refresh_token=refresh_token,
        ), headers={'Accept': 'application/json'})
        if r.status_code == 400:  # Keycloak response when refresh token or user session expires
            return None
        r.raise_for_status()
        resp = TokenResponse(r.json(), self)
        if "scope" in resp._data:
            resp.scope = set(self.translate_scope_out(set(resp._data["scope"].split(" "))))
        if not hasattr(resp, "scope") or "openid" in resp.scope:
            resp.id = self.get_id(resp)

        return resp


def keycloak_client():
    g = settings()
    return KeycloakClient(g['KEYCLOAK_URL'], g['CLIENT_ID'], g['CLIENT_SECRET'])


def redirect_to_keycloak(base_url):
    kc = keycloak_client()
    return redirect(kc.authorize(base_url, None))


def fetch_tokens(base_url, code):
    kc = keycloak_client()
    return kc.request_token(base_url, code)


def require_tokens(f):
    """Function decorator to ensure we have OIDC tokens"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        kc = keycloak_client()
        if 'tokens' in session:
            if session['tokens']['expired_at'] < int(time.time()) + 5:
                response = kc.refresh_token(request.base_url, session['tokens']['refresh_token'])
                if response is None:
                    del session['tokens']
                    return 'Unauthorized', 401
                kc_id = kc.get_id(response)
                session['tokens'] = dict(
                    access_token=response.access_token,
                    expired_at=kc_id['exp'],
                    id_token=response.id_token,
                    userinfo=response.userinfo,
                    refresh_token=response._data.get('refresh_token', None),
                )
        else:
            return 'Unauthorized', 401
        return f(*args, **kwargs)
    return wrapper


def with_tokens(f):
    """Function decorator to ensure we have OIDC tokens"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        kc = keycloak_client()

        if 'tokens' in session:
            if session['tokens']['expired_at'] < int(time.time()) + 5:
                response = kc.refresh_token(request.base_url, session['tokens']['refresh_token'])
                if response is None:
                    del session['tokens']
                    session['redirect-to'] = request.args.get('redir', None)
                    return redirect_to_keycloak(request.base_url)
                kc_id = kc.get_id(response)
                session['tokens'] = dict(
                    access_token=response.access_token,
                    expired_at=kc_id['exp'],
                    id_token=response.id_token,
                    userinfo=response.userinfo,
                    refresh_token=response._data.get('refresh_token', None),
                )

        else:
            code = request.args.get('code', None)
            if code is None:
                session['redirect-to'] = request.args.get('redir', None)
                return redirect_to_keycloak(request.base_url)
            response = fetch_tokens(request.base_url, code)
            kc_id = kc.get_id(response)
            session['tokens'] = dict(
                access_token=response.access_token,
                expired_at=kc_id['exp'],
                id_token=response.id_token,
                userinfo=response.userinfo,
                refresh_token=response._data.get('refresh_token', None),
            )
        return f(*args, **kwargs)
    return wrapper
