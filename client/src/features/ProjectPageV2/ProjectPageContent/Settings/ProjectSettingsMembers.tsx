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
import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { PeopleFill } from "react-bootstrap-icons";
import { Button, Col, Row, Table } from "reactstrap";

import { PlusRoundButton } from "../../../../components/buttons/Button.tsx";
import { RtkErrorAlert } from "../../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../../components/Loader";

import type { ProjectMemberResponse } from "../../../projectsV2/api/projectV2.api";
import {
  useDeleteProjectsByProjectIdMembersAndMemberIdMutation,
  useGetProjectsByProjectIdMembersQuery,
} from "../../../projectsV2/api/projectV2.enhanced-api";
import AddProjectMemberModal from "../../../projectsV2/fields/AddProjectMemberModal";

import styles from "../ProjectOverview/ProjectOverview.module.scss";

function OverviewBox({ children }: { children: ReactNode }) {
  return (
    <div
      className={cx(
        "border-1",
        "border-rk-text-light",
        "rounded-2",
        "bg-white",
        "mt-3",
        "mt-lg-0",
        styles.BorderDashed,
        styles.ProjectPageOverviewBox
      )}
    >
      {children}
    </div>
  );
}

interface ProjectPageSettingsMembersTableProps
  extends ProjectPageSettingsMembersProps {
  members: ProjectMemberResponse[];
}

function ProjectPageSettingsMembersTable({
  members,
  projectId,
}: ProjectPageSettingsMembersTableProps) {
  const [deleteMember] =
    useDeleteProjectsByProjectIdMembersAndMemberIdMutation();

  const onDelete = useCallback(
    (member: ProjectMemberResponse) => {
      deleteMember({ projectId, memberId: member.id });
    },
    [deleteMember, projectId]
  );
  return (
    <Table>
      <tbody>
        {members.map((d, i) => {
          return (
            <tr key={d.id}>
              <td>{d.email ?? d.id}</td>
              <td>{d.role}</td>
              <td>
                <Button
                  color="outline-danger"
                  data-cy={`delete-member-${i}`}
                  onClick={() => onDelete(d)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

function ProjectPageSettingsMembersContent({
  projectId,
}: ProjectPageSettingsMembersProps) {
  const {
    data: members,
    error,
    isLoading,
  } = useGetProjectsByProjectIdMembersQuery({
    projectId,
  });
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const toggleAddMemberModalOpen = useCallback(() => {
    setIsAddMemberModalOpen((open) => !open);
  }, []);

  if (isLoading)
    return (
      <p>
        <Loader className="bi" inline size={16} />
        Loading members...
      </p>
    );
  if (error) {
    return <RtkErrorAlert error={error} />;
  }
  if (members == null)
    return <div className="mb-3">Could not load members</div>;
  const totalMembers = members ? members?.length : 0;
  return (
    <>
      <div className={cx("d-flex", "justify-content-between", "p-3")}>
        <div className="fw-bold">
          <PeopleFill className={cx("rk-icon", "rk-icon-lg", "me-2")} />
          Members ({totalMembers})
        </div>
        <PlusRoundButton
          data-cy="project-add-member"
          handler={toggleAddMemberModalOpen}
        />
      </div>
      <p className={cx("px-3", totalMembers > 1 && "d-none")}>
        Add members to give them access to this project.
      </p>
      <ProjectPageSettingsMembersTable
        members={members}
        projectId={projectId}
      />
      <AddProjectMemberModal
        isOpen={isAddMemberModalOpen}
        members={members}
        projectId={projectId}
        toggle={toggleAddMemberModalOpen}
      />
    </>
  );
}

interface ProjectPageSettingsMembersProps {
  projectId: string;
}

export default function ProjectPageSettingsMembers({
  projectId,
}: ProjectPageSettingsMembersProps) {
  return (
    <div className="mx-3 pb-5">
      <Row className="g-5">
        <Col sm={12}>
          <OverviewBox>
            <ProjectPageSettingsMembersContent projectId={projectId} />
          </OverviewBox>
        </Col>
      </Row>
    </div>
  );
}
