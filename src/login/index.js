/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';

// TODO: Find a way to access the previous route (before login) for a more meaningful redirect url (or make
// TODO: this a non-component).
class Login extends Component {
  render() {
    window.location =
      `${this.props.params.GATEWAY_URL}/auth/login?redirect_url=${encodeURIComponent(this.props.params.BASE_URL)}`;
    return <p>logging in</p>;
  }
}

class Logout extends Component {
  render() {
    this.props.cookies.remove('access_token');
    this.props.cookies.remove('refresh_token');
    this.props.cookies.remove('id_token');
    this.props.cookies.remove('jh_token');

    window.location = `${this.props.params.GATEWAY_URL}/auth/logout?` +
      `redirect_url=${encodeURIComponent(this.props.params.BASE_URL)}`;
    return <p>logging out</p>;
  }
}


export { Logout, Login };
