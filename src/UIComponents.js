
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

/**
 *  incubator-renga-ui
 *
 *  App.js
 *  Coordinator for the application.
 */

import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome'

class Avatar extends Component {
  render() {
    const img = this.props.avatar;
    const user = this.props.user;
    return (img) ?
      <img height={48} src={img} alt={user} /> :
      <FontAwesome alt={user} name="user-circle-o" size="2x" style={{textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)'}} />;
  }
}

export { Avatar };
