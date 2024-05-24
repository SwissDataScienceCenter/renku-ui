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

import { useCallback, useEffect, useState } from "react";
import { PlusLg, XLg } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";

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

import type { UserWithId } from "../../user/dataServicesUser.api";

import type {
  GroupMemberResponseList,
  GroupMemberPatchRequest,
} from "../api/namespace.api";
import { usePatchGroupsByGroupSlugMembersMutation } from "../api/projectV2.enhanced-api";

import AddEntityMemberEmailLookupForm from "./AddEntityMemberLookupForm";

interface AddGroupMemberModalProps {
  isOpen: boolean;
  members: GroupMemberResponseList;
  groupSlug: string;
  toggle: () => void;
}

interface GroupMemberForAdd extends GroupMemberPatchRequest {
  email: string;
}

interface AddGroupMemberAccessFormProps
  extends Pick<AddGroupMemberModalProps, "members" | "groupSlug" | "toggle"> {
  user: UserWithId;
}
function AddGroupMemberAccessForm({
  members,
  groupSlug,
  toggle,
  user,
}: AddGroupMemberAccessFormProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [patchGroupMembers, result] =
    usePatchGroupsByGroupSlugMembersMutation();
  const { control, handleSubmit } = useForm<GroupMemberForAdd>({
    defaultValues: {
      id: user.id,
      email: user.email,
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
          <div
            className={cx("align-items-baseline", "d-flex", "flex-row", "mb-3")}
          >
            <Label>{user.email}</Label>
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
        <Button className="btn-outline-rk-green" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
        <Button onClick={handleSubmit(onSubmit)} type="submit">
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
  const [newMember, setNewMember] = useState<UserWithId | undefined>(undefined);
  const toggleVisible = useCallback(() => {
    setNewMember(undefined);
    toggle();
  }, [setNewMember, toggle]);

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
      {newMember == null && (
        <AddEntityMemberEmailLookupForm
          setNewMember={setNewMember}
          toggle={toggleVisible}
        />
      )}
      {newMember != null && (
        <AddGroupMemberAccessForm
          members={members}
          groupSlug={groupSlug}
          toggle={toggleVisible}
          user={newMember}
        />
      )}
    </Modal>
  );
}
