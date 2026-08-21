/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import { describe, expect, it } from "vitest";

import { formatAppLogTabLabel, isAppUserContainerLog } from "./appLogs.utils";

/* eslint-disable spellcheck/spell-checker */
// The pod name suffixes below are Kubernetes-generated random strings, copied in
// the shape they really have so the label formatting is exercised faithfully.

describe("isAppUserContainerLog", () => {
  it("matches the user container of a pod", () => {
    expect(
      isAppUserContainerLog(
        "my-app-00001-deployment-6b9f7-2xqzt/user-container",
      ),
    ).toBe(true);
  });

  it("does not match the other containers of a pod", () => {
    expect(
      isAppUserContainerLog("my-app-00001-deployment-6b9f7-2xqzt/queue-proxy"),
    ).toBe(false);
  });

  it("does not match a pod whose name ends with the container name", () => {
    expect(isAppUserContainerLog("app-user-container")).toBe(false);
  });
});

describe("formatAppLogTabLabel", () => {
  it("labels with the container and the pod's trailing identifier", () => {
    expect(
      formatAppLogTabLabel(
        "my-app-00001-deployment-6b9f7-2xqzt/user-container",
      ),
    ).toBe("user-container (2xqzt)");
  });

  it("keeps the two pods of an app apart", () => {
    const keys = [
      "my-app-00001-deployment-6b9f7-2xqzt/user-container",
      "my-app-00002-deployment-4c1d8-p8rzn/user-container",
    ];
    expect(keys.map(formatAppLogTabLabel)).toStrictEqual([
      "user-container (2xqzt)",
      "user-container (p8rzn)",
    ]);
  });

  it("falls back to the raw key when it is not pod/container shaped", () => {
    expect(formatAppLogTabLabel("user-container")).toBe("user-container");
    expect(formatAppLogTabLabel("my-app-pod/")).toBe("my-app-pod/");
    expect(formatAppLogTabLabel("/user-container")).toBe("/user-container");
  });

  it("uses the whole pod name when it has no trailing identifier", () => {
    expect(formatAppLogTabLabel("pod/user-container")).toBe(
      "user-container (pod)",
    );
  });
});
/* eslint-enable spellcheck/spell-checker */
