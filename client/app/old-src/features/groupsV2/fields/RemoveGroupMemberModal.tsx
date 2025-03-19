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
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../components/Loader";
import type { GroupMemberResponse } from "../../projectsV2/api/namespace.api";
import { useDeleteGroupsByGroupSlugMembersAndUserIdMutation } from "../../projectsV2/api/projectV2.enhanced-api";
import { ProjectMemberDisplay } from "../../projectsV2/shared/ProjectMemberDisplay";

interface RemoveGroupMemberModalProps {
  groupSlug: string;
  isOpen: boolean;
  member: GroupMemberResponse | undefined;
  toggle: () => void;
}

export default function RemoveGroupMemberModal({
  groupSlug,
  isOpen,
  member,
  toggle,
}: RemoveGroupMemberModalProps) {
  return (
    <Modal
      backdrop="static"
      centered
      data-cy="remove-group-member-modal"
      fullscreen="lg"
      isOpen={isOpen && member != null}
      size="lg"
      toggle={toggle}
    >
      <ModalHeader toggle={toggle}>Remove a group member</ModalHeader>
      {member != null && (
        <RemoveGroupMemberAccessForm
          groupSlug={groupSlug}
          member={member}
          toggle={toggle}
        />
      )}
    </Modal>
  );
}

interface RemoveGroupMemberAccessFormProps {
  groupSlug: string;
  member: GroupMemberResponse;
  toggle: () => void;
}

function RemoveGroupMemberAccessForm({
  groupSlug,
  member,
  toggle,
}: RemoveGroupMemberAccessFormProps) {
  const [deleteGroupMember, { isLoading, isSuccess, error }] =
    useDeleteGroupsByGroupSlugMembersAndUserIdMutation();

  useEffect(() => {
    if (isSuccess) {
      toggle();
    }
  }, [isSuccess, toggle]);

  const onDelete = useCallback(() => {
    deleteGroupMember({
      groupSlug,
      userId: member.id,
    });
  }, [deleteGroupMember, groupSlug, member.id]);

  return (
    <>
      <ModalBody>
        {error && <RtkOrNotebooksError error={error} />}
        <div className={cx("align-items-baseline", "d-flex", "flex-row")}>
          <p className="mb-0">
            Remove <ProjectMemberDisplay member={member} nameInBold={true} />{" "}
            from group?
          </p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="outline-danger" onClick={toggle}>
          <XLg className={cx("bi", "me-1")} />
          Close
        </Button>
        <Button
          color="danger"
          disabled={isLoading}
          onClick={onDelete}
          type="submit"
        >
          {isLoading ? (
            <Loader inline size={16} />
          ) : (
            <Trash className={cx("bi", "me-1")} />
          )}
          Remove member
        </Button>
      </ModalFooter>
    </>
  );
}
