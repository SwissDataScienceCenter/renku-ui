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
import { useCallback, useMemo, useState } from "react";
import { Link, To, useLocation } from "react-router";
import { Col, ListGroupItem, Row } from "reactstrap";

import RenkuStorageIcon from "~/components/icons/RenkuStorageIcon";
import type { ProjectStorageV2 } from "~/features/cloudStorage/api/projectCloudStorage.api";
import { useGetStorageQuotasByStorageQuotaIdQuery } from "~/features/sessionsV2/api/computeResources.api";
import useLocationHash from "~/utils/customHooks/useLocationHash.hook";
import ProjectStorageV2Actions from "./ProjectStorageV2Actions";
import ProjectStorageV2EditModal from "./ProjectStorageV2EditModal";
import ProjectStorageV2View from "./ProjectStorageV2View";

interface ProjectStorageV2LinkDisplayProps {
  storage: ProjectStorageV2;
}

export default function ProjectStorageV2LinkDisplay({
  storage,
}: ProjectStorageV2LinkDisplayProps) {
  // Handle hash
  const [hash, setHash] = useLocationHash();
  const storageHash = useMemo(
    () => `project-storage-v2-${storage.id}`,
    [storage.id],
  );
  const showOffCanvas = useMemo(
    () => hash === storageHash,
    [storageHash, hash],
  );
  const toggleOffCanvas = useCallback(() => {
    setHash((prev) => {
      const isOpen = prev === storageHash;
      return isOpen ? "" : storageHash;
    });
  }, [storageHash, setHash]);

  // Handle url with Hash
  const location = useLocation();
  const targetOffcanvasLocation: To = {
    pathname: location.pathname,
    search: location.search,
    hash: storageHash,
  };

  const [isEditOpen, setIsEditOpen] = useState(false);
  const toggleEdit = useCallback(() => {
    setIsEditOpen((open) => !open);
  }, []);

  // Load storage quota
  const { data: storageQuota } = useGetStorageQuotasByStorageQuotaIdQuery({
    storageQuotaId: storage.storage_quota_id,
  });

  return (
    <>
      <ListGroupItem
        action
        className={cx("position-relative", "p-0")}
        data-cy="project-storage-item"
      >
        <Link
          className={cx(
            "d-block",
            "link-primary",
            "py-3",
            "text-body",
            "text-decoration-none",
          )}
          to={targetOffcanvasLocation}
        >
          <Row
            className={cx("align-items-center", "flex-nowrap", "g-3", "mx-0")}
          >
            <Col className={cx("d-flex", "flex-column", "min-w-0", "px-0")}>
              <div
                className={cx(
                  "align-items-center",
                  "d-flex",
                  "flex-wrap",
                  "gap-2",
                )}
              >
                <span className="fw-bold" data-cy="project-storage-name">
                  Project storage
                </span>
              </div>
              <div
                className={cx(
                  "align-items-center",
                  "d-flex",
                  "flex-row",
                  "gap-1",
                )}
              >
                <RenkuStorageIcon />
                <p className={cx("mb-0", "text-break")}>
                  {storageQuota ? (
                    <>{storageQuota.storage_flavor_display_name}</>
                  ) : (
                    <>Renku storage</>
                  )}
                </p>
              </div>
            </Col>
            {/* This column is a placeholder to reserve the space for the action button */}
            <Col xs="auto" className="flex-shrink-0">
              <div
                aria-hidden="true"
                className={cx(
                  "btn",
                  "btn-sm",
                  "opacity-0",
                  "pe-none",
                  "text-nowrap",
                )}
              >
                FakeButton123
              </div>
            </Col>
          </Row>
        </Link>
        {/* The action button is visually positioned over the previous placeholder column */}
        <div
          className={cx("end-0", "mt-3", "position-absolute", "top-0", "z-5")}
        >
          <ProjectStorageV2Actions storage={storage} toggleEdit={toggleEdit} />
        </div>
      </ListGroupItem>
      <ProjectStorageV2View
        storage={storage}
        showView={showOffCanvas}
        toggleView={toggleOffCanvas}
      />
      <ProjectStorageV2EditModal
        storage={storage}
        isOpen={isEditOpen}
        toggle={toggleEdit}
      />
    </>
  );
}
