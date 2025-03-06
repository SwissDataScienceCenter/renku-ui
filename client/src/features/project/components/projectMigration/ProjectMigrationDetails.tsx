/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
import { useCallback, useMemo, useState } from "react";
import {
  BarChartSteps,
  Bookmarks,
  CardImage,
  Check2Circle,
  Database,
  FileCode,
  FileEarmarkRuled,
  FileText,
  FileX,
  People,
  PlayCircle,
} from "react-bootstrap-icons";
import { Link } from "react-router-dom-v5-compat";
import { Collapse } from "reactstrap";
import { InfoAlert } from "../../../../components/Alert.jsx";
import ChevronFlippedIcon from "../../../../components/icons/ChevronFlippedIcon";
import { Links } from "../../../../utils/constants/Docs.js";
import { ResourceClass } from "../../../dataServices/dataServices.types";
import { SessionRowResourceRequests } from "../../../session/components/SessionsList";
import { GitLabRepositoryCommit } from "../../GitLab.types";

interface DetailsMigrationProps {
  isPinnedImage?: boolean;
  commits?: GitLabRepositoryCommit[];
  containerImage?: string;
  branch?: string;
  keywords?: string;
  description?: string;
  codeRepository: string;
  resourceClass?: ResourceClass;
  isProjectSupported: boolean;
}
export function DetailsMigration({
  isPinnedImage,
  commits,
  containerImage,
  branch,
  keywords,
  description,
  codeRepository,
  resourceClass,
  isProjectSupported,
}: DetailsMigrationProps) {
  const [showDetails, setShowDetails] = useState(false);
  const onToggleShowDetails = useCallback(() => {
    setShowDetails((isOpen) => !isOpen);
  }, []);

  const commitMessage = useMemo(() => {
    return commits ? commits[0].message : "";
  }, [commits]);
  const shortIdCommit = useMemo(() => {
    return commits ? commits[0].short_id : undefined;
  }, [commits]);

  const resourceClassData = resourceClass
    ? {
        gpu: resourceClass.gpu,
        cpu: resourceClass.cpu,
        storage: resourceClass.max_storage,
        memory: resourceClass.memory,
      }
    : undefined;

  const containerImageInfo = (
    <div>
      <span>- Container image:</span> <code>{containerImage}</code>
    </div>
  );
  const resourceClassInfo = (
    <div className={cx("d-flex", "flex-row", "gap-2")}>
      <span>- Resource class:</span>
      {resourceClass ? (
        <>
          <span>{resourceClass?.name} |</span>
          <SessionRowResourceRequests resourceRequests={resourceClassData} />
        </>
      ) : (
        <span className="fst-italic">Resource class not found</span>
      )}
    </div>
  );

  const detailsSession = (
    <div className={cx("ps-4", "d-flex", "flex-column", "gap-2", "pb-2")}>
      {isPinnedImage ? (
        <>
          <div>
            The pinned image for this project will be used to create a session
            launcher.
          </div>
          {containerImageInfo}
          {resourceClassInfo}
        </>
      ) : (
        <>
          <div>
            The latest image for this project will be used to create a session
            launcher.
          </div>
          {containerImageInfo}
          <div>
            <span>- Branch:</span> <code>{branch}</code>
          </div>
          <div>
            <span>- Commit:</span> <code>{shortIdCommit}</code> -{" "}
            <code>{commitMessage}</code>
          </div>
          {resourceClassInfo}
        </>
      )}
    </div>
  );

  const containerImageInfoAlert = (
    <div className="py-2">
      <InfoAlert dismissible={false} timeout={0}>
        This session image will not update as you make additional commits.{" "}
        <Link
          to={Links.RENKU_2_MIGRATION_INFO}
          className={cx("text-info")}
          rel="noreferrer noopener"
          target="_blank"
        >
          Learn more
        </Link>
      </InfoAlert>
    </div>
  );

  return (
    <>
      {!isPinnedImage &&
        containerImage &&
        isProjectSupported &&
        !showDetails &&
        containerImageInfoAlert}
      <div className="mb-2">
        <a
          className={cx(
            "d-inline-block",
            "cursor-pointer",
            "fw-bold",
            "text-decoration-none"
          )}
          onClick={onToggleShowDetails}
        >
          <Check2Circle size={20} className={cx("me-1")} /> What will be
          migrated <ChevronFlippedIcon className="ms-1" flipped={showDetails} />
        </a>
      </div>
      <div className="mb-3">
        <Collapse isOpen={showDetails}>
          <div className="mx-4">
            <div className="py-2">
              <span className="fw-bold">
                <FileCode className={cx("bi", "me-1")} />
                Code repository:
              </span>{" "}
              {codeRepository}
            </div>
            <div className="py-2">
              <span className="fw-bold">
                <FileEarmarkRuled className={cx("bi", "me-1")} /> Datasets &
                Data in Git LFS:{" "}
              </span>
              Will continue to be available via the git lfs command line
            </div>
            <div className="py-2">
              <span className="fw-bold">
                <PlayCircle className={cx("bi", "me-1")} /> Session launcher{" "}
              </span>
            </div>
            {detailsSession}
            {!isPinnedImage &&
              containerImage &&
              isProjectSupported &&
              showDetails &&
              containerImageInfoAlert}
            <div className="py-2">
              <span className="fw-bold">
                <BarChartSteps className={cx("bi", "me-1")} /> Workflows:{" "}
              </span>
              Will continue to be available via the git lfs command line
            </div>
            <div className="py-2">
              <span className="fw-bold">
                <FileText className={cx("bi", "me-1")} /> Description:
              </span>{" "}
              {description ? (
                description
              ) : (
                <span className="text-body-secondary">
                  Description not found
                </span>
              )}
            </div>
            <div className="py-2">
              <span className="fw-bold">
                <Bookmarks className={cx("bi", "me-1")} /> Keywords:
              </span>{" "}
              {keywords ? (
                keywords
              ) : (
                <span className="text-body-secondary">Keywords not found</span>
              )}
            </div>
          </div>
        </Collapse>
      </div>
    </>
  );
}

export function DetailsNotIncludedInMigration() {
  const [showDetails, setShowDetails] = useState(true);
  const onToggleShowDetails = useCallback(() => {
    setShowDetails((isOpen) => !isOpen);
  }, []);

  return (
    <div>
      <div className="mb-2">
        <a
          className={cx(
            "d-inline-block",
            "cursor-pointer",
            "fw-bold",
            "text-decoration-none"
          )}
          onClick={onToggleShowDetails}
        >
          <FileX size={20} className={cx("me-1")} /> What will NOT be migrated{" "}
          <ChevronFlippedIcon className="ms-1" flipped={showDetails} />
        </a>
      </div>
      <div className="mb-3">
        <Collapse isOpen={showDetails}>
          <div className="mx-4">
            <div className="py-2">
              <span className="fw-bold">
                <People className={cx("bi", "me-1")} /> Members:
              </span>{" "}
              Members will not be migrated. Please add members directly to the
              Renku 2.0 project.
            </div>
            <div className="py-2">
              <span className="fw-bold">
                <Database className={cx("bi", "me-1")} /> Cloud storage:
              </span>{" "}
              We&apos;re sorry, cloud storage migration isn&apos;t available at
              the moment. Please reconfigure your cloud storage as a Renku 2.0
              Data Connector.
            </div>
            <div className="py-2">
              <span className="fw-bold">
                <CardImage className={cx("bi", "me-1")} /> Project image:
              </span>{" "}
              We&apos;re sorry, project image migration isn&apos;t available at
              the moment.
            </div>
          </div>
        </Collapse>
      </div>
    </div>
  );
}
