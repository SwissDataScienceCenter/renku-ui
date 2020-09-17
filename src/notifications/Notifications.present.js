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
import { ExternalLink, TimeCaption } from "../utils/UIComponents";

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


class NotificationToast extends Component {
  render() {
    const { notification, markRead, closeToast } = this.props;
    const { level, topic, desc, link, linkText } = notification;

    const icon = (<NotificationIcon level={level} />);
    const linkObj = (
      <NotificationLink link={link} linkText={linkText} markRead={markRead} closeToast={closeToast} icon={true} />
    );

    return (
      <div className="small">
        <div>
          <h6>{icon} {topic}</h6>
        </div>
        <p className="mb-1">{desc}</p>
        {linkObj}
      </div>
    );
  }
}

/**
 * Notification icon associated to the specific notification level
 *
 * @param {string} level - notification level
 */
class NotificationIcon extends Component {
  render() {
    const { level } = this.props;
    const { Levels } = NotificationsInfo;
    return (level === Levels.SUCCESS || level === Levels.INFO) ?
      (<FontAwesomeIcon icon={faInfoCircle} />) :
      (<FontAwesomeIcon icon={faExclamationTriangle} />);
  }
}

/**
 * Notification icon associated to the specific notification level
 *
 * @param {string} link - target url
 * @param {string} [linkText] - text to display as link, default is the full url
 * @param {function} [markRead] - function to mark the notification read
 * @param {function} [closeToast] - function to close the toast notification
 * @param {boolean} [icon] - toggle link icon, default false
 */
class NotificationLink extends Component {
  cleanup() {
    const { markRead, closeToast } = this.props;
    if (markRead)
      markRead();
    if (closeToast)
      closeToast();
  }

  render() {
    const { link, linkText, icon } = this.props;

    if (!link) {
      return null;
    }
    else if (link.startsWith("http")) {
      return (
        <ExternalLink url={link} title={linkText} role="link" showLinkIcon={icon} onClick={() => this.cleanup()} />
      );
    }
    const linkIcon = icon ?
      (<FontAwesomeIcon icon={faLink} />) :
      null;
    return (<Link onClick={() => this.cleanup()} to={link}>{linkIcon} {linkText}</Link>);
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

class NotificationDropdownItem extends Component {
  render() {
    const { notification, markRead, closeToast } = this.props;
    const { level, topic, desc, link, linkText, timestamp } = notification;

    const icon = (<NotificationIcon level={level} />);
    const linkObj = (
      <NotificationLink link={link} linkText={linkText} markRead={markRead} closeToast={closeToast} icon={true} />
    );
    const read = (<FontAwesomeIcon className="close-icon" icon={faTimes} onClick={() => markRead()} />);

    return (
      <Fragment>
        <TimeCaption caption="From" time={timestamp} />
        <h5>{icon} {topic} {read}</h5>
        <p>{desc}</p>
        <p>{linkObj}</p>
      </Fragment>
    );
  }
}

class NotificationsMenuList extends Component {
  // TODO: create a different Notification elelemnt? OR just add the timestamp?
  render() {
    const notifications = this.props.notifications.filter(notification =>
      notification.level !== this.props.levels.INFO &&
      !notification.read);
    let renderedNotifications = notifications.map(notification => {
      const className = `notification-list-item ${notification.level.toLowerCase()}`;
      const markRead = () => { this.props.handlers.markRead(notification.id); };

      return (
        <div key={notification.id} className={className}>
          <NotificationDropdownItem notification={notification} markRead={() => markRead()} />
        </div>
      );
    });

    const content = renderedNotifications.length ?
      (<Fragment>
        <DropdownItem divider />
        <div className="notification-list-container">{renderedNotifications}</div>
      </Fragment>) :
      null;

    return (
      <Fragment>
        <DropdownItem>Show all notifications</DropdownItem>
        <NotificationsMenuTesting {...this.props} /> {/* // ! TEST- Remove  */}
        {content}
      </Fragment>
    );
  }
}

class NotificationsMenuTesting extends Component {
  render() {
    return (
      <Fragment>
        {/* TEST ONLY */}
        <DropdownItem divider />
        <DropdownItem onClick={() => this.props.handlers.addMultipleNotifications()}>TEST - add multiple</DropdownItem>
        <DropdownItem onClick={() => this.props.handlers.addRandomNotification()}>TEST - add random</DropdownItem>
      </Fragment>
    );
  }
}


export { NotificationsMenu, NotificationToast, NotificationDropdownItem, CloseToast };
