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
 *  Notifications.state.js
 *  Notifications controller code.
 */

const NotificationsInfo = {
  Levels: {
    INFO: "info",
    SUCCESS: "success",
    WARNING: "warning",
    ERROR: "error",
  },
  Topics: {
    DATASET_CREATE: "Dataset creation",
    ENVIRONMENT_START: "Interactive environment",
  },
};

class NotificationsCoordinator {
  constructor(client, model) {
    this.client = client;
    this.model = model;
  }

  getToastSettings() {
    return this.model.get("toast");
  }

  /**
   * Add a notification to the list
   *
   * @param {string} level - notification level as in Notifications.Levels
   * @param {string} topic - general topic as in Notifications.Topics.key
   * @param {string} desc - short description/information.
   * @param {string} [link] - source page or target page relevant for a follow up.
   * @param {string} [linkText] - text to show on the link.
   * @param {string} [longDesc] - detailed description of what happened.
   */
  addNotification(level, topic, desc, link, linkText, longDesc) {
    const notification = {
      id: Math.random().toString(36).substring(2),
      timestamp: new Date(),
      level,
      topic,
      desc,
      link,
      linkText,
      longDesc,
      read: level === NotificationsInfo.Levels.INFO ? true : false
    };
    const notifications = this.model.get("");
    let updateObject = { all: { $set: [...notifications.all, notification] } };
    if (level !== NotificationsInfo.Levels.INFO)
      updateObject.unread = notifications.unread + 1;
    this.model.setObject(updateObject);
    return notification;
  }

  markRead(id) {
    const notifications = this.model.get("");
    let changed = false;
    const updateAll = notifications.all.map((elem) => {
      if (elem.id === id && !elem.read) {
        changed = true;
        elem.read = true;
      }
      return elem;
    });
    if (changed) {
      this.model.setObject({
        all: { $set: updateAll },
        unread: notifications.unread - 1
      });
    }
  }
}

export { NotificationsInfo, NotificationsCoordinator };
