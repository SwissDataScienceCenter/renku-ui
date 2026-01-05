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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useMemo } from "react";
import { Plugin, Send, SkipForward, XLg } from "react-bootstrap-icons";
import { generatePath, Link, useLocation, useNavigate } from "react-router";
import { Button, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { Loader } from "~/components/Loader";
import ScrollableModal from "~/components/modal/ScrollableModal";
import { ABSOLUTE_ROUTES } from "~/routing/routes.constants";
import useAppDispatch from "~/utils/customHooks/useAppDispatch.hook";
import type { Project } from "../projectsV2/api/projectV2.api";
import { SessionLauncher } from "./api/sessionLaunchersV2.generated-api";
import { useGetSessionsImagesQuery } from "./api/sessionsV2.api";
import SessionImageBadge from "./components/SessionStatus/SessionImageBadge";
import startSessionOptionsV2Slice from "./startSessionOptionsV2.slice";

interface SessionImageModalProps {
  isOpen: boolean;
  launcher: SessionLauncher;
  project: Project;
}
export default function SessionImageModal({
  isOpen,
  launcher,
  project,
}: SessionImageModalProps) {
  const navigate = useNavigate();
  const onCancel = useCallback(() => {
    const url = generatePath(ABSOLUTE_ROUTES.v2.projects.show.root, {
      namespace: project.namespace,
      slug: project.slug,
    });
    navigate(url);
  }, [navigate, project.namespace, project.slug]);

  const containerImage = launcher.environment?.container_image ?? "";
  const { data, isLoading } = useGetSessionsImagesQuery(
    containerImage ? { imageUrl: containerImage } : skipToken
  );

  const { pathname, hash } = useLocation();
  const search = useMemo(() => {
    return `?${new URLSearchParams({
      targetProvider: data?.provider?.id ?? "",
      source: `${pathname}${hash}`,
    }).toString()}`;
  }, [data, pathname, hash]);

  const dispatch = useAppDispatch();
  const onSkip = useCallback(() => {
    dispatch(startSessionOptionsV2Slice.actions.setImageReady(true));
  }, [dispatch]);

  const content =
    isLoading || !data ? (
      <Loader />
    ) : (
      <>
        <div className="mb-2">
          <SessionImageBadge data={data} isLoading={isLoading} />
        </div>
        {!data.connection && !data.provider ? (
          <>
            <p className="mb-2">
              The container image reference <code>{containerImage}</code> is
              invalid or points to an unsupported registry.
            </p>
            <p className="mb-0">
              Please verify the image and check if the registry is in the
              currently supported{" "}
              <Link
                to={{
                  pathname: ABSOLUTE_ROUTES.v2.integrations,
                  search,
                }}
              >
                <Plugin className={cx("bi", "me-1")} />
                integrations
              </Link>
              . If you&apos;re certain the reference is correct and points to a
              registry we don&apos;t currently support,{" "}
              <a
                target="_blank"
                rel="noreferrer noopener"
                href="mailto:hello@renku.io"
              >
                <Send className={cx("bi", "me-1")} />
                contact us
              </a>{" "}
              about adding an integration.
            </p>
          </>
        ) : data.connection?.status === "connected" ? (
          <>
            <p className="mb-0">
              Either the container image reference does not exist, or you do not
              have access to it.
            </p>
            {data?.provider?.id && (
              <>
                <p className={cx("mb-2", "mt-2")}>
                  If you think you should have access, check your integration
                  configuration.
                </p>
                <Link
                  className={cx("btn", "btn-primary", "btn-sm")}
                  to={{
                    pathname: ABSOLUTE_ROUTES.v2.integrations,
                    search,
                  }}
                >
                  <Plugin className={cx("bi", "me-1")} />
                  View integration
                </Link>
              </>
            )}
          </>
        ) : (
          <>
            <p className="mb-2">
              This container image reference is from a supported registry, but
              you haven &apos;t activated the integration yet. Activate the
              integration to check if you have access to this image.
            </p>
            <Link
              className={cx("btn", "btn-primary", "btn-sm")}
              to={{
                pathname: ABSOLUTE_ROUTES.v2.integrations,
                search,
              }}
            >
              <Plugin className={cx("bi", "me-1")} />
              Go to Integration
            </Link>
          </>
        )}
      </>
    );

  return (
    <ScrollableModal
      centered
      data-cy="session-secrets-modal"
      isOpen={isOpen}
      size="lg"
    >
      <ModalHeader tag="h2" data-cy="session-image-not-accessible-header">
        Session image not accessible
      </ModalHeader>
      <ModalBody>{content}</ModalBody>
      <ModalFooter>
        <Button
          color="outline-danger"
          onClick={onCancel}
          data-cy="session-image-not-accessible-cancel-button"
        >
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button color="outline-danger" onClick={onSkip}>
          <SkipForward className={cx("bi", "me-1")} />
          Attempt launch
        </Button>
      </ModalFooter>
    </ScrollableModal>
  );
}
