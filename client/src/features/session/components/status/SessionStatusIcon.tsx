/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Loader } from "../../../../components/Loader";
import SessionPausedIcon from "../../../../components/icons/SessionPausedIcon";
import { SessionStatusState } from "../../sessions.types";

interface SessionStatusIconProps {
  defaultImage: boolean;
  status: SessionStatusState;
}

export default function SessionStatusIcon({
  defaultImage,
  status,
}: SessionStatusIconProps) {
  return status === "running" && defaultImage ? (
    <FontAwesomeIcon icon={faExclamationTriangle} size="lg" />
  ) : status === "running" ? (
    <FontAwesomeIcon icon={faCheckCircle} size="lg" />
  ) : status === "starting" || status === "stopping" ? (
    <Loader size={16} inline />
  ) : status === "hibernated" ? (
    <SessionPausedIcon size={16} />
  ) : status === "failed" ? (
    <FontAwesomeIcon icon={faTimesCircle} size="lg" />
  ) : (
    <FontAwesomeIcon icon={faExclamationTriangle} size="lg" />
  );
}
