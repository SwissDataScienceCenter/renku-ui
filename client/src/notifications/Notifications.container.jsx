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

import { Component } from "react";
import { connect } from "react-redux";

import { NotificationTypes } from "./Notifications.constants";
import {
  NotificationDropdownItem as NotificationDropdown,
  NotificationPageItem,
  NotificationToast,
  Notifications as NotificationsPresent,
} from "./Notifications.present";
import { NotificationsCoordinator } from "./Notifications.state";

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

/**
 * NotificationsPage component.
 *
 * @param {Object} client - api-client used to query the gateway
 * @param {Object} model - global model for the ui
 * @param {Object} notifications - global notifications object
 */
class NotificationsPage extends Component {
  constructor(props) {
    super(props);
    this.model = props.model.subModel("notifications");
    this.coordinator = new NotificationsCoordinator(props.client, this.model);

    this.handlers = {
      markRead: this.markRead.bind(this),
      markAllRead: this.markAllRead.bind(this),
    };
  }

  markRead(id) {
    this.coordinator.markRead(id);
  }

  markAllRead() {
    this.coordinator.markAllRead();
  }

  mapStateToProps(state) {
    return {
      handlers: this.handlers,
      notifications: state.stateModel.notifications.all,
      unread: state.stateModel.notifications.unread,
    };
  }

  render() {
    const VisibleNotifications = connect(this.mapStateToProps.bind(this))(
      NotificationsPresent
    );
    return (
      <VisibleNotifications
        store={this.model.reduxStore}
        levels={this.props.notifications.Levels}
        topics={this.props.notifications.Topics}
        location={this.props.location}
      />
    );
  }
}

export { Notification, NotificationsPage };
