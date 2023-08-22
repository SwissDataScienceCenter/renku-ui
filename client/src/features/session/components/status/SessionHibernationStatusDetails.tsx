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

import React from "react";
import cx from "classnames";
import { NotebookAnnotations } from "../../../../notebooks/components/session.types";
import { TimeCaption } from "../../../../components/TimeCaption";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface SessionHibernationStatusDetailsProps {
  annotations: NotebookAnnotations;
}

export default function SessionHibernationStatusDetails({
  annotations,
}: SessionHibernationStatusDetailsProps) {
  const hasHibernationInfo = !!annotations["hibernation-date"];

  return (
    <>
      {hasHibernationInfo ? (
        <>
          <p className="mb-0">
            <span className="fw-bold">Paused:</span>{" "}
            <TimeCaption
              datetime={annotations["hibernation-date"]}
              enableTooltip
              noCaption
            />
          </p>
          <p className="mb-0">
            <span className="fw-bold">Current commit:</span>{" "}
            <code>{annotations["hibernation-commit-sha"].slice(0, 8)}</code>
          </p>
          <p className="mb-0">
            <span className="fw-bold">
              {annotations["hibernation-dirty"] ? (
                <>
                  <FontAwesomeIcon
                    className={cx("text-warning", "me-1")}
                    icon={faExclamationTriangle}
                  />
                  Uncommitted files
                </>
              ) : (
                "No uncommitted files"
              )}
            </span>
          </p>
          <p className="mb-2">
            <span className="fw-bold">
              {!annotations["hibernation-synchronized"] ? (
                <>
                  <FontAwesomeIcon
                    className={cx("text-warning", "me-1")}
                    icon={faExclamationTriangle}
                  />
                  Some commits are not synced to the remote
                </>
              ) : (
                "All commits pushed to remote"
              )}
            </span>
          </p>
        </>
      ) : (
        <p className="mb-2">
          <span className="fw-bold">
            <FontAwesomeIcon
              className={cx("text-warning", "me-1")}
              icon={faExclamationTriangle}
            />
            Could not retrieve session information before the session was
            paused. There may be uncommitted files or unsynced commits.
          </span>
        </p>
      )}
    </>
  );
}
