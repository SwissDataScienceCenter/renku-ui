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
import { Trash, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
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
import { getMemberNameToDisplay } from "../../ProjectPageV2/utils/roleUtils";
import type { ProjectMemberResponse } from "../api/projectV2.api";
import { useDeleteProjectsByProjectIdMembersAndMemberIdMutation } from "../api/projectV2.enhanced-api";

interface RemoveProjectMemberModalProps {
  isOpen: boolean;
  member: ProjectMemberResponse | undefined;
  projectId: string;
  toggle: () => void;
}

type ProjectMemberForRemove = ProjectMemberResponse;

interface RemoveProjectMemberAccessFormProps
  extends Pick<RemoveProjectMemberModalProps, "projectId" | "toggle"> {
  member: ProjectMemberResponse;
}
function RemoveProjectMemberAccessForm({
  projectId,
  toggle,
  member,
}: RemoveProjectMemberAccessFormProps) {
  const [deleteMember, result] =
    useDeleteProjectsByProjectIdMembersAndMemberIdMutation();

  const onRemove = useCallback(() => {
    deleteMember({ projectId, memberId: member.id });
  }, [deleteMember, member, projectId]);
  const { handleSubmit } = useForm<ProjectMemberForRemove>({
    defaultValues: {
      id: member.id,
    },
  });

  useEffect(() => {
    if (!result.isSuccess) {
      return;
    }
    toggle();
  }, [result.isSuccess, toggle]);

  const nameToDisplay = getMemberNameToDisplay(member);

  return (
    <>
      <ModalBody>
        <Form
          noValidate
          data-cy="remove-member-form"
          onSubmit={handleSubmit(onRemove)}
        >
          {result.error && <RtkOrNotebooksError error={result.error} />}
          <div
            className={cx("align-items-baseline", "d-flex", "flex-row", "mb-3")}
          >
            <Label>
              Remove <b>{nameToDisplay}</b>{" "}
              <span className="fst-italic">
                {member.namespace ? `@${member.namespace}` : ""}
              </span>{" "}
              from project?
            </Label>
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button className="btn-outline-rk-green" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
        <Button color="danger" onClick={handleSubmit(onRemove)} type="submit">
          <Trash className={cx("bi", "me-1")} />
          Remove member
        </Button>
      </ModalFooter>
    </>
  );
}

export default function RemoveProjectMemberModal({
  isOpen,
  member,
  projectId,
  toggle,
}: RemoveProjectMemberModalProps) {
  return (
    <Modal
      backdrop="static"
      centered
      fullscreen="lg"
      isOpen={isOpen && member != null}
      size="lg"
      toggle={toggle}
    >
      <ModalHeader toggle={toggle}>Remove a project member</ModalHeader>
      {member != null && (
        <RemoveProjectMemberAccessForm
          projectId={projectId}
          toggle={toggle}
          member={member}
        />
      )}
    </Modal>
  );
}
