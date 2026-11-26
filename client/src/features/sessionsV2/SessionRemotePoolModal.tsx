/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
import { useCallback } from "react";
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

import ScrollableModal from "~/components/modal/ScrollableModal";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import useAppDispatch from "~/utils/customHooks/useAppDispatch.hook";
import type { Project } from "../projectsV2/api/projectV2.api";
import type { ResourcePoolWithIdFiltered } from "./api/computeResources.api";
import ImagePlatformMismatchMessage from "./components/ImagePlatformMismatchMessage";
import { MissingEnvVariablesDetails } from "./components/RemotePoolEnvVariables";
import type { RemotePoolRequiredEnvVariable } from "./session.constants";
import startSessionOptionsV2Slice from "./startSessionOptionsV2.slice";
import type { ImagePlatformCompatibility } from "./useImagePlatformCompatibility.hook";

export interface SessionRemotePoolIssues {
  resourcePool: ResourcePoolWithIdFiltered;
  missingEnvVariables: RemotePoolRequiredEnvVariable[];
  imageCompatibility: ImagePlatformCompatibility;
}

interface SessionRemotePoolModalProps extends SessionRemotePoolIssues {
  isOpen: boolean;
  project: Project;
  onSkip?: () => void;
  onCancel?: () => void;
}

export default function SessionRemotePoolModal({
  isOpen,
  project,
  resourcePool,
  missingEnvVariables,
  imageCompatibility,
  onSkip: onSkipProp,
  onCancel: onCancelProp,
}: SessionRemotePoolModalProps) {
  const navigate = useNavigate();
  const defaultOnCancel = useCallback(() => {
    const url = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
      namespace: project.namespace,
      slug: project.slug,
    });
    navigate(url);
  }, [navigate, project.namespace, project.slug]);
  const onCancel = onCancelProp ?? defaultOnCancel;

  const dispatch = useAppDispatch();
  const defaultOnSkip = useCallback(() => {
    dispatch(startSessionOptionsV2Slice.actions.setRemotePoolReady(true));
  }, [dispatch]);
  const onSkip = onSkipProp ?? defaultOnSkip;

  const hasMissingEnvVariables = missingEnvVariables.length > 0;
  const hasImageMismatch = imageCompatibility.isCompatible === false;
  const issueCount =
    (hasMissingEnvVariables ? 1 : 0) + (hasImageMismatch ? 1 : 0);

  return (
    <ScrollableModal
      centered
      data-cy="session-remote-pool-modal"
      isOpen={isOpen}
      size="lg"
    >
      <ModalHeader tag="h2">Remote resource pool requirements</ModalHeader>
      <ModalBody>
        <p data-cy="session-remote-pool-warning">
          The <span className="fw-bold">{resourcePool.name}</span> resource pool
          has{" "}
          {issueCount === 1
            ? "a requirement that needs"
            : "requirements that need"}{" "}
          fixing.
        </p>
        <ListGroup>
          {hasMissingEnvVariables && (
            <ListGroupItem data-cy="session-remote-pool-env-variables">
              <h3>Missing environment variables</h3>
              <MissingEnvVariablesDetails
                missing={missingEnvVariables}
                resourcePoolName={resourcePool.name}
              />
            </ListGroupItem>
          )}
          {hasImageMismatch && (
            <ListGroupItem data-cy="session-remote-pool-image">
              <h3>Incompatible image</h3>
              <p className="mb-2">
                This resource pool requires an image compatible with{" "}
                <code>{resourcePool.platform}</code>.
              </p>
              <ImagePlatformMismatchMessage
                compatibility={imageCompatibility}
              />
            </ListGroupItem>
          )}
        </ListGroup>
      </ModalBody>
      <ModalFooter>
        <Button
          color="outline-primary"
          data-cy="session-remote-pool-modal-cancel"
          onClick={onCancel}
        >
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="outline-primary"
          data-cy="session-remote-pool-modal-continue"
          onClick={onSkip}
        >
          <SkipForward className={cx("bi", "me-1")} />
          Launch anyway
        </Button>
      </ModalFooter>
    </ScrollableModal>
  );
}
