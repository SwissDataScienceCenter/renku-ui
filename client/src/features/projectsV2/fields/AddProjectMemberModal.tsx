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

import {
  usePatchProjectsByProjectIdMembersMutation,
  type ProjectMemberPatchRequest,
  type ProjectMemberResponse,
} from "../api/projectsV2.api";

import AddEntityMemberEmailLookupForm from "./AddEntityMemberLookupForm";

interface AddProjectMemberModalProps {
  isOpen: boolean;
  members: ProjectMemberPatchRequest[];
  projectId: string;
  toggle: () => void;
}

interface ProjectMemberForAdd extends ProjectMemberResponse {
  email: string;
}

interface AddProjectMemberAccessFormProps
  extends Pick<AddProjectMemberModalProps, "members" | "projectId" | "toggle"> {
  user: UserWithId;
}
function AddProjectMemberAccessForm({
  members,
  projectId,
  toggle,
  user,
}: AddProjectMemberAccessFormProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [patchProjectMembers, result] =
    usePatchProjectsByProjectIdMembersMutation();
  const { control, handleSubmit } = useForm<ProjectMemberForAdd>({
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
    (data: ProjectMemberForAdd) => {
      const projectMembers = members.map((m: ProjectMemberResponse) => ({
        id: m.id,
        role: m.role,
      }));
      projectMembers.push({ id: data.id, role: data.role });

      patchProjectMembers({
        projectId,
        projectMemberListPatchRequest: projectMembers,
      });
    },
    [patchProjectMembers, projectId, members]
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
  projectId,
  toggle,
}: AddProjectMemberModalProps) {
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
      <ModalHeader toggle={toggle}>Add a project member</ModalHeader>
      {newMember == null && (
        <AddEntityMemberEmailLookupForm
          setNewMember={setNewMember}
          toggle={toggleVisible}
        />
      )}
      {newMember != null && (
        <AddProjectMemberAccessForm
          members={members}
          projectId={projectId}
          toggle={toggleVisible}
          user={newMember}
        />
      )}
    </Modal>
  );
}
