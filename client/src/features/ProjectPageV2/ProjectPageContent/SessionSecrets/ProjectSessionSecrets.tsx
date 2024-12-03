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
import { useEffect, useMemo, useRef } from "react";
import { ShieldLock } from "react-bootstrap-icons";
import { Badge, Card, CardBody, CardHeader, ListGroup } from "reactstrap";

import { InfoAlert } from "../../../../components/Alert";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../../components/Loader";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import useLocationHash from "../../../../utils/customHooks/useLocationHash.hook";
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
import { SESSION_SECRETS_CARD_ID } from "./sessionSecrets.constants";
import { getSessionSecretSlotsWithSecrets } from "./sessionSecrets.utils";
import SessionSecretSlotItem from "./SessionSecretSlotItem";
import UpdateSecretsMountDirectoryButton, {
  SecretsMountDirectoryComponent,
} from "./UpdateSecretsMountDirectoryButton";

export default function ProjectSessionSecrets() {
  const userLogged = useLegacySelector<boolean>(
    (state) => state.stateModel.user.logged
  );

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
      secretsMountDirectory={secretsMountDirectory}
      sessionSecretSlots={sessionSecretSlots}
      sessionSecrets={sessionSecrets ?? []}
    />
  );

  const ref = useRef<HTMLDivElement>(null);
  const [hash] = useLocationHash();
  useEffect(() => {
    if (hash === SESSION_SECRETS_CARD_ID && !isLoading) {
      ref.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash, isLoading]);

  return (
    <Card
      id={SESSION_SECRETS_CARD_ID}
      data-cy="project-settings-session-secrets"
      innerRef={ref}
    >
      <CardHeader>
        <div
          className={cx(
            "align-items-center",
            "d-flex",
            "justify-content-between",
            "mb-2"
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
        <p className="mb-1">
          Use session secrets to connect to resources from inside a session that
          require a password or credential.
        </p>
        <p className="mb-0">
          Session secrets will be mounted at the following location:
        </p>
        <SecretsMountDirectoryComponent />

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
  secretsMountDirectory: string;
  sessionSecretSlots: SessionSecretSlot[];
  sessionSecrets: SessionSecret[];
}

function ProjectSessionSecretsContent({
  secretsMountDirectory,
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
          secretsMountDirectory={secretsMountDirectory}
          secretSlot={secretSlot}
        />
      ))}
    </ListGroup>
  );
}
