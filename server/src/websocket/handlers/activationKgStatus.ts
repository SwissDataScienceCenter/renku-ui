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

import { Channel } from "../index";
import { WsMessage } from "../WsMessages";
import * as util from "util";
import APIClient from "../../api-client";
import { AsyncSemaphore } from "../../utils/asyncSemaphore";
import logger from "../../logger";
import config from "../../config";

type ActivationStatus = {
  [key: string]: number
}

interface ActivationResult {
  progress: number;
}

function sendMessage(data: string, channel: Channel) {
  const info = new WsMessage({ message: data }, "user", "activation");
  channel.sockets.forEach(socket => socket.send(info.toString()));
}

function getActivationStatus(id: number, channel: Channel, apiClient: APIClient, authHeaders: Headers) {
  return apiClient.kgActivationStatus(id, authHeaders)
    .then(async (response) => {
      const status = response as unknown as ActivationResult;
      const previousStatuses = channel.data.get("activationProjects") as ActivationStatus;
      const currentStatus = status?.progress ?? -1;
      const previousStatus = previousStatuses ? previousStatuses[`${id}`] : null;
      if (!util.isDeepStrictEqual(previousStatus, currentStatus)) {
        const currentStatuses = { ...previousStatuses, [`${id}`]: currentStatus };
        sendMessage(JSON.stringify(currentStatuses), channel);
        channel.data.set("activationProjects", currentStatuses);
      }
    })
    .catch((err) => {
      if (err.status != 404) {
        // remove id from project ids list
        const projectIds = channel.data.get("projectsIds") as Record<number, Date>;
        delete projectIds[id];
        channel.data.set("projectsIds", projectIds);

        // inform client that there is an error getting activation status
        const previousStatuses = channel.data.get("activationProjects") as ActivationStatus;
        const currentStatuses = { ...previousStatuses, [`${id}`]: -2 };
        sendMessage(JSON.stringify(currentStatuses), channel);
        channel.data.set("activationProjects", currentStatuses);
      }
    });
}

async function getAllActivationStatus(
  projectIds: Record<number, Date>, channel: Channel, apiClient: APIClient, authHeaders: Headers
): Promise<void> {
  const semaphore = new AsyncSemaphore(5);
  const ids = Object.keys(projectIds);
  for (let i = 0; i < ids.length; i++) {
    const id = parseInt(ids[i]);
    await semaphore.withLockRunAndForget(() => getActivationStatus(id, channel, apiClient, authHeaders));
  }

  await semaphore.awaitTerminate();
}


async function handlerRequestActivationKgStatus(
  data: Record<string, unknown>, channel: Channel): Promise<void> {
  // save the request enabler
  if (data.projects) {
    const projectsIds = data.projects as number[];
    const projectIdsToCheck = channel.data.get("projectsIds") as Record<number, Date> ?? {};
    projectsIds.forEach( (id) => {
      if (!projectIdsToCheck[id])
        projectIdsToCheck[id] = new Date();
    });
    channel.data.set("projectsIds", projectIdsToCheck);
  }
}

async function heartbeatRequestActivationKgStatus(
  channel: Channel, apiClient: APIClient, authHeaders: Headers
): Promise<void> {
  const projectsIds = channel.data.get("projectsIds") as Record<number, Date>;
  if (projectsIds) {
    const previousStatuses = channel.data.get("activationProjects") as ActivationStatus;
    const { ids } = cleanCompletedStatuses(previousStatuses, projectsIds, channel);
    getAllActivationStatus(ids, channel, apiClient, authHeaders);
  }
}

function cleanCompletedStatuses(statuses: ActivationStatus, projectIds: Record<number, Date>, channel: Channel) {
  const validIds = projectIds ?? {};
  // clean status when are completed
  if (statuses) {
    const noCompletedStatus = statuses;
    Object.keys(statuses).forEach((key => {
      const id = parseInt(key);
      if (statuses[id] && statuses[id] === 100) {
        delete noCompletedStatus[id];

        if (validIds[id])
          delete validIds[id];
      }
    }));
    channel.data.set("activationProjects", noCompletedStatus);
  }

  // clean projectIds that exceed time
  Object.keys(projectIds).forEach((key => {
    const id = parseInt(key);
    const exceedTime = exceedTimeRequest(projectIds[id]);
    if (exceedTime) {
      delete validIds[id];
      logger.info(`Removed id ${ id } due timeout, starting fetching at ${projectIds[id]}`);
      sendMessage(JSON.stringify({ [id]: -408 }), channel);
    }
  }));

  channel.data.set("projectsIds", validIds);

  return {
    ids: validIds
  };
}

function exceedTimeRequest(initialFetch: Date): boolean {
  const diff = new Date().getTime() - initialFetch.getTime();
  const diffMinutes = (diff / 60000);
  return diffMinutes >= config.websocket.timeoutActivationStatus;
}

export { handlerRequestActivationKgStatus, heartbeatRequestActivationKgStatus };
