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
import { CheckLg, Pencil, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { generatePath, useNavigate } from "react-router-dom-v5-compat";
import {
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../components/Loader";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import type {
  GroupPatchRequest,
  GroupResponse,
} from "../../projectsV2/api/namespace.api";
import {
  useDeleteGroupsByGroupSlugMutation,
  usePatchGroupsByGroupSlugMutation,
} from "../../projectsV2/api/projectV2.enhanced-api";
import DescriptionFormField from "../../projectsV2/fields/DescriptionFormField";
import NameFormField from "../../projectsV2/fields/NameFormField";
import SlugFormField from "../../projectsV2/fields/SlugFormField";

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
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="danger"
          disabled={typedName !== group.slug.trim()}
          onClick={onDelete}
        >
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <CheckLg className={cx("bi", "me-1")} />
          )}
          Yes, delete group
        </Button>
      </ModalFooter>
    </Modal>
  );
}

interface GroupMetadataFormProps {
  group: GroupResponse;
}
export default function GroupMetadataForm({ group }: GroupMetadataFormProps) {
  const navigate = useNavigate();

  const {
    control,
    formState: { errors, isDirty },
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
      {updateGroupResult.error && (
        <RtkOrNotebooksError error={updateGroupResult.error} />
      )}
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
          <Button
            color="primary"
            disabled={isUpdating || !isDirty}
            type="submit"
          >
            {isUpdating ? (
              <Loader inline size={16} />
            ) : (
              <Pencil className={cx("bi", "me-1")} />
            )}
            Update
          </Button>
        </div>
      </Form>
    </div>
  );
}
