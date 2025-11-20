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
import { useCallback, useEffect } from "react";
import { PencilSquare, PersonGear, XLg } from "react-bootstrap-icons";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Form,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../components/Loader";
import type { GroupMemberResponse } from "../../projectsV2/api/namespace.api";
import { usePatchGroupsByGroupSlugMembersMutation } from "../../projectsV2/api/projectV2.enhanced-api";
import { ProjectMemberDisplay } from "../../projectsV2/shared/ProjectMemberDisplay";
import GroupMemberRoleSelect from "./GroupMemberRoleSelect";

interface EditGroupMemberModalProps {
  groupSlug: string;
  isOpen: boolean;
  member: GroupMemberResponse | undefined;
  toggle: () => void;
}

export default function EditGroupMemberModal({
  groupSlug,
  isOpen,
  member,
  toggle,
}: EditGroupMemberModalProps) {
  return (
    <Modal
      backdrop="static"
      centered
      fullscreen="lg"
      isOpen={isOpen && member != null}
      size="lg"
      toggle={toggle}
    >
      <ModalHeader tag="h2" toggle={toggle}>
        <PersonGear className={cx("me-1", "bi")} />
        Change access
      </ModalHeader>
      {member != null && (
        <EditGroupMemberRoleForm
          groupSlug={groupSlug}
          member={member}
          toggle={toggle}
        />
      )}
    </Modal>
  );
}

interface EditGroupMemberRoleFormProps {
  groupSlug: string;
  member: GroupMemberResponse;
  toggle: () => void;
}

function EditGroupMemberRoleForm({
  groupSlug,
  member,
  toggle,
}: EditGroupMemberRoleFormProps) {
  const [patchGroupMembers, { isLoading, isSuccess, error }] =
    usePatchGroupsByGroupSlugMembersMutation();
  const {
    control,
    formState: { isDirty },
    handleSubmit,
  } = useForm<GroupMemberResponse>({
    defaultValues: {
      id: member.id,
      role: member.role,
    },
  });

  useEffect(() => {
    if (isSuccess) {
      toggle();
    }
  }, [isSuccess, toggle]);

  const onSubmit = useCallback(
    (data: GroupMemberResponse) => {
      patchGroupMembers({
        groupSlug,
        groupMemberPatchRequestList: [
          {
            id: data.id,
            role: data.role,
          },
        ],
      });
    },
    [groupSlug, patchGroupMembers]
  );

  return (
    <>
      <ModalBody>
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          {error && <RtkOrNotebooksError error={error} />}
          <div className={cx("align-items-baseline", "d-flex", "flex-row")}>
            <Label for="member-role-select-input">
              <ProjectMemberDisplay member={member} />
            </Label>
            <Controller
              control={control}
              name="role"
              render={({
                field: { onBlur, onChange, value, disabled },
                fieldState: { error },
              }) => (
                <>
                  <div
                    className={cx("ms-1", "flex-grow-1", error && "is-invalid")}
                  >
                    <GroupMemberRoleSelect
                      disabled={disabled}
                      data-cy="member-role-select"
                      id="member-role"
                      inputId="member-role-select-input"
                      name="role"
                      onBlur={onBlur}
                      onChange={onChange}
                      value={value ?? ""}
                    />
                  </div>
                  <div className="invalid-feedback">
                    {error?.message ? (
                      <>{error.message}</>
                    ) : (
                      <>Please select a role.</>
                    )}
                  </div>
                </>
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
        <Button
          color="primary"
          disabled={isLoading || !isDirty}
          onClick={handleSubmit(onSubmit)}
          type="submit"
        >
          {isLoading ? (
            <Loader inline size={16} />
          ) : (
            <PencilSquare className={cx("bi", "me-1")} />
          )}
          Change access
        </Button>
      </ModalFooter>
    </>
  );
}
