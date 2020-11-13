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

import React, { Component, Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, DropdownMenu, DropdownToggle, DropdownItem, Button, Row, Col, Collapse } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLink, faInfoCircle, faExclamationTriangle, faInbox, faTimes, faCheckSquare
} from "@fortawesome/free-solid-svg-icons";

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
    const { level, topic, desc, link, linkText, longDesc } = notification;

    const icon = (<NotificationIcon level={level} />);
    const linkObj = (
      <NotificationLink link={link} linkText={linkText ? linkText : link}
        markRead={markRead} closeToast={closeToast} icon={true} />
    );
    const notificationsLink = longDesc ?
      (<Link to="/notifications" onClick={() => { if (closeToast) closeToast(); }}>[more info]</Link>) :
      null;

    return (
      <div className="small">
        <div>
          <h6>{icon} {topic}</h6>
        </div>
        <p className="mb-1">{desc} {notificationsLink}</p>
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
    const { level, size } = this.props;
    const { Levels } = NotificationsInfo;

    let sizeIcon = size ?
      size :
      null;
    return (level === Levels.SUCCESS || level === Levels.INFO) ?
      (<FontAwesomeIcon icon={faInfoCircle} size={sizeIcon} className="color" />) :
      (<FontAwesomeIcon icon={faExclamationTriangle} size={sizeIcon} className="color" />);
  }
}

/**
 * Notification icon associated to the specific notification level
 *
 * @param {string} link - target url
 * @param {string} [linkText] - text to display as link and description, default is the full url.
 * @param {function} [markRead] - function to mark the notification read
 * @param {function} [closeToast] - function to close the toast notification
 * @param {boolean} [icon] - toggle link icon, default false
 * @param {boolean} [onlyIcon] - toggle to remove the text.
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
    const { link, linkText, icon, onlyIcon, childClass, iconSize } = this.props;
    let text = "";
    if (!onlyIcon) {
      text = linkText ?
        linkText :
        link;
    }

    if (!link) {
      return null;
    }
    else if (link.startsWith("http")) {
      return (
        <ExternalLink className={childClass} url={link} title={text} role="link"
          showLinkIcon={icon || onlyIcon} iconSize={iconSize} onClick={() => this.cleanup()} />
      );
    }
    const linkIcon = icon || onlyIcon ?
      (<FontAwesomeIcon icon={faLink} size={iconSize} />) :
      null;
    return (
      <Link className={childClass} title={linkText} onClick={() => this.cleanup()} to={link}>{linkIcon} {text}</Link>
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
        {/* This throws an error in test: Warning `Reference` should not be used outside of a `Manager` component. */}
        <DropdownToggle className="nav-link" nav caret>
          <FontAwesomeIcon icon={faInbox} id="notificationsBarIcon" />
          {badge}
        </DropdownToggle>
        <DropdownMenu className="notification-menu" right key="notifications-bar" aria-labelledby="notifications-menu">
          <NotificationsMenuList {...this.props} />
        </DropdownMenu>
      </Fragment>
    );
  }
}

class NotificationsMenuList extends Component {
  render() {
    const notifications = this.props.notifications.filter(notification =>
      notification.level !== this.props.levels.INFO &&
      !notification.read);
    let renderedNotifications = notifications.map(notification => {
      const className = `notification-list-item notification ${notification.level.toLowerCase()}`;
      const markRead = () => { this.props.handlers.markRead(notification.id); };

      return (
        <div key={notification.id} className={className}>
          <NotificationDropdownItem notification={notification} markRead={() => markRead()} />
        </div>
      );
    });

    const content = renderedNotifications.length ?
      (<Fragment>
        <DropdownItem onClick={() => this.props.handlers.markAllRead()}>Mark all read</DropdownItem>
        <DropdownItem divider />
        <div className="notification-list-container">{renderedNotifications}</div>
      </Fragment>) :
      null;

    return (
      <Fragment>
        <NotificationsMenuTesting {...this.props} /> {/* // ! TEST- Remove  */}
        <Link to="/notifications"><DropdownItem>Notification page</DropdownItem></Link>
        {content}
      </Fragment>
    );
  }
}

class NotificationDropdownItem extends Component {
  render() {
    const { notification, markRead, closeToast } = this.props;
    const { level, topic, desc, link, linkText, timestamp, longDesc } = notification;

    const icon = (<NotificationIcon level={level} />);
    const linkObj = (
      <NotificationLink link={link} linkText={linkText ? linkText : link} markRead={markRead}
        closeToast={closeToast} icon={true} />
    );
    const read = (<FontAwesomeIcon className="close-icon" icon={faTimes} onClick={() => markRead()} />);
    const notificationsLink = longDesc ?
      (<Link to="/notifications">[more info]</Link>) :
      null;

    return (
      <Fragment>
        <p><TimeCaption caption=" " time={timestamp} /></p>
        <h5>{icon} {topic} {read}</h5>
        <p>{desc} {notificationsLink}</p>
        <p>{linkObj}</p>
      </Fragment>
    );
  }
}

class Notifications extends Component {
  render() {
    const { notifications, handlers } = this.props;

    const newNotifications = notifications && notifications.filter(notification => !notification.read);
    const readNotifications = notifications && notifications.filter(notification => notification.read);

    let newSection = null, readSection = null;
    if (!notifications || !notifications.length) {
      newSection = (
        <Fragment>
          <h1>Notifications</h1>
          <p className="font-italic">No unread notifications.</p>
        </Fragment>
      );
    }
    else {
      if (newNotifications && newNotifications.length) {
        const newContent = newNotifications
          .sort((a, b) => b.timestamp - a.timestamp)
          .map(notification => (
            <Row key={notification.id} className="notification-page-item">
              <NotificationPageItem notification={notification} read={false}
                markRead={() => this.props.handlers.markRead(notification.id)} />
            </Row>
          ));
        newSection = (
          <Fragment>
            <h1>New notifications</h1>
            <Button color="primary" size="sm" className="mb-3" onClick={() => { handlers.markAllRead(); }}>
              Mark all as read
            </Button>
            <Col className="mb-3">{newContent}</Col>
          </Fragment>
        );
      }
      else {
        newSection = (
          <p className="font-italic">No unread notifications.</p>
        );
      }
      if (readNotifications && readNotifications.length) {
        const readContent = readNotifications
          .sort((a, b) => b.timestamp - a.timestamp)
          .map(notification => (
            <Row key={notification.id} className="notification-page-item">
              <NotificationPageItem notification={notification} read={true}
                markRead={() => this.props.handlers.markRead(notification.id)} />
            </Row>
          ));
        readSection = (
          <Fragment>
            <h1>Already read</h1>
            <Col className="mb-3">{readContent}</Col>
          </Fragment>
        );
      }
    }

    return (
      <Fragment>
        {newSection}
        {readSection}
      </Fragment>
    );
  }
}

class NotificationPageItem extends Component {
  render() {
    const { notification, markRead, read } = this.props;
    const { level, topic, desc, link, linkText, timestamp, longDesc } = notification;

    let markReadButton = null, linkButton = null;
    if (!read) {
      markReadButton = (
        <Button color="link" className="p-0 m-2" onClick={() => markRead()}>
          <FontAwesomeIcon icon={faCheckSquare} size="lg" />
        </Button>
      );
    }
    if (link) {
      linkButton = (
        <NotificationLink childClass="p-0 mx-2 my-auto" link={link} linkText={linkText} onlyIcon={true} iconSize="lg"
          markRead={markRead} />
      );
    }

    const readClass = read ?
      " read" :
      "";
    const levelClass = level.toLowerCase();
    const className = `d-flex pt-2 pb-2 border-top notification ${levelClass}${readClass}`;

    return (
      <div className={className}>
        <div className="d-flex flex-column my-auto mx-1">
          <NotificationIcon level={level} size="2x" />
        </div>
        <div className="d-flex flex-fill flex-column ml-2 mw-0 flex-sm-row">
          <div className="d-flex flex-column">
            <p className="mt-auto mb-auto">
              <b>{topic}</b>
              <span className="ml-2">
                <TimeCaption caption=" " time={timestamp} />
              </span>
            </p>
            <div className="mt-auto mb-auto">
              <span>{desc}</span>
              <NotificationPageItemDetails text={longDesc} />
            </div>
          </div>
          <div className="d-flex flex-shrink-0 ml-sm-auto">
            {linkButton}
            {markReadButton}
          </div>
        </div>
      </div>
    );
  }
}

function NotificationPageItemDetails(props) {
  const [visible, setVisible] = useState(false);
  const toggleVisibility = () => setVisible(!visible);

  if (!props.text)
    return null;
  return (
    <Fragment>
      <Button color="link" className="pr-0 pl-1 pt-0 pb-0 mb-1" onClick={toggleVisibility} >
        <small>[{visible ? "less" : "more"} info]</small>
      </Button>
      <Collapse isOpen={visible}>
        <br />
        <span>{props.text}</span>
      </Collapse>
    </Fragment>
  );
}

class NotificationsMenuTesting extends Component {
  render() {
    return (
      <Fragment>
        {/* // ! TEST ONLY */}
        <DropdownItem onClick={() => this.props.handlers.addMultipleNotifications()}>TEST - add multiple</DropdownItem>
        <DropdownItem onClick={() => this.props.handlers.addRandomNotification()}>TEST - add random</DropdownItem>
        <DropdownItem divider />
      </Fragment>
    );
  }
}


export {
  NotificationsMenu, NotificationToast, NotificationDropdownItem, CloseToast, Notifications, NotificationPageItem
};
