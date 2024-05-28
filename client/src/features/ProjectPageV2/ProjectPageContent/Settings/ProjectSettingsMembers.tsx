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

import type {
  Project,
  ProjectMemberResponse,
} from "../../../projectsV2/api/projectV2.api";
import { useGetProjectsByProjectIdMembersQuery } from "../../../projectsV2/api/projectV2.enhanced-api";
import AddProjectMemberModal from "../../../projectsV2/fields/AddProjectMemberModal";
import EditProjectMemberModal from "../../../projectsV2/fields/EditProjectMemberModal.tsx";
import RemoveProjectMemberModal from "../../../projectsV2/fields/RemoveProjectMemberModal";

import MembershipGuard from "../../utils/MembershipGuard.tsx";
import { toSortedMembers } from "../../utils/roleUtils.ts";

function OverviewBox({ children }: { children: ReactNode }) {
  return <div className={cx("bg-white", "rounded-3", "mt-3")}>{children}</div>;
}

type MemberActionMenuProps = Omit<
  ProjectPageSettingsMembersTableRowProps,
  "member" | "members" | "numberOfOwners"
> & { disabled?: boolean };

function MemberActionMenu({
  disabled,
  index,
  onRemove,
  onEdit,
}: MemberActionMenuProps) {
  const defaultAction = (
    <Button
      color="rk-green"
      disabled={disabled}
      data-cy={`project-member-edit-${index}`}
      onClick={onEdit}
    >
      <PencilSquare className={cx("rk-icon", "rk-icon-sm", "me-2")} /> Edit
    </Button>
  );
  return (
    <ButtonWithMenu
      className="py-1"
      color="rk-green"
      default={defaultAction}
      disabled={disabled}
      isPrincipal
    >
      <DropdownItem onClick={onRemove}>
        <Trash className={cx("rk-icon", "rk-icon-sm", "me-2")} /> Remove
      </DropdownItem>
    </ButtonWithMenu>
  );
}

function ProjectMemberAction({
  index,
  member,
  members,
  numberOfOwners,
  onRemove,
  onEdit,
}: ProjectPageSettingsMembersTableRowProps) {
  if (member.role === "owner" && numberOfOwners < 2) {
    return (
      <MemberActionMenu
        disabled={true}
        index={index}
        onRemove={onRemove}
        onEdit={onEdit}
      />
    );
  }
  return (
    <MembershipGuard
      disabled={
        <MemberActionMenu
          disabled={true}
          index={index}
          onRemove={onRemove}
          onEdit={onEdit}
        />
      }
      enabled={
        <MemberActionMenu index={index} onRemove={onRemove} onEdit={onEdit} />
      }
      members={members}
      selfOverride={{
        disabled: (
          <Button
            color="danger"
            data-cy={`project-member-remove-${index}`}
            onClick={onRemove}
          >
            <Trash className={cx("rk-icon", "rk-icon-sm", "me-2")} /> Remove
          </Button>
        ),
        subject: member,
      }}
    />
  );
}

interface ProjectPageSettingsMembersTableRowProps {
  index: number;
  member: ProjectMemberResponse;
  members: ProjectMemberResponse[];
  numberOfOwners: number;
  onRemove: () => void;
  onEdit: () => void;
}

function ProjectPageSettingsMembersTableRow({
  index,
  member,
  members,
  numberOfOwners,
  onRemove,
  onEdit,
}: ProjectPageSettingsMembersTableRowProps) {
  return (
    <Row className={cx("px-0", "py-4", "py-xl-3", "px-md-2", "m-0")}>
      <Col xs={9} sm={6} className={cx("d-flex", "align-items-center", "px-3")}>
        {member.email ?? member.id}
      </Col>
      <Col
        xs={3}
        sm={6}
        xl={3}
        className={cx("d-flex", "align-items-center", "px-2")}
      >
        {member.role}
      </Col>
      <Col
        xs={12}
        xl={3}
        className={cx("d-flex", "align-items-center", "px-3", "px-md-2")}
        data-cy={`project-member-actions-${index}`}
      >
        <ProjectMemberAction
          index={index}
          member={member}
          members={members}
          numberOfOwners={numberOfOwners}
          onRemove={onRemove}
          onEdit={onEdit}
        />
      </Col>
    </Row>
  );
}

interface ProjectPageSettingsMembersTableProps {
  members: ProjectMemberResponse[];
  projectId: string;
}

function ProjectPageSettingsMembersTable({
  members,
  projectId,
}: ProjectPageSettingsMembersTableProps) {
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<ProjectMemberResponse>();
  const sortedMembers = toSortedMembers(members);
  const numberOfOwners = sortedMembers.filter((m) => m.role === "owner").length;

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
      <Row
        className={cx("d-none", "d-xl-flex", "pt-3", "px-md-2", "m-0", "mb-1")}
      >
        <Col
          xs={9}
          sm={6}
          className={cx("d-flex", "align-items-center", "px-3")}
        >
          <span className={cx(headerClasses)}>User id</span>
        </Col>
        <Col
          xs={3}
          sm={6}
          xl={3}
          className={cx("d-flex", "align-items-center", "px-2")}
        >
          <span className={cx(headerClasses)}>Role</span>
        </Col>
        <Col
          xs={12}
          xl={3}
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
            members={members}
            numberOfOwners={numberOfOwners}
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

interface ProjectPageSettingsMembersContentProps {
  projectId: string;
  isLoading: boolean;
  members: ProjectMemberResponse[] | undefined;
  error: ReturnType<typeof useGetProjectsByProjectIdMembersQuery>["error"];
}

function ProjectPageSettingsMembersContent({
  error,
  isLoading,
  members,
  projectId,
}: ProjectPageSettingsMembersContentProps) {
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
    if (error.status === 401 || error.status === 404) return null;
    return <RtkErrorAlert error={error} />;
  }
  if (members == null)
    return <div className="mb-3">Could not load members</div>;
  const totalMembers = members ? members?.length : 0;
  return (
    <>
      <div className={cx("d-flex", "justify-content-between", "p-3", "p-md-4")}>
        <div className="fw-bold">
          <PeopleFill className={cx("rk-icon", "rk-icon-lg", "me-2")} />
          Members ({totalMembers})
        </div>
        <div>
          <MembershipGuard
            disabled={null}
            enabled={
              <PlusRoundButton
                data-cy="project-add-member"
                handler={toggleAddMemberModalOpen}
              />
            }
            members={members}
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
  project: Project;
}

export default function ProjectPageSettingsMembers({
  project,
}: ProjectPageSettingsMembersProps) {
  const {
    data: members,
    error,
    isLoading,
  } = useGetProjectsByProjectIdMembersQuery({
    projectId: project.id,
  });
  return (
    <>
      <Row className="g-5">
        <Col sm={12}>
          <h4 className="fw-bold">Members of the project</h4>
          <MembershipGuard
            disabled={null}
            enabled={<small>Manage access permissions to the project</small>}
            members={members}
          />
        </Col>
      </Row>
      <Row className="g-5">
        <Col sm={12}>
          <OverviewBox>
            <ProjectPageSettingsMembersContent
              error={error}
              isLoading={isLoading}
              members={members}
              projectId={project.id}
            />
          </OverviewBox>
        </Col>
      </Row>
    </>
  );
}
