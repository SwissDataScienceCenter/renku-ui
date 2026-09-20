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
import { Pencil, ShieldLock } from "react-bootstrap-icons";
import { generatePath, Link } from "react-router";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ListGroup,
  UncontrolledTooltip,
} from "reactstrap";

import { useGetUserQueryState } from "~/features/usersV2/api/users.api";
import { useProject } from "~/routes/projects/root";
import { InfoAlert } from "../../../../components/Alert";
import RtkOrDataServicesError from "../../../../components/errors/RtkOrDataServicesError";
import { Loader } from "../../../../components/Loader";
import { ABSOLUTE_ROUTES } from "../../../../routing/routes.constants";
import PermissionsGuard from "../../../permissionsV2/PermissionsGuard";
import type {
  SessionSecret,
  SessionSecretSlot,
} from "../../../projectsV2/api/projectV2.api";
import {
  useGetProjectsByProjectIdSessionSecretSlotsQuery,
  useGetProjectsByProjectIdSessionSecretsQuery,
} from "../../../projectsV2/api/projectV2.enhanced-api";
import type { SessionLauncher } from "../../../sessionsV2/api/sessionLaunchersV2.api";
import CustomizeSessionSecretsModal from "../../../sessionsV2/SessionView/CustomizeSessionSecretsModal";
import useProjectPermissions from "../../utils/useProjectPermissions.hook";
import { SESSION_SECRETS_CARD_ID } from "./sessionSecrets.constants";
import { getSessionSecretSlotsWithSecrets } from "./sessionSecrets.utils";
import SessionSecretSlotItem from "./SessionSecretSlotItem";

interface SessionViewSessionSecretsProps {
  isEditOpen?: boolean;
  launcher?: SessionLauncher;
  toggleEdit?: () => void;
}

export default function SessionViewSessionSecrets({
  isEditOpen = false,
  launcher,
  toggleEdit,
}: SessionViewSessionSecretsProps) {
  const { data: user } = useGetUserQueryState();
  const isUserLoggedIn = !!user?.isLoggedIn;

  const { project } = useProject();
  const { id: projectId, secrets_mount_directory: secretsMountDirectory } =
    project;
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
    isUserLoggedIn ? { projectId } : skipToken,
  );
  const isLoading = isLoadingSessionSecretSlots || isLoadingSessionSecrets;
  const error = sessionSecretSlotsError ?? sessionSecretsError;

  const projectUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.settings, {
    namespace: project.namespace,
    slug: project.slug,
  });

  const content = isLoading ? (
    <Loader />
  ) : error || !sessionSecretSlots || (isUserLoggedIn && !sessionSecrets) ? (
    <>
      <p>Error: could not load this project&apos;s session secrets.</p>
      {error && <RtkOrDataServicesError error={error} dismissible={false} />}
    </>
  ) : (
    <SessionViewSessionSecretsContent
      secretsMountDirectory={secretsMountDirectory}
      sessionSecretSlots={sessionSecretSlots}
      sessionSecrets={sessionSecrets ?? []}
    />
  );

  return (
    <>
      <Card>
        <CardHeader
          className={cx(
            "align-items-center",
            "d-flex",
            "justify-content-between",
          )}
        >
          <div className={cx("align-items-center", "d-flex")}>
            <h3 className={cx("align-items-center", "d-flex", "mb-0", "me-2")}>
              <ShieldLock className="me-1" />
              Session Secrets
            </h3>
            {sessionSecretSlots && <Badge>{sessionSecretSlots.length}</Badge>}
          </div>
          {toggleEdit && (
            <PermissionsGuard
              disabled={null}
              enabled={
                <>
                  <Button
                    aria-label="Customize session secrets"
                    color="outline-primary"
                    data-cy="session-view-modify-session-secrets-button"
                    id="modify-session-secrets-button"
                    onClick={toggleEdit}
                    size="sm"
                    tabIndex={0}
                  >
                    <Pencil className="bi" />
                  </Button>
                  <UncontrolledTooltip target="modify-session-secrets-button">
                    Customize session secrets
                  </UncontrolledTooltip>
                </>
              }
              requestedPermission="write"
              userPermissions={permissions}
            />
          )}
        </CardHeader>

        <CardBody>
          {!isUserLoggedIn &&
            sessionSecretSlots &&
            sessionSecretSlots.length > 0 && (
              <InfoAlert className="mb-2" dismissible={false} timeout={0}>
                <p className="mb-0">
                  As an anonymous user, you cannot use session secrets.
                </p>
              </InfoAlert>
            )}

          <p className="mb-2">
            To add or change secret values, go to{" "}
            <Link to={{ pathname: projectUrl, hash: SESSION_SECRETS_CARD_ID }}>
              the project&apos;s settings
            </Link>
            .
          </p>

          {content}
        </CardBody>
      </Card>
      {launcher && toggleEdit && (
        <CustomizeSessionSecretsModal
          isOpen={isEditOpen}
          launcher={launcher}
          secretsMountDirectory={secretsMountDirectory}
          sessionSecretSlots={sessionSecretSlots ?? []}
          toggle={toggleEdit}
        />
      )}
    </>
  );
}

interface SessionViewSessionSecretsContentProps {
  secretsMountDirectory: string;
  sessionSecretSlots: SessionSecretSlot[];
  sessionSecrets: SessionSecret[];
}

function SessionViewSessionSecretsContent({
  secretsMountDirectory,
  sessionSecretSlots,
  sessionSecrets,
}: SessionViewSessionSecretsContentProps) {
  const sessionSecretSlotsWithSecrets = useMemo(
    () =>
      getSessionSecretSlotsWithSecrets({ sessionSecretSlots, sessionSecrets }),
    [sessionSecretSlots, sessionSecrets],
  );

  if (!sessionSecretSlots.length) {
    return <p className="fst-italic">No session secrets included</p>;
  }

  return (
    <ListGroup>
      {sessionSecretSlotsWithSecrets.map((secretSlot) => (
        <SessionSecretSlotItem
          key={secretSlot.secretSlot.id}
          secretsMountDirectory={secretsMountDirectory}
          secretSlot={secretSlot}
          noActions
        />
      ))}
    </ListGroup>
  );
}
