/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import cx from "classnames";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import Select, {
  components,
  type ClassNamesConfig,
  type GroupBase,
  type InputProps,
} from "react-select";

import {
  useGetSearchQueryQuery,
  type SearchGroup,
  type SearchProject,
} from "~/features/searchV2/api/searchV2Api.api";
import type { PickedMember } from "./addMemberToResourcePool.types";
import adminKeycloakApi from "./adminKeycloak.api";
import type { KeycloakUser } from "./adminKeycloak.types";
import { buildTypeScopedSearchQuery } from "./MemberSelect.utils";
import useKeycloakRealm from "./useKeycloakRealm.hook";

import styles from "./MemberSelect.module.scss";

function makeSelectClassNames<T>(): ClassNamesConfig<T, false> {
  return {
    control: ({ menuIsOpen }) =>
      cx(menuIsOpen ? "rounded-top" : "rounded", "border", styles.control),
    input: () => cx("px-3"),
    menu: () => cx("bg-white", "rounded-bottom", "border"),
    menuList: () => cx("d-grid"),
    option: ({ isFocused, isSelected }) =>
      cx(
        "px-3",
        "py-2",
        styles.option,
        isFocused && styles.optionIsFocused,
        !isFocused && isSelected && styles.optionIsSelected,
      ),
    placeholder: () => cx("px-3", "text-body-secondary"),
    loadingMessage: () => cx("p-3"),
    noOptionsMessage: () => cx("p-3"),
  };
}

function makeSelectComponents<T>() {
  return {
    DropdownIndicator: () => null,
    Input: (props: InputProps<T, false, GroupBase<T>>) => (
      <components.Input {...props} autoComplete="off" />
    ),
  };
}

interface MemberSelectProps<T> {
  placeholder: string;
  options: T[];
  getOptionValue: (option: T) => string;
  formatOptionLabel: (option: T) => ReactNode;
  onPick: (option: T | null) => void;
  onInputChange: (value: string) => void;
  isLoading?: boolean;
}

export default function MemberSelect<T>({
  placeholder,
  options,
  getOptionValue,
  formatOptionLabel,
  onPick,
  onInputChange,
  isLoading,
}: MemberSelectProps<T>) {
  // Stable identity across re-renders; a new components object remounts the
  // input on every keystroke and loses focus (react-select FAQ)
  const selectClassNames = useMemo(() => makeSelectClassNames<T>(), []);
  const selectComponents = useMemo(() => makeSelectComponents<T>(), []);

  return (
    <Select<T, false, GroupBase<T>>
      options={options}
      unstyled
      placeholder={placeholder}
      getOptionValue={getOptionValue}
      formatOptionLabel={formatOptionLabel}
      onChange={(option) => onPick(option)}
      onInputChange={(value, { action }) => {
        if (action === "input-change") onInputChange(value);
      }}
      classNames={selectClassNames}
      components={selectComponents}
      controlShouldRenderValue={false}
      filterOption={null}
      isClearable={false}
      isLoading={isLoading}
    />
  );
}

export function UserSelect({
  onPick,
}: {
  onPick: (member: PickedMember | null | undefined) => void;
}) {
  const realm = useKeycloakRealm();
  const [getKeycloakUsers, { data: users, isFetching }] =
    adminKeycloakApi.useLazyGetKeycloakUsersQuery();

  const onInputChange = useCallback(
    (searchValue: string) =>
      getKeycloakUsers(
        { realm, search: searchValue },
        /*preferCacheValue=*/ true,
      ),
    [getKeycloakUsers, realm],
  );

  const handlePick = useCallback(
    (user: KeycloakUser | null) => {
      if (user == null) return;
      onPick({
        type: "user",
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    },
    [onPick],
  );

  return (
    <MemberSelect<KeycloakUser>
      placeholder="Search for a user's name or email"
      options={users ?? []}
      getOptionValue={({ id }) => id}
      formatOptionLabel={({ firstName, lastName, email }) => (
        <span>
          {firstName} {lastName} &lt;{email}&gt;
        </span>
      )}
      onPick={handlePick}
      onInputChange={onInputChange}
      isLoading={isFetching}
    />
  );
}

export function GroupSelect({
  onPick,
}: {
  onPick: (member: PickedMember | null | undefined) => void;
}) {
  const [query, setQuery] = useState("");
  const { data: searchResult, isFetching } = useGetSearchQueryQuery(
    {
      params: {
        q: buildTypeScopedSearchQuery(query, "Group"),
        page: 1,
        per_page: 20,
      },
    },
    { skip: query.length < 2 },
  );

  const options = useMemo(
    () =>
      (searchResult?.items ?? []).filter(
        (item): item is SearchGroup => item.type === "Group",
      ),
    [searchResult],
  );

  const handlePick = useCallback(
    (group: SearchGroup | null) => {
      if (group == null) return;
      onPick({
        type: "group",
        id: group.id,
        name: group.name,
        slug: group.slug,
      });
    },
    [onPick],
  );

  return (
    <MemberSelect<SearchGroup>
      placeholder="Search for a group by name or slug"
      options={options}
      getOptionValue={({ id }) => id}
      formatOptionLabel={({ name, slug }) => <span>{`${name} (${slug})`}</span>}
      onPick={handlePick}
      onInputChange={setQuery}
      isLoading={isFetching}
    />
  );
}

export function ProjectSelect({
  onPick,
}: {
  onPick: (member: PickedMember | null | undefined) => void;
}) {
  const [query, setQuery] = useState("");
  const { data: searchResult, isFetching } = useGetSearchQueryQuery(
    {
      params: {
        q: buildTypeScopedSearchQuery(query, "Project"),
        page: 1,
        per_page: 20,
      },
    },
    { skip: query.length < 2 },
  );

  const options = useMemo(
    () =>
      (searchResult?.items ?? []).filter(
        (item): item is SearchProject => item.type === "Project",
      ),
    [searchResult],
  );

  const getNamespaceLabel = (project: SearchProject) =>
    project.namespace?.type === "Group"
      ? project.namespace.name
      : (project.namespace?.slug ?? project.path);

  const handlePick = useCallback(
    (project: SearchProject | null) => {
      if (project == null) return;
      onPick({
        type: "project",
        id: project.id,
        name: project.name,
        namespace: getNamespaceLabel(project),
        slug: project.slug,
      });
    },
    [onPick],
  );

  return (
    <MemberSelect<SearchProject>
      placeholder="Search for a project by name or namespace"
      options={options}
      getOptionValue={({ id }) => id}
      formatOptionLabel={(project) => (
        <span>{`${project.name} (${getNamespaceLabel(project)})`}</span>
      )}
      onPick={handlePick}
      onInputChange={setQuery}
      isLoading={isFetching}
    />
  );
}
