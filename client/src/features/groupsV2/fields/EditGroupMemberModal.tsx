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
import { PencilSquare, XLg } from "react-bootstrap-icons";
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

import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../components/Loader";
import type { GroupMemberResponse } from "../../projectsV2/api/namespace.api";
import { usePatchGroupsByGroupSlugMembersMutation } from "../../projectsV2/api/projectV2.enhanced-api";
import { ProjectMemberDisplay } from "../../projectsV2/shared/ProjectMemberDisplay";

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
      <ModalHeader toggle={toggle}>Change access</ModalHeader>
      {member != null && (
        <EditGroupMemberAccessForm
          groupSlug={groupSlug}
          member={member}
          toggle={toggle}
        />
      )}
    </Modal>
  );
}

interface EditGroupMemberAccessFormProps {
  groupSlug: string;
  member: GroupMemberResponse;
  toggle: () => void;
}

function EditGroupMemberAccessForm({
  groupSlug,
  member,
  toggle,
}: EditGroupMemberAccessFormProps) {
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
      <ModalBody className="pb-0">
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          {error && <RtkOrNotebooksError error={error} />}
          <div
            className={cx("align-items-baseline", "d-flex", "flex-row", "mb-3")}
          >
            <Label for="member-role">
              <ProjectMemberDisplay member={member} />
            </Label>
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
