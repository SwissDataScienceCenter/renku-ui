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

import { NotificationsCoordinator, Notifications as NotificationsInfo } from "./Notifications.state";
import { Notification, CloseToast, NotificationsMenu as NotificationsMenuPresent } from "./Notifications.present";


/**
 * Notifications component
 *
 * @param {object} client
 * @param {object} model
 */
const Notifications = (props) => {
  const model = props.model.subModel("notifications");
  const coordinator = new NotificationsCoordinator(props.client, model);
  const { Levels, Topics } = NotificationsInfo;

  // get toast settings -- can't be static anymore once users will be able to change settings from the UI
  const settings = coordinator.getToastSettings();

  /**
   * Add a notification to the list
   *
   * @param {string} level - notification level as in NotificationsInfo.Levels
   * @param {string} topic - general topic as in NotificationsInfo.Topics
   * @param {string} desc - short description/information.
   * @param {string} [link] - source page or target page relevant for a follow up.
   * @param {string} [linkText] - text to show on the link.
   * @param {string} [longDesc] - detailed description of what happened.
   */
  const add = (level, topic, desc, link, linkText, longDesc) => {
    const notification = coordinator.addNotification(level, topic, desc, link, linkText, longDesc);
    if (settings.enabled && level !== Levels.INFO) {
      const markRead = () => { coordinator.markRead(notification.id); };
      let options = {
        closeOnClick: false,
        toastId: `toast-${notification.id}`,
        className: level.toLowerCase(),
        position: settings.position,
        autoClose: settings.timeout ? settings.timeout : false,
        closeButton: <CloseToast markRead={markRead} />
      };
      const toastPresent = (<Notification notification={notification} settings={settings} markRead={markRead} />);
      toast(toastPresent, options );
    }
  };

  const addInfo = (topic, desc, link, linkText, longDesc) => {
    return add(Levels.INFO, topic, desc, link, linkText, longDesc);
  };
  const addSuccess = (topic, desc, link, linkText, longDesc) => {
    return add(Levels.SUCCESS, topic, desc, link, linkText, longDesc);
  };
  const addWarning = (topic, desc, link, linkText, longDesc) => {
    return add(Levels.WARNING, topic, desc, link, linkText, longDesc);
  };
  const addError = (topic, desc, link, linkText, longDesc) => {
    return add(Levels.ERROR, topic, desc, link, linkText, longDesc);
  };

  return { Levels, Topics, add, addInfo, addSuccess, addWarning, addError };
};

/**
 * NotificationsMenu component
 *
 * @param {object} xxx
 */
class NotificationsMenu extends Component {
  constructor(props) {
    super(props);
    this.model = props.model.subModel("notifications");
    this.coordinator = new NotificationsCoordinator(props.client, this.model);

    this.handlers = {
      markRead: this.markRead.bind(this),
    };
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

export { Notifications, NotificationsMenu };
