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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useMemo } from "react";
import { Key, Lock, Pencil, PlusLg, ShieldLock } from "react-bootstrap-icons";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  ListGroup,
  ListGroupItem,
  Row,
} from "reactstrap";

import { Loader } from "../../../../components/Loader";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import PermissionsGuard from "../../../permissionsV2/PermissionsGuard";
import type {
  Project,
  SessionSecret,
  SessionSecretSlot,
} from "../../../projectsV2/api/projectV2.api";
import {
  useGetProjectsByProjectIdSecretSlotsQuery,
  useGetProjectsByProjectIdSecretsQuery,
} from "../../../projectsV2/api/projectV2.enhanced-api";
import { useGetUserQuery } from "../../../usersV2/api/users.api";
import { useProject } from "../../ProjectPageContainer/ProjectPageContainer";
import useProjectPermissions from "../../utils/useProjectPermissions.hook";
import type { SessionSecretSlotWithSecret } from "./sessionSecrets.types";
import { getSessionSecretSlotsWithSecrets } from "./sessionSecrets.utils";

export default function ProjectSessionSecrets() {
  const { project } = useProject();
  const { id: projectId } = project;
  const permissions = useProjectPermissions({ projectId });
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useGetUserQuery();
  const {
    data: sessionSecretSlots,
    isLoading: isLoadingSessionSecretSlots,
    error: sessionSecretSlotsError,
  } = useGetProjectsByProjectIdSecretSlotsQuery({ projectId });
  const {
    data: sessionSecrets,
    isLoading: isLoadingSessionSecrets,
    error: sessionSecretsError,
  } = useGetProjectsByProjectIdSecretsQuery(
    user?.isLoggedIn ? { projectId } : skipToken
  );
  const isLoading =
    isLoadingUser || isLoadingSessionSecretSlots || isLoadingSessionSecrets;
  const error = userError ?? sessionSecretSlotsError ?? sessionSecretsError;

  const content = isLoading ? (
    <Loader />
  ) : error || !sessionSecretSlots || (user?.isLoggedIn && !sessionSecrets) ? (
    <>
      <p>Error: could not load this project&apos;s session secrets.</p>
      {error && <RtkOrNotebooksError error={error} dismissible={false} />}
    </>
  ) : (
    <ProjectSessionSecretsContent
      project={project}
      sessionSecretSlots={sessionSecretSlots}
      sessionSecrets={sessionSecrets ?? []}
    />
  );

  return (
    <Card>
      <CardHeader>
        <div
          className={cx(
            "align-items-center",
            "d-flex",
            "justify-content-between"
          )}
        >
          <div className={cx("align-items-center", "d-flex")}>
            <h4 className={cx("m-0", "me-2")}>
              <ShieldLock className={cx("me-1", "bi")} />
              Session Secrets
            </h4>
            {sessionSecretSlots && <Badge>{sessionSecretSlots.length}</Badge>}
          </div>

          <div className="my-auto">
            <PermissionsGuard
              disabled={null}
              enabled={
                <Button
                  color="outline-primary"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  size="sm"
                >
                  <PlusLg className="bi" />
                </Button>
              }
              requestedPermission="write"
              userPermissions={permissions}
            />
          </div>
        </div>
      </CardHeader>
      <CardBody>{content}</CardBody>
    </Card>
  );
}

interface ProjectSessionSecretsContentProps {
  project: Project;
  sessionSecretSlots: SessionSecretSlot[];
  sessionSecrets: SessionSecret[];
}

function ProjectSessionSecretsContent({
  project,
  sessionSecretSlots,
  sessionSecrets,
}: ProjectSessionSecretsContentProps) {
  const sessionSecretSlotsWithSecrets = useMemo(
    () =>
      getSessionSecretSlotsWithSecrets({ sessionSecretSlots, sessionSecrets }),
    [sessionSecretSlots, sessionSecrets]
  );

  if (!sessionSecretSlots.length) {
    return null;
  }

  return (
    <ListGroup flush>
      {sessionSecretSlotsWithSecrets.map((secretSlot) => (
        <SessionSecretSlotItem
          key={secretSlot.secretSlot.id}
          project={project}
          secretSlot={secretSlot}
        />
      ))}
    </ListGroup>
  );
}

interface SessionSecretSlotItemProps {
  project: Project;
  secretSlot: SessionSecretSlotWithSecret;
}

function SessionSecretSlotItem({
  project,
  secretSlot,
}: SessionSecretSlotItemProps) {
  const { id: projectId } = project;
  const { filename, name, description } = secretSlot.secretSlot;

  const permissions = useProjectPermissions({ projectId });

  return (
    <ListGroupItem action>
      <Row>
        <Col>
          <div className={cx("align-items-center", "d-flex")}>
            <span className={cx("fw-bold", "me-2")}>{name}</span>
            {secretSlot.secretId ? (
              <Badge
                className={cx(
                  "border",
                  "border-success",
                  "bg-success-subtle",
                  "text-success-emphasis"
                )}
                pill
              >
                <Key className={cx("bi", "me-1")} />
                Secret saved
              </Badge>
            ) : (
              <Badge
                className={cx(
                  "border",
                  "border-dark-subtle",
                  "bg-light",
                  "text-dark-emphasis"
                )}
                pill
              >
                <Lock className={cx("bi", "me-1")} />
                Secret not provided
              </Badge>
            )}
          </div>
          <div>
            filename: <code>{filename}</code>
          </div>
          {description && <p className="mb-0">{description}</p>}
        </Col>
        <PermissionsGuard
          disabled={null}
          enabled={
            <Col xs={12} sm="auto" className="ms-auto">
              <Button
                color="outline-primary"
                onClick={(e) => {
                  e.preventDefault();
                }}
                size="sm"
              >
                <Pencil className={cx("bi", "me-1")} />
                Edit
              </Button>
            </Col>
          }
          requestedPermission="write"
          userPermissions={permissions}
        />
      </Row>
    </ListGroupItem>
  );
}
