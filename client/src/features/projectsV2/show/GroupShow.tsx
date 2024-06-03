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
import { useCallback, useState } from "react";
import { ArrowLeft } from "react-bootstrap-icons";
import { Link, useParams } from "react-router-dom-v5-compat";
import {
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Label,
  Row,
} from "reactstrap";

import { Loader } from "../../../components/Loader";
import { TimeCaption } from "../../../components/TimeCaption";
import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import FormSchema from "../../../components/formschema/FormSchema";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";

import type { GroupResponse } from "../api/namespace.api";
import { useGetGroupsByGroupSlugQuery } from "../api/projectV2.enhanced-api";
import WipBadge from "../shared/WipBadge";

import { GroupMembersForm, GroupMetadataForm } from "./groupEditForms";
import { SettingEditOption } from "./groupShow.types";
import ContainerWrap from "../../../components/container/ContainerWrap";

interface GroupHeaderProps {
  group: GroupResponse;
  setSettingEdit: (option: SettingEditOption) => void;
  settingEdit: SettingEditOption;
}
function GroupHeader({ group, setSettingEdit, settingEdit }: GroupHeaderProps) {
  const groupListUrl = ABSOLUTE_ROUTES.v2.groups.root;
  return (
    <>
      <div>{group.slug}</div>
      <TimeCaption datetime={group.creation_date} prefix="Created" />{" "}
      <WipBadge />
      <div className="my-2">
        <Link to={groupListUrl}>
          <ArrowLeft /> Back to list
        </Link>
      </div>
      <hr className="my-2" />
      <GroupHeaderEditButtonGroup
        group={group}
        setSettingEdit={setSettingEdit}
        settingEdit={settingEdit}
      />
    </>
  );
}

function GroupHeaderEditButtonGroup({
  group,
  setSettingEdit,
  settingEdit,
}: GroupHeaderProps) {
  const canEdit = group.slug != null;
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
      </DropdownMenu>
    </Dropdown>
  );
}

function GroupDescriptionDescription({
  description,
}: Pick<GroupResponse, "description">) {
  const desc =
    description == null
      ? "(no description)"
      : description.length < 1
      ? "(no description)"
      : description;
  return <div className="fs-5">{desc}</div>;
}

interface GroupDisplayProps {
  group: Pick<GroupResponse, "description">;
}
export function GroupDescription({ group }: GroupDisplayProps) {
  return (
    <>
      <div className="mb-3">
        <Label>Description</Label>
        <GroupDescriptionDescription description={group.description} />
      </div>
    </>
  );
}

export default function GroupShow() {
  const { slug: groupSlug } = useParams<"slug">();
  const { data, isLoading, error } = useGetGroupsByGroupSlugQuery(
    {
      groupSlug: groupSlug ?? "",
    },
    { skip: groupSlug == null }
  );

  const [settingEdit, setSettingEdit] = useState<SettingEditOption>(null);

  if (isLoading) return <Loader />;
  if (error || data == null) {
    return (
      <Row>
        <Col>
          {error ? (
            <RtkOrNotebooksError error={error} />
          ) : (
            <p>Could not retrieve the group.</p>
          )}
          <p>
            Click here to{" "}
            <Link to={ABSOLUTE_ROUTES.v2.groups.root}>
              return to groups list
            </Link>
            .
          </p>
        </Col>
      </Row>
    );
  }

  return (
    <ContainerWrap>
      <FormSchema
        showHeader={true}
        title={data.name ?? "(unknown)"}
        description={
          <GroupHeader
            group={data}
            setSettingEdit={setSettingEdit}
            settingEdit={settingEdit}
          />
        }
      >
        {settingEdit == null && <GroupDescription group={data} />}
        {settingEdit == "members" && (
          <GroupMembersForm group={data} setSettingEdit={setSettingEdit} />
        )}
        {settingEdit == "metadata" && (
          <GroupMetadataForm group={data} setSettingEdit={setSettingEdit} />
        )}
      </FormSchema>
    </ContainerWrap>
  );
}
