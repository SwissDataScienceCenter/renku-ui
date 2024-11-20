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
import { Col, ListGroupItem, Row } from "reactstrap";

import { RtkOrNotebooksError } from "../../components/errors/RtkErrorAlert";
import { Loader } from "../../components/Loader";
import { TimeCaption } from "../../components/TimeCaption";
import type {
  Project,
  SessionSecretSlot,
} from "../projectsV2/api/projectV2.api";
import { type SecretWithId } from "../usersV2/api/users.api";
import useGetRelatedProjects from "./useGetRelatedProjects.hook";
import { useMemo } from "react";
import { generatePath, Link } from "react-router-dom-v5-compat";
import { ABSOLUTE_ROUTES } from "../../routing/routes.constants";

interface GeneralSecretItemProps {
  secret: SecretWithId;
}

export default function GeneralSecretItem({ secret }: GeneralSecretItemProps) {
  const { name, modification_date } = secret;

  const { projects, secretSlots, error, isLoading } = useGetRelatedProjects({
    secret,
  });

  const usedInContent = isLoading ? (
    <>
      <Loader className="me-1" inline size={16} />
      Loading related projects...
    </>
  ) : error || !projects || !secretSlots ? (
    <>
      <p>Error: could not load related projects</p>
      {error && <RtkOrNotebooksError error={error} dismissible={false} />}
    </>
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
          <div className={cx("text-light-emphasis", "small")}>
            Edited{" "}
            <TimeCaption datetime={modification_date} enableTooltip noCaption />
          </div>
          <div>{usedInContent}</div>
        </Col>
        {/* <SessionSecretActions secretSlot={secretSlot} /> */}
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
  // NOTE: this case should not happen
  if (projects.length == 0) {
    return null;
  }

  return (
    <div>
      <p className={cx("mb-0", "fw-medium")}>Used in:</p>
      <ul>
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

  // NOTE: this case should not happen
  if (secretSlotsForThisProject.length == 0) {
    return null;
  }

  const projectUrl = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
    namespace: project.namespace,
    slug: project.slug,
  });

  return (
    <li>
      <div>
        <Link to={projectUrl}>
          {project.name}
          {" - "}
          <span className="fst-italic">
            {"@"}
            {project.namespace}/{project.slug}
          </span>
        </Link>
      </div>
      <div>
        <ul>
          {secretSlotsForThisProject.map((secretSlot) => (
            <GeneralSecretUsedInProjectSecretSlot
              key={secretSlot.id}
              secretSlot={secretSlot}
            />
          ))}
        </ul>
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
