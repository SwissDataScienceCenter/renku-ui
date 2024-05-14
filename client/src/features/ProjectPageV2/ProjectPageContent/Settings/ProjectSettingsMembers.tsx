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
import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { PeopleFill, PencilSquare, Trash } from "react-bootstrap-icons";
import { Button, Col, DropdownItem, Row } from "reactstrap";

import {
  ButtonWithMenu,
  PlusRoundButton,
} from "../../../../components/buttons/Button.tsx";
import { RtkErrorAlert } from "../../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../../components/Loader";

import type { ProjectMemberResponse } from "../../../projectsV2/api/projectV2.api";
import { useGetProjectsByProjectIdMembersQuery } from "../../../projectsV2/api/projectV2.enhanced-api";
import AddProjectMemberModal from "../../../projectsV2/fields/AddProjectMemberModal";
import EditProjectMemberModal from "../../../projectsV2/fields/EditProjectMemberModal.tsx";
import RemoveProjectMemberModal from "../../../projectsV2/fields/RemoveProjectMemberModal";

import styles from "../ProjectOverview/ProjectOverview.module.scss";

function roleCompare(a: string, b: string) {
  if (a === "owner") {
    return -1;
  }
  if (b === "owner") {
    return 1;
  }
  if (a === "editor") {
    return -1;
  }
  if (b === "editor") {
    return 1;
  }
  return 0;
}

function OverviewBox({ children }: { children: ReactNode }) {
  return (
    <div
      className={cx(
        "border-1",
        "border-rk-text-light",
        "rounded-2",
        "bg-white",
        "mt-3",
        "mt-lg-0",
        styles.BorderDashed,
        styles.ProjectPageOverviewBox
      )}
    >
      {children}
    </div>
  );
}

interface ProjectPageSettingsMembersTableRowProps {
  index: number;
  member: ProjectMemberResponse;
  onRemove: () => void;
  onEdit: () => void;
}

function ProjectPageSettingsMembersTableRow({
  index,
  member,
  onRemove,
  onEdit,
}: ProjectPageSettingsMembersTableRowProps) {
  const defaultAction = (
    <Button
      color="rk-green"
      data-cy={`project-member-edit-${index}`}
      onClick={onEdit}
    >
      <PencilSquare className={cx("rk-icon", "rk-icon-sm", "me-2")} /> Edit
    </Button>
  );
  return (
    <Row className={cx("px-0", "py-4", "py-xl-3", "m-0")}>
      <Col
        xl={6}
        xs={12}
        className={cx("d-flex", "align-items-center", "px-3")}
      >
        {member.email ?? member.id}
      </Col>
      <Col
        xl={3}
        sm={6}
        xs={12}
        className={cx("d-flex", "align-items-center", "px-2")}
      >
        {member.role}
      </Col>
      <Col
        xl={3}
        sm={6}
        xs={12}
        className={cx("d-flex", "align-items-center", "px-2")}
        data-cy={`project-member-actions-${index}`}
      >
        <ButtonWithMenu
          className="py-1"
          color="rk-green"
          default={defaultAction}
          isPrincipal
        >
          <DropdownItem onClick={onRemove}>
            <Trash className={cx("rk-icon", "rk-icon-sm", "me-2")} /> Remove
          </DropdownItem>
        </ButtonWithMenu>
      </Col>
    </Row>
  );
}

interface ProjectPageSettingsMembersTableProps
  extends ProjectPageSettingsMembersProps {
  members: ProjectMemberResponse[];
}

function ProjectPageSettingsMembersTable({
  members,
  projectId,
}: ProjectPageSettingsMembersTableProps) {
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<ProjectMemberResponse>();
  const sortedMembers = [...members].sort((a, b) => {
    if (a.role !== b.role) {
      return roleCompare(a.role, b.role);
    }
    if (a.email && b.email) {
      return a.email.localeCompare(b.email);
    }
    return a.id < b.id ? -1 : 1;
  });

  const headerClasses = [
    "w-100",
    "fst-italic",
    "fs-small",
    "text-rk-gray-600",
    "border-0",
    "border-bottom",
    "border-rk-gray-200",
    "rk-border-dotted",
  ];
  return (
    <>
      <Row className={cx("d-none", "d-xl-flex", "pt-3", "px-0", "m-0", "mb-1")}>
        <Col
          xl={6}
          xs={12}
          className={cx("d-flex", "align-items-center", "px-3")}
        >
          <span className={cx(headerClasses)}>User id</span>
        </Col>
        <Col
          xl={3}
          sm={6}
          xs={12}
          className={cx("d-flex", "align-items-center", "px-2")}
        >
          <span className={cx(headerClasses)}>Role</span>
        </Col>
        <Col
          xl={3}
          sm={6}
          xs={12}
          className={cx("d-flex", "align-items-center", "px-2")}
        >
          <span className={cx(headerClasses)}>Actions</span>
        </Col>
      </Row>
      {sortedMembers.map((d, i) => {
        return (
          <ProjectPageSettingsMembersTableRow
            index={i}
            key={d.id}
            member={d}
            onRemove={() => {
              setMemberToEdit(d);
              setIsRemoveMemberModalOpen(true);
            }}
            onEdit={() => {
              setMemberToEdit(d);
              setIsEditMemberModalOpen(true);
            }}
          />
        );
      })}
      <EditProjectMemberModal
        isOpen={isEditMemberModalOpen}
        member={memberToEdit}
        members={members}
        projectId={projectId}
        toggle={() => setIsEditMemberModalOpen(false)}
      />
      <RemoveProjectMemberModal
        isOpen={isRemoveMemberModalOpen}
        member={memberToEdit}
        projectId={projectId}
        toggle={() => setIsRemoveMemberModalOpen(false)}
      />
    </>
  );
}

function ProjectPageSettingsMembersContent({
  projectId,
}: ProjectPageSettingsMembersProps) {
  const {
    data: members,
    error,
    isLoading,
  } = useGetProjectsByProjectIdMembersQuery({
    projectId,
  });
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const toggleAddMemberModalOpen = useCallback(() => {
    setIsAddMemberModalOpen((open) => !open);
  }, []);

  if (isLoading)
    return (
      <p>
        <Loader className="bi" inline size={16} />
        Loading members...
      </p>
    );
  if (error) {
    return <RtkErrorAlert error={error} />;
  }
  if (members == null)
    return <div className="mb-3">Could not load members</div>;
  const totalMembers = members ? members?.length : 0;
  return (
    <>
      <div className={cx("d-flex", "justify-content-between", "p-3")}>
        <div className="fw-bold">
          <PeopleFill className={cx("rk-icon", "rk-icon-lg", "me-2")} />
          Members ({totalMembers})
        </div>
        <div>
          <PlusRoundButton
            data-cy="project-add-member"
            handler={toggleAddMemberModalOpen}
          />
        </div>
      </div>
      <ProjectPageSettingsMembersTable
        members={members}
        projectId={projectId}
      />
      <AddProjectMemberModal
        isOpen={isAddMemberModalOpen}
        members={members}
        projectId={projectId}
        toggle={toggleAddMemberModalOpen}
      />
    </>
  );
}

interface ProjectPageSettingsMembersProps {
  projectId: string;
}

export default function ProjectPageSettingsMembers({
  projectId,
}: ProjectPageSettingsMembersProps) {
  return (
    <div className="mx-3 pb-5">
      <Row className="g-5">
        <Col sm={12}>
          <h4>
            <b>Members of your project</b>
          </h4>
          <p>Maintain access permissions to your project</p>
        </Col>
      </Row>
      <Row className="g-5">
        <Col sm={12}>
          <OverviewBox>
            <ProjectPageSettingsMembersContent projectId={projectId} />
          </OverviewBox>
        </Col>
      </Row>
    </div>
  );
}
