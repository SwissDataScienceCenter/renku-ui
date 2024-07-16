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
import { useCallback, useEffect, useState } from "react";
import { CheckLg, PlusLg, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import {
  Button,
  Form,
  Input,
  ListGroup,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { capitalize } from "lodash-es";

import { Loader } from "../../../components/Loader";
import type {
  GroupMemberResponse,
  GroupPatchRequest,
  GroupResponse,
} from "../api/namespace.api";
import {
  useDeleteGroupsByGroupSlugMembersAndUserIdMutation,
  useDeleteGroupsByGroupSlugMutation,
  useGetGroupsByGroupSlugMembersQuery,
  usePatchGroupsByGroupSlugMutation,
} from "../api/projectV2.enhanced-api";
import AddGroupMemberModal from "../fields/AddGroupMemberModal";
import DescriptionFormField from "../fields/DescriptionFormField";
import NameFormField from "../fields/NameFormField";
import SlugFormField from "../fields/SlugFormField";
import { generatePath, useNavigate } from "react-router-dom-v5-compat";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";

type GroupMetadata = Omit<GroupPatchRequest, "repositories">;

interface GroupDeleteConfirmationProps {
  isOpen: boolean;
  toggle: () => void;
  group: GroupResponse;
}

function GroupDeleteConfirmation({
  isOpen,
  toggle,
  group,
}: GroupDeleteConfirmationProps) {
  const [deleteGroup, result] = useDeleteGroupsByGroupSlugMutation();
  const onDelete = useCallback(() => {
    deleteGroup({ groupSlug: group.slug });
  }, [deleteGroup, group.slug]);
  const [typedName, setTypedName] = useState("");
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTypedName(e.target.value.trim());
    },
    [setTypedName]
  );

  useEffect(() => {
    if (result.isSuccess || result.isError) {
      toggle();
    }
  }, [result.isError, result.isSuccess, toggle]);

  return (
    <Modal centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader>Are you absolutely sure?</ModalHeader>
      <ModalBody>
        <p>
          Deleting a group{" "}
          <strong>will also delete all projects in the group</strong>, and
          deleted groups and projects cannot be restored. Please type{" "}
          <strong>{group.slug}</strong>, the slug of the group, to confirm.
        </p>
        <Input
          data-cy="delete-confirmation-input"
          value={typedName}
          onChange={onChange}
        />
      </ModalBody>
      <ModalFooter>
        <Button color="outline-danger" onClick={toggle}>
          <XLg className={cx("me-2", "text-icon")} />
          Cancel
        </Button>
        <Button
          color="danger"
          disabled={typedName !== group.slug.trim()}
          onClick={onDelete}
        >
          {result.isLoading ? (
            <Loader className="me-2" inline size={16} />
          ) : (
            <CheckLg className={cx("me-2", "text-icon")} />
          )}
          Yes, delete group
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface GroupEditSubmitGroupProps {
  isUpdating: boolean;
}
function GroupEditSubmitGroup({ isUpdating }: GroupEditSubmitGroupProps) {
  return (
    <div className={cx("d-flex", "justify-content-between")}>
      <div>
        <Button color="primary" disabled={isUpdating} type="submit">
          {isUpdating && <Loader inline={true} size={16} />} Update
        </Button>
      </div>
    </div>
  );
}

interface GroupMetadataFormProps {
  group: GroupResponse;
}
export function GroupMetadataForm({ group }: GroupMetadataFormProps) {
  const navigate = useNavigate();

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<GroupMetadata>({
    defaultValues: {
      description: group.description,
      name: group.name,
      slug: group.slug ?? "",
    },
  });

  const [updateGroup, updateGroupResult] = usePatchGroupsByGroupSlugMutation();

  useEffect(() => {
    if (updateGroupResult.isSuccess) {
      navigate(
        generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
          slug: updateGroupResult.data.slug,
        })
      );
    }
  }, [navigate, updateGroupResult.data?.slug, updateGroupResult.isSuccess]);

  const isUpdating = updateGroupResult.isLoading;

  const onSubmit = useCallback(
    (data: GroupMetadata) => {
      updateGroup({ groupSlug: group.slug ?? "", groupPatchRequest: data });
    },
    [group, updateGroup]
  );

  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  return (
    <div>
      <GroupDeleteConfirmation isOpen={isOpen} group={group} toggle={toggle} />
      <Form noValidate onSubmit={handleSubmit(onSubmit)}>
        <NameFormField
          control={control}
          entityName="group"
          errors={errors}
          name="name"
        />
        <SlugFormField
          control={control}
          entityName="group"
          errors={errors}
          name="slug"
        />
        <DescriptionFormField
          control={control}
          entityName="group"
          errors={errors}
          name="description"
        />
        <div className={cx("d-flex", "gap-2")}>
          <Button className="ms-auto" color="outline-danger" onClick={toggle}>
            Delete
          </Button>
          <GroupEditSubmitGroup isUpdating={isUpdating} />
        </div>
        {updateGroupResult.isError && <div>There was an error</div>}
      </Form>
    </div>
  );
}

export function GroupMembersForm({ group }: GroupMetadataFormProps) {
  const { data, isLoading } = useGetGroupsByGroupSlugMembersQuery({
    groupSlug: group.slug,
  });
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const toggleAddMemberModalOpen = useCallback(() => {
    setIsAddMemberModalOpen((open) => !open);
  }, []);

  const [deleteMember] = useDeleteGroupsByGroupSlugMembersAndUserIdMutation();

  const onDelete = useCallback(
    (member: GroupMemberResponse) => {
      deleteMember({ groupSlug: group.slug, userId: member.id });
    },
    [deleteMember, group.slug]
  );

  if (isLoading) return <Loader />;
  if (data == null)
    return (
      <>
        <h4>Project Members</h4>
        <div className="mb-3">Could not load members</div>
      </>
    );
  return (
    <>
      <div className={cx("d-flex", "gap-2", "mb-3")}>
        <h4>Project Members</h4>
        <div>
          <Button
            color="outline-primary"
            data-cy="group-add-member"
            onClick={toggleAddMemberModalOpen}
            size="sm"
          >
            <PlusLg className="text-icon" id="createPlus" />
          </Button>
        </div>
      </div>
      <ListGroup>
        {data.map((d, i) => {
          return (
            <ListGroupItem key={d.id}>
              <div
                className={cx(
                  "align-items-center",
                  "d-flex",
                  "gap-2",
                  "justify-content-between"
                )}
              >
                <p className={cx("d-flex", "mb-0", "gap-2")}>
                  <span className="fw-bold">{d.email ?? d.id}</span>
                  <span>{capitalize(d.role)}</span>
                </p>
                <div>
                  <Button
                    color="outline-danger"
                    data-cy={`delete-member-${i}`}
                    onClick={() => onDelete(d)}
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </ListGroupItem>
          );
        })}
      </ListGroup>
      <AddGroupMemberModal
        isOpen={isAddMemberModalOpen}
        members={data}
        groupSlug={group.slug}
        toggle={toggleAddMemberModalOpen}
      />
    </>
  );
}
