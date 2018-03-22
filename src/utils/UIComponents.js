
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
 *  UIComponents.js
 *  Utility UI components for the application.
 */

import React, { Component } from 'react';
import { FormGroup, FormText, Input, Label } from 'reactstrap';
import FontAwesome from 'react-fontawesome'
import human from 'human-time';

import { NavLink as RRNavLink }  from 'react-router-dom'
import { NavLink } from 'reactstrap';

class Avatar extends Component {
  render() {
    let img, user;
    const person = this.props.person;
    if (person != null) {
      img = person.avatar_url;
      user = person.username;
    } else {
      img = this.props.avatar;
      user = this.props.user;
    }
    return (img) ?
      <img width={36} src={img} alt={user} /> :
      <FontAwesome alt={user} name="user-circle-o" size="2x" style={{textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)'}} />;
  }
}

class FieldGroup extends Component {
  render() {
    const label = this.props.label,
      help = this.props.help,
      props = this.props;
    return <FormGroup>
      <Label>{label}</Label>
      <Input {...props} />
      {help && <FormText color="muted">{help}</FormText>}
    </FormGroup>
  }
}

class TimeCaption extends Component {
  // Take a time and caption and generate a span that shows it
  render() {
    const time = this.props.time;
    const displayTime = human((new Date() - new Date(time)) / 1000);
    const caption = (this.props.caption) ? this.props.caption : 'Updated';
    return <span className="time-caption">{caption} {displayTime}.</span>
  }
}

class RengaNavLink extends Component {
  render() {
    const to = this.props.to;
    const title = this.props.title;
    const exact = (this.props.exact != null) ? this.props.exact : true;
    return <NavLink exact={exact} to={to} tag={RRNavLink}>{title}</NavLink>
  }
}

export { Avatar, TimeCaption, FieldGroup, RengaNavLink };
