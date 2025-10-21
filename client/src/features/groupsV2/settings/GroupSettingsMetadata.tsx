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
import { useCallback, useContext, useEffect, useState } from "react";
import { CheckLg, Pencil, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { generatePath, useNavigate } from "react-router";
import {
  Button,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../components/Loader";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import AppContext from "../../../utils/context/appContext";
import PermissionsGuard from "../../permissionsV2/PermissionsGuard";
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
import useGroupPermissions from "../utils/useGroupPermissions.hook";

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
  const navigate = useNavigate();
  const [deleteGroup, result] = useDeleteGroupsByGroupSlugMutation();
  const { notifications } = useContext(AppContext);
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
    if (result.isError)
      notifications?.addError(`Error deleting the group ${group.name}`);
    if (result.isSuccess) {
      notifications?.addSuccess(
        `Group ${group.name} has been successfully deleted.`
      );
      navigate(generatePath(ABSOLUTE_ROUTES.v2.root));
    }
  }, [result.isError, result.isSuccess, notifications, group.name, navigate]);

  return (
    <Modal centered isOpen={isOpen} size="lg" toggle={toggle}>
      <ModalHeader tag="h2">Are you absolutely sure?</ModalHeader>
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
          data-cy="group-delete-confirm-button"
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
    formState: { dirtyFields, errors, isDirty },
    handleSubmit,
    setValue,
  } = useForm<GroupMetadata>({
    defaultValues: {
      description: group.description,
      name: group.name,
      slug: group.slug ?? "",
    },
  });
  const permissions = useGroupPermissions({ groupSlug: group.slug });

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

  const resetUrl = useCallback(() => {
    setValue("slug", group.slug, {
      shouldValidate: true,
    });
  }, [setValue, group.slug]);

  const { params } = useContext(AppContext);
  const baseUrl = params?.BASE_URL ?? window.location.origin;
  const groupPath = generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
    slug: "",
  });
  const url = `${baseUrl}${groupPath}/`;

  return (
    <div>
      {updateGroupResult.error && (
        <RtkOrNotebooksError error={updateGroupResult.error} />
      )}
      <GroupDeleteConfirmation isOpen={isOpen} group={group} toggle={toggle} />
      <Form
        className={cx("d-flex", "flex-column", "gap-3")}
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <PermissionsGuard
          disabled={<GroupReadOnlyField title="Name" value={group.name} />}
          enabled={
            <NameFormField
              control={control}
              entityName="group"
              errors={errors}
              name="name"
            />
          }
          requestedPermission="write"
          userPermissions={permissions.permissions}
        />

        <PermissionsGuard
          disabled={<GroupReadOnlyField title="Slug" value={group.slug} />}
          enabled={
            <div>
              <Label className="form-label" for="group-slug">
                Slug
              </Label>
              <SlugFormField
                compact={true}
                control={control}
                entityName={"group"}
                errors={errors}
                name={"slug"}
                resetFunction={resetUrl}
                url={url}
              />
              {errors.slug && dirtyFields.slug && (
                <div className={cx("d-block", "invalid-feedback")}>
                  <p className="mb-1">
                    {errors?.slug?.message?.toString() ?? ""}
                  </p>
                </div>
              )}
            </div>
          }
          requestedPermission="delete"
          userPermissions={permissions.permissions}
        />

        <PermissionsGuard
          disabled={
            <GroupReadOnlyField
              title="Description"
              value={group.description ?? ""}
            />
          }
          enabled={
            <DescriptionFormField
              control={control}
              entityName="group"
              errors={errors}
              name="description"
            />
          }
          requestedPermission="write"
          userPermissions={permissions.permissions}
        />

        <div className={cx("d-flex", "gap-2")}>
          <PermissionsGuard
            disabled={null}
            enabled={
              <Button
                className="ms-auto"
                color="outline-danger"
                data-cy="group-delete-button"
                onClick={toggle}
              >
                Delete
              </Button>
            }
            requestedPermission="delete"
            userPermissions={permissions.permissions}
          />

          <PermissionsGuard
            disabled={null}
            enabled={
              <Button
                color="primary"
                data-cy="group-update-button"
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
            }
            requestedPermission="write"
            userPermissions={permissions.permissions}
          />
        </div>
      </Form>
    </div>
  );
}
function GroupReadOnlyField({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div>
      <Label className="form-label" for={`group-${title}`}>
        {title}
      </Label>
      <Input
        className="form-control"
        id={`group-${title}`}
        type="text"
        value={value}
        disabled={true}
        readOnly
      />
    </div>
  );
}
