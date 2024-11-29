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
import { Key, Lock, ShieldLock } from "react-bootstrap-icons";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  ListGroup,
  ListGroupItem,
  Row,
} from "reactstrap";

import { InfoAlert } from "../../../../components/Alert";
import { Loader } from "../../../../components/Loader";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import PermissionsGuard from "../../../permissionsV2/PermissionsGuard";
import type {
  SessionSecret,
  SessionSecretSlot,
} from "../../../projectsV2/api/projectV2.api";
import {
  useGetProjectsByProjectIdSessionSecretSlotsQuery,
  useGetProjectsByProjectIdSessionSecretsQuery,
} from "../../../projectsV2/api/projectV2.enhanced-api";
import { useProject } from "../../ProjectPageContainer/ProjectPageContainer";
import useProjectPermissions from "../../utils/useProjectPermissions.hook";
import AddSessionSecretButton from "./AddSessionSecretButton";
import SessionSecretActions from "./SessionSecretActions";
import type { SessionSecretSlotWithSecret } from "./sessionSecrets.types";
import { getSessionSecretSlotsWithSecrets } from "./sessionSecrets.utils";

export default function ProjectSessionSecrets() {
  const userLogged = useLegacySelector<boolean>(
    (state) => state.stateModel.user.logged
  );

  const { project } = useProject();
  const { id: projectId } = project;
  const permissions = useProjectPermissions({ projectId });
  const {
    data: sessionSecretSlots,
    isLoading: isLoadingSessionSecretSlots,
    error: sessionSecretSlotsError,
  } = useGetProjectsByProjectIdSessionSecretSlotsQuery({ projectId });
  const {
    data: sessionSecrets,
    isLoading: isLoadingSessionSecrets,
    error: sessionSecretsError,
  } = useGetProjectsByProjectIdSessionSecretsQuery(
    userLogged ? { projectId } : skipToken
  );
  const isLoading = isLoadingSessionSecretSlots || isLoadingSessionSecrets;
  const error = sessionSecretSlotsError ?? sessionSecretsError;

  const content = isLoading ? (
    <Loader />
  ) : error || !sessionSecretSlots || (userLogged && !sessionSecrets) ? (
    <>
      <p>Error: could not load this project&apos;s session secrets.</p>
      {error && <RtkOrNotebooksError error={error} dismissible={false} />}
    </>
  ) : (
    <ProjectSessionSecretsContent
      sessionSecretSlots={sessionSecretSlots}
      sessionSecrets={sessionSecrets ?? []}
    />
  );

  return (
    <Card data-cy="project-settings-session-secrets">
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
              enabled={<AddSessionSecretButton />}
              requestedPermission="write"
              userPermissions={permissions}
            />
          </div>
        </div>

        <p className="mb-0">
          Use session secrets to connect to resources from inside a session that
          require a password or credential.
        </p>

        {!userLogged && (
          <InfoAlert
            className={cx("mt-3", "mb-0")}
            dismissible={false}
            timeout={0}
          >
            <p className="mb-0">
              As an anonymous user, you cannot use session secrets.
            </p>
          </InfoAlert>
        )}
      </CardHeader>
      <CardBody className={cx(sessionSecretSlots?.length == 0 && "pb-0")}>
        {content}
      </CardBody>
    </Card>
  );
}

interface ProjectSessionSecretsContentProps {
  sessionSecretSlots: SessionSecretSlot[];
  sessionSecrets: SessionSecret[];
}

function ProjectSessionSecretsContent({
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
          secretSlot={secretSlot}
        />
      ))}
    </ListGroup>
  );
}

interface SessionSecretSlotItemProps {
  secretSlot: SessionSecretSlotWithSecret;
}

function SessionSecretSlotItem({ secretSlot }: SessionSecretSlotItemProps) {
  const { filename, name, description } = secretSlot.secretSlot;

  return (
    <ListGroupItem action data-cy="session-secret-slot-item">
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
        <SessionSecretActions secretSlot={secretSlot} />
      </Row>
    </ListGroupItem>
  );
}
