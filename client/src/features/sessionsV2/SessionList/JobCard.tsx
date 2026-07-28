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

import cx from "classnames";
import { KeyboardEvent, MouseEvent, useCallback } from "react";
import { Col, Row } from "reactstrap";

import {
  getLauncherCategoryDefinition,
  sessionLauncherKindToCategory,
} from "~/features/sessionsV2/session.utils";
import { Project } from "../../projectsV2/api/projectV2.api";
import ActiveSessionButton from "../components/SessionButton/ActiveSessionButton";
import {
  SessionStatusV2Badge,
  SessionStatusV2Description,
} from "../components/SessionStatus/SessionStatus";
import { getShowSessionUrlByProject } from "../SessionsV2";
import { SessionV2 } from "../sessionsV2.types";

interface JobCardProps {
  project: Project;
  session?: SessionV2;
  onOpen?: (submissionId: string) => void;
}
export default function JobCard({ project, session, onOpen }: JobCardProps) {
  const handleOpen = useCallback(() => {
    if (session?.submission_id && onOpen) {
      onOpen(session.submission_id);
    }
  }, [onOpen, session]);

  const stopPropagation = useCallback((event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation();
  }, []);

  if (!session) return null;

  const launcherCategory = sessionLauncherKindToCategory(session.session_type);
  const launcherDefinition = getLauncherCategoryDefinition(launcherCategory);

  return (
    <div
      data-cy="job-item"
      className={cx(
        "p-0",
        "pb-3",
        "border",
        "border-1",
        "border-top-0",
        "border-left-0",
        "border-right-0",
        "border-bottom",
        onOpen && "cursor-pointer",
      )}
      onClick={onOpen ? handleOpen : undefined}
      role={onOpen ? "button" : undefined}
      aria-label={
        onOpen ? `View details for job ${session.submission_id}` : undefined
      }
      tabIndex={onOpen ? 0 : undefined}
    >
      <div className={cx("ms-3", "px-3", "pt-3")}>
        <Row className={cx("g-2", "align-items-center")}>
          <Col
            xs={12}
            lg={6}
            className={cx(
              "d-flex",
              "align-items-center",
              "gap-2",
              "min-w-0",
              "link-primary",
              "text-body",
              "mt-1",
              "mt-lg-0",
            )}
          >
            <div data-cy="job-submission-id" className="text-truncate">
              {launcherDefinition.text.display}: {session.submission_id}
            </div>
            <SessionStatusV2Badge session={session} />
          </Col>
          <Col
            xs={12}
            lg={6}
            className={cx(
              "d-flex",
              "flex-column",
              "flex-md-row",
              "align-items-md-center",
              "justify-content-between",
              "justify-content-md-end",
              "gap-2",
            )}
          >
            <div
              className={cx(
                "d-flex",
                "justify-content-lg-end",
                "text-start",
                "text-md-end",
              )}
            >
              <SessionStatusV2Description
                session={session}
                showInfoDetails={true}
                includeIcon={false}
              />
            </div>
            <div
              className={cx("d-flex", "justify-content-end", "flex-shrink-0")}
              onClick={stopPropagation}
              onKeyDown={stopPropagation}
            >
              <ActiveSessionButton
                session={session}
                showSessionUrl={getShowSessionUrlByProject(
                  project,
                  session.name,
                )}
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
