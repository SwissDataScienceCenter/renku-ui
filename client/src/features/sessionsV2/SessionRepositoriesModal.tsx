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
import { useCallback, useMemo, type ReactNode } from "react";
import { Ban, Check, SkipForward, XLg } from "react-bootstrap-icons";
import { generatePath, useNavigate } from "react-router";
import {
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  UncontrolledAccordion,
} from "reactstrap";

import RtkOrDataServicesError from "~/components/errors/RtkOrDataServicesError";
import { Loader } from "~/components/Loader";
import ScrollableModal from "~/components/modal/ScrollableModal";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import useAppDispatch from "~/utils/customHooks/useAppDispatch.hook";
import {
  RepositoryCallToActionAlert,
  RepositoryPermissionsBadge,
} from "../ProjectPageV2/ProjectPageContent/CodeRepositories/CodeRepositoryDisplay";
import {
  getRepositoryName,
  shouldInterrupt,
} from "../ProjectPageV2/ProjectPageContent/CodeRepositories/repositories.utils";
import useProjectPermissions from "../ProjectPageV2/utils/useProjectPermissions.hook";
import type { Project } from "../projectsV2/api/projectV2.api";
import {
  GetRepositoriesApiResponse,
  useGetRepositoriesQuery,
} from "../repositories/api/repositories.api";
import startSessionOptionsV2Slice from "./startSessionOptionsV2.slice";

interface VisibleItem {
  id: string;
  label: string;
}

interface SessionRepositoriesModalProps {
  embedded?: boolean;
  isOpen: boolean;
  project: Project;
  onSkip?: () => void;
  onCancel?: () => void;
  continueLabel?: string;
  repositoriesReady?: boolean;
  title?: string;
  visibleItems?: VisibleItem[];
  warningIntro?: string;
}
export default function SessionRepositoriesModal({
  embedded = false,
  isOpen,
  project,
  onSkip: onSkipProp,
  onCancel: onCancelProp,
  continueLabel = "Launch anyway",
  repositoriesReady = false,
  title = "Session repositories not accessible",
  visibleItems,
  warningIntro = "your attention before launching the session",
}: SessionRepositoriesModalProps) {
  const navigate = useNavigate();
  const defaultOnCancel = useCallback(() => {
    const url = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
      namespace: project.namespace,
      slug: project.slug,
    });
    navigate(url);
  }, [navigate, project.namespace, project.slug]);
  const onCancel = onCancelProp ?? defaultOnCancel;

  const projectPermissions = useProjectPermissions({ projectId: project.id });
  const { data, error, isLoading } = useGetRepositoriesQuery(
    project.repositories ?? [],
  );

  const hasWriteAccess = !!projectPermissions?.write;
  const repoWithInterruptions = useMemo(() => {
    if (isLoading || !data) return [];
    return data.filter((repo) =>
      repositoryNeedsAttention(repo, hasWriteAccess),
    );
  }, [data, hasWriteAccess, isLoading]);
  const pinnedRepositories = useMemo(() => {
    if (visibleItems == null || !data) {
      return null;
    }
    const byUrl = new Map(
      data.map((repository) => [repository.url, repository]),
    );
    return visibleItems.map((item) => {
      const repository = byUrl.get(item.id);
      return {
        item,
        pending: repositoryNeedsAttention(repository, hasWriteAccess),
        repository,
        skipped:
          repositoriesReady &&
          repositoryNeedsAttention(repository, hasWriteAccess),
      };
    });
  }, [data, hasWriteAccess, repositoriesReady, visibleItems]);

  const dispatch = useAppDispatch();
  const defaultOnSkip = useCallback(() => {
    dispatch(startSessionOptionsV2Slice.actions.setRepositoriesReady(true));
  }, [dispatch]);
  const onSkip = onSkipProp ?? defaultOnSkip;

  const content =
    isLoading || !data ? (
      <Loader />
    ) : error ? (
      <div>
        <p>
          An error occurred while checking the project repositories. You can try
          to reload the page.
        </p>
        <RtkOrDataServicesError error={error} />
      </div>
    ) : pinnedRepositories != null ? (
      <PinnedRepositoryList
        hasWriteAccess={hasWriteAccess}
        openInNewTab={embedded}
        project={project}
        rows={pinnedRepositories}
        warningIntro={warningIntro}
      />
    ) : (
      <>
        <p data-cy="session-repositories-warning">
          There{" "}
          {repoWithInterruptions.length === 1
            ? `is ${repoWithInterruptions.length} repository that requires`
            : `are ${repoWithInterruptions.length} repositories that require`}{" "}
          {warningIntro}:
        </p>
        <RepositoryAccordion
          openIds={repoWithInterruptions.map((repository) =>
            repositoryAccordionId(repository.url),
          )}
        >
          {repoWithInterruptions.map((repository) => (
            <SessionRepositoryWarning
              key={repository.url}
              accordionId={repositoryAccordionId(repository.url)}
              hasWriteAccess={hasWriteAccess}
              openInNewTab={embedded}
              repository={repository}
              project={project}
            />
          ))}
        </RepositoryAccordion>
      </>
    );

  const skipButton = (
    <Button
      color="outline-primary"
      data-cy="session-repositories-modal-continue"
      onClick={onSkip}
    >
      <SkipForward className={cx("bi", "me-1")} />
      {continueLabel}
    </Button>
  );

  if (embedded) {
    return <div data-cy="session-repositories-modal">{content}</div>;
  }

  return (
    <ScrollableModal
      centered
      data-cy="session-repositories-modal"
      isOpen={isOpen}
      size="lg"
    >
      <ModalHeader tag="h2">{title}</ModalHeader>
      <ModalBody>{content}</ModalBody>
      <ModalFooter>
        <Button
          color="outline-primary"
          data-cy="session-repositories-modal-cancel"
          onClick={onCancel}
        >
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        {skipButton}
      </ModalFooter>
    </ScrollableModal>
  );
}

function repositoryNeedsAttention(
  repository: GetRepositoriesApiResponse | undefined,
  hasWriteAccess: boolean,
): boolean {
  if (repository == null) {
    return false;
  }
  return (
    !!repository.error ||
    (!!repository.data && shouldInterrupt(repository.data, hasWriteAccess))
  );
}

function PinnedRepositoryList({
  hasWriteAccess,
  openInNewTab,
  project,
  rows,
  warningIntro,
}: {
  hasWriteAccess: boolean;
  openInNewTab: boolean;
  project: Project;
  rows: {
    item: VisibleItem;
    pending: boolean;
    repository?: GetRepositoriesApiResponse;
    skipped: boolean;
  }[];
  warningIntro: string;
}) {
  const pendingCount = rows.filter((row) => row.pending && !row.skipped).length;
  const openIds = rows
    .filter((row) => repositoryStartsOpen(row))
    .map((row) => repositoryAccordionId(row.item.id));
  return (
    <>
      {pendingCount > 0 && (
        <p data-cy="session-repositories-warning">
          There{" "}
          {pendingCount === 1
            ? "is 1 repository that requires"
            : `are ${pendingCount} repositories that require`}{" "}
          {warningIntro}:
        </p>
      )}
      <RepositoryAccordion key={openIds.join("|")} openIds={openIds}>
        {rows.map((row) => {
          const accordionId = repositoryAccordionId(row.item.id);
          if (row.repository == null) {
            return (
              <RepositoryAccordionItem
                key={row.item.id}
                accordionId={accordionId}
                title={row.item.label}
              >
                Unavailable
              </RepositoryAccordionItem>
            );
          }
          return (
            <SessionRepositoryWarning
              key={row.item.id}
              accordionId={accordionId}
              connected={!row.pending && isRepositoryConnected(row.repository)}
              hasWriteAccess={hasWriteAccess}
              openInNewTab={openInNewTab}
              repository={row.repository}
              project={project}
              showActions={row.pending}
              skipped={row.skipped}
            />
          );
        })}
      </RepositoryAccordion>
    </>
  );
}

function repositoryAccordionId(repositoryUrl: string): string {
  return `repository-${encodeURIComponent(repositoryUrl)}`;
}

function RepositoryAccordion({
  children,
  openIds,
}: {
  children: ReactNode;
  openIds: string[];
}) {
  const toggle = useCallback(() => {}, []);
  return (
    <UncontrolledAccordion
      defaultOpen={openIds}
      stayOpen={true}
      toggle={toggle}
    >
      {children}
    </UncontrolledAccordion>
  );
}

function RepositoryAccordionItem({
  accordionId,
  badge,
  children,
  title,
}: {
  accordionId: string;
  badge?: "skipped" | "connected";
  children?: ReactNode;
  title: string;
}) {
  return (
    <AccordionItem data-cy={accordionId}>
      <AccordionHeader targetId={accordionId}>
        <span className="fw-bold">{title}</span>
        {badge != null && <RepositoryStatusBadge status={badge} />}
      </AccordionHeader>
      <AccordionBody accordionId={accordionId}>{children}</AccordionBody>
    </AccordionItem>
  );
}

function RepositoryStatusBadge({
  status,
}: {
  status: "skipped" | "connected";
}) {
  const connected = status === "connected";
  const colorClass = connected
    ? ["border-success", "bg-success-subtle", "text-success-emphasis"]
    : ["border-secondary", "bg-secondary-subtle", "text-secondary-emphasis"];
  return (
    <span className={cx("ms-2", "border", "badge", "fw-normal", colorClass)}>
      {connected ? <Check className="me-1" /> : <Ban className="me-1" />}
      {connected ? "Connected" : "Skipped"}
    </span>
  );
}

function isRepositoryConnected(
  repository: GetRepositoriesApiResponse,
): boolean {
  return repository.data?.connection?.status === "connected";
}

function repositoryStartsOpen(row: {
  pending: boolean;
  repository?: GetRepositoriesApiResponse;
  skipped: boolean;
}): boolean {
  if (row.skipped) {
    return false;
  }
  if (
    row.repository != null &&
    !row.pending &&
    isRepositoryConnected(row.repository)
  ) {
    return false;
  }
  return true;
}

interface SessionRepositoryWarningProps {
  accordionId: string;
  connected?: boolean;
  hasWriteAccess: boolean;
  openInNewTab?: boolean;
  repository: GetRepositoriesApiResponse;
  project: Project;
  showActions?: boolean;
  skipped?: boolean;
}
function repositoryBadge(
  skipped: boolean,
  connected: boolean,
): "skipped" | "connected" | undefined {
  if (skipped) {
    return "skipped";
  }
  if (connected) {
    return "connected";
  }
  return undefined;
}

function SessionRepositoryWarning({
  accordionId,
  connected = false,
  hasWriteAccess,
  openInNewTab = false,
  repository,
  project,
  showActions = true,
  skipped = false,
}: SessionRepositoryWarningProps) {
  const title = getRepositoryName(repository.url);
  const badge = repositoryBadge(skipped, connected);
  return (
    <RepositoryAccordionItem
      accordionId={accordionId}
      badge={badge}
      title={title}
    >
      <p className="mb-2">URL: {repository.url}</p>
      <div className="mb-2">
        <RepositoryPermissionsBadge
          hasWriteAccess={hasWriteAccess}
          repositoryUrl={repository.url}
        />
      </div>
      {showActions && (
        <RepositoryCallToActionAlert
          hasWriteAccess={hasWriteAccess}
          openInNewTab={openInNewTab}
          repositoryUrl={repository.url}
          project={project}
        />
      )}
    </RepositoryAccordionItem>
  );
}
