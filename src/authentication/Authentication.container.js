/*!
 * Copyright 2019 - Swiss Data Science Center (SDSC)
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

/**
*  renku-ui
*
*  authentication/Authentication.container.js
*  Authentication components to log in and out.
*/


import React, { Component } from 'react';


// always pass "previous" with the current `location.pathname`
class Login extends Component {
  render() {
    let redirectUrl = this.props.params.BASE_URL;
    if (this.props.location.state && this.props.location.state.previous) {
      redirectUrl += this.props.location.state.previous;
    }
    window.location =
      `${this.props.params.GATEWAY_URL}/auth/login?redirect_url=${encodeURIComponent(redirectUrl)}`;
    return <p>logging in</p>;
  }
}

export { Login };
