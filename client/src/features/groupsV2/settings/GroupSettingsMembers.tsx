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

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { capitalize } from "lodash-es";
import { ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { PencilSquare, PersonGear, PlusLg, Trash } from "react-bootstrap-icons";
import {
  Button,
  CardBody,
  CardHeader,
  DropdownItem,
  ListGroup,
  ListGroupItem,
  UncontrolledTooltip,
} from "reactstrap";

import { ButtonWithMenuV2 } from "../../../components/buttons/Button";
import { Loader } from "../../../components/Loader";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import useGroupPermissions from "../../groupsV2/utils/useGroupPermissions.hook";
import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
import type {
  GroupMemberResponse,
  GroupMemberResponseList,
  GroupResponse,
} from "../../projectsV2/api/namespace.api";
import { useGetGroupsByGroupSlugMembersQuery } from "../../projectsV2/api/projectV2.enhanced-api";
import { useGetUserQuery } from "../../user/dataServicesUser.api";
import AddGroupMemberModal from "../fields/AddGroupMemberModal";
import EditGroupMemberModal from "../fields/EditGroupMemberModal";
import RemoveGroupMemberModal from "../fields/RemoveGroupMemberModal";

interface GroupSettingsMembersProps {
  group: GroupResponse;
}

export default function GroupSettingsMembers({
  group,
}: GroupSettingsMembersProps) {
  const permissions = useGroupPermissions({ groupSlug: group.slug });

  const { data, isLoading } = useGetGroupsByGroupSlugMembersQuery({
    groupSlug: group.slug,
  });
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const toggleAddMemberModalOpen = useCallback(() => {
    setIsAddMemberModalOpen((open) => !open);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  if (data == null) {
    return (
      <>
        <CardHeader>
          <h4>
            <PersonGear className={cx("me-1", "bi")} />
            Group Members
          </h4>
        </CardHeader>
        <CardBody>
          <div className="mb-3">Could not load members</div>
        </CardBody>
      </>
    );
  }

  return (
    <>
      <CardHeader>
        <div className={cx("d-flex", "gap-2", "mb-3")}>
          <h4>
            <PersonGear className={cx("me-1", "bi")} />
            Group Members
          </h4>

          <PermissionsGuard
            disabled={null}
            enabled={
              <div>
                <Button
                  color="outline-primary"
                  data-cy="group-add-member"
                  onClick={toggleAddMemberModalOpen}
                  size="sm"
                >
                  <PlusLg className="bi" id="createPlus" />
                </Button>
              </div>
            }
            requestedPermission="change_membership"
            userPermissions={permissions}
          />
        </div>
      </CardHeader>
      <CardBody>
        <GroupSettingsMembersList group={group} members={data} />
        <AddGroupMemberModal
          isOpen={isAddMemberModalOpen}
          members={data}
          groupSlug={group.slug}
          toggle={toggleAddMemberModalOpen}
        />
      </CardBody>
    </>
  );
}

interface GroupSettingsMembersListProps {
  group: GroupResponse;
  members: GroupMemberResponseList;
}

function GroupSettingsMembersList({
  group,
  members,
}: GroupSettingsMembersListProps) {
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<GroupMemberResponse>();
  const numberOfOwners = useMemo(
    () => members.filter((m) => m.role === "owner").length,
    [members]
  );

  const toggleEditMemberModal = useCallback(() => {
    setIsEditMemberModalOpen((isOpen) => !isOpen);
  }, []);
  const toggleRemoveMemberModal = useCallback(() => {
    setIsRemoveMemberModalOpen((isOpen) => !isOpen);
  }, []);

  const onEdit = useCallback((member: GroupMemberResponse) => {
    return () => {
      setMemberToEdit(member);
      setIsEditMemberModalOpen(true);
    };
  }, []);
  const onRemove = useCallback((member: GroupMemberResponse) => {
    return () => {
      setMemberToEdit(member);
      setIsRemoveMemberModalOpen(true);
    };
  }, []);

  return (
    <>
      <ListGroup>
        {members.map((member, idx) => (
          <GroupMemberItem
            key={member.id}
            group={group}
            index={idx}
            member={member}
            members={members}
            numberOfOwners={numberOfOwners}
            onEdit={onEdit(member)}
            onRemove={onRemove(member)}
          />
        ))}
      </ListGroup>
      <EditGroupMemberModal
        groupSlug={group.slug}
        isOpen={isEditMemberModalOpen}
        member={memberToEdit}
        toggle={toggleEditMemberModal}
      />
      <RemoveGroupMemberModal
        groupSlug={group.slug}
        isOpen={isRemoveMemberModalOpen}
        member={memberToEdit}
        toggle={toggleRemoveMemberModal}
      />
    </>
  );
}

interface GroupMemberItemProps {
  group: GroupResponse;
  index: number;
  member: GroupMemberResponse;
  members: GroupMemberResponseList;
  numberOfOwners: number;
  onEdit: () => void;
  onRemove: () => void;
}

function GroupMemberItem({
  group,
  index,
  member,
  members,
  numberOfOwners,
  onEdit,
  onRemove,
}: GroupMemberItemProps) {
  const name =
    member.first_name && member.last_name
      ? `${member.first_name} ${member.last_name}`
      : member.first_name || member.last_name;

  return (
    <ListGroupItem>
      <div
        className={cx(
          "align-items-center",
          "d-flex",
          "gap-2",
          "justify-content-between"
        )}
      >
        <p className={cx("d-flex", "mb-0", "gap-2")}>
          <span>{name ?? "Unknown user"}</span>
          <span className="fst-italic">{`@${member.namespace}`}</span>
          <span className="fw-bold">({capitalize(member.role)})</span>
        </p>
        <div data-cy={`group-member-actions-${index}`}>
          <GroupMemberAction
            group={group}
            index={index}
            member={member}
            members={members}
            numberOfOwners={numberOfOwners}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        </div>
      </div>
    </ListGroupItem>
  );
}

interface GroupMemberActionProps {
  group: GroupResponse;
  index: number;
  member: GroupMemberResponse;
  members: GroupMemberResponseList;
  numberOfOwners: number;
  onEdit: () => void;
  onRemove: () => void;
}

function GroupMemberAction({
  group,
  index,
  member,
  members,
  numberOfOwners,
  onEdit,
  onRemove,
}: GroupMemberActionProps) {
  const logged = useLegacySelector((state) => state.stateModel.user.logged);
  const permissions = useGroupPermissions({ groupSlug: group.slug });
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useGetUserQuery(logged ? undefined : skipToken);
  const userMember = useMemo(() => {
    if (isUserLoading || userError || !user || !member) {
      return undefined;
    }
    return members.find((member) => member.id === user.id);
  }, [isUserLoading, member, members, user, userError]);

  if (userMember === member) {
    return (
      <PermissionsGuard
        disabled={
          <Button
            color="danger"
            data-cy={`group-member-remove-${index}`}
            onClick={onRemove}
          >
            <Trash className={cx("bi", "me-1")} />
            Remove
          </Button>
        }
        enabled={
          numberOfOwners >= 2 || userMember.role !== "owner" ? (
            <MemberActionMenu
              index={index}
              onRemove={onRemove}
              onEdit={onEdit}
            />
          ) : (
            <MemberActionMenu
              disabled={true}
              index={index}
              onRemove={onRemove}
              onEdit={onEdit}
              tooltip={"A group requires at least one owner."}
            />
          )
        }
        requestedPermission="change_membership"
        userPermissions={permissions}
      />
    );
  }

  return (
    <PermissionsGuard
      disabled={null}
      enabled={
        <MemberActionMenu index={index} onEdit={onEdit} onRemove={onRemove} />
      }
      requestedPermission="change_membership"
      userPermissions={permissions}
    />
  );
}

interface MemberActionMenuProps {
  disabled?: boolean;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
  tooltip?: ReactNode;
}

function MemberActionMenu({
  disabled,
  index,
  onEdit,
  onRemove,
  tooltip,
}: MemberActionMenuProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const defaultAction = (
    <Button
      color="outline-primary"
      disabled={disabled}
      data-cy={`group-member-edit-${index}`}
      onClick={onEdit}
      size="sm"
    >
      <PencilSquare className={cx("bi", "me-1")} />
      Edit
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
            <Trash className={cx("bi", "me-1")} />
            Remove
          </DropdownItem>
        </ButtonWithMenuV2>
      </span>
      {tooltip && (
        <UncontrolledTooltip target={ref}>{tooltip}</UncontrolledTooltip>
      )}
    </>
  );
}
