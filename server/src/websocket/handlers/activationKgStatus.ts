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

import ws from "ws";

import { Channel } from "../index";
import { WsMessage } from "../WsMessages";
import config from "../../config";
import logger from "../../logger";
import fetch from "cross-fetch";
import * as util from "util";

type ActivationStatus = {
  [key: number]: number
}

async function getActivationStatus(projectIds: number[]): Promise<ActivationStatus> {
  const { gatewayUrl } = config.deployment;
  let statuses = {};
  for (let i = 0; i < projectIds.length; i++) {
    const id = projectIds[i];
    const activationStatusURL = `${gatewayUrl}/projects/${id}/graph/status`;
    logger.info(`Fetching activation from ${id} projects`);

    const response = await fetch(activationStatusURL);
    const status = await response.json();
    const progressActivation = status?.progress ?? -1;
    statuses = { ...statuses, [id]: progressActivation };
  }
  return statuses;
}

async function handlerRequestActivationKgStatus(
  data: Record<string, unknown>, channel: Channel, socket: ws): Promise<void> {
  // save the request enabler
  if (data.projects) {
    const projectsIds = data.projects as number[];
    channel.data.set("projectsIds", data.projects);
    if (!projectsIds.length)
      return;

    const statuses = await getActivationStatus(projectsIds as number[]);
    const dataResponse = JSON.stringify(statuses);
    channel.data.set("activationProjects", statuses);
    const response = { start: true, message: dataResponse };
    socket.send((new WsMessage(response, "user", "activation")).toString());
  }
}

async function heartbeatRequestActivationKgStatus(channel: Channel): Promise<void> {
  const previousStatuses = channel.data.get("activationProjects") as ActivationStatus;
  const projectsIds = channel.data.get("projectsIds") as number[];

  if (projectsIds?.length && previousStatuses) {
    // remove ids are complete
    const ids: number[] = (projectsIds).filter( (id: number) => previousStatuses[id] != 100);

    channel.data.set("projectsIds", ids.length ? ids : []);
    const statuses = await getActivationStatus(ids);

    if (!util.isDeepStrictEqual(previousStatuses, statuses)) {
      channel.data.set("activationProjects", statuses);
      const response = { start: true, message: JSON.stringify(statuses) };
      const info = new WsMessage(response, "user", "activation");
      channel.sockets.forEach(socket => socket.send(info.toString()));
    }
  }
}

export { handlerRequestActivationKgStatus, heartbeatRequestActivationKgStatus };
