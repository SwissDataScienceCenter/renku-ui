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
import { useMemo } from "react";
import { generatePath, Link } from "react-router-dom-v5-compat";
import { Col, ListGroupItem, Row } from "reactstrap";

import { skipToken } from "@reduxjs/toolkit/query";
import { Folder } from "react-bootstrap-icons";
import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { Loader } from "../../components/Loader";
import { TimeCaption } from "../../components/TimeCaption";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";
import { SESSION_SECRETS_CARD_ID } from "../ProjectPageV2/ProjectPageContent/SessionSecrets/sessionSecrets.constants";
import type {
  Project,
  SessionSecretSlot,
} from "../projectsV2/api/projectV2.api";
import { useGetNamespacesByNamespaceSlugQuery } from "../projectsV2/api/projectV2.enhanced-api";
import {
  useGetUserByIdQuery,
  type SecretWithId,
} from "../usersV2/api/users.api";
import UserAvatar from "../usersV2/show/UserAvatar";
import SecretItemActions from "./SecretItemActions";
import useGetRelatedProjects from "./useGetRelatedProjects.hook";

interface GeneralSecretItemProps {
  secret: SecretWithId;
}

export default function GeneralSecretItem({ secret }: GeneralSecretItemProps) {
  const { name, modification_date } = secret;

  const { projects, secretSlots, error, isLoading } = useGetRelatedProjects({
    secret,
  });

  const usedInContent = isLoading ? (
    <div>
      <Loader className="me-1" inline size={16} />
      Loading related projects...
    </div>
  ) : error || !projects || !secretSlots ? (
    <div>
      <p>Error: could not load related projects</p>
      {error && <RtkOrNotebooksError error={error} dismissible={false} />}
    </div>
  ) : (
    <GeneralSecretUsedIn projects={projects} secretSlots={secretSlots} />
  );

  return (
    <ListGroupItem action>
      <Row>
        <Col>
          <div className={cx("align-items-center", "d-flex")}>
            <span className={cx("fw-bold", "me-2")}>{name}</span>
          </div>
          {usedInContent}
        </Col>
        <Col
          xs={12}
          sm="auto"
          className={cx(
            "ms-auto",
            "d-flex",
            "flex-column",
            "align-items-end",
            "gap-1"
          )}
        >
          <div className={cx("text-light-emphasis", "small")}>
            Edited{" "}
            <TimeCaption datetime={modification_date} enableTooltip noCaption />
          </div>
          <SecretItemActions isV2 secret={secret} />
        </Col>
      </Row>
    </ListGroupItem>
  );
}

interface GeneralSecretUsedInProps {
  projects: Project[];
  secretSlots: SessionSecretSlot[];
}

function GeneralSecretUsedIn({
  projects,
  secretSlots,
}: GeneralSecretUsedInProps) {
  if (projects.length == 0) {
    return null;
  }

  return (
    <div>
      <p className={cx("mb-0", "fw-medium")}>This secret is used in:</p>
      <ul className="list-unstyled">
        {projects.map((project) => (
          <GeneralSecretUsedInProject
            key={project.id}
            project={project}
            secretSlots={secretSlots}
          />
        ))}
      </ul>
    </div>
  );
}

interface GeneralSecretUsedInProjectProps {
  project: Project;
  secretSlots: SessionSecretSlot[];
}

function GeneralSecretUsedInProject({
  project,
  secretSlots,
}: GeneralSecretUsedInProjectProps) {
  const secretSlotsForThisProject = useMemo(
    () => secretSlots.filter(({ project_id }) => project_id === project.id),
    [project.id, secretSlots]
  );

  const { data: namespace } = useGetNamespacesByNamespaceSlugQuery({
    namespaceSlug: project.namespace,
  });
  const { data: user } = useGetUserByIdQuery(
    namespace?.namespace_kind === "user" && namespace.created_by
      ? { userId: namespace.created_by }
      : skipToken
  );
  const namespaceName = useMemo(
    () => namespace?.name ?? project.namespace,
    [namespace?.name, project.namespace]
  );

  // NOTE: this case should not happen
  if (secretSlotsForThisProject.length == 0) {
    return null;
  }

  const projectUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.settings, {
    namespace: project.namespace,
    slug: project.slug,
  });

  return (
    <li className={cx("d-flex", "flex-row")}>
      <div>
        <Folder className={cx("bi", "me-1")} />
      </div>
      <div>
        <div className={cx("d-flex", "flex-row", "gap-4")}>
          <Link
            className={cx("fw-semibold")}
            to={{ pathname: projectUrl, hash: SESSION_SECRETS_CARD_ID }}
          >
            {project.name}
          </Link>
          <div
            className={cx("d-flex", "flex-row", "align-items-center", "gap-1")}
          >
            <UserAvatar
              firstName={user?.first_name}
              lastName={user?.last_name}
              username={namespaceName}
            />
            <span>{namespaceName}</span>
          </div>
        </div>
        <div>Secret slot: xxx</div>
        {secretSlotsForThisProject.map((secretSlot) => (
          <GeneralSecretUsedInProjectSecretSlot
            key={secretSlot.id}
            secretSlot={secretSlot}
          />
        ))}
      </div>
    </li>
  );
}

interface GeneralSecretUsedInProjectSecretSlotProps {
  secretSlot: SessionSecretSlot;
}

function GeneralSecretUsedInProjectSecretSlot({
  secretSlot,
}: GeneralSecretUsedInProjectSecretSlotProps) {
  const { filename } = secretSlot;

  return (
    <li>
      <span>
        Mounted in sessions as: <code>{filename}</code>
      </span>
    </li>
  );
}
