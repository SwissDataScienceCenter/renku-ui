/*!
 * Copyright 2020 - Swiss Data Science Center (SDSC)
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
 *  Notifications.present.js
 *  Presentational components for notifications
 */

import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import { Badge, DropdownMenu, DropdownToggle, DropdownItem } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faInfoCircle, faExclamationTriangle, faInbox, faTimes } from "@fortawesome/free-solid-svg-icons";

import { NotificationsInfo } from ".";
import { ExternalLink } from "../utils/UIComponents";

import "./Notifications.css";


/**
 * Close button for the toast notification.
 * REF: https://fkhadra.github.io/react-toastify/use-a-custom-close-button-or-remove-it/
 *
 * @param {function} markRead - function to mark the notification as read
 * @param {function} [closeToast] - function to close the toast notification
 */
class CloseToast extends Component {
  close() {
    this.props.markRead();
    if (this.props.closeToast)
      this.props.closeToast();
  }

  render() {
    const addedClasses = this.props.addClasses ? ` ${this.props.addClasses}` : null;
    const className = `Toastify__close-button Toastify__close-button--default${addedClasses}`;

    return (
      <button className={className} aria-label="close"
        onClick={() => { this.close(); }}>
        <FontAwesomeIcon icon={faTimes} />
      </button>
    );
  }
}


class Notification extends Component {
  render() {
    const { notification, settings } = this.props;
    if (!settings.enabled)
      return null;

    let link = null;
    if (notification.link) {
      const target = notification.link.startsWith("http") ?
        (<ExternalLink url={notification.link} title={notification.linkText} role="link" showLinkIcon={true}
          onClick={() => this.props.markRead()} />) :
        (<Link onClick={() => this.props.markRead()} to={notification.link}>
          <FontAwesomeIcon icon={faLink} /> {notification.linkText}
        </Link>);
      link = (<p className="mb-1">{target}</p>);
    }

    const icon = notification.level === NotificationsInfo.Levels.SUCCESS ?
      (<FontAwesomeIcon icon={faInfoCircle} />) :
      (<FontAwesomeIcon icon={faExclamationTriangle} />);

    return (
      <div className="small">
        {this.props.renderCloseButton ? this.props.renderCloseButton : null}
        <div>
          <h6>{icon} {notification.topic}</h6>
        </div>
        <p className="mb-1">{notification.desc}</p>
        {link}
      </div>
    );
  }
}

class NotificationsMenu extends Component {
  render() {
    const badge = this.props.unread ?
      (<Badge color="danger" className="notification-badge">{this.props.unread}</Badge>) :
      null;
    return (
      <Fragment>
        <DropdownToggle className="nav-link" nav caret>
          <FontAwesomeIcon icon={faInbox} id="notificationsBarIcon" />
          {badge}
        </DropdownToggle>
        {/* //TODO: adjust the size, maybe with modifiers. REF: https://reactstrap.github.io/components/dropdowns/ */}
        <DropdownMenu right key="notifications-bar" aria-labelledby="gitLab-menu">
          <NotificationsMenuList {...this.props} />
        </DropdownMenu>
      </Fragment>
    );
  }
}

class NotificationsMenuList extends Component {
  // TODO: create a different Notification elelemnt? OR just add the timestamp?
  render() {
    const settings = { enabled: true };
    const notifications = this.props.notifications.filter(notification =>
      notification.level !== this.props.levels.INFO &&
      !notification.read);
    let renderNotifications = notifications.map(notification => {
      const className = "notification-list-item Toastify__toast Toastify__toast--default " +
        notification.level.toLowerCase();
      const markRead = () => { this.props.handlers.markRead(notification.id); };
      const closeButton = (
        <CloseToast settings={settings} notification={notification} addClasses="float-right font16"
          markRead={() => markRead()} />
      );
      return (
        <div key={notification.id} className={className}>
          <Notification settings={settings} notification={notification}
            renderCloseButton={closeButton} markRead={() => markRead()} />
        </div>
      );
    });
    if (!renderNotifications.length)
      renderNotifications = (<DropdownItem className="font-italic">Nothing new</DropdownItem>);

    return (
      <Fragment>
        <DropdownItem>Show all notifications</DropdownItem>
        <DropdownItem divider />
        <div className="notification-list-container">{renderNotifications}</div>
      </Fragment>
    );
  }
}


export { NotificationsMenu, Notification, CloseToast };
