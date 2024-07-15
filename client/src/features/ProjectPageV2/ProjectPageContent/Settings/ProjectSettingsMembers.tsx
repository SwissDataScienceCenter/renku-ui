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
import React, { useCallback, useState, useRef } from "react";
import {
  People,
  PencilSquare,
  Trash,
  PlusLg,
  PersonGear,
} from "react-bootstrap-icons";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  DropdownItem,
  ListGroup,
  ListGroupItem,
  Row,
  UncontrolledTooltip,
} from "reactstrap";

import { ButtonWithMenuV2 } from "../../../../components/buttons/Button.tsx";
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

type MemberActionMenuProps = Omit<
  ProjectPageSettingsMembersListItemProps,
  "member" | "members" | "numberOfOwners"
> & { disabled?: boolean; tooltip?: React.ReactNode };

function MemberActionMenu({
  disabled,
  index,
  onRemove,
  onEdit,
  tooltip,
}: MemberActionMenuProps) {
  const ref = useRef(null);
  const defaultAction = (
    <Button
      color="outline-primary"
      disabled={disabled}
      data-cy={`project-member-edit-${index}`}
      onClick={onEdit}
      size="sm"
    >
      <PencilSquare className={cx("me-2", "text-icon")} /> Edit
    </Button>
  );
  return (
    <>
      <span ref={ref}>
        <ButtonWithMenuV2
          color="outline-primary"
          default={defaultAction}
          disabled={disabled}
          size="sm"
        >
          <DropdownItem onClick={onRemove}>
            <Trash className={cx("me-2", "text-icon")} /> Remove
          </DropdownItem>
        </ButtonWithMenuV2>
      </span>
      {tooltip && (
        <UncontrolledTooltip target={ref}>{tooltip}</UncontrolledTooltip>
      )}
    </>
  );
}

function ProjectMemberAction({
  index,
  member,
  members,
  numberOfOwners,
  onRemove,
  onEdit,
}: ProjectPageSettingsMembersListItemProps) {
  return (
    <MembershipGuard
      disabled={
        <MemberActionMenu
          disabled={true}
          index={index}
          onRemove={onRemove}
          onEdit={onEdit}
          tooltip={"Only project owners can modify access to the project."}
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
            <Trash className={cx("me-2", "text-icon")} />
            Remove
          </Button>
        ),
        enabled:
          member.role === "owner" && numberOfOwners < 2 ? (
            <MemberActionMenu
              disabled={true}
              index={index}
              onRemove={onRemove}
              onEdit={onEdit}
              tooltip={"A project requires at least one owner."}
            />
          ) : undefined,
        subject: member,
      }}
    />
  );
}

interface ProjectPageSettingsMembersListItemProps {
  index: number;
  member: ProjectMemberResponse;
  members: ProjectMemberResponse[];
  numberOfOwners: number;
  onRemove: () => void;
  onEdit: () => void;
}
function ProjectPageSettingsMembersListItem({
  index,
  member,
  members,
  numberOfOwners,
  onRemove,
  onEdit,
}: ProjectPageSettingsMembersListItemProps) {
  return (
    <ListGroupItem>
      <Row className="g-2">
        <Col className="align-content-around" xs={12} md="auto">
          {member.email ?? member.id}{" "}
          <span className="fw-bold">({member.role})</span>
        </Col>
        <Col
          className="ms-md-auto"
          xs={12}
          md="auto"
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
    </ListGroupItem>
  );
}

interface ProjectPageSettingsMembersListProps {
  members: ProjectMemberResponse[];
  projectId: string;
}
function ProjectPageSettingsMembersList({
  members,
  projectId,
}: ProjectPageSettingsMembersListProps) {
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<ProjectMemberResponse>();
  const sortedMembers = toSortedMembers(members);
  const numberOfOwners = sortedMembers.filter((m) => m.role === "owner").length;

  return (
    <>
      <ListGroup flush>
        {sortedMembers.map((d, i) => {
          return (
            <ProjectPageSettingsMembersListItem
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
      </ListGroup>
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
        <Loader className="me-2" inline />
        Loading members...
      </p>
    );
  if (error) {
    if (error.status === 401 || error.status === 404) return null;
    return <RtkErrorAlert error={error} />;
  }
  if (members == null) return <p className="p-0">Could not load members</p>;
  const totalMembers = members ? members?.length : 0;
  return (
    <>
      <div className={cx("d-flex", "justify-content-between", "mb-2")}>
        <p className={cx("fw-bold", "my-auto")}>
          <People className={cx("me-2", "text-icon")} />
          Members ({totalMembers})
        </p>
        <div className="my-auto">
          <MembershipGuard
            disabled={null}
            enabled={
              <Button
                color="outline-primary"
                data-cy="project-add-member"
                onClick={toggleAddMemberModalOpen}
                size="sm"
              >
                <PlusLg className="icon-text" />
              </Button>
            }
            members={members}
          />
        </div>
      </div>
      <ProjectPageSettingsMembersList members={members} projectId={projectId} />
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
    <Card id="members">
      <CardHeader>
        <MembershipGuard
          disabled={<h4 className="m-0">Members of the project</h4>}
          enabled={
            <>
              <h4>
                <PersonGear className={cx("me-2", "small", "text-icon")} />
                Members of the project
              </h4>
              <p className="m-0">Manage access permissions to the project</p>
            </>
          }
          members={members}
        />
      </CardHeader>
      <CardBody>
        <ProjectPageSettingsMembersContent
          error={error}
          isLoading={isLoading}
          members={members}
          projectId={project.id}
        />
      </CardBody>
    </Card>
  );
}
