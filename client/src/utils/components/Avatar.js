/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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
 *  Avatar.js
 *  Avatar code and presentation.
 */

import React, { Component, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

/**
 * Show user avatar
 *
 * @param {string} size - image size (sm, md, lg). Default is 'lg'
 * @param {string} person - user data object, as returned by /user api.
 *   It must contain at least `avatar_url` and `username`
 */
class UserAvatar extends Component {
  computeWidgetSize() {
    const size = this.props.size || "lg";
    let widgetSize = { img: 36, fa: "2x" };
    switch (size) {
      case "sm": widgetSize = { img: 18, fa: null }; break;
      case "md": widgetSize = { img: 18 * 2, fa: "2x" }; break;
      case "lg": widgetSize = { img: 18 * 3, fa: "3x" }; break;
      case "xl": widgetSize = { img: 18 * 6, fa: "6x" }; break;
      default: break;
    }
    return widgetSize;
  }

  render() {
    let img, user;
    const widgetSize = this.computeWidgetSize();
    const person = this.props.person;
    if (person != null) {
      img = person.avatar_url;
      user = person.username;
    }
    else {
      img = this.props.avatar;
      user = this.props.user;
    }
    return (img) ?
      <img width={widgetSize.img} src={img} alt={user} /> :
      <div style={{ minWidth: widgetSize.img, textAlign: "center" }}>
        <FontAwesomeIcon alt={user} icon={faUser} size={widgetSize.fa}
          style={{ textShadow: "0 1px 0 rgba(0, 0, 0, 0.1)" }} /></div>;
  }
}

function ProjectAvatar(props) {

  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    if (props.avatar_url) setAvatarUrl(props.avatar_url);
  }, [props]);

  return props.avatar_url ? <UserAvatar avatar={avatarUrl} size="xl" /> : null;
}

export { UserAvatar, ProjectAvatar };
