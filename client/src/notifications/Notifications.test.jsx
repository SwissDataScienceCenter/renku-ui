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
 *  Notifications.test.js
 *  Tests for notifications
 */

import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { act } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { testClient as client } from "../api-client";
import { StateModel, globalSchema } from "../model";
import { CloseToast } from "./Notifications.present";
import NotificationsManager from "./NotificationsManager";
import NotificationsMenu from "./NotificationsMenu";
import { Notification, NotificationsPage } from "./Notifications.container";
import { NotificationsInfo } from "./Notifications.state";

const fakeLocation = { pathname: "" };

// random notifications generator
function addMultipleNotifications(notifications, quantity = 1) {
  for (let num = 0; num < quantity; num++) {
    const rnd = Math.random();
    if (rnd <= 0.33) {
      notifications.addSuccess(
        notifications.Topics.SESSION_START,
        "Session xyz has started, you can now access it.",
        "/sessions",
        "Sessions list"
      );
    } else if (rnd >= 0.67) {
      notifications.addInfo(
        "Fake topic Info",
        "I'm an info, I shouldn't appear in the menu",
        "/",
        "Home"
      );
    } else {
      notifications.addError(
        notifications.Topics.SESSION_START,
        "Test - session couldn't start",
        "/sessions",
        "Sessions list"
      );
    }
  }
}

// tests
describe("setup and use notification system", () => {
  const model = new StateModel(globalSchema);
  let notifications;
  it("create notification object", () => {
    notifications = new NotificationsManager(model, client, fakeLocation);
    expect(Object.keys(notifications)).toContain("Topics");
    expect(Object.keys(notifications.Topics)).toContain("DATASET_CREATE");
    expect(notifications.Topics.DATASET_CREATE).toBe("Dataset creation");
    expect(Object.keys(notifications.Topics).length).toBeGreaterThanOrEqual(2);
    expect(Object.keys(notifications)).toContain("Levels");
    expect(Object.keys(notifications.Levels)).toContain("INFO");
    expect(notifications.Levels.INFO).toBe("INFO".toLowerCase());
    expect(Object.keys(notifications.Levels)).toHaveLength(4);
  });

  it("add notifications", () => {
    expect(model.get("notifications.all")).toHaveLength(0);
    notifications.addWarning(
      notifications.Topics.DATASET_CREATE,
      "Warning test with external link",
      "https://getbootstrap.com",
      "External link",
      [],
      "Long description here"
    );
    expect(model.get("notifications.all")).toHaveLength(1);
    const firstNotification = model.get("notifications.all")[0];
    expect(firstNotification.level).toBe(notifications.Levels.WARNING);
    expect(firstNotification.topic).toBe(notifications.Topics.DATASET_CREATE);
    expect(firstNotification.desc).toBe("Warning test with external link");
    expect(firstNotification.link).toBe("https://getbootstrap.com");
    expect(firstNotification.linkText).toBe("External link");
    expect(firstNotification.longDesc).toBe("Long description here");
    expect(firstNotification.read).toBeFalsy();
    addMultipleNotifications(notifications, 3);
    expect(model.get("notifications.all")).toHaveLength(4);
  });

  it("NotificationsInfo object is included in the notification object", () => {
    const keys = Object.keys(NotificationsInfo).sort();
    const subNotification = Object.keys(notifications)
      .sort()
      .reduce((subNotifications, key) => {
        if (keys.includes(key)) subNotifications[key] = notifications[key];
        return subNotifications;
      }, {});
    expect(JSON.stringify(NotificationsInfo)).toBe(
      JSON.stringify(subNotification)
    );
  });
});

const model = new StateModel(globalSchema);
const props = { client, model };
const notifications = new NotificationsManager(model, client, fakeLocation);
addMultipleNotifications(notifications, 1);

describe("rendering NotificationsPage", () => {
  it("renders NotificationsPage", async () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const root = createRoot(div);
    await act(async () => {
      root.render(
        <MemoryRouter>
          <NotificationsPage {...props} notifications={notifications} />
        </MemoryRouter>
      );
    });
  });
});

describe("rendering Notification", () => {
  const notification = model.get("notifications.all")[0];
  const settings = model.get("notifications.toast");

  // setup a DOM element as a render target and cleanup on exit
  let div, root;
  beforeEach(async () => {
    await act(async () => {
      div = document.createElement("div");
      document.body.appendChild(div);
      root = createRoot(div);
    });
  });
  afterEach(async () => {
    await act(async () => {
      root.unmount(div);
      div.remove();
      div = null;
    });
  });

  it("renders Notification", async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <Notification
            type="dropdown"
            notification={notification}
            markRead={() => null}
          />
        </MemoryRouter>
      );
    });

    await act(async () => {
      root.render(
        <MemoryRouter>
          <Notification
            type="complete"
            notification={notification}
            markRead={() => null}
          />
        </MemoryRouter>
      );
    });

    await act(async () => {
      const closeToast = (
        <CloseToast settings={settings} markRead={() => true} />
      );

      root.render(
        <MemoryRouter>
          <Notification
            type="toast"
            notification={notification}
            markRead={() => null}
            closeToast={closeToast}
          />
        </MemoryRouter>
      );
    });

    await act(async () => {
      root.render(
        <MemoryRouter>
          <Notification
            type="custom"
            present={
              <div>
                <span>empty</span>
              </div>
            }
          />
        </MemoryRouter>
      );
    });
  });
});

describe("rendering NotificationsMenu", () => {
  it("renders NotificationsMenu", async () => {
    const div = document.createElement("div");
    const root = createRoot(div);
    document.body.appendChild(div);

    await act(async () => {
      root.render(
        <MemoryRouter>
          <NotificationsMenu {...props} notifications={notifications} />
        </MemoryRouter>
      );
    });
  });
});
