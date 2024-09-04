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

import { RtkErrorAlert } from "../../../components/errors/RtkErrorAlert";

import {
  usePatchProjectsByProjectIdMembersMutation,
  type ProjectMemberPatchRequest,
  type ProjectMemberResponse,
} from "../api/projectsV2.api";

interface EditProjectMemberModalProps {
  isOpen: boolean;
  member: ProjectMemberResponse | undefined;
  members: ProjectMemberPatchRequest[];
  projectId: string;
  toggle: () => void;
}

type ProjectMemberForEdit = ProjectMemberResponse;

interface EditProjectMemberAccessFormProps
  extends Pick<
    EditProjectMemberModalProps,
    "members" | "projectId" | "toggle"
  > {
  member: ProjectMemberForEdit;
}
function EditProjectMemberAccessForm({
  members,
  projectId,
  toggle,
  member,
}: EditProjectMemberAccessFormProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [patchProjectMembers, result] =
    usePatchProjectsByProjectIdMembersMutation();
  const { control, handleSubmit } = useForm<ProjectMemberForEdit>({
    defaultValues: {
      id: member.id,
      email: member.email,
      role: member.role,
    },
  });

  useEffect(() => {
    if (!result.isSuccess) {
      return;
    }
    toggle();
  }, [result.isSuccess, toggle]);

  const onSubmit = useCallback(
    (data: ProjectMemberForEdit) => {
      const projectMembers = members.map((m: ProjectMemberResponse) =>
        m.id === member.id
          ? {
              id: m.id,
              role: data.role,
            }
          : { id: m.id, role: m.role }
      );

      patchProjectMembers({
        projectId,
        projectMemberListPatchRequest: projectMembers,
      });
    },
    [patchProjectMembers, projectId, members, member]
  );

  return (
    <>
      <ModalBody className="pb-0">
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          {result.error && <RtkErrorAlert error={result.error} />}
          <div
            className={cx("align-items-baseline", "d-flex", "flex-row", "mb-3")}
          >
            <Label>{member.email ?? member.id}</Label>
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
          <PencilSquare className={cx("bi", "me-1")} />
          Change access
        </Button>
      </ModalFooter>
    </>
  );
}

export default function EditProjectMemberModal({
  isOpen,
  member,
  members,
  projectId,
  toggle,
}: EditProjectMemberModalProps) {
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
        <EditProjectMemberAccessForm
          members={members}
          projectId={projectId}
          toggle={toggle}
          member={member}
        />
      )}
    </Modal>
  );
}
