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
 *  Notifications.container.js
 *  Container components for notifications
 */

import React, { Component } from "react";
import { toast } from "react-toastify";
import { connect } from "react-redux";

import { NotificationsCoordinator, NotificationsInfo } from "./Notifications.state";
import {
  NotificationToast, CloseToast, NotificationsMenu as NotificationsMenuPresent,
  NotificationDropdownItem as NotificationDropdown
} from "./Notifications.present";


const NotificationTypes = {
  TOAST: "toast",
  DROPDOWN: "dropdown",
  COMPLETE: "complete",
  CUSTOM: "custom"
};

/**
 * Notifications object - it's not a React component.
 *
 * @param {Object} client - api-client used to query the gateway
 * @param {Object} model - global model for the ui
 * @param {Object} location - react location object
 */
class NotificationsManager {
  constructor(model, client, location) {
    this.location = location;
    this.model = model.subModel("notifications");
    this.coordinator = new NotificationsCoordinator(client, this.model);
    this.Levels = NotificationsInfo.Levels;
    this.Topics = NotificationsInfo.Topics;

    // can't be static anymore once users will be able to change settings from the UI
    this.toastSettings = this.coordinator.getToastSettings();
  }

  /**
   * Add a notification to the list
   *
   * @param {string} level - notification level as in NotificationsInfo.Levels
   * @param {string} topic - general topic as in NotificationsInfo.Topics
   * @param {string} desc - short description/information.
   * @param {string} [link] - source page or target page relevant for a follow up.
   * @param {string} [linkText] - text to show on the link.
   * @param {string[]} [awareLocations] - list of locations where the user would know about the information
   * @param {string} [longDesc] - detailed description of what happened.
   */
  add(level, topic, desc, link = null, linkText = null, awareLocations = [], longDesc = null) {
    // verify if the notification should trigger the +1.
    const locations = Array.isArray(awareLocations) ?
      awareLocations :
      [awareLocations];
    let forceRead = level === this.Levels.INFO ?
      true :
      false;
    if (!forceRead && locations.length && locations.includes(this.location.pathname))
      forceRead = true;

    // add the notification
    const notification = this.coordinator.addNotification(
      level, topic, desc, link, linkText, locations, longDesc, forceRead);

    // create the toast notification when required
    if (this.toastSettings.enabled && !forceRead) {
      const markRead = () => { this.coordinator.markRead(notification.id); };
      let options = {
        closeOnClick: false,
        toastId: `toast-${notification.id}`,
        className: level.toLowerCase(),
        position: this.toastSettings.position,
        autoClose: this.toastSettings.timeout ? this.toastSettings.timeout : false,
        closeButton: <CloseToast markRead={markRead} />
      };
      const toastComponent = (
        <Notification notification={notification} markRead={markRead} type={NotificationTypes.TOAST} />
      );
      toast(toastComponent, options);
    }

    return notification;
  }

  addInfo(topic, desc, link, linkText, awareLocations, longDesc) {
    return this.add(this.Levels.INFO, topic, desc, link, linkText, awareLocations, longDesc);
  }
  addSuccess(topic, desc, link, linkText, awareLocations, longDesc) {
    return this.add(this.Levels.SUCCESS, topic, desc, link, linkText, awareLocations, longDesc);
  }
  addWarning(topic, desc, link, linkText, awareLocations, longDesc) {
    return this.add(this.Levels.WARNING, topic, desc, link, linkText, awareLocations, longDesc);
  }
  addError(topic, desc, link, linkText, awareLocations, longDesc) {
    return this.add(this.Levels.ERROR, topic, desc, link, linkText, awareLocations, longDesc);
  }
}

/**
 * Generic notification component.
 *
 * @param {string} type - the notification type. Available types are "toast", "dropdown", "complete"
 *  and "custom". The presentational component is expected as props.present if you choose the "custom" type.
 * @param {Object} notification - notification object as created by the NotificationsManager.
 * @param {function} markRead - function to mark the component as read.
 * @param {Object} [present] - react component for the presentation. Required for "custom" type notifications.
 * @param {function} [closeToast] - function to close the toast notification. Required for "toast" notifications
 */
class Notification extends Component {
  render() {
    const { type, notification, markRead } = this.props;
    if (type === NotificationTypes.TOAST)
      return (<NotificationToast notification={notification} markRead={markRead} closeToast={this.props.closeToast} />);
    else if (type === NotificationTypes.DROPDOWN)
      return (<NotificationDropdown notification={notification} markRead={markRead} />);

    return null;
  }
}

/**
 * NotificationsMenu component.
 *
 * @param {Object} client - api-client used to query the gateway
 * @param {Object} model - global model for the ui
 * @param {Object} notifications - global notifications object
 */
class NotificationsMenu extends Component {
  constructor(props) {
    super(props);
    this.model = props.model.subModel("notifications");
    this.coordinator = new NotificationsCoordinator(props.client, this.model);

    this.handlers = {
      markRead: this.markRead.bind(this),
      addMultipleNotifications: this.addMultipleNotifications.bind(this), // ! TEMP - only for testing
      addRandomNotification: this.addRandomNotification.bind(this), // ! TEMP - only for testing
    };
  }

  // ! TEMP - only for testing
  addMultipleNotifications() {
    const { notifications } = this.props;
    notifications.addWarning(
      notifications.Topics.DATASET_CREATE,
      "Warning test with external link",
      "https://getbootstrap.com",
      "External link");
    notifications.addSuccess(
      notifications.Topics.ENVIRONMENT_START,
      "Environment xyz has started, you can now access it.",
      "/environments",
      "Environments list",
      "/environments");
    notifications.addInfo(
      "Fake topic Info",
      "I'm an info, I shouldn't appear",
      "/",
      "Home");
    notifications.addError(
      notifications.Topics.ENVIRONMENT_START,
      "Test - environment couldn't start",
      "/help",
      "Help page",
      ["/help"]);
  }
  // ! TEMP - only for testing
  addRandomNotification() {
    const { notifications } = this.props;
    const rdn = Math.random();
    let level, topic, desc, link, linkText;
    if (rdn < 0.3) {
      level = notifications.Levels.INFO;
      topic = "Random info";
      desc = "Randomly generated info notification";
    }
    else if (rdn < 0.6) {
      level = notifications.Levels.SUCCESS;
      topic = "Random success";
      desc = "Randomly generated success notification";
      if (rdn < 0.5) {
        link = "/";
        linkText = "Check home";
      }
      else {
        link = "https://getbootstrap.com";
        linkText = "External link";
      }
    }
    else if (rdn < 0.8) {
      level = notifications.Levels.WARNING;
      topic = "Random warning";
      desc = "Randomly generated success warning";
      link = "/environments";
      linkText = "Environments list";
    }
    else {
      level = notifications.Levels.ERROR;
      topic = "Random error";
      desc = "Randomly generated success error";
      link = "https://github.com/fkhadra/react-toastify";
      linkText = "Toastify library";
    }

    notifications.add(level, topic, desc, link, linkText);
  }

  markRead(id) {
    this.coordinator.markRead(id);
  }

  mapStateToProps(state, ownProps) {
    return {
      handlers: this.handlers,
      notifications: state.notifications.all,
      unread: state.notifications.unread
    };
  }

  render() {
    const VisibleNotificationsMenu = connect(this.mapStateToProps.bind(this))(NotificationsMenuPresent);
    return (<VisibleNotificationsMenu
      store={this.model.reduxStore}
      levels={this.props.notifications.Levels} />);
  }
}

export { NotificationsManager, NotificationsMenu, Notification };
