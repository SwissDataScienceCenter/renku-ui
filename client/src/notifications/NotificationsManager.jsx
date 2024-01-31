/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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

import cx from "classnames";
import { Component } from "react";
import { toast } from "react-toastify";

import { NotificationTypes } from "./Notifications.constants";
import {
  CloseToast,
  NotificationDropdownItem as NotificationDropdown,
  NotificationPageItem,
  NotificationToast,
} from "./Notifications.present";
import {
  NotificationsCoordinator,
  NotificationsInfo,
} from "./Notifications.state";

/**
 * Notifications object - it's not a React component.
 *
 * @param {Object} client - api-client used to query the gateway
 * @param {Object} model - global model for the ui
 * @param {function} getLocation - function to invoke to get the up-to-date react location object
 */
export default class NotificationsManager {
  constructor(model, client, getLocation) {
    this.model = model.subModel("notifications");
    this.client = client;
    this.getLocation = getLocation;
    this.coordinator = new NotificationsCoordinator(this.client, this.model);
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
  add(
    level,
    topic,
    desc,
    link = null,
    linkText = null,
    awareLocations = [],
    longDesc = null
  ) {
    // verify if the notification should trigger the +1.
    const locations = Array.isArray(awareLocations)
      ? awareLocations
      : [awareLocations];
    let forceRead = level === this.Levels.INFO;
    if (
      !forceRead &&
      locations.length &&
      locations.includes(window.location.pathname)
    )
      forceRead = true;

    // add the notification
    const notification = this.coordinator.addNotification(
      level,
      topic,
      desc,
      link,
      linkText,
      locations,
      longDesc,
      forceRead
    );

    // create the toast notification when required
    if (this.toastSettings.enabled && !forceRead) {
      const markRead = () => {
        this.coordinator.markRead(notification.id);
      };
      let options = {
        closeOnClick: false,
        toastId: `toast-${notification.id}`,
        className: cx(level.toLowerCase(), "card", "rounded", "flex-row"),
        position: this.toastSettings.position,
        autoClose: this.toastSettings.timeout
          ? this.toastSettings.timeout
          : false,
        closeButton: <CloseToast markRead={markRead} />,
      };
      const toastComponent = (
        <Notification
          notification={notification}
          markRead={markRead}
          type={NotificationTypes.TOAST}
        />
      );
      toast(toastComponent, options);
    }

    return notification;
  }

  addInfo(topic, desc, link, linkText, awareLocations, longDesc) {
    return this.add(
      this.Levels.INFO,
      topic,
      desc,
      link,
      linkText,
      awareLocations,
      longDesc
    );
  }
  addSuccess(topic, desc, link, linkText, awareLocations, longDesc) {
    return this.add(
      this.Levels.SUCCESS,
      topic,
      desc,
      link,
      linkText,
      awareLocations,
      longDesc
    );
  }
  addWarning(topic, desc, link, linkText, awareLocations, longDesc) {
    return this.add(
      this.Levels.WARNING,
      topic,
      desc,
      link,
      linkText,
      awareLocations,
      longDesc
    );
  }
  addError(topic, desc, link, linkText, awareLocations, longDesc) {
    return this.add(
      this.Levels.ERROR,
      topic,
      desc,
      link,
      linkText,
      awareLocations,
      longDesc
    );
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
export class Notification extends Component {
  render() {
    const { type, notification, markRead } = this.props;
    if (type === NotificationTypes.TOAST)
      return (
        <NotificationToast
          notification={notification}
          markRead={markRead}
          closeToast={this.props.closeToast}
        />
      );
    else if (type === NotificationTypes.DROPDOWN)
      return (
        <NotificationDropdown notification={notification} markRead={markRead} />
      );
    else if (type === NotificationTypes.COMPLETE)
      return (
        <NotificationPageItem notification={notification} markRead={markRead} />
      );
    else if (type === NotificationTypes.CUSTOM) return this.props.present;
    return null;
  }
}
