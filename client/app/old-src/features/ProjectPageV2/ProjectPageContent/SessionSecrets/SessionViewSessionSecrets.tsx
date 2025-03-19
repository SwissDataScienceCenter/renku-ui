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
import { Link } from "@remix-run/react";
import cx from "classnames";
import { useMemo } from "react";
import { ShieldLock } from "react-bootstrap-icons";
import { generatePath } from "react-router";
import { Badge, ListGroup } from "reactstrap";

import { InfoAlert } from "../../../../components/Alert";
import { RtkOrNotebooksError } from "../../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../../components/Loader";
import { ABSOLUTE_ROUTES } from "../../../../routing/routes.constants";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import type {
  SessionSecret,
  SessionSecretSlot,
} from "../../../projectsV2/api/projectV2.api";
import {
  useGetProjectsByProjectIdSessionSecretSlotsQuery,
  useGetProjectsByProjectIdSessionSecretsQuery,
} from "../../../projectsV2/api/projectV2.enhanced-api";
import { useProject } from "../../ProjectPageContainer/ProjectPageContainer";
import { SESSION_SECRETS_CARD_ID } from "./sessionSecrets.constants";
import { getSessionSecretSlotsWithSecrets } from "./sessionSecrets.utils";
import SessionSecretSlotItem from "./SessionSecretSlotItem";

export default function SessionViewSessionSecrets() {
  const userLogged = useLegacySelector<boolean>(
    (state) => state.stateModel.user.logged
  );

  const { project } = useProject();
  const { id: projectId, secrets_mount_directory: secretsMountDirectory } =
    project;
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

  const projectUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.settings, {
    namespace: project.namespace,
    slug: project.slug,
  });

  const content = isLoading ? (
    <Loader />
  ) : error || !sessionSecretSlots || (userLogged && !sessionSecrets) ? (
    <>
      <p>Error: could not load this project&apos;s session secrets.</p>
      {error && <RtkOrNotebooksError error={error} dismissible={false} />}
    </>
  ) : (
    <SessionViewSessionSecretsContent
      secretsMountDirectory={secretsMountDirectory}
      sessionSecretSlots={sessionSecretSlots}
      sessionSecrets={sessionSecrets ?? []}
    />
  );

  return (
    <div>
      <div className={cx("align-items-center", "d-flex", "mb-2")}>
        <h4 className={cx("align-items-center", "d-flex", "mb-0", "me-2")}>
          <ShieldLock className={cx("me-1", "bi")} />
          Session Secrets
        </h4>
        {sessionSecretSlots && <Badge>{sessionSecretSlots.length}</Badge>}
      </div>

      {!userLogged && sessionSecretSlots && sessionSecretSlots.length > 0 && (
        <InfoAlert className="mb-2" dismissible={false} timeout={0}>
          <p className="mb-0">
            As an anonymous user, you cannot use session secrets.
          </p>
        </InfoAlert>
      )}

      <p className="mb-2">
        To modify session secrets, go to{" "}
        <Link to={{ pathname: projectUrl, hash: SESSION_SECRETS_CARD_ID }}>
          the project&apos;s settings
        </Link>
        .
      </p>

      {content}
    </div>
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
    [sessionSecretSlots, sessionSecrets]
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
