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

import { useGetUsersQuery } from "../../user/dataServicesUser.api";
import type { UserWithId } from "../../user/dataServicesUser.api";

import type { FullUsersWithRoles, MemberWithRole } from "../api/projectV2.api";
import { usePatchProjectsByProjectIdMembersMutation } from "../api/projectV2.enhanced-api";
import type { ProjectMember } from "../projectV2.types";

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

interface AddProjectMemberModalProps {
  isOpen: boolean;
  members: FullUsersWithRoles;
  projectId: string;
  toggle: () => void;
}

type NewProjectMember = Pick<ProjectMember, "email">;

interface AddProjectMemberEmailLookupFormProps
  extends Pick<AddProjectMemberModalProps, "toggle"> {
  setNewMember: (user: UserWithId) => void;
}
function AddProjectMemberEmailLookupForm({
  setNewMember,
  toggle,
}: AddProjectMemberEmailLookupFormProps) {
  const [lookupEmail, setLookupEmail] = useState<string | undefined>(undefined);
  const [isUserNotFound, setIsUserNotFound] = useState(false);
  const { data, isLoading } = useGetUsersQuery(
    { exactEmail: lookupEmail },
    { skip: lookupEmail == null }
  );

  useEffect(() => {
    if (data == null) return;
    if (data.length < 1) {
      setIsUserNotFound(true);
      return;
    }
    setNewMember(data[0]);
  }, [data, setNewMember, setIsUserNotFound]);

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<NewProjectMember>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = useCallback(
    (data: NewProjectMember) => {
      setIsUserNotFound(false);
      setLookupEmail(data.email);
    },
    [setLookupEmail]
  );

  return (
    <>
      <ModalBody>
        <Form
          className="form-rk-green"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-3">
            <Label className="form-label" for="addProjectMemberEmail">
              Email
            </Label>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  className={cx("form-control", errors.email && "is-invalid")}
                  data-cy="add-project-member-email"
                  disabled={isLoading}
                  id="addProjectMemberEmail"
                  placeholder="email"
                  type="text"
                  {...field}
                />
              )}
              rules={{ required: true, pattern: emailRegex }}
            />
            <div className="invalid-feedback">
              Please provide the email address for the member to add.
            </div>
            {isUserNotFound && <div>No user found for {lookupEmail}.</div>}
          </div>
          <div className={cx("d-flex", "flex-row-reverse")}>
            <Button
              className="btn-outline-rk-green"
              disabled={isLoading}
              type="submit"
            >
              Lookup
            </Button>
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          className="btn-outline-rk-green"
          onClick={toggle}
          data-cy="user-lookup-close-button"
        >
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
        <Button disabled={true} onClick={handleSubmit(onSubmit)} type="submit">
          <PlusLg className={cx("bi", "me-1")} />
          Add Member
        </Button>
      </ModalFooter>
    </>
  );
}

interface ProjectMemberForAdd extends MemberWithRole {
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
      member: { id: user.id },
      email: user.email,
      role: "member",
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
      const projectMembers = members.map((m) => ({
        member: { id: m.member.id },
        role: m.role,
      }));
      projectMembers.push({ member: { id: data.member.id }, role: data.role });

      patchProjectMembers({ projectId, membersWithRoles: projectMembers });
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
                  <option value="member">Member</option>
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
        <AddProjectMemberEmailLookupForm
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
