
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
 *  incubator-renku-ui
 *
 *  UIComponents.js
 *  Utility UI components for the application.
 */

import React, { Component } from 'react';
import { FormFeedback, FormGroup, FormText, Input, Label, Alert } from 'reactstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faUser from '@fortawesome/fontawesome-free-solid/faUser'
import human from 'human-time';
import ReactPagination from "react-js-pagination";

import { NavLink as RRNavLink }  from 'react-router-dom'
import { NavLink } from 'reactstrap';

import { Provider, connect } from 'react-redux'

class Avatar extends Component {
  computeWidgetSize() {
    const size = this.props.size || 'lg';
    let widgetSize = {img: 36, fa: '2x'};
    switch(size) {
    case 'sm': widgetSize = {img: 18, fa: null}; break;
    case 'md': widgetSize = {img: 18*2, fa: '2x'}; break;
    case 'lg': widgetSize = {img: 18*3, fa: '3x'}; break;
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
    } else {
      img = this.props.avatar;
      user = this.props.user;
    }
    return (img) ?
      <img width={widgetSize.img} src={img} alt={user} /> :
      <FontAwesomeIcon alt={user} icon={faUser} size={widgetSize.fa}
        style={{textShadow: '0 1px 0 rgba(0, 0, 0, 0.1)'}} />;
  }
}

// Old FieldGroup implementation
//
// class FieldGroup extends Component {
//   render() {
//     const label = this.props.label,
//       help = this.props.help,
//       props = this.props;
//     return <FormGroup>
//       <Label>{label}</Label>
//       <Input {...props} />
//       {help && <FormText color="muted">{help}</FormText>}
//     </FormGroup>
//   }
// }

class FieldGroup extends Component {
  render() {
    const label = this.props.label,
      help = this.props.help,
      feedback = this.props.feedback,
      props = this.props;
    const subprops = {}
    if (props.valid === true)
      subprops.valid = "true";
    if (props.invalid === true)
      subprops.invalid = "true";
    return <FormGroup>
      <Label>{label}</Label>
      <Input {...props} />
      {feedback && <FormFeedback {...subprops}>{feedback}</FormFeedback>}
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

/**
 * Provide a react-router-compatible link to a URL. Show the link as active
 * if it matches either the to or alternate URL.
 */
class RenkuNavLink extends Component {

  constructor() {
    super()
    this.isActive = this.testActive.bind(this);
  }

  testActive(match, location) {
    const alt = this.props.alternate;
    let haveMatch = match != null;
    if (alt == null) return haveMatch;
    return haveMatch || location.pathname.startsWith(alt);
  }

  render() {
    const { previous, title } = this.props;
    const to = previous ?
      { "pathname": this.props.to, "state": { previous } } :
      this.props.to;
    const exact = (this.props.exact != null) ? this.props.exact : true;
    return <NavLink exact={exact} to={to} isActive={this.isActive} tag={RRNavLink}>{title}</NavLink>
  }
}

class UserAvatarPresent extends Component {
  render() {
    return <Avatar size="sm" person={this.props.user} />
  }
}

class UserAvatar extends Component {
  constructor(props) {
    super(props);
    this.store = this.props.userState;
  }

  mapStateToProps(state, ownProps) {
    return {...state}
  }

  render() {
    const VisibleAvatar = connect(this.mapStateToProps)(UserAvatarPresent);
    return [
      <Provider key="new" store={this.store}>
        <VisibleAvatar userState={this.props.userState}/>
      </Provider>
    ]
  }
}

class Pagination extends Component {
  render() {

    // We do not display the pagination footer when there are no pages or only one page
    if (this.props.totalItems == null
        || this.props.totalItems < 1
        || this.props.totalItems <= this.props.perPage) {
      return null;
    }

    return <ReactPagination
      activePage={this.props.currentPage}
      itemsCountPerPage={this.props.perPage}
      totalItemsCount={this.props.totalItems}
      onChange={this.props.onPageChange}

      // Some defaults for the styling
      prevPageText={'Previous'}
      nextPageText={'Next'}
      itemClass={'page-item'}
      linkClass={'page-link'}
      activeClass={'page-item active'}
      hideFirstLastPages={true}
    />
  }
}

class ExternalLink extends Component {
  render() {
    let className = "btn btn-primary";
    if (this.props.size != null) {
      className += ` btn-${this.props.size}`;
    }
    if (this.props.disabled) {
      className += " disabled";
    }
    if (this.props.className) {
      className += ` ${this.props.className}`;
    }
    return <a href={this.props.url}
      className={className} role="button" target="_blank"
      rel="noreferrer noopener">{this.props.title}</a>
  }
}

class Loader extends Component {
  render() {
    const size = this.props.size || 120;
    const d = `${size}px`;
    // Inspired from https://www.w3schools.com/howto/howto_css_loader.asp
    const border = `${size / 10}px solid #f3f3f3`;
    const borderTop = `${size / 10}px solid #5561A6`; // Use SDSC Dark Blue
    const borderRight = borderTop; // Added a borderRight to make a half-circle
    const borderRadius = "50%";
    const animation =  "spin 2s linear infinite";
    const left = this.props.inline ? "" : "40%", right = left;
    const display = this.props.inline ? "inline-block" : "";
    const verticalAlign = this.props.inline ? "middle" : "";
    const margin = `m-${this.props.margin ? this.props.margin : 0}`;
    return <div className={ margin } style={{
      width: d, height: d,
      border, borderTop, borderRight, borderRadius, animation, left, right, display, verticalAlign,
      position: 'relative',
    }}></div>
  }
}

/**
 * Use `hidden` to completely hide the alert, `open` to manually control the visibility,
 * `dismissCallback` to attach a function to be called when the alert is dismissed,
 * `timeout` to control how many seconds the component should be visible: 0 for unlimited,
 * default 10, it fires `dismissCallback` but keep in mind it is overwritten by `open`
 */

class RenkuAlert extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: true,
      timeout: null,
    };

    this.onDismiss = this.onDismiss.bind(this);
  }

  componentDidMount() {
    this.addTimeout();
  }

  componentWillUnmount() {
    this.removeTimeout();
  }

  addTimeout() {
    // add the timeout and keep track of the timeout variable to clear it when the alert
    // is manually closed
    if (this.props.timeout === 0) {
      return;
    }
    const timeout = this.props.timeout ? this.props.timeout : 10;
    const timeoutController = setTimeout(() => {
      this.onDismiss();
    }, timeout * 1000);
    this.setState({timeout: timeoutController});
  }

  removeTimeout() {
    // remove the timeout when component is closed to avoid double firing callback function
    if (this.state.timeout !== null) {
      clearTimeout(this.state.timeout);
    }
  }

  onDismiss() {
    this.setState({ open: false });
    this.removeTimeout();
    if (this.props.dismissCallback) {
      this.props.dismissCallback();
    }
  }

  render() {
    if (this.props.hidden || this.state.hidden) return null;
    const isOpen = this.props.open ? this.props.open : this.state.open;
    return (
      <Alert color={this.props.color} isOpen={isOpen} toggle={this.onDismiss}>
        {this.props.children}
      </Alert>
    );
  }
}

class InfoAlert extends Component {
  render() {
    return(
      <RenkuAlert color="primary" {...this.props} >
        {this.props.children}
      </RenkuAlert>
    )
  }
}

class SuccessAlert extends Component {
  render() {
    return(
      <RenkuAlert color="success" {...this.props} >
        {this.props.children}
      </RenkuAlert>
    )
  }
}

class WarnAlert extends Component {
  render() {
    return(
      <RenkuAlert color="warning" timeout={0} {...this.props} >
        {this.props.children}
      </RenkuAlert>
    )
  }
}

class ErrorAlert extends Component {
  render() {
    return(
      <RenkuAlert color="danger" timeout={0} {...this.props} >
        {this.props.children}
      </RenkuAlert>
    )
  }
}

export { Avatar, TimeCaption, FieldGroup, RenkuNavLink, UserAvatar, Pagination };
export { ExternalLink, Loader, InfoAlert, SuccessAlert, WarnAlert, ErrorAlert };
