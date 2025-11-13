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
import { useCallback, useMemo } from "react";
import { SkipForward, XLg } from "react-bootstrap-icons";
import { generatePath, useNavigate } from "react-router";
import {
  Button,
  ListGroup,
  ListGroupItem,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { RtkOrNotebooksError } from "~/components/errors/RtkErrorAlert";
import { Loader } from "~/components/Loader";
import ScrollableModal from "~/components/modal/ScrollableModal";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import useAppDispatch from "~/utils/customHooks/useAppDispatch.hook";
import {
  RepositoryCallToActionAlert,
  RepositoryPermissionsBadge,
} from "../ProjectPageV2/ProjectPageContent/CodeRepositories/CodeRepositoryDisplay";
import { getRepositoryName } from "../ProjectPageV2/ProjectPageContent/CodeRepositories/repositories.utils";
import useProjectPermissions from "../ProjectPageV2/utils/useProjectPermissions.hook";
import type { Project } from "../projectsV2/api/projectV2.api";
import {
  RepositoriesApiResponseWithInterrupts,
  useGetRepositoriesArrayQuery,
} from "../repositories/api/repositories.api";
import startSessionOptionsV2Slice from "./startSessionOptionsV2.slice";

interface SessionRepositoriesModalProps {
  isOpen: boolean;
  project: Project;
}
export default function SessionRepositoriesModal({
  isOpen,
  project,
}: SessionRepositoriesModalProps) {
  const navigate = useNavigate();
  const onCancel = useCallback(() => {
    const url = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
      namespace: project.namespace,
      slug: project.slug,
    });
    navigate(url);
  }, [navigate, project.namespace, project.slug]);

  const projectPermissions = useProjectPermissions({ projectId: project.id });
  const interruptProperty = projectPermissions?.write
    ? "interruptOwner"
    : "interruptAlways";
  const { data, error, isLoading } = useGetRepositoriesArrayQuery(
    project.repositories ?? []
  );

  const repoWithInterruptions = useMemo(() => {
    if (isLoading || !data) return [];
    return data.filter((repo) => repo[interruptProperty]) ?? [];
  }, [data, interruptProperty, isLoading]);

  const dispatch = useAppDispatch();
  const onSkip = useCallback(() => {
    dispatch(startSessionOptionsV2Slice.actions.setRepositoriesReady(true));
  }, [dispatch]);

  const content =
    isLoading || !data ? (
      <Loader />
    ) : error ? (
      <div>
        <p>
          An error occurred while checking the project repositories. You can try
          to reload the page.
        </p>
        <RtkOrNotebooksError error={error} />
      </div>
    ) : (
      <>
        <p>
          There{" "}
          {repoWithInterruptions.length === 1
            ? `is ${repoWithInterruptions.length} repository that requires`
            : `are ${repoWithInterruptions.length} repositories that require`}{" "}
          your attention before launching the session:
        </p>
        <ListGroup>
          {repoWithInterruptions.map((repository) => (
            <SessionRepositoryWarning
              key={repository.url}
              hasWriteAccess={projectPermissions?.write}
              repository={repository}
            />
          ))}
        </ListGroup>
      </>
    );

  return (
    <ScrollableModal
      centered
      data-cy="session-repositories-modal"
      isOpen={isOpen}
      size="lg"
    >
      <ModalHeader tag="h2">Session repositories not accessible</ModalHeader>
      <ModalBody>{content}</ModalBody>
      <ModalFooter>
        <Button color="outline-primary" onClick={onCancel}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button color="outline-primary" onClick={onSkip}>
          <SkipForward className={cx("bi", "me-1")} />
          Launch anyway
        </Button>
      </ModalFooter>
    </ScrollableModal>
  );
}

interface SessionRepositoryWarningProps {
  hasWriteAccess: boolean;
  repository: RepositoriesApiResponseWithInterrupts;
}
function SessionRepositoryWarning({
  hasWriteAccess,
  repository,
}: SessionRepositoryWarningProps) {
  const title = getRepositoryName(repository.url);

  return (
    <ListGroupItem>
      <h3>{title}</h3>
      <p className="mb-2">URL: {repository.url}</p>
      <div className="mb-2">
        <RepositoryPermissionsBadge
          hasWriteAccess={hasWriteAccess}
          repositoryUrl={repository.url}
        />
      </div>
      <RepositoryCallToActionAlert
        hasWriteAccess={hasWriteAccess}
        repositoryUrl={repository.url}
      />
    </ListGroupItem>
  );
}
