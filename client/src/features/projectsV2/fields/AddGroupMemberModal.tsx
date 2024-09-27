/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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
import { useCallback, useEffect } from "react";
import { PlusLg, XLg } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import { SingleValue } from "react-select";
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
import { RtkErrorAlert } from "../../../components/errors/RtkErrorAlert";

import {
  usePatchGroupsByGroupSlugMembersMutation,
  type GroupMemberPatchRequest,
  type GroupMemberResponseList,
} from "../../groupsV2/api/groupsV2.api";
import { User } from "../../searchV2/api/searchV2Api.api";
import { UserControl } from "./UserSelector";

interface AddGroupMemberModalProps {
  isOpen: boolean;
  members: GroupMemberResponseList;
  groupSlug: string;
  toggle: () => void;
}

interface GroupMemberForAdd extends GroupMemberPatchRequest {}

interface AddGroupMemberAccessFormProps
  extends Pick<AddGroupMemberModalProps, "members" | "groupSlug" | "toggle"> {}
function AddGroupMemberAccessForm({
  members,
  groupSlug,
  toggle,
}: AddGroupMemberAccessFormProps) {
  const [patchGroupMembers, result] =
    usePatchGroupsByGroupSlugMembersMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GroupMemberForAdd>({
    defaultValues: {
      id: "",
      role: "viewer",
    },
  });

  useEffect(() => {
    if (!result.isSuccess) {
      return;
    }
    toggle();
  }, [result.isSuccess, toggle]);

  const onSubmit = useCallback(
    (data: GroupMemberForAdd) => {
      const groupMembers = members.map((m) => ({
        id: m.id,
        role: m.role,
      }));
      groupMembers.push({ id: data.id, role: data.role });

      patchGroupMembers({
        groupSlug,
        groupMemberPatchRequestList: groupMembers,
      });
    },
    [patchGroupMembers, groupSlug, members]
  );

  return (
    <>
      <ModalBody>
        <Form
          className="form-rk-green"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {result.error && <RtkErrorAlert error={result.error} />}
          <div className="mb-3">
            <Label className="form-label" for="addProjectMemberEmail">
              User
            </Label>
            <Controller
              control={control}
              name="id"
              render={({ field }) => {
                return (
                  <UserControl
                    {...field}
                    className={cx(errors.id && "is-invalid")}
                    data-cy="add-project-member"
                    id="addProjectMember"
                    onChange={(newValue: SingleValue<User>) =>
                      field.onChange(newValue?.id)
                    }
                  />
                );
              }}
              rules={{ required: true }}
            />
            <div className="invalid-feedback">Please select a user to add</div>
          </div>
          <div
            className={cx("align-items-baseline", "d-flex", "flex-row", "mb-3")}
          >
            <Label>Role</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Input
                  className={cx("form-control", "ms-3")}
                  data-cy="member-role"
                  id="member-role"
                  type="select"
                  style={{ maxWidth: "7em" }}
                  {...field}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="owner">Owner</option>
                </Input>
              )}
              rules={{ required: true }}
            />
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="outline-primary" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
        <Button color="primary" onClick={handleSubmit(onSubmit)} type="submit">
          <PlusLg className={cx("bi", "me-1")} />
          Add Member
        </Button>
      </ModalFooter>
    </>
  );
}

export default function AddProjectMemberModal({
  isOpen,
  members,
  groupSlug,
  toggle,
}: AddGroupMemberModalProps) {
  return (
    <Modal
      backdrop="static"
      centered
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggle}
    >
      <ModalHeader toggle={toggle}>Add a group member</ModalHeader>
      <AddGroupMemberAccessForm
        members={members}
        groupSlug={groupSlug}
        toggle={toggle}
      />
    </Modal>
  );
}
