/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

import {
  ActivationStatusProgressError,
  filterProgressingProjects,
} from "../../features/inactiveKgProjects/";
import {
  setActivationSlow,
  updateProgress,
} from "../../features/inactiveKgProjects/inactiveKgProjectsSlice";
import type { KgInactiveProjectsState } from "../../features/inactiveKgProjects/inactiveKgProjectsSlice";

type ActivationStatus = {
  [key: string]: number;
};

const SLOW_ACTIVATION_CUTOFF_MS = 60 * 1000;

/* eslint-disable @typescript-eslint/no-explicit-any */

function handleKgActivationStatus(
  data: Record<string, unknown>,
  _webSocket: WebSocket,
  model: any,
  notifications: any
) {
  if (data.message) {
    const statuses = JSON.parse(data.message as string) as ActivationStatus;
    updateStatus(statuses, model.reduxStore);
    processStatusForNotifications(statuses, notifications);
  }
  return null;
}

function handleWebSocketErrorForKgActivationStatus(model: any) {
  // Set the status of any pending KG indexing to an error state
  const state = model?.reduxStore?.getState();
  // kgInactiveProjects
  const kgInactiveProjects: KgInactiveProjectsState = state?.kgInactiveProjects;
  if (kgInactiveProjects == null) return;
  const progressingProjects = filterProgressingProjects(
    kgInactiveProjects.inactiveProjects
  );
  if (progressingProjects.length === 0) return;

  const kgActivation: Record<string, number> = {};
  progressingProjects.forEach((project) => {
    kgActivation[`${project.id}`] =
      ActivationStatusProgressError.WEB_SOCKET_ERROR;
  });
  updateStatus(kgActivation, model.reduxStore);
}

function handleWebSocketPing(model: any) {
  // Set the status of any pending KG indexing to an error state
  const state = model?.reduxStore?.getState();
  // kgInactiveProjects
  const kgInactiveProjects: KgInactiveProjectsState = state?.kgInactiveProjects;
  if (kgInactiveProjects?.activationStatus?.lastUpdateAt == null) return;
  // Already set to slow
  if (kgInactiveProjects?.activationStatus?.isActivationSlow === true) return;

  const now = Date.now();
  const lastUpdateAt = kgInactiveProjects.activationStatus.lastUpdateAt;
  if (now - lastUpdateAt > SLOW_ACTIVATION_CUTOFF_MS) {
    model.reduxStore.dispatch(setActivationSlow(true));
  }
}

function updateStatus(kgActivation: ActivationStatus, store: any) {
  Object.keys(kgActivation).forEach((projectId: string) => {
    const id = parseInt(projectId);
    if (id > 0) {
      const status = kgActivation[projectId] ?? null;
      store.dispatch(updateProgress({ id, progress: status }));
    }
  });
}

function processStatusForNotifications(
  statuses: ActivationStatus,
  notifications: any
) {
  Object.keys(statuses).forEach((projectId: string) => {
    const id = parseInt(projectId);
    if (id > 0) {
      const status = statuses[id] ?? null;
      if (status === 100) {
        notifications.addSuccess(
          notifications.Topics.KG_ACTIVATION,
          "Project indexing has been activated.",
          "/inactive-kg-projects",
          "Go to activation page",
          "/inactive-kg-projects",
          "Check the status of projects that need to be indexed."
        );
      }
      if (status === -2) {
        notifications.addError(
          notifications.Topics.KG_ACTIVATION,
          "Project indexing has been activated, but with errors.",
          "/inactive-kg-projects",
          "Go to activation page",
          "/inactive-kg-projects",
          "Check the status of projects that need to be indexed"
        );
      }
    }
  });
}

export {
  handleKgActivationStatus,
  handleWebSocketErrorForKgActivationStatus,
  handleWebSocketPing,
  updateStatus,
};
