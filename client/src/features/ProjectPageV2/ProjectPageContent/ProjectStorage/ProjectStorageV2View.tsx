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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import { InfoCircle } from "react-bootstrap-icons";
import {
  Card,
  CardBody,
  CardHeader,
  Offcanvas,
  OffcanvasBody,
  UncontrolledTooltip,
} from "reactstrap";

import { InfoAlert } from "~/components/Alert";
import OffcanvasHeaderWithType from "~/components/offcanvas/OffcanvasHeaderWithType";
import OffcanvasTopButtons from "~/components/offcanvas/OffcanvasTopButtons";
import type { ProjectStorageV2 } from "~/features/cloudStorage/api/projectCloudStorage.api";
import { InfoEntry } from "~/features/dataConnectorsV2/components/DataConnectorInfoBox";
import { computeResourcesApi } from "~/features/sessionsV2/api/computeResources.api";
import ProjectStorageV2Actions from "./ProjectStorageV2Actions";
import ProjectStorageV2EditModal from "./ProjectStorageV2EditModal";

interface ProjectStorageV2ViewProps {
  storage: ProjectStorageV2;
  showView: boolean;
  toggleView: () => void;
}

export default function ProjectStorageV2View({
  storage,
  showView,
  toggleView,
}: ProjectStorageV2ViewProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const toggleEdit = useCallback(() => {
    setIsEditOpen((open) => !open);
  }, []);

  // Prevents body scroll-lock when deleting project storage
  const showViewRef = useRef(showView);
  useEffect(() => {
    showViewRef.current = showView;
  }, [showView]);
  useEffect(() => {
    return () => {
      if (showViewRef.current) {
        document.body.style.overflow = "";
      }
    };
  }, []);

  return (
    <Offcanvas
      toggle={toggleView}
      isOpen={showView}
      direction="end"
      backdrop={true}
    >
      <OffcanvasBody data-cy="project-storage-view">
        <OffcanvasTopButtons
          entityType="project-storage"
          toggleView={toggleView}
        />

        <div className={cx("d-flex", "flex-column", "gap-3")}>
          <ProjectStorageV2ViewHeader
            storage={storage}
            toggleView={toggleView}
            toggleEdit={toggleEdit}
          />

          <InfoAlert dismissible={false} timeout={0}>
            Project storage is mounted in your sessions and jobs (not in apps).
            Project owners and project editors have read-write access, while
            other users have read-only access to this storage.
          </InfoAlert>

          <ProjectStorageV2InfoBox storage={storage} headerTag="h3" />
        </div>
      </OffcanvasBody>
      <ProjectStorageV2EditModal
        storage={storage}
        isOpen={isEditOpen}
        toggle={toggleEdit}
      />
    </Offcanvas>
  );
}

function ProjectStorageV2ViewHeader({
  storage,
  toggleView,
  toggleEdit,
}: {
  storage: ProjectStorageV2;
  toggleView: () => void;
  toggleEdit: () => void;
}) {
  return (
    <OffcanvasHeaderWithType
      entityType="project-storage"
      title="Project storage"
    >
      <ProjectStorageV2Actions
        storage={storage}
        toggleView={toggleView}
        toggleEdit={toggleEdit}
      />
    </OffcanvasHeaderWithType>
  );
}

function ProjectStorageV2InfoBox({
  storage,
  headerTag = "h2",
}: {
  storage: ProjectStorageV2;
  headerTag?: "h2" | "h3" | "h4";
}) {
  const { data: storageQuota, isUninitialized } =
    computeResourcesApi.endpoints.getStorageQuotasByStorageQuotaId.useQueryState(
      { storageQuotaId: storage.storage_quota_id },
    );
  computeResourcesApi.endpoints.getStorageQuotasByStorageQuotaId.useQuerySubscription(
    isUninitialized ? { storageQuotaId: storage.storage_quota_id } : skipToken,
  );

  return (
    <Card data-cy="project-storage-info-box">
      <CardHeader tag={headerTag}>
        <span className={cx("align-items-center", "d-flex")}>
          <InfoCircle className="me-1" />
          Info
        </span>
      </CardHeader>
      <CardBody className={cx("d-flex", "flex-column", "gap-3")}>
        {storageQuota && (
          <InfoEntry title="Storage type">
            {storageQuota.storage_flavor_display_name}
          </InfoEntry>
        )}
        {storage.actual_size && (
          <InfoEntry title="Actual size">{storage.actual_size} GB</InfoEntry>
        )}
        <InfoEntry title="Requested size">
          {storage.requested_size} GB
        </InfoEntry>
        <InfoEntry title={<MountPointHead />} dataCy="mount-point">
          <code>{storage.mount_path}</code>
        </InfoEntry>
        {storage.k8s_pvc_name && (
          <InfoEntry title="(?) PVC name">
            <code>{storage.k8s_pvc_name}</code>
          </InfoEntry>
        )}
        {storage.k8s_pvc_status && (
          <InfoEntry title="(?) PVC status phase">
            <code>{storage.k8s_pvc_status}</code>
          </InfoEntry>
        )}
      </CardBody>
    </Card>
  );
}

function MountPointHead() {
  const ref = useRef(null);
  return (
    <>
      <span>Mount Point</span>
      <span className="ms-1" ref={ref} tabIndex={0}>
        <InfoCircle />
      </span>
      <UncontrolledTooltip target={ref} placement="bottom">
        This is where the project storage will be mounted.
      </UncontrolledTooltip>
    </>
  );
}
