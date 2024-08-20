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
import { useMemo, useState } from "react";
import { ChevronDown } from "react-bootstrap-icons";
import Select, {
  ClassNamesConfig,
  components,
  GroupBase,
  InputProps,
  NoticeProps,
  OptionProps,
  PlaceholderProps,
  SelectComponentsConfig,
  SingleValue,
  SingleValueProps,
} from "react-select";
import { ErrorAlert } from "../../../components/Alert.jsx";
import { useGetQueryQuery, User } from "../../searchV2/api/searchV2Api.api.ts";
import styles from "./ProjectNamespaceFormField.module.scss";

const CANT_USER_RESULT = 100;

interface OptionOrSingleValueContentProps {
  user: User;
}

function OptionOrSingleValueContent({ user }: OptionOrSingleValueContentProps) {
  return (
    <>
      <span>
        {user.firstName} {user.lastName}
      </span>
      <span className={cx("fst-italic", "text-body-secondary", styles.kind)}>
        @{user.namespace}
      </span>
    </>
  );
}

const selectComponents: SelectComponentsConfig<User, false, GroupBase<User>> = {
  DropdownIndicator: (props) => {
    return (
      <components.DropdownIndicator {...props}>
        <ChevronDown className="icon-text" />
      </components.DropdownIndicator>
    );
  },
  Input: (props: InputProps<User, false, GroupBase<User>>) => {
    return <components.Input {...props} autoComplete="off"></components.Input>;
  },
  Option: (props: OptionProps<User, false, GroupBase<User>>) => {
    const { data: user } = props;
    return (
      <components.Option {...props}>
        <OptionOrSingleValueContent user={user} />
      </components.Option>
    );
  },
  SingleValue: (props: SingleValueProps<User, false, GroupBase<User>>) => {
    const { data: user } = props;
    return (
      <components.SingleValue {...props}>
        <OptionOrSingleValueContent user={user} />
      </components.SingleValue>
    );
  },
  Placeholder: (props: PlaceholderProps<User, false, GroupBase<User>>) => {
    return (
      <components.Placeholder {...props}>
        <div className={cx("text-body-secondary")}>
          Enter name or namespace to find users
        </div>
      </components.Placeholder>
    );
  },
};

const selectClassNames: ClassNamesConfig<User, false> = {
  control: ({ menuIsOpen }) =>
    cx(menuIsOpen ? "rounded-top" : "rounded", "border", styles.control),
  dropdownIndicator: () => cx("pe-3"),
  input: () => cx("px-3"),
  menu: () => cx("bg-white", "rounded-bottom", "border"),
  menuList: () => cx("d-grid"),
  option: ({ isFocused, isSelected }) =>
    cx(
      "d-flex",
      "flex-column",
      "flex-sm-row",
      "column-gap-3",
      "px-3",
      "py-2",
      styles.option,
      isFocused && styles.optionIsFocused,
      !isFocused && isSelected && styles.optionIsSelected
    ),
  placeholder: () => cx("px-3"),
  loadingMessage: () => cx("p-3"),
  singleValue: () =>
    cx("d-flex", "flex-column", "flex-sm-row", "column-gap-3", "px-3"),
};

interface CustomNoOptionsMessageProps {
  query: string;
}
function CustomNoOptionsMessage({ query }: CustomNoOptionsMessageProps) {
  return function CustomNoOptionsMessageInner(props: NoticeProps<User, false>) {
    return (
      <components.NoOptionsMessage {...props}>
        <div className={cx("pt-2", "fst-italic", "text-body-secondary")}></div>
        {query.length < 1 && (
          <p className={cx("fst-italic", "text-body-secondary")}>
            Type to find users.
          </p>
        )}
        {query.length > 0 && (
          <p className={cx("fst-italic", "text-body-secondary")}>
            0 users found.
            {query.length > 3 && (
              <>
                <br />
                New registered users can take around 3 minutes to be available.
              </>
            )}
          </p>
        )}
      </components.NoOptionsMessage>
    );
  };
}

interface UserSelectorProps {
  currentUser?: string;
  isFetchingMore?: boolean;
  users?: User[];
  onChange?: (newValue: SingleValue<User>) => void;
  onSetQuery: (q: string) => void;
  query: string;
}
export function UserSelector({
  currentUser,
  isFetchingMore,
  users,
  onChange,
  onSetQuery,
  query,
}: UserSelectorProps) {
  const currentValue = useMemo(
    () => users?.find(({ id }) => currentUser === id),
    [users, currentUser]
  );

  const components = useMemo(
    () => ({
      ...selectComponents,
      NoOptionsMessage: CustomNoOptionsMessage({ query }),
    }),
    [query]
  );

  return (
    <Select
      options={users}
      value={currentValue}
      unstyled
      getOptionValue={(option) => option.id}
      getOptionLabel={(option) =>
        `${option.firstName} ${option.lastName} @${option.namespace}`
      }
      onChange={onChange}
      classNames={selectClassNames}
      // see https://stackoverflow.com/a/63844955/5804638
      classNamePrefix="namespace-select"
      components={components}
      isClearable={true}
      isSearchable={true}
      isLoading={isFetchingMore}
      onInputChange={onSetQuery}
    />
  );
}

interface UserControlProps {
  className: string;
  "data-cy": string;
  id: string;
  onChange: (newValue: SingleValue<User>) => void;
  value?: string;
}

export function UserControl(props: UserControlProps) {
  const [lookupQuery, setLookupQuery] = useState<string | undefined>(undefined);
  const { className, id, onChange, value } = props;
  const dataCy = props["data-cy"];

  const {
    data: users,
    isError,
    isFetching,
    isLoading,
  } = useGetQueryQuery(
    {
      page: 1,
      perPage: CANT_USER_RESULT,
      q: `type:user ${lookupQuery}`,
    },
    { skip: !lookupQuery || lookupQuery == null || lookupQuery.length < 2 }
  );

  const allUsers = useMemo(
    () => users?.items?.filter((u) => u.type === "User"),
    [users]
  );

  if (isError) {
    return (
      <div className={className} id={id}>
        <ErrorAlert>
          <p className="mb-0">Error: could not fetch users.</p>
        </ErrorAlert>
      </div>
    );
  }

  return (
    <div className={className} data-cy={dataCy} id={id}>
      <UserSelector
        currentUser={value}
        isFetchingMore={isFetching || isLoading}
        query={lookupQuery || ""}
        users={!lookupQuery?.length ? [] : (allUsers as User[])}
        onChange={onChange}
        onSetQuery={(query: string) => setLookupQuery(query)}
      />
    </div>
  );
}
