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
import config from "../../config";
import logger from "../../logger";
import fetch from "cross-fetch";
import * as util from "util";

type ActivationStatus = {
  [key: number]: number
}

function sendMessage(data: string, channel: Channel) {
  const info = new WsMessage({ message: data }, "user", "activation");
  channel.sockets.forEach(socket => socket.send(info.toString()));
}

function getActivationStatus(projectIds: number[], channel: Channel): void {
  const { gatewayUrl } = config.deployment;
  for (let i = 0; i < projectIds.length; i++) {
    const id = projectIds[i];
    const activationStatusURL = `${gatewayUrl}/projects/${id}/graph/status`;
    logger.info(`Fetching activation from ${id} projects`);

    fetch(activationStatusURL).then(async (response) => {
      const status = await response.json();
      const previousStatuses = channel.data.get("activationProjects") as ActivationStatus;
      const currentStatus = status?.progress ?? -1;
      const previousStatus = previousStatuses ? previousStatuses[id] : null;
      if (!util.isDeepStrictEqual(previousStatus, currentStatus)) {
        const currentStatuses = { ...previousStatuses, [id]: currentStatus };
        sendMessage(JSON.stringify(currentStatuses), channel);
        channel.data.set("activationProjects", currentStatuses);
      }
    });
  }
}

async function handlerRequestActivationKgStatus(
  data: Record<string, unknown>, channel: Channel): Promise<void> {
  // save the request enabler
  if (data.projects) {
    const projectsIds = data.projects as number[];
    const currentProjectsIds = channel.data.get("projectsIds") as number[];
    const ids = currentProjectsIds?.length ? [...currentProjectsIds, ...projectsIds] : projectsIds;
    channel.data.set("projectsIds", ids);
  }
}

async function heartbeatRequestActivationKgStatus(channel: Channel): Promise<void> {
  const projectsIds = channel.data.get("projectsIds") as number[];
  if (projectsIds?.length) {
    const previousStatuses = channel.data.get("activationProjects") as ActivationStatus;
    // remove ids are complete
    const ids: number[] = previousStatuses ?
      (projectsIds).filter( (id: number) => previousStatuses[id] != 100) :
      projectsIds;
    cleanCompletedStatuses(previousStatuses, channel);

    channel.data.set("projectsIds", ids.length ? ids : []);
    getActivationStatus(ids, channel);
  }
}

function cleanCompletedStatuses(statuses: ActivationStatus, channel: Channel) {
  if (!statuses)
    return;
  const noCompletedStatus = statuses;
  Object.keys(statuses).forEach((key => {
    const id = parseInt(key);
    if (statuses[id] === 100)
      delete noCompletedStatus[id];
  }));
  channel.data.set("activationProjects", noCompletedStatus);
}

export { handlerRequestActivationKgStatus, heartbeatRequestActivationKgStatus };
