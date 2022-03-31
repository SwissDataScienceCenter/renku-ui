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
 *  Alert.js
 *  Alert code and presentation.
 */

import React, { Component } from "react";
import { Alert } from "reactstrap";

import rkDangerIcon from "../../styles/icons/assets/danger.svg";
import rkInfoIcon from "../../styles/icons/assets/info.svg";
import rkWarningIcon from "../../styles/icons/assets/warning.svg";
import rkSuccessIcon from "../../styles/icons/assets/success.svg";

/**
 * Display a alert that can be dismissed.
 *
 * @param {number} [timeout] - define how many seconds the component should be visible.
 *   10 is default. 0 for unlimited.
 * @param {boolean} [hidden] - hide the alert if true.
 * @param {boolean} [open] - manually pilot visibility.
 * @param {function} [dismissCallback] - function to be invoked when the alert is dismissed.
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
    if (this.props.timeout === 0)
      return;

    const timeout = this.props.timeout ? this.props.timeout : 10;
    const timeoutController = setTimeout(() => {
      this.onDismiss();
    }, timeout * 1000);
    this.setState({ timeout: timeoutController });
  }

  removeTimeout() {
    // remove the timeout when component is closed to avoid double firing callback function
    if (this.state.timeout !== null)
      clearTimeout(this.state.timeout);
  }

  onDismiss() {
    this.setState({ open: false });
    this.removeTimeout();
    if (this.props.dismissCallback)
      this.props.dismissCallback();
  }

  getIcon() {
    const icon = ({
      "danger": <img alt="danger icon" src={rkDangerIcon} />,
      "info": <img alt="info icon" src={rkInfoIcon} />,
      "warning": <img alt="warning icon" src={rkWarningIcon} />,
      "success": <img alt="success icon" src={rkSuccessIcon} />,
    })[this.props.color];

    return icon ? (
      <div className="alert-icon">{icon}</div>
    ) : "";
  }

  render() {
    const alertIcon = this.getIcon();
    if (this.props.hidden || this.state.hidden) return null;
    const isOpen = this.props.open ? this.props.open : this.state.open;
    const toggle = (this.props.dismissible === false) ? null : this.onDismiss;
    return (
      <Alert color={this.props.color} isOpen={isOpen} toggle={toggle} className={this.props.className}>
        <div className="alert-content">
          {alertIcon}
          <div>
            {this.props.children}
          </div>
        </div>
      </Alert>
    );
  }
}

function InfoAlert(props) {
  const { color = "info" } = props;
  return (
    <RenkuAlert color={color} {...props} >
      {props.children}
    </RenkuAlert>
  );
}

class SuccessAlert extends Component {
  render() {
    return (
      <RenkuAlert color="success" {...this.props} >
        {this.props.children}
      </RenkuAlert>
    );
  }
}

class WarnAlert extends Component {
  render() {
    return (
      <RenkuAlert color="warning" timeout={0} {...this.props} >
        {this.props.children}
      </RenkuAlert>
    );
  }
}

class ErrorAlert extends Component {
  render() {
    return (
      <RenkuAlert color="danger" timeout={0} {...this.props} >
        {this.props.children}
      </RenkuAlert>
    );
  }
}

export { ErrorAlert, InfoAlert, RenkuAlert, SuccessAlert, WarnAlert };
