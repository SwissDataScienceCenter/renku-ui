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
import { useCallback, useState } from "react";
import { ArrowLeft } from "react-bootstrap-icons";
import { Link, useParams } from "react-router-dom-v5-compat";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Label,
} from "reactstrap";

import FormSchema from "../../../components/formschema/FormSchema";
import { Loader } from "../../../components/Loader";
import { TimeCaption } from "../../../components/TimeCaption";
import { Url } from "../../../utils/helpers/url";

import SessionsV2 from "../../sessionsV2/SessionsV2";
import type { Project } from "../api/projectV2.api";
import {
  isErrorResponse,
  useGetProjectsByProjectIdQuery,
} from "../api/projectV2.enhanced-api";
import WipBadge from "../shared/WipBadge";

import {
  ProjectV2MembersForm,
  ProjectV2MetadataForm,
  ProjectV2RepositoryForm,
} from "./ProjectV2EditForm";
import { SettingEditOption } from "./projectV2Show.types";

interface ProjectV2HeaderProps {
  project: Project;
  setSettingEdit: (option: SettingEditOption) => void;
  settingEdit: SettingEditOption;
}
function ProjectV2Header({
  project,
  setSettingEdit,
  settingEdit,
}: ProjectV2HeaderProps) {
  const projectListUrl = Url.get(Url.pages.v2Projects.list);
  return (
    <>
      <div>{project.slug}</div>
      <div className="fst-italic">{project.visibility}</div>
      <TimeCaption datetime={project.creation_date} prefix="Created" />{" "}
      <WipBadge />
      <div className="my-2">
        <Link to={projectListUrl}>
          <ArrowLeft /> Back to list
        </Link>
      </div>
      <hr className="my-2" />
      <ProjectV2HeaderEditButtonGroup
        project={project}
        setSettingEdit={setSettingEdit}
        settingEdit={settingEdit}
      />
    </>
  );
}

function ProjectV2HeaderEditButtonGroup({
  project,
  setSettingEdit,
  settingEdit,
}: ProjectV2HeaderProps) {
  const canEdit = project.slug != null;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = useCallback(
    () => setDropdownOpen((prev) => !prev),
    [setDropdownOpen]
  );
  const onSetMetadata = useCallback(
    () => setSettingEdit("metadata"),
    [setSettingEdit]
  );
  const onSetMembers = useCallback(
    () => setSettingEdit("members"),
    [setSettingEdit]
  );
  const onSetRepositories = useCallback(
    () => setSettingEdit("repositories"),
    [setSettingEdit]
  );

  if (!canEdit) return null;

  return (
    <Dropdown
      isOpen={dropdownOpen}
      toggle={toggle}
      disabled={settingEdit != null}
    >
      <DropdownToggle caret className="w-100">
        Edit Settings
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={onSetMetadata}>Metadata</DropdownItem>
        <DropdownItem onClick={onSetMembers}>Members</DropdownItem>
        <DropdownItem onClick={onSetRepositories}>Repositories</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

function ProjectV2Description({ description }: Pick<Project, "description">) {
  const desc =
    description == null
      ? "(no description)"
      : description.length < 1
      ? "(no description)"
      : description;
  return <div className="fs-5">{desc}</div>;
}

function ProjectV2Repositories({
  repositories,
}: Pick<Project, "repositories">) {
  if (repositories == null || repositories.length < 1)
    return <div className="mb-3">(no repositories)</div>;
  return (
    <div>
      {repositories?.map((repo, i) => (
        <div key={i}>{repo}</div>
      ))}
    </div>
  );
}

interface ProjectV2DisplayProps {
  project: Pick<Project, "description" | "repositories">;
}
export function ProjectV2DescriptionAndRepositories({
  project,
}: ProjectV2DisplayProps) {
  return (
    <>
      <div className="mb-3">
        <Label>Description</Label>
        <ProjectV2Description description={project.description} />
      </div>
      <div className="mb-3">
        <Label>Repositories</Label>
        <ProjectV2Repositories repositories={project.repositories} />
      </div>
      <SessionsV2 />
    </>
  );
}

export default function ProjectV2Show() {
  const { id: projectId } = useParams<"id">();
  const { data, isLoading, error } = useGetProjectsByProjectIdQuery({
    projectId: projectId ?? "",
  });

  const [settingEdit, setSettingEdit] = useState<SettingEditOption>(null);

  if (isLoading) return <Loader />;
  if (error) {
    if (isErrorResponse(error)) {
      return (
        <div>
          Project does not exist, or you are not authorized to access it.{" "}
          <Link to={Url.get(Url.pages.v2Projects.list)}>Return to list</Link>
        </div>
      );
    }
    return <div>Could not retrieve project</div>;
  }
  if (data == null) return <div>Could not retrieve project</div>;

  return (
    <FormSchema
      showHeader={true}
      title={data.name ?? "(unknown)"}
      description={
        <ProjectV2Header
          project={data}
          setSettingEdit={setSettingEdit}
          settingEdit={settingEdit}
        />
      }
    >
      {settingEdit == null && (
        <>
          <ProjectV2DescriptionAndRepositories project={data} />
          <SessionsV2 />
        </>
      )}
      {settingEdit == "members" && (
        <ProjectV2MembersForm project={data} setSettingEdit={setSettingEdit} />
      )}
      {settingEdit == "metadata" && (
        <ProjectV2MetadataForm project={data} setSettingEdit={setSettingEdit} />
      )}
      {settingEdit == "repositories" && (
        <ProjectV2RepositoryForm
          project={data}
          setSettingEdit={setSettingEdit}
        />
      )}
    </FormSchema>
  );
}
