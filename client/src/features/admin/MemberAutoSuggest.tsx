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

import {
  FormEvent,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Autosuggest, {
  ChangeEvent,
  InputProps,
  SuggestionSelectedEventData,
  SuggestionsFetchRequestedParams,
} from "react-autosuggest";

import {
  useGetSearchQueryQuery,
  type SearchGroup,
  type SearchProject,
} from "~/features/searchV2/api/searchV2Api.api";
import type { PickedMember } from "./addMemberToResourcePool.types";
import adminKeycloakApi from "./adminKeycloak.api";
import type { KeycloakUser } from "./adminKeycloak.types";
import { buildTypeScopedSearchQuery } from "./MemberAutoSuggest.utils";
import useKeycloakRealm from "./useKeycloakRealm.hook";

interface MemberAutoSuggestProps<T> {
  placeholder: string;
  suggestions: T[];
  value: string;
  onValueChange: (value: string) => void;
  getSuggestionValue: (suggestion: T) => string;
  renderSuggestion: (suggestion: T) => ReactNode;
  onSuggestionSelected: (suggestion: T) => void;
  onSuggestionsFetchRequested?: (value: string) => void;
}

export default function MemberAutoSuggest<T>({
  placeholder,
  suggestions,
  value,
  onValueChange,
  getSuggestionValue,
  renderSuggestion,
  onSuggestionSelected,
  onSuggestionsFetchRequested,
}: MemberAutoSuggestProps<T>) {
  const onChange = useCallback(
    (_event: FormEvent<HTMLElement>, { newValue }: ChangeEvent) => {
      onValueChange(newValue);
    },
    [onValueChange],
  );

  const inputProps: InputProps<T> = { placeholder, value, onChange };

  const handleSuggestionsFetchRequested = useCallback(
    ({ value }: SuggestionsFetchRequestedParams) => {
      onSuggestionsFetchRequested?.(value);
    },
    [onSuggestionsFetchRequested],
  );

  const handleSuggestionSelected = useCallback(
    (
      _event: FormEvent<HTMLElement>,
      { suggestion }: SuggestionSelectedEventData<T>,
    ) => {
      onSuggestionSelected(suggestion);
    },
    [onSuggestionSelected],
  );

  return (
    <Autosuggest<T>
      suggestions={suggestions}
      inputProps={inputProps}
      getSuggestionValue={getSuggestionValue}
      onSuggestionsClearRequested={() => {}}
      onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
      onSuggestionSelected={handleSuggestionSelected}
      renderSuggestion={renderSuggestion}
    />
  );
}

export function UserAutoSuggest({
  onPick,
}: {
  onPick: (member: PickedMember | null | undefined) => void;
}) {
  const realm = useKeycloakRealm();
  const [value, setValue] = useState("");
  const [getKeycloakUsers, { data: users }] =
    adminKeycloakApi.useLazyGetKeycloakUsersQuery();

  const onSuggestionsFetchRequested = useCallback(
    (searchValue: string) =>
      getKeycloakUsers(
        { realm, search: searchValue },
        /*preferCacheValue=*/ true,
      ),
    [getKeycloakUsers, realm],
  );

  const onSuggestionSelected = useCallback(
    (suggestion: KeycloakUser) => {
      onPick({
        type: "user",
        id: suggestion.id,
        email: suggestion.email,
        firstName: suggestion.firstName,
        lastName: suggestion.lastName,
      });
    },
    [onPick],
  );

  const getSuggestionValue = useCallback(
    ({ firstName, lastName }: KeycloakUser) => `${firstName} ${lastName}`,
    [],
  );

  const renderSuggestion = ({ firstName, lastName, email }: KeycloakUser) => (
    <div>
      {firstName} {lastName} &lt;{email}&gt;
    </div>
  );

  return (
    <MemberAutoSuggest
      placeholder="Search for a user's name or email"
      suggestions={users ?? []}
      value={value}
      onValueChange={setValue}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      onSuggestionSelected={onSuggestionSelected}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
    />
  );
}

export function GroupAutoSuggest({
  onPick,
}: {
  onPick: (member: PickedMember | null | undefined) => void;
}) {
  const [value, setValue] = useState("");
  const { data: searchResult } = useGetSearchQueryQuery(
    {
      params: {
        q: buildTypeScopedSearchQuery(value, "Group"),
        page: 1,
        per_page: 20,
      },
    },
    { skip: value.length < 2 },
  );

  const suggestions = useMemo(
    () =>
      (searchResult?.items ?? []).filter(
        (item): item is SearchGroup => item.type === "Group",
      ),
    [searchResult],
  );

  const onSuggestionSelected = useCallback(
    (suggestion: SearchGroup) => {
      onPick({
        type: "group",
        id: suggestion.id,
        name: suggestion.name,
        slug: suggestion.slug,
      });
    },
    [onPick],
  );

  const getSuggestionValue = useCallback(
    (group: SearchGroup) => `${group.name} (${group.slug})`,
    [],
  );

  const renderSuggestion = (group: SearchGroup) => (
    <div>{`${group.name} (${group.slug})`}</div>
  );

  return (
    <MemberAutoSuggest
      placeholder="Search for a group by name or slug"
      suggestions={suggestions}
      value={value}
      onValueChange={setValue}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      onSuggestionSelected={onSuggestionSelected}
    />
  );
}

export function ProjectAutoSuggest({
  onPick,
}: {
  onPick: (member: PickedMember | null | undefined) => void;
}) {
  const [value, setValue] = useState("");
  const { data: searchResult } = useGetSearchQueryQuery(
    {
      params: {
        q: buildTypeScopedSearchQuery(value, "Project"),
        page: 1,
        per_page: 20,
      },
    },
    { skip: value.length < 2 },
  );

  const suggestions = useMemo(
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

  const onSuggestionSelected = useCallback(
    (suggestion: SearchProject) => {
      onPick({
        type: "project",
        id: suggestion.id,
        name: suggestion.name,
        namespace: getNamespaceLabel(suggestion),
        slug: suggestion.slug,
      });
    },
    [onPick],
  );

  const getSuggestionValue = useCallback(
    (project: SearchProject) =>
      `${project.name} (${getNamespaceLabel(project)})`,
    [],
  );

  const renderSuggestion = (project: SearchProject) => (
    <div>{`${project.name} (${getNamespaceLabel(project)})`}</div>
  );

  return (
    <MemberAutoSuggest
      placeholder="Search for a project by name or namespace"
      suggestions={suggestions}
      value={value}
      onValueChange={setValue}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      onSuggestionSelected={onSuggestionSelected}
    />
  );
}
