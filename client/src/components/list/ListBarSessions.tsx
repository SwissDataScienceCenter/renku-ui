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

import React, {
  Fragment,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import {
  Badge,
  PopoverBody,
  PopoverHeader,
  UncontrolledPopover,
} from "reactstrap";
import SessionButton from "../../features/session/components/SessionButton";
import { SessionStatusState } from "../../features/session/sessions.types";
import { Notebook } from "../../notebooks/components/Session";
import { getStatusObject } from "../../notebooks/components/SessionListStatus";
import AppContext from "../../utils/context/appContext";
import { toHumanDateTime } from "../../utils/helpers/DateTimeUtils";
import { stylesByItemType } from "../../utils/helpers/HelperFunctions";
import { Clipboard } from "../Clipboard";
import { ExternalLink } from "../ExternalLinks";
import { TimeCaption } from "../TimeCaption";
import EntityCreators from "../entities/Creators";
import EntityDescription from "../entities/Description";
import EntityLabel from "../entities/Label";
import VisibilityIcon from "../entities/VisibilityIcon";
import { ListElementProps } from "./List.d";
import "./ListBar.scss";

/** Helper function for formatting the resource list */
interface ResourceListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resources: Record<string, any>;
}
function ResourceList({ resources }: ResourceListProps) {
  const resourcesKeys = Object.keys(resources);
  const items = resourcesKeys.map((name, index) => {
    return (
      <span key={name} className="text-nowrap">
        <span className="fw-bold">{resources[name]} </span>
        {name}
        {resourcesKeys.length - 1 === index ? " " : " | "}
      </span>
    );
  });
  return <div className="text-truncate">{items}</div>;
}

interface SessionStatusIconProps {
  status: SessionStatusState;
  data: {
    icon: ReactNode;
    color: string;
    text: string;
  };
  sessionId: string;
  errorSession: string;
  defaultImage: boolean;
}
function SessionStatusIcon({
  status,
  data,
  sessionId,
  errorSession,
  defaultImage,
}: SessionStatusIconProps) {
  const policy = defaultImage ? <div>A fallback image was used.</div> : null;
  const popover =
    status === "failed" || (status === "running" && defaultImage) ? (
      <UncontrolledPopover
        target={sessionId}
        trigger="hover"
        placement="bottom"
      >
        <PopoverHeader>
          {status === "failed" ? "Error Details" : "Warning Details"}
        </PopoverHeader>
        <PopoverBody>
          {errorSession}
          {policy}
        </PopoverBody>
      </UncontrolledPopover>
    ) : null;

  return (
    <div
      id={sessionId}
      className={`d-flex align-items-center gap-1 ${
        status === "failed" ? "cursor-pointer" : ""
      }`}
    >
      <Badge color={data.color}>{data.icon}</Badge>
      <span className={`text-${data.color} small session-status-text`}>
        {data.text}
      </span>
      {popover}
    </div>
  );
}

/*
 * Session Details PopOver
 */
interface SessionDetailsPopOverProps {
  commit: {
    author_name: string;
    committed_date: string;
    message: string;
    id: string;
    web_url: string;
  };
  image: string;
}
function SessionDetailsPopOver({ commit, image }: SessionDetailsPopOverProps) {
  const ref = useRef(null);
  if (!commit) return null;

  const content = (
    <Fragment>
      <h3 className="fs-6 fw-bold">Image Source:</h3>
      <span>
        {image} <Clipboard clipboardText={image} />
      </span>
      <h3 className="fs-6 fw-bold mt-2">Commit Details:</h3>
      <span className="fw-bold">Author:</span>
      <span>{commit.author_name}</span>
      <br />
      <span>
        <span className="fw-bold">Date:</span>{" "}
        <span>
          {toHumanDateTime({ datetime: commit.committed_date, format: "full" })}
        </span>{" "}
        <TimeCaption datetime={commit.committed_date} prefix="~" />
        <br />
      </span>
      <span className="fw-bold">Message:</span> <span>{commit.message}</span>
      <br />
      <span className="fw-bold">Full SHA:</span> <span>{commit.id}</span>
      <br />
      <span className="fw-bold me-1">Details:</span>
      <ExternalLink
        url={commit.web_url}
        title="Open commit in GitLab"
        role="text"
        showLinkIcon={true}
      />
    </Fragment>
  );

  return (
    <span>
      <FontAwesomeIcon ref={ref} icon={faInfoCircle} />
      <UncontrolledPopover target={ref} trigger="hover" placement="bottom">
        <PopoverHeader>Session Information</PopoverHeader>
        <PopoverBody>{content}</PopoverBody>
      </UncontrolledPopover>
    </span>
  );
}

/*
 * Session View
 */
interface ListBarSessionProps extends ListElementProps {
  fullPath: string;
  gitUrl: string;
  notebook: Notebook["data"];
  showLogs: Function; // eslint-disable-line @typescript-eslint/ban-types
}

function ListBarSession({
  creators,
  description,
  fullPath,
  gitUrl,
  id,
  imageUrl,
  itemType,
  labelCaption,
  notebook,
  slug,
  timeCaption,
  title,
  url,
  visibility,
}: ListBarSessionProps) {
  const { client } = useContext(AppContext);
  const [commit, setCommit] = useState(null);

  const [sessionStatus, setSessionStatus] =
    useState<SessionStatusState>("starting");
  useEffect(() => {
    setSessionStatus(notebook?.status?.state);
  }, [notebook?.status?.state]);

  useEffect(() => {
    client
      .getCommits(id, notebook.annotations.branch)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((commitsFetched: Record<string, any>) => {
        if (commitsFetched.data?.length > 0) {
          const sessionCommit = commitsFetched.data.filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (commit: Record<string, any>) =>
              commit.id === notebook.annotations["commit-sha"]
          );
          if (sessionCommit.length > 0) setCommit(sessionCommit[0]);
        }
      });
  }, [notebook.annotations]); // eslint-disable-line

  const imageStyles = imageUrl ? { backgroundImage: `url("${imageUrl}")` } : {};
  const colorByType = stylesByItemType(itemType);

  /* session part */
  const resources = notebook.resources?.requests;
  const sessionId = notebook.name;
  // const statusData = getStatusObject(
  //   sessionStatus,
  //   notebook.annotations["default_image_used"]
  // );
  const statusData = getStatusObject({
    annotations: notebook.annotations,
    defaultImage: notebook.annotations["default_image_used"],
    startTime: "",
    status: sessionStatus,
  });
  const sessionTimeLabel =
    sessionStatus === "running" ? `${statusData.text} since ` : statusData.text;
  const sessionDetailsPopover = commit ? (
    <SessionDetailsPopOver commit={commit} image={notebook.image} />
  ) : null;

  return (
    <div className="container-sessions" data-cy="container-session">
      <div className="entity-image">
        <Link to={url} className="text-decoration-none">
          <div
            style={imageStyles}
            className={`cursor-pointer listBar-entity-image ${
              !imageUrl ? `card-header-entity--${itemType}` : ""
            }`}
          >
            {!imageUrl ? (
              <div className="card-bg-title card-bg-title--small user-select-none">
                {title}
              </div>
            ) : null}
          </div>
        </Link>
      </div>
      <div
        className="entity-title text-truncate cursor-pointer"
        data-cy={`${itemType}-title`}
      >
        <Link to={url} className="text-decoration-none">
          <div className="listBar-title text-truncate">
            <span
              className="card-title text-truncate"
              data-cy="list-card-title"
            >
              {title}
            </span>
            <span className="entity-title--slug text-truncate">{slug}</span>
          </div>
        </Link>
      </div>
      <div className="entity-description cursor-pointer">
        <Link to={url} className="text-decoration-none">
          <EntityDescription
            description={description}
            isHeightFixed={true}
            showSuggestion={false}
            urlChangeDescription={`${url}/settings`}
            className="text-rk-dark m-0"
            numberLines={1}
          />
        </Link>
      </div>
      <div className="entity-type-visibility align-items-baseline">
        <EntityLabel type={itemType} workflowType={null} />
        {visibility ? (
          <VisibilityIcon
            visibility={visibility}
            className={colorByType.colorText}
          />
        ) : null}
      </div>
      <div className="entity-creators align-items-baseline text-truncate">
        <EntityCreators
          display="list"
          creators={creators}
          itemType={itemType}
          includeIcon={true}
          className="listBar-entity-creators"
        />
      </div>
      <div className="entity-date listBar-entity-date">
        <TimeCaption
          className="text-rk-text-light text-truncate"
          enableTooltip
          datetime={timeCaption}
          prefix={labelCaption || "Updated"}
        />
      </div>
      <div className="entity-action d-flex align-items-baseline gap-1">
        <SessionButton fullPath={fullPath} gitUrl={gitUrl} />
      </div>
      <div className="session-resources text-truncate">
        <ResourceList resources={resources} />
      </div>
      <div className="session-time text-truncate">
        <div className="d-flex">
          <span className="session-info">
            Branch
            <span className="text-decoration-underline mx-1">
              {notebook.annotations["branch"]}
            </span>
          </span>
          <div className="session-icon-details">{sessionDetailsPopover}</div>
        </div>
        <TimeCaption
          className="text-rk-text-light text-truncate"
          enableTooltip
          datetime={notebook.started}
          prefix={sessionTimeLabel || ""}
        />
      </div>
      <div className="session-icon">
        <SessionStatusIcon
          status={sessionStatus}
          data={statusData}
          defaultImage={notebook.annotations["default_image_used"]}
          errorSession={notebook.status.message || ""}
          sessionId={sessionId}
        />
      </div>
    </div>
  );
}

export default ListBarSession;
