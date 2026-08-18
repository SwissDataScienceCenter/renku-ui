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
import type { ProjectStorage } from "~/features/dataConnectorsV2/api/data-connectors.api";
import { InfoEntry } from "~/features/dataConnectorsV2/components/DataConnectorInfoBox";
import {
  EditProjectStorageModal,
  ProjectStorageActions,
} from "./ProjectStorageLinkDisplay";

interface ProjectStorageViewProps {
  projectStorage: ProjectStorage;
  showView: boolean;
  toggleView: () => void;
}

export default function ProjectStorageView({
  projectStorage,
  showView,
  toggleView,
}: ProjectStorageViewProps) {
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
          <ProjectStorageViewHeader
            projectStorage={projectStorage}
            toggleView={toggleView}
            toggleEdit={toggleEdit}
          />

          <InfoAlert dismissible={false} timeout={0}>
            Project storage is mounted in your sessions and jobs (not in apps).
            Project owners and project editors have read-write access, while
            other users have read-only access to this storage.
          </InfoAlert>

          <ProjectStorageInfoBox
            projectStorage={projectStorage}
            headerTag="h3"
          />
        </div>
      </OffcanvasBody>
      <EditProjectStorageModal
        isOpen={isEditOpen}
        toggle={toggleEdit}
        projectStorage={projectStorage}
      />
    </Offcanvas>
  );
}

function ProjectStorageViewHeader({
  projectStorage,
  toggleView,
  toggleEdit,
}: {
  projectStorage: ProjectStorage;
  toggleView: () => void;
  toggleEdit: () => void;
}) {
  return (
    <OffcanvasHeaderWithType
      entityType="project-storage"
      title="Project storage"
    >
      <ProjectStorageActions
        projectStorage={projectStorage}
        toggleView={toggleView}
        toggleEdit={toggleEdit}
      />
    </OffcanvasHeaderWithType>
  );
}

function ProjectStorageInfoBox({
  projectStorage,
  headerTag = "h2",
}: {
  projectStorage: ProjectStorage;
  headerTag?: "h2" | "h3" | "h4";
}) {
  return (
    <Card data-cy="project-storage-info-box">
      <CardHeader tag={headerTag}>
        <span className={cx("align-items-center", "d-flex")}>
          <InfoCircle className="me-1" />
          Info
        </span>
      </CardHeader>
      <CardBody className={cx("d-flex", "flex-column", "gap-3")}>
        <InfoEntry title="Size">{projectStorage.size} GB</InfoEntry>
        <InfoEntry title={<MountPointHead />} dataCy="mount-point">
          {projectStorage.mount_path}
        </InfoEntry>
      </CardBody>
    </Card>
  );
}

function MountPointHead() {
  const ref = useRef(null);
  return (
    <>
      <span>Mount Point</span>
      <span ref={ref}>
        <InfoCircle className="ms-1" />
      </span>
      <UncontrolledTooltip target={ref} placement="bottom">
        This is where the project storage will be mounted.
      </UncontrolledTooltip>
    </>
  );
}
