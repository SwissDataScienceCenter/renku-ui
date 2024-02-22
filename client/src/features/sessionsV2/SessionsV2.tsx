/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
import { ThreeDotsVertical } from "react-bootstrap-icons";
import { useParams } from "react-router-dom-v5-compat";
import {
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  UncontrolledDropdown,
} from "reactstrap";

import { skipToken } from "@reduxjs/toolkit/query";
import { Loader } from "../../components/Loader";
import { TimeCaption } from "../../components/TimeCaption";
import { CommandCopy } from "../../components/commandCopy/CommandCopy";
import { RtkErrorAlert } from "../../components/errors/RtkErrorAlert";
import type { Project } from "../projectsV2/api/projectV2.api";
import AddSessionLauncherButton from "./AddSessionLauncherButton";
import DeleteSessionV2Modal from "./DeleteSessionLauncherModal";
import { ProjectSessionConfigContextProvider } from "./ProjectSessionConfig.context";
import StartSessionButton from "./StartSessionButton";
import UpdateSessionLauncherModal from "./UpdateSessionLauncherModal";
import sessionsV2Api, {
  useGetProjectSessionLaunchersQuery,
  useGetSessionEnvironmentsQuery,
} from "./sessionsV2.api";
import { SessionLauncher } from "./sessionsV2.types";

interface SessionsV2Props {
  project: Project;
}

export default function SessionsV2({ project }: SessionsV2Props) {
  const { error } = useGetSessionEnvironmentsQuery();

  return (
    <ProjectSessionConfigContextProvider project={project}>
      <div>
        <h3>Sessions</h3>
        <div>
          <AddSessionLauncherButton />
        </div>

        {error && <RtkErrorAlert error={error} />}

        <div className="mt-2">
          <SessionLaunchersListDisplay />
        </div>
      </div>
    </ProjectSessionConfigContextProvider>
  );
}

function SessionLaunchersListDisplay() {
  const { id: projectId } = useParams<"id">();

  const {
    data: launchers,
    error,
    isLoading,
  } = useGetProjectSessionLaunchersQuery(projectId ? { projectId } : skipToken);

  if (isLoading) {
    return (
      <p>
        <Loader className="bi" inline size={16} />
        Loading sessions...
      </p>
    );
  }

  if (error) {
    return <RtkErrorAlert error={error} />;
  }

  if (!launchers || launchers.length == 0) {
    return null;
  }

  return (
    <Container className="px-0" fluid>
      <Row className="gy-4">
        {launchers.map((launcher) => (
          <SessionLauncherDisplay key={launcher.id} launcher={launcher} />
        ))}
      </Row>
    </Container>
  );
}

interface SessionLauncherDisplayProps {
  launcher: SessionLauncher;
}

function SessionLauncherDisplay({ launcher }: SessionLauncherDisplayProps) {
  const { creation_date, environment_kind, name, description } = launcher;

  const { data: environments, isLoading } =
    sessionsV2Api.endpoints.getSessionEnvironments.useQueryState(
      environment_kind === "global_environment" ? undefined : skipToken
    );
  const environment = useMemo(
    () =>
      launcher.environment_kind === "global_environment" &&
      environments?.find((env) => env.id === launcher.environment_id),
    [environments, launcher]
  );

  const container_image =
    environment_kind === "global_environment" && environment
      ? environment.container_image
      : environment_kind === "global_environment"
      ? "unknown"
      : launcher.container_image;

  return (
    <Col className={cx("col-12", "col-sm-6")}>
      <Card className="h-100">
        <CardBody className={cx("d-flex", "flex-column")}>
          <CardTitle
            className={cx(
              "d-flex",
              "flex-row",
              "justify-content-between",
              "align-items-center"
            )}
          >
            <h5 className={cx("mb-0", "fs-5")}>
              {isLoading && (
                <Loader className={cx("bi", "me-2")} inline size={20} />
              )}
              {name}
            </h5>
            <SessionV2Actions launcher={launcher} />
          </CardTitle>
          <CardText className="mb-0">
            {description ? description : <i>No description</i>}
          </CardText>
          {environment && (
            <CardText className="mb-0">
              Uses the <b>{environment.name}</b> session environment.
            </CardText>
          )}
          <CardText className="mb-2" tag="div">
            <p className="mb-0">Container image:</p>
            <CommandCopy command={container_image} noMargin />
          </CardText>
          <CardText>
            <TimeCaption
              datetime={creation_date}
              enableTooltip
              prefix="Created"
            />
          </CardText>
          <div className="mt-auto">
            <StartSessionButton />
          </div>
        </CardBody>
      </Card>
    </Col>
  );
}

function SessionV2Actions({ launcher: session }: SessionLauncherDisplayProps) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const toggleUpdate = useCallback(() => {
    setIsUpdateOpen((open) => !open);
  }, []);
  const toggleDelete = useCallback(() => {
    setIsDeleteOpen((open) => !open);
  }, []);

  return (
    <>
      <UncontrolledDropdown>
        <DropdownToggle
          className={cx("p-2", "rounded-circle")}
          color="outline-rk-green"
        >
          <div className="lh-1">
            <ThreeDotsVertical className="bi" />
            <span className="visually-hidden">Actions</span>
          </div>
        </DropdownToggle>
        <DropdownMenu className="btn-with-menu-options" end>
          <DropdownItem onClick={toggleUpdate}>Edit</DropdownItem>
          <DropdownItem onClick={toggleDelete}>Delete</DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>

      <UpdateSessionLauncherModal
        isOpen={isUpdateOpen}
        launcher={session}
        toggle={toggleUpdate}
      />
      <DeleteSessionV2Modal
        isOpen={isDeleteOpen}
        launcher={session}
        toggle={toggleDelete}
      />
    </>
  );
}
