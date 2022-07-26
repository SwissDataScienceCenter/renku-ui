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
import {
  Badge, DropdownMenu, DropdownToggle, DropdownItem, Button, Row, Col, Collapse
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLink, faInfoCircle, faExclamationTriangle, faInbox, faTimes, faCheck, faCheckCircle
} from "@fortawesome/free-solid-svg-icons";

import { NotificationsInfo } from ".";

import "./Notifications.css";
import { ExternalLink } from "../utils/components/ExternalLinks";
import { TimeCaption } from "../utils/components/TimeCaption";


/**
 * Close button for the toast notification.
 * REF: https://fkhadra.github.io/react-toastify/use-a-custom-close-button-or-remove-it/
 *
 * @param {function} markRead - function to mark the notification as read
 * @param {function} [closeToast] - function to close the toast notification
 */
class CloseToast extends Component {
  close() {
    if (this.props.markRead)
      this.props.markRead();
    if (this.props.closeToast)
      this.props.closeToast();
  }

  render() {
    const addedClasses = this.props.addClasses ? ` ${this.props.addClasses}` : null;
    const className = `btn-close me-2 mt-2 ${addedClasses}`;

    return (
      <button type="button" className={className}
        data-bs-dismiss="toast" aria-label="Close" onClick={() => { this.close(); }}>{" "}
      </button>
    );
  }
}


class NotificationToast extends Component {
  render() {
    const { notification, markRead, closeToast } = this.props;
    const { level, topic, desc, link, linkText, longDesc } = notification;

    const icon = (<NotificationIcon className="color me-2" level={level} />);
    const linkObj = (
      <NotificationLink link={link} linkText={linkText ? linkText : link}
        markRead={markRead} closeToast={closeToast} icon={true} childClass={"link-" + getColorFromLevel(level)} />
    );
    const notificationsLink = longDesc ?
      (<Fragment>
        <br /><Link to="/notifications" onClick={() => { if (closeToast) closeToast(); }}>[more info]</Link>
      </Fragment>) :
      null;

    return (<Fragment>
      <div className="toast-header border-bottom-0">
        {icon}
        <strong className="me-auto mt-1">{topic}</strong>
      </div>
      <div className="toast-body pt-2">
        <p className="mb-1">{desc} {notificationsLink}</p>
        {linkObj}
      </div>
    </Fragment>
    );
  }
}

function getColorFromLevel(level) {
  const { Levels } = NotificationsInfo;
  switch (level) {
    case Levels.SUCCESS:
      return "success";
    case Levels.WARNING:
      return "warning";
    case Levels.ERROR:
      return "danger";
    default:
      return "info";
  }
}

/**
 * Notification icon associated to the specific notification level
 *
 * @param {string} level - notification level
 */
class NotificationIcon extends Component {
  render() {
    const { level, size, className } = this.props;
    const { Levels } = NotificationsInfo;

    let sizeIcon = size ?
      size :
      null;

    switch (level) {
      case Levels.SUCCESS:
        return <FontAwesomeIcon icon={faCheckCircle}
          color="var(--bs-success)" size={sizeIcon} className={className} />;
      case Levels.WARNING:
        return <FontAwesomeIcon icon={faExclamationTriangle}
          color="var(--bs-warning)" size={sizeIcon} className={className} />;
      case Levels.ERROR:
        return <FontAwesomeIcon icon={faExclamationTriangle}
          color="var(--bs-danger)" size={sizeIcon} className={className} />;
      default:
        return <FontAwesomeIcon icon={faInfoCircle}
          color="var(--bs-info)" size={sizeIcon} className={className} />;
    }
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
 * @param {string} [role] - "button" or "link" to define the appearance. "link" is the default
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
    const { link, linkText, icon, onlyIcon, childClass, iconSize, role } = this.props;
    let text = "";
    if (!onlyIcon) {
      text = linkText ?
        linkText :
        link;
    }
    const displayAs = role ?
      role :
      "link";

    if (!link) {
      return null;
    }
    else if (link.startsWith("http")) {
      return (
        <ExternalLink className={childClass} url={link} title={text} role={displayAs}
          showLinkIcon={icon || onlyIcon} iconSize={iconSize} onClick={() => this.cleanup()} />
      );
    }
    const linkIcon = icon || onlyIcon ?
      (<FontAwesomeIcon icon={faLink} size={iconSize} />) :
      null;

    const fullClass = displayAs === "button" ?
      `${childClass} btn btn-secondary` :
      childClass;

    return (
      <Link className={fullClass} title={linkText}
        onClick={() => this.cleanup()} to={link}>{linkIcon} {text}</Link>
    );
  }
}

class NotificationsMenu extends Component {
  render() {
    if (!this.props.enabled)
      return null;

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
        <DropdownMenu className="notification-menu btn-with-menu-options" end
          key="notifications-bar" aria-labelledby="notifications-menu">
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
      const className = `notification-list-item pt-3 notification ${notification.level.toLowerCase()}`;
      const markRead = () => { this.props.handlers.markRead(notification.id); };

      return (
        <div key={notification.id} className={className}>
          <NotificationDropdownItem notification={notification} markRead={() => markRead()} />
        </div>
      );
    });

    const content = renderedNotifications.length ?
      (<div className="notification-list-container mt-2">{renderedNotifications}</div>) :
      null;

    return (
      <Fragment>
        <Link to="/notifications"><DropdownItem>Notifications ({renderedNotifications.length})</DropdownItem></Link>
        {content}
      </Fragment>
    );
  }
}

class NotificationDropdownItem extends Component {
  render() {
    const { notification, markRead, closeToast } = this.props;
    const { level, topic, desc, link, linkText, timestamp, longDesc } = notification;

    const icon = (<NotificationIcon className="color" level={level} />);
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
        <h5 className="pb-1">{icon} {topic} {read}</h5>
        <p className="pb-1">{desc} {notificationsLink} </p>
        <span>{linkObj}</span>
        <span className="float-end"><TimeCaption caption=" " time={timestamp} /></span>
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
          <Row className="pt-2 pb-3">
            <Col className="d-flex mb-2 justify-content-between">
              <h2 >Notifications</h2>
            </Col>
          </Row>
          <p className="font-italic">No unread notifications.</p>
        </Fragment>
      );
    }
    else {
      if (newNotifications && newNotifications.length) {
        const newContent = newNotifications
          .sort((a, b) => b.timestamp - a.timestamp)
          .map(notification => (
            <NotificationPageItem key={notification.id} notification={notification} read={false}
              markRead={() => this.props.handlers.markRead(notification.id)} />
          ));

        newSection = (
          <Fragment>
            <Row className="pt-2 pb-3">
              <Col className="d-flex mb-2 justify-content-between">
                <h2 >Notifications</h2>
                <Button color="secondary" size="sm" className="mb-3" onClick={() => { handlers.markAllRead(); }}>
                  <FontAwesomeIcon icon={faCheck}
                  /> Mark all as read
                </Button>
              </Col>
            </Row>
            <Col className="mb-3 ">{newContent}</Col>
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
            <NotificationPageItem key={notification.id} notification={notification} read={true}
              markRead={() => this.props.handlers.markRead(notification.id)} />
          ));
        readSection = (
          <Fragment>
            <Row className="pt-3 pb-3">
              <Col className="d-flex mb-2 justify-content-between">
                <h2>Already read</h2>
              </Col>
            </Row>
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
    const { level, topic, desc, link, linkText, timestamp, longDesc, id } = notification;

    let markReadButton = null, linkButton = null;
    if (!read) {
      const readId = `read-button-${id}`;
      markReadButton = (
        <Fragment>
          <Button id={readId} color="secondary" size="sm"
            outline onClick={() => markRead()}>
            <FontAwesomeIcon icon={faCheck}
            />  Mark as read
          </Button>
        </Fragment>
      );
    }
    if (link) {
      linkButton = (
        <NotificationLink childClass="fs-6"
          link={link} linkText={linkText}
          className="link-primary"
          icon={true} markRead={markRead} />
      );
    }

    const readClass = read ?
      " read" :
      "";
    const levelClass = level.toLowerCase();
    const className = `d-flex flex-row rk-search-result notification ${levelClass}${readClass}`;

    return <div className={className}>
      <NotificationIcon className="color p-0 m-2 cursor-default" level={level}/>
      <Col className="d-flex align-items-start flex-column col-9 overflow-hidden">
        <div className="title d-inline-block">
          {topic}  {linkButton}
        </div>
        <div className="text-rk-text">
          <span>{desc}</span>
          <NotificationPageItemDetails text={longDesc} />
        </div>
        <div className="mt-auto">
          <TimeCaption caption=" " time={timestamp} className="text-secondary"/>
        </div>
      </Col>
      <Col className="d-flex align-items-end flex-column flex-shrink-0">
        {markReadButton}
      </Col>
    </div>;
  }
}

function NotificationPageItemDetails(props) {
  const [visible, setVisible] = useState(false);
  const toggleVisibility = () => setVisible(!visible);

  if (!props.text)
    return null;
  return (
    <Fragment>
      <br />
      <span onClick={toggleVisibility} className="link-primary ms-1">
        [{visible ? "less" : "more"} info]
      </span>
      <Collapse isOpen={visible}>
        <br />
        <span>{props.text}</span>
      </Collapse>
    </Fragment>
  );
}


export {
  NotificationsMenu, NotificationToast, NotificationDropdownItem, CloseToast, Notifications, NotificationPageItem
};
